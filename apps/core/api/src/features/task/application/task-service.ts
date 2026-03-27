import type {
  AuthUser,
  Task,
  TaskAuditItem,
  TaskAuditListResponse,
  TaskBulkCreateResponse,
  TaskInsights,
  TaskInsightsResponse,
  TaskListResponse,
  TaskResponse,
  TaskStatus,
  TaskTemplateListResponse,
  TaskTemplateResponse,
  TaskUpsertPayload,
} from '@shared/index'
import {
  taskAuditListResponseSchema,
  taskBulkCreatePayloadSchema,
  taskBulkCreateResponseSchema,
  taskInsightsResponseSchema,
  taskListResponseSchema,
  taskResponseSchema,
  taskTemplateListResponseSchema,
  taskTemplateResponseSchema,
  taskTemplateUpsertPayloadSchema,
  taskUpsertPayloadSchema,
  taskActivityInputSchema,
} from '@shared/index'
import type { TaskRepository } from '../data/task-repository'
import { ApplicationError } from '@framework-core/runtime/errors/application-error'
import { ProductRepository } from '@ecommerce-api/features/product/data/product-repository'
import type { NotificationService } from '../../notification/application/notification-service'
import type { MilestoneRepository } from '../data/milestone-repository'
import { randomUUID } from 'node:crypto'

interface PersistenceError {
  sqlMessage?: string
  message?: string
}

type TaskMutationAction = 'create' | 'update' | 'finalize'

function startOfDay(value = new Date()) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
}

function addDays(value: Date, days: number) {
  const next = new Date(value)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function parseDate(value: string | null) {
  if (!value) {
    return null
  }

  const parsedValue = new Date(value)
  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue
}

function getVerificationState(task: { checklistCompletionCount: number; checklistTotalCount: number }): TaskAuditItem['verificationState'] {
  if (task.checklistTotalCount === 0 || task.checklistCompletionCount === 0) {
    return 'not_started'
  }

  if (task.checklistCompletionCount >= task.checklistTotalCount) {
    return 'completed'
  }

  return 'partial'
}

function isOverdueTask(task: { dueDate: string | null; status: string }, today = startOfDay()) {
  const dueDate = parseDate(task.dueDate)
  if (!dueDate || task.status === 'finalized') {
    return false
  }

  return dueDate < today
}

function isStuckTask(task: { status: string; updatedAt: string }, today = startOfDay(), thresholdDays = 3) {
  if (task.status !== 'in_progress') {
    return false
  }

  const updatedAt = parseDate(task.updatedAt)
  if (!updatedAt) {
    return false
  }

  return updatedAt < addDays(today, -thresholdDays)
}

function toAuditItem(task: TaskAuditItem | {
  id: string
  title: string
  description: string | null
  milestoneId: string | null
  milestoneTitle: string | null
  status: TaskAuditItem['status']
  priority: TaskAuditItem['priority']
  tags: string[]
  scopeType: TaskAuditItem['scopeType']
  entityType: TaskAuditItem['entityType']
  entityId: string | null
  entityLabel: string | null
  templateId: string | null
  templateName: string | null
  assigneeId: string | null
  assigneeName: string | null
  reviewAssignedTo: string | null
  reviewAssignedToName: string | null
  creatorId: string
  creatorName: string
  reviewedBy: string | null
  reviewedByName: string | null
  reviewedAt: string | null
  reviewComment: string | null
  dueDate: string | null
  checklistCompletionCount: number
  checklistTotalCount: number
  createdAt: string
  updatedAt: string
}): TaskAuditItem {
  const verificationState = getVerificationState(task)
  return {
    ...task,
    verificationState,
    isOverdue: isOverdueTask(task),
    isStuck: isStuckTask(task),
    isIncompleteVerification: task.checklistTotalCount > 0 && task.checklistCompletionCount < task.checklistTotalCount,
  }
}

function isBackofficeUser(user: AuthUser) {
  return user.actorType === 'admin' || user.actorType === 'staff'
}

function isManagerLike(user: AuthUser) {
  return user.isSuperAdmin || user.roles.some((role) => {
    const key = role.key.toLowerCase()
    const name = role.name.toLowerCase()
    return key.includes('manager') || name.includes('manager')
  })
}

function isAdminLike(user: AuthUser) {
  return user.actorType === 'admin' || user.isSuperAdmin || isManagerLike(user)
}

function canAssignTasks(user: AuthUser) {
  return isAdminLike(user)
}

function canFinalizeTasks(user: AuthUser) {
  return isAdminLike(user)
}

function assertBackofficeUser(user: AuthUser) {
  if (!isBackofficeUser(user)) {
    throw new ApplicationError('Only backoffice users can manage tasks.', { actorType: user.actorType }, 403)
  }
}

function isChecklistComplete(checklistCompletionCount: number, checklistTotalCount: number) {
  return checklistTotalCount === 0 || checklistCompletionCount >= checklistTotalCount
}

function validateStatusTransition(previousStatus: TaskStatus, nextStatus: TaskStatus) {
  if (previousStatus === nextStatus) {
    return
  }

  const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    pending: ['in_progress'],
    in_progress: ['review'],
    review: ['in_progress', 'finalized'],
    finalized: [],
  }

  if (!allowedTransitions[previousStatus].includes(nextStatus)) {
    throw new ApplicationError(
      'Invalid task status transition.',
      { previousStatus, nextStatus, allowedTransitions: allowedTransitions[previousStatus] },
      400,
    )
  }
}

