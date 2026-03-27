import type {
  Task,
  TaskActivity,
  TaskSummary,
  TaskUpsertPayload,
} from '@shared/index'
import type { RowDataPacket } from 'mysql2'
import { randomUUID } from 'node:crypto'
import { ensureDatabaseSchema } from '@framework-core/runtime/database/database'
import { db } from '@framework-core/runtime/database/orm'
import { authTableNames, taskTableNames } from '@framework-core/runtime/database/table-names'
import { ApplicationError } from '@framework-core/runtime/errors/application-error'

interface TaskSummaryRow extends RowDataPacket {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  tags_json: string | null
  assignee_id: string | null
  assignee_name: string | null
  creator_id: string
  creator_name: string
  due_date: Date | null
  created_at: Date
  updated_at: Date
}

interface TaskRow extends TaskSummaryRow {
  description: string | null
}

interface TaskActivityRow extends RowDataPacket {
  id: string
  task_id: string
  author_id: string
  activity_type: 'status_change' | 'comment' | 'assignment'
  content: string
  created_at: Date
}

function toTimestamp(value: Date) {
  return value.toISOString()
}

function toDateString(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null
}

function toTags(value: string | null) {
  if (!value) {
    return []
  }

  try {
    const parsedValue = JSON.parse(value) as unknown
    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean)
  } catch {
    return []
  }
}

function toTaskSummary(row: TaskSummaryRow): TaskSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskSummary['status'],
    priority: row.priority as TaskSummary['priority'],
    tags: toTags(row.tags_json),
    assigneeId: row.assignee_id,
    assigneeName: row.assignee_name,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    dueDate: toDateString(row.due_date),
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at),
  }
}

function toTaskActivity(row: TaskActivityRow): TaskActivity {
  return {
    id: row.id,
    taskId: row.task_id,
    authorId: row.author_id,
    activityType: row.activity_type,
    content: row.content,
    createdAt: toTimestamp(row.created_at),
  }
}

export class TaskRepository {
  async listVisibleTasks(userId: string) {
    await ensureDatabaseSchema()

    const rows = await db.query<TaskSummaryRow>(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          CAST(t.tags_json AS CHAR) AS tags_json,
          t.assignee_id,
          assignee.display_name AS assignee_name,
          t.creator_id,
          creator.display_name AS creator_name,
          t.due_date,
          t.created_at,
          t.updated_at
        FROM ${taskTableNames.tasks} t
        INNER JOIN ${authTableNames.users} creator ON creator.id = t.creator_id
        LEFT JOIN ${authTableNames.users} assignee ON assignee.id = t.assignee_id
        WHERE t.assignee_id = ? OR t.creator_id = ?
        ORDER BY t.created_at ASC, t.id ASC
      `,
      [userId, userId]
    )

    return rows.map(toTaskSummary)
  }

  async listAllTasks() {
    await ensureDatabaseSchema()

    const rows = await db.query<TaskSummaryRow>(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          CAST(t.tags_json AS CHAR) AS tags_json,
          t.assignee_id,
          assignee.display_name AS assignee_name,
          t.creator_id,
          creator.display_name AS creator_name,
          t.due_date,
          t.created_at,
          t.updated_at
        FROM ${taskTableNames.tasks} t
        INNER JOIN ${authTableNames.users} creator ON creator.id = t.creator_id
        LEFT JOIN ${authTableNames.users} assignee ON assignee.id = t.assignee_id
        ORDER BY t.created_at ASC, t.id ASC
      `
    )

    return rows.map(toTaskSummary)
  }

