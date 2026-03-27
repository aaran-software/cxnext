import type {
  TaskListResponse,
  TaskResponse,
  TaskTemplateListResponse,
  TaskTemplateResponse,
  TaskUpsertPayload,
} from '@shared/index'
import {
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

interface PersistenceError {
  sqlMessage?: string
  message?: string
}

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async listForUser(userId: string) {
    const items = await this.repository.listVisibleTasks(userId)
    return taskListResponseSchema.parse({ items } satisfies TaskListResponse)
  }

  async listAll() {
    const items = await this.repository.listAllTasks()
    return taskListResponseSchema.parse({ items } satisfies TaskListResponse)
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

  async create(creatorId: string, payload: unknown) {
    const parsedPayload = taskUpsertPayloadSchema.parse(payload)
    try {
      const item = await this.repository.create(creatorId, parsedPayload)
      return taskResponseSchema.parse({ item } satisfies TaskResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'create')
    }
  }

  async createFromTemplate(creatorId: string, payload: unknown) {
    const parsedPayload = payload as {
      templateId: string
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
      scopeType: template.scopeType,
      entityType: parsedPayload.entityType ?? (template.scopeType === 'general' ? null : template.scopeType),
      entityId: parsedPayload.entityId ?? null,
      entityLabel: parsedPayload.entityLabel ?? null,
      templateId: template.id,
      assigneeId: parsedPayload.assigneeId ?? null,
      dueDate: parsedPayload.dueDate ?? null,
      checklistItems: [],
    })

    return this.create(creatorId, nextPayload)
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