function toTaskUpsertPayload(task: Task): TaskUpsertPayload {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    tags: task.tags,
    milestoneId: task.milestoneId,
    scopeType: task.scopeType,
    entityType: task.entityType,
    entityId: task.entityId,
    entityLabel: task.entityLabel,
    templateId: task.templateId,
    assigneeId: task.assigneeId,
    dueDate: task.dueDate,
    reviewComment: task.reviewComment,
    checklistItems: task.checklistItems.map((item) => ({
      id: item.id,
      label: item.label,
      isChecked: item.isChecked,
      note: item.note,
    })),
  }
}

function areChecklistUpdatesEquivalent(previousItem: Task, nextPayload: TaskUpsertPayload) {
  if (previousItem.checklistItems.length !== nextPayload.checklistItems.length) {
    return false
  }

  const nextChecklistById = new Map(nextPayload.checklistItems.map((item) => [item.id, item]))
  return previousItem.checklistItems.every((item) => {
    const nextItem = nextChecklistById.get(item.id)
    if (!nextItem) {
      return false
    }
    return nextItem.isChecked === item.isChecked && (nextItem.note ?? null) === (item.note ?? null)
  })
}

function isMutationEquivalent(previousItem: Task, nextPayload: TaskUpsertPayload) {
  return (
    previousItem.title === nextPayload.title
    && previousItem.description === nextPayload.description
    && previousItem.milestoneId === nextPayload.milestoneId
    && previousItem.status === nextPayload.status
    && previousItem.priority === nextPayload.priority
    && previousItem.scopeType === nextPayload.scopeType
    && previousItem.entityType === nextPayload.entityType
    && previousItem.entityId === nextPayload.entityId
    && previousItem.entityLabel === nextPayload.entityLabel
    && previousItem.templateId === nextPayload.templateId
    && previousItem.assigneeId === nextPayload.assigneeId
    && previousItem.dueDate === nextPayload.dueDate
    && previousItem.reviewComment === nextPayload.reviewComment
    && previousItem.tags.join('|') === nextPayload.tags.join('|')
    && areChecklistUpdatesEquivalent(previousItem, nextPayload)
  )
}

export class TaskService {
  constructor(
    private readonly repository: TaskRepository,
    private readonly productRepository = new ProductRepository(),
    private readonly notificationService?: NotificationService,
    private readonly milestoneRepository?: MilestoneRepository,
  ) {}

  async listForUser(userId: string, filters?: { milestoneId?: string | null }) {
    const items = await this.repository.listVisibleTasks(userId, filters)
    return taskListResponseSchema.parse({ items } satisfies TaskListResponse)
  }

  async listAll(filters?: { milestoneId?: string | null }) {
    const items = await this.repository.listAllTasks(filters)
    return taskListResponseSchema.parse({ items } satisfies TaskListResponse)
  }