  async findById(id: string): Promise<Task | null> {
    await ensureDatabaseSchema()

    const row = await db.first<TaskRow>(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          CAST(t.tags_json AS CHAR) AS tags_json,
          t.assignee_id,
          assignee.display_name AS assignee_name,
          t.creator_id,
          creator.display_name AS creator_name,
          t.due_date,
          t.created_at,
          t.updated_at
        FROM ${taskTableNames.tasks} t
        INNER JOIN ${authTableNames.users} creator ON creator.id = t.creator_id
        LEFT JOIN ${authTableNames.users} assignee ON assignee.id = t.assignee_id
        WHERE t.id = ?
        LIMIT 1
      `,
      [id]
    )

    if (!row) {
      return null
    }

    const activities = await db.query<TaskActivityRow>(
      `SELECT * FROM ${taskTableNames.activities} WHERE task_id = ? ORDER BY created_at ASC`,
      [id]
    )

    return {
      ...toTaskSummary(row),
      activities: activities.map(toTaskActivity),
    } satisfies Task
  }

  async create(creatorId: string, payload: TaskUpsertPayload) {
    await ensureDatabaseSchema()
    const taskId = randomUUID()

    await db.transaction(async (transaction) => {
      await transaction.execute(
        `
          INSERT INTO ${taskTableNames.tasks} (
            id,
            title,
            description,
            status,
            priority,
            assignee_id,
            creator_id,
            due_date,
            tags_json
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          taskId,
          payload.title,
          payload.description,
          payload.status,
          payload.priority,
          payload.assigneeId,
          creatorId,
          payload.dueDate,
          JSON.stringify(payload.tags),
        ]
      )

      await transaction.execute(
        `
          INSERT INTO ${taskTableNames.activities} (
            id,
            task_id,
            author_id,
            activity_type,
            content
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          randomUUID(),
          taskId,
          creatorId,
          'status_change',
          'Task created',
        ]
      )
    })

    const task = await this.findById(taskId)
    if (!task) {
      throw new ApplicationError('Expected created task to be retrievable.', { id: taskId }, 500)
    }

    return task
  }

  async update(id: string, authorId: string, payload: TaskUpsertPayload) {
    await ensureDatabaseSchema()

    await db.transaction(async (transaction) => {
      const existing = await transaction.first<RowDataPacket>(
        `SELECT id FROM ${taskTableNames.tasks} WHERE id = ? LIMIT 1`,
        [id]
      )

      if (!existing) {
        throw new ApplicationError('Task not found.', { id }, 404)
      }

      await transaction.execute(
        `
          UPDATE ${taskTableNames.tasks}
          SET
            title = ?,
            description = ?,
            status = ?,
            priority = ?,
            assignee_id = ?,
            due_date = ?,
            tags_json = ?
          WHERE id = ?
        `,
        [
          payload.title,
          payload.description,
          payload.status,
          payload.priority,
          payload.assigneeId,
          payload.dueDate,
          JSON.stringify(payload.tags),
          id,
        ]
      )

      await transaction.execute(
        `
          INSERT INTO ${taskTableNames.activities} (
            id,
            task_id,
            author_id,
            activity_type,
            content
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          randomUUID(),
          id,
          authorId,
          'status_change',
          'Task updated'
        ]
      )
    })

    const task = await this.findById(id)
    if (!task) {
      throw new ApplicationError('Expected updated task to be retrievable.', { id }, 500)
    }

    return task
  }

  async addActivity(taskId: string, authorId: string, activityType: string, content: string) {
    await ensureDatabaseSchema()
    
    await db.execute(
      `
        INSERT INTO ${taskTableNames.activities} (
          id,
          task_id,
          author_id,
          activity_type,
          content
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        taskId,
        authorId,
        activityType,
        content,
      ]
    )

    const task = await this.findById(taskId)
    if (!task) {
      throw new ApplicationError('Expected task to be retrievable after comment.', { id: taskId }, 500)
    }

    return task
  }

  async updateStatus(id: string, authorId: string, newStatus: string) {
    await ensureDatabaseSchema()
    
    await db.transaction(async (transaction) => {
      const result = await transaction.execute(
        `UPDATE ${taskTableNames.tasks} SET status = ? WHERE id = ?`,
        [newStatus, id]
      )

      if (result.affectedRows === 0) {
        throw new ApplicationError('Task not found.', { id }, 404)
      }

      await transaction.execute(
        `
          INSERT INTO ${taskTableNames.activities} (
            id,
            task_id,
            author_id,
            activity_type,
            content
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          randomUUID(),
          id,
          authorId,
          'status_change',
          'Status changed to ' + newStatus,
        ]
      )
    })

    const task = await this.findById(id)
    if (!task) {
      throw new ApplicationError('Expected task to be retrievable after status update.', { id }, 500)
    }

    return task
  }
}
