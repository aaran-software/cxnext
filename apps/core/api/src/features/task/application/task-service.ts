import type { TaskListResponse, TaskResponse } from '@shared/index'
import {
  taskListResponseSchema,
  taskResponseSchema,
  taskUpsertPayloadSchema,
  taskActivityInputSchema,
} from '@shared/index'
import type { TaskRepository } from '../data/task-repository'
import { ApplicationError } from '@framework-core/runtime/errors/application-error'

interface PersistenceError {
  code?: string
  sqlMessage?: string
  message?: string
}

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async listForUser(userId: string) {
    const items = await this.repository.listVisibleTasks(userId)

    return taskListResponseSchema.parse({
      items,
    } satisfies TaskListResponse)
  }

  async listAll() {
    // Admins usually see everything
    const items = await this.repository.listAllTasks()

    return taskListResponseSchema.parse({
      items,
    } satisfies TaskListResponse)
  }

  async getById(id: string) {
    const item = await this.repository.findById(id)

    if (!item) {
      throw new ApplicationError('Task not found.', { id }, 404)
    }

    return taskResponseSchema.parse({
      item,
    } satisfies TaskResponse)
  }

  async create(creatorId: string, payload: unknown) {
    const parsedPayload = taskUpsertPayloadSchema.parse(payload)

    try {
      const item = await this.repository.create(creatorId, parsedPayload)
      return taskResponseSchema.parse({ item } satisfies TaskResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'create')
    }
  }

  async update(id: string, authorId: string, payload: unknown) {
    const parsedPayload = taskUpsertPayloadSchema.parse(payload)

    try {
      const item = await this.repository.update(id, authorId, parsedPayload)
      return taskResponseSchema.parse({ item } satisfies TaskResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'update', id)
    }
  }

  async finalize(id: string, authorId: string) {
    try {
      const item = await this.repository.updateStatus(id, authorId, 'finalized')
      return taskResponseSchema.parse({ item } satisfies TaskResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'update', id)
    }
  }

  async addActivity(id: string, authorId: string, payload: unknown) {
    const parsedPayload = taskActivityInputSchema.parse(payload)

    try {
      const item = await this.repository.addActivity(
        id,
        authorId,
        parsedPayload.activityType,
        parsedPayload.content
      )
      return taskResponseSchema.parse({ item } satisfies TaskResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'update', id)
    }
  }

  private throwPersistenceError(
    error: unknown,
    action: 'create' | 'update' | 'deactivate' | 'restore',
    id?: string,
  ): never {
    if (error instanceof ApplicationError) {
      throw error
    }

    const persistenceError = error as PersistenceError

    throw new ApplicationError(
      'Failed to persist task data.',
      { action, id: id ?? 'new', detail: persistenceError.sqlMessage ?? persistenceError.message ?? 'unknown persistence error' },
      500,
    )
  }
}