  async getInsights(userId: string) {
    const items = await this.repository.listAllTasks()
    const today = startOfDay()
    const weekBoundary = addDays(today, 7)
    const finalizedCount = items.filter((item) => item.status === 'finalized').length
    const insights = {
      systemStatus: {
        totalTasks: items.length,
        pending: items.filter((item) => item.status === 'pending').length,
        inProgress: items.filter((item) => item.status === 'in_progress').length,
        inReview: items.filter((item) => item.status === 'review').length,
        finalized: finalizedCount,
      },
      ownership: {
        assignedToMe: items.filter((item) => item.assigneeId === userId).length,
        createdByMe: items.filter((item) => item.creatorId === userId).length,
        unassigned: items.filter((item) => !item.assigneeId).length,
      },
      urgency: {
        overdue: items.filter((item) => isOverdueTask(item, today)).length,
        dueToday: items.filter((item) => {
          const dueDate = parseDate(item.dueDate)
          return dueDate ? dueDate.getTime() === today.getTime() : false
        }).length,
        dueThisWeek: items.filter((item) => {
          const dueDate = parseDate(item.dueDate)
          return dueDate ? dueDate >= today && dueDate <= weekBoundary : false
        }).length,
      },
      signals: {
        stuck: items.filter((item) => isStuckTask(item, today)).length,
        incompleteVerification: items.filter((item) => item.checklistTotalCount > 0 && item.checklistCompletionCount < item.checklistTotalCount).length,
        completionRate: items.length === 0 ? 0 : finalizedCount / items.length,
      },
    } satisfies TaskInsights

    return taskInsightsResponseSchema.parse({ insights } satisfies TaskInsightsResponse)
  }

  async getAuditList(filters: {
    templateId?: string | null
    assigneeId?: string | null
    status?: string | null
    verificationState?: string | null
    dateFrom?: string | null
    dateTo?: string | null
  }) {
    const items = (await this.repository.listAllTasks()).map(toAuditItem)
    const filteredItems = items.filter((item) => {
      if (filters.templateId && item.templateId !== filters.templateId) {
        return false
      }

      if (filters.assigneeId && item.assigneeId !== filters.assigneeId) {
        return false
      }

      if (filters.status && item.status !== filters.status) {
        return false
      }

      if (filters.verificationState && item.verificationState !== filters.verificationState) {
        return false
      }

      const dueDate = parseDate(item.dueDate)
      const dateFrom = parseDate(filters.dateFrom ?? null)
      const dateTo = parseDate(filters.dateTo ?? null)

      if (dateFrom && (!dueDate || dueDate < dateFrom)) {
        return false
      }

      if (dateTo && (!dueDate || dueDate > dateTo)) {
        return false
      }

      return true
    })

    return taskAuditListResponseSchema.parse({ items: filteredItems } satisfies TaskAuditListResponse)
  }

  async listByEntity(entityType: string, entityId: string) {
    const items = await this.repository.listTasksByEntity(entityType, entityId)
    return taskListResponseSchema.parse({ items } satisfies TaskListResponse)
  }

  async getById(id: string) {
    const item = await this.repository.findById(id)
    if (!item) {
      throw new ApplicationError('Task not found.', { id }, 404)
    }
    return taskResponseSchema.parse({ item } satisfies TaskResponse)
  }

  async create(actor: AuthUser, payload: unknown) {
    assertBackofficeUser(actor)
    const parsedPayload = taskUpsertPayloadSchema.parse(payload)
    try {
      await this.validateTaskMutation({
        action: 'create',
        actor,
        previousItem: null,
        nextPayload: parsedPayload,
      })
      const item = await this.repository.create(actor.id, parsedPayload)
      await this.notifyOnCreate(item, actor.id)
      return taskResponseSchema.parse({ item } satisfies TaskResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'create')
    }
  }

  async createFromTemplate(actor: AuthUser, payload: unknown) {
    assertBackofficeUser(actor)
    const parsedPayload = payload as {
      templateId: string
      milestoneId?: string | null
      assigneeId?: string | null
      dueDate?: string | null
      entityType?: TaskUpsertPayload['entityType']
      entityId?: string | null
      entityLabel?: string | null
      title?: string | null
      description?: string | null
      tags?: string[]
      priority?: TaskUpsertPayload['priority']
    }
    const template = await this.repository.findTemplateById(parsedPayload.templateId)
    if (!template) {
      throw new ApplicationError('Task template not found.', { templateId: parsedPayload.templateId }, 404)
    }

    const nextPayload = taskUpsertPayloadSchema.parse({
      title: parsedPayload.title?.trim() || template.titleTemplate,
      description: parsedPayload.description ?? template.descriptionTemplate,
      status: 'pending',
      priority: parsedPayload.priority ?? template.defaultPriority,
      tags: parsedPayload.tags?.length ? parsedPayload.tags : template.defaultTags,
      milestoneId: parsedPayload.milestoneId ?? null,
      scopeType: template.scopeType,
      entityType: parsedPayload.entityType ?? (template.scopeType === 'general' ? null : template.scopeType),
      entityId: parsedPayload.entityId ?? null,
      entityLabel: parsedPayload.entityLabel ?? null,
      templateId: template.id,
      assigneeId: parsedPayload.assigneeId ?? null,
      dueDate: parsedPayload.dueDate ?? null,
      checklistItems: template.checklistItems.map((item) => ({
        id: randomUUID(),
        label: item.label,
        isChecked: false,
        note: null,
      })),
    })

    return this.create(actor, nextPayload)
  }

  async createBulkFromTemplate(actor: AuthUser, payload: unknown) {
    assertBackofficeUser(actor)
    const parsedPayload = taskBulkCreatePayloadSchema.parse(payload)
    const uniqueEntityIds = [...new Set(parsedPayload.entityIds)]
    const createdItems = []

    for (const entityId of uniqueEntityIds) {
      const entityLabel = await this.resolveEntityLabel(parsedPayload.entityType, entityId)
      const item = await this.createFromTemplate(actor, {
        templateId: parsedPayload.templateId,
        assigneeId:
          parsedPayload.assigneeMode === 'specific'
            ? parsedPayload.assigneeId ?? null
            : parsedPayload.assigneeMode === 'self'
              ? actor.id
              : null,
        dueDate: parsedPayload.dueDate ?? null,
        entityType: parsedPayload.entityType,
        entityId,
        entityLabel,
        milestoneId: parsedPayload.milestoneId,
        tags: parsedPayload.tags,
        priority: parsedPayload.priority,
      })
      createdItems.push(item.item)
    }

    return taskBulkCreateResponseSchema.parse({
      items: createdItems,
      createdCount: createdItems.length,
    } satisfies TaskBulkCreateResponse)
  }

  async update(id: string, actor: AuthUser, payload: unknown) {
    assertBackofficeUser(actor)
    const parsedPayload = taskUpsertPayloadSchema.parse(payload)
    try {
      const previousItem = await this.repository.findById(id)
      if (!previousItem) {
        throw new ApplicationError('Task not found.', { id }, 404)
      }
      if (previousItem.status === 'finalized') {
        if (isMutationEquivalent(previousItem, parsedPayload)) {
          return taskResponseSchema.parse({ item: previousItem } satisfies TaskResponse)
        }
        throw new ApplicationError('Finalized tasks are immutable.', { id }, 400)
      }

      const validationResult = await this.validateTaskMutation({
        action: 'update',
        actor,
        previousItem,
        nextPayload: parsedPayload,
      })
      const item = await this.repository.update(
        id,
        actor.id,
        parsedPayload,
        validationResult.reviewState,
        validationResult.activityEntries,
      )
      await this.notificationService?.markReadByTask(actor.id, id)
      await this.notifyOnUpdate(previousItem, item, actor.id)
      return taskResponseSchema.parse({ item } satisfies TaskResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'update', id)
    }
  }

  async finalize(id: string, actor: AuthUser) {
    assertBackofficeUser(actor)
    const existingTask = await this.repository.findById(id)
    if (!existingTask) {
      throw new ApplicationError('Task not found.', { id }, 404)
    }
    if (existingTask.status === 'finalized') {
      return taskResponseSchema.parse({ item: existingTask } satisfies TaskResponse)
    }

    return this.update(id, actor, {
      ...toTaskUpsertPayload(existingTask),
      status: 'finalized',
    })
  }

  async addActivity(id: string, authorId: string, payload: unknown) {
    const parsedPayload = taskActivityInputSchema.parse(payload)
    try {
      const item = await this.repository.addActivity(id, authorId, parsedPayload.activityType, parsedPayload.content)
      return taskResponseSchema.parse({ item } satisfies TaskResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'update', id)
    }
  }

  async listTemplates(scopeType?: string | null) {
    const items = await this.repository.listTemplates(scopeType)
    return taskTemplateListResponseSchema.parse({ items } satisfies TaskTemplateListResponse)
  }

  async getTemplateById(id: string) {
    const item = await this.repository.findTemplateById(id)
    if (!item) {
      throw new ApplicationError('Task template not found.', { id }, 404)
    }
    return taskTemplateResponseSchema.parse({ item } satisfies TaskTemplateResponse)
  }

  async createTemplate(payload: unknown) {
    const parsedPayload = taskTemplateUpsertPayloadSchema.parse(payload)
    try {
      const item = await this.repository.createTemplate(parsedPayload)
      return taskTemplateResponseSchema.parse({ item } satisfies TaskTemplateResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'create')
    }
  }

  async updateTemplate(id: string, payload: unknown) {
    const parsedPayload = taskTemplateUpsertPayloadSchema.parse(payload)
    try {
      const item = await this.repository.updateTemplate(id, parsedPayload)
      return taskTemplateResponseSchema.parse({ item } satisfies TaskTemplateResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'update', id)
    }
  }

  private async validateTaskMutation(input: {
    action: TaskMutationAction
    actor: AuthUser
    previousItem: Task | null
    nextPayload: TaskUpsertPayload
  }) {
    const { action, actor, previousItem, nextPayload } = input
    assertBackofficeUser(actor)

    if (nextPayload.templateId) {
      const template = await this.repository.findTemplateById(nextPayload.templateId)
      if (!template) {
        throw new ApplicationError('Task template not found.', { templateId: nextPayload.templateId }, 404)
      }
    }

    if (nextPayload.milestoneId) {
      const milestone = await this.milestoneRepository?.findById(nextPayload.milestoneId)
      if (!milestone) {
        throw new ApplicationError('Milestone not found.', { milestoneId: nextPayload.milestoneId }, 404)
      }
    }

    if (action === 'create') {
      if (!canAssignTasks(actor) && nextPayload.assigneeId && nextPayload.assigneeId !== actor.id) {
        throw new ApplicationError('Permission denied to assign tasks to other users.', { assigneeId: nextPayload.assigneeId }, 403)
      }
      if (nextPayload.status !== 'pending' && nextPayload.status !== 'in_progress') {
        throw new ApplicationError(
          'New tasks can only start in pending or in progress.',
          { status: nextPayload.status },
          400,
        )
      }
      return {
        reviewState: {
          reviewAssignedTo: null,
          reviewedBy: null,
          reviewedAt: null,
          reviewComment: null,
        },
        activityEntries: [],
      }
    }

    if (!previousItem) {
      throw new ApplicationError('Task not found.', {}, 404)
    }

    validateStatusTransition(previousItem.status, nextPayload.status)

    if (previousItem.assigneeId !== nextPayload.assigneeId) {
      const isSelfAssignment = nextPayload.assigneeId === actor.id && !previousItem.assigneeId
      if (!canAssignTasks(actor) && !isSelfAssignment) {
        throw new ApplicationError('Permission denied to assign or reassign tasks.', { actorId: actor.id }, 403)
      }
    }

    if (nextPayload.status === 'review' && !nextPayload.assigneeId) {
      throw new ApplicationError('Cannot move to review without assignee.', {}, 400)
    }

    if (previousItem.status !== 'review' && nextPayload.status === 'review' && !previousItem.reviewAssignedTo) {
      if (previousItem.creatorId === actor.id && !canFinalizeTasks(actor)) {
        throw new ApplicationError(
          'Cannot move to review because no eligible reviewer is assigned.',
          { taskId: previousItem.id },
          400,
        )
      }
    }

    const nextChecklistState = new Map(previousItem.checklistItems.map((item) => [item.id, item.isChecked]))
    for (const item of nextPayload.checklistItems) {
      nextChecklistState.set(item.id, item.isChecked)
    }
    const nextChecklistCompletionCount = Array.from(nextChecklistState.values()).filter(Boolean).length
    const nextChecklistTotalCount = nextChecklistState.size
    const activityEntries: Array<{ activityType: Task['activities'][number]['activityType']; content: string }> = []

    if (previousItem.status !== nextPayload.status) {
      activityEntries.push({
        activityType: 'status_change',
        content: `Status changed from ${previousItem.status} to ${nextPayload.status}`,
      })
    }

    if (previousItem.assigneeId !== nextPayload.assigneeId) {
      activityEntries.push({
        activityType: 'assignment',
        content: nextPayload.assigneeId
          ? `Assignee changed from ${previousItem.assigneeName ?? 'Unassigned'} to ${nextPayload.assigneeId === actor.id ? actor.displayName : 'another user'}`
          : `Assignee cleared from ${previousItem.assigneeName ?? 'Unassigned'}`,
      })
    }

    if (nextChecklistCompletionCount !== previousItem.checklistCompletionCount) {
      activityEntries.push({
        activityType: 'checklist',
        content: `Checklist progress changed from ${previousItem.checklistCompletionCount}/${previousItem.checklistTotalCount} to ${nextChecklistCompletionCount}/${nextChecklistTotalCount}`,
      })
    }

    if (nextPayload.status === 'finalized') {
      if (!canFinalizeTasks(actor)) {
        throw new ApplicationError('Permission denied to finalize tasks.', { actorId: actor.id }, 403)
      }
      if (!previousItem.reviewAssignedTo) {
        throw new ApplicationError('Task has no assigned reviewer.', { taskId: previousItem.id }, 400)
      }
      if (previousItem.reviewAssignedTo !== actor.id) {
        throw new ApplicationError('Only the assigned reviewer can finalize this task.', { reviewerId: previousItem.reviewAssignedTo }, 403)
      }

      if (!isChecklistComplete(nextChecklistCompletionCount, nextChecklistTotalCount)) {
        throw new ApplicationError(
          'Cannot finalize: checklist incomplete.',
          { completionCount: nextChecklistCompletionCount, totalCount: nextChecklistTotalCount },
          400,
        )
      }

      activityEntries.push({
        activityType: 'reviewed',
        content: `Task approved and finalized by ${actor.displayName}`,
      })

      return {
        reviewState: {
          reviewAssignedTo: previousItem.reviewAssignedTo,
          reviewedBy: actor.id,
          reviewedAt: new Date(),
          reviewComment: nextPayload.reviewComment ?? previousItem.reviewComment,
        },
        activityEntries,
      }
    }

    if (previousItem.status === 'review' && nextPayload.status === 'in_progress') {
      if (!canFinalizeTasks(actor)) {
        throw new ApplicationError('Permission denied to reject reviewed tasks.', { actorId: actor.id }, 403)
      }
      if (!previousItem.reviewAssignedTo || previousItem.reviewAssignedTo !== actor.id) {
        throw new ApplicationError('Only the assigned reviewer can reject this task.', { reviewerId: previousItem.reviewAssignedTo }, 403)
      }
      activityEntries.push({
        activityType: 'reviewed',
        content: `Task sent back to in progress by ${actor.displayName}`,
      })
      return {
        reviewState: {
          reviewAssignedTo: null,
          reviewedBy: null,
          reviewedAt: null,
          reviewComment: null,
        },
        activityEntries,
      }
    }

    return {
      reviewState: {
        reviewAssignedTo: nextPayload.status === 'review'
          ? previousItem.reviewAssignedTo ?? previousItem.creatorId
          : previousItem.reviewAssignedTo,
        reviewedBy: previousItem.reviewedBy,
        reviewedAt: previousItem.reviewedAt ? new Date(previousItem.reviewedAt) : null,
        reviewComment: previousItem.reviewComment,
      },
      activityEntries,
    }
  }

  private async resolveEntityLabel(entityType: TaskUpsertPayload['entityType'], entityId: string) {
    if (entityType === 'product') {
      const product = await this.productRepository.findById(entityId)
      if (!product) {
        throw new ApplicationError('Product not found for bulk task creation.', { entityId }, 404)
      }
      return product.name
    }

    return entityId
  }

  private async notifyOnCreate(item: TaskResponse['item'], actorId: string) {
    if (!this.notificationService || !item.assigneeId || item.assigneeId === actorId) {
      return
    }

    await this.notificationService.createNotification({
      userId: item.assigneeId,
      type: 'task_assigned',
      title: `Task assigned: ${item.title}`,
      message: `Open the task and start work on ${item.title}.`,
      entityType: item.entityType,
      entityId: item.entityId,
      taskId: item.id,
    })
  }

  private async notifyOnUpdate(previousItem: TaskResponse['item'], nextItem: TaskResponse['item'], actorId: string) {
    if (!this.notificationService) {
      return
    }

    if (previousItem.assigneeId !== nextItem.assigneeId && nextItem.assigneeId && nextItem.assigneeId !== actorId) {
      await this.notificationService.createNotification({
        userId: nextItem.assigneeId,
        type: 'task_assigned',
        title: `Task assigned: ${nextItem.title}`,
        message: `You were assigned ${nextItem.title}. Open the task and continue execution.`,
        entityType: nextItem.entityType,
        entityId: nextItem.entityId,
        taskId: nextItem.id,
      })
    }

    if (previousItem.status !== nextItem.status && nextItem.status === 'review' && nextItem.creatorId !== actorId) {
      await this.notificationService.createNotification({
        userId: nextItem.creatorId,
        type: 'task_review_requested',
        title: `Task moved to review: ${nextItem.title}`,
        message: `Review the task and confirm the submitted work for ${nextItem.title}.`,
        entityType: nextItem.entityType,
        entityId: nextItem.entityId,
        taskId: nextItem.id,
      })
    }
  }

  private throwPersistenceError(error: unknown, action: 'create' | 'update' | 'deactivate' | 'restore', id?: string): never {
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
