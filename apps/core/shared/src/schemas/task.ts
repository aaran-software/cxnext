import { z } from 'zod'

export const TaskStatusEnum = z.enum([
  'pending',
  'in_progress',
  'review',
  'finalized'
])

export const TaskPriorityEnum = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
])

export const TaskActivityTypeEnum = z.enum([
  'status_change',
  'comment',
  'assignment'
])

const dashString = z.string().trim().nullish().transform((value) => value?.trim() || '-')

export const taskActivitySchema = z.object({
  id: z.string().min(1),
  taskId: z.string().min(1),
  authorId: z.string().min(1),
  activityType: TaskActivityTypeEnum,
  content: z.string().min(1), // could be a comment text, or a JSON string for state changes
  createdAt: z.string().min(1),
})

export const taskSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  tags: z.array(z.string().min(1)),
  assigneeId: z.string().nullable(),
  assigneeName: z.string().nullable(),
  creatorId: z.string().min(1),
  creatorName: z.string().min(1),
  dueDate: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const taskSchema = taskSummarySchema.extend({
  activities: z.array(taskActivitySchema),
})

export const taskActivityInputSchema = z.object({
  activityType: TaskActivityTypeEnum,
  content: z.string().min(1),
})

export const taskUpsertPayloadSchema = z.object({
  title: z.string().trim().min(3),
  description: dashString,
  status: TaskStatusEnum.default('pending'),
  priority: TaskPriorityEnum.default('medium'),
  tags: z.array(z.string().trim().min(1)).default([]),
  assigneeId: z.string().nullable().optional().default(null),
  dueDate: z.string().nullable().optional().default(null),
})

export const taskListResponseSchema = z.object({
  items: z.array(taskSummarySchema),
})

export const taskResponseSchema = z.object({
  item: taskSchema,
})

export type TaskStatus = z.infer<typeof TaskStatusEnum>
export type TaskPriority = z.infer<typeof TaskPriorityEnum>
export type TaskActivityType = z.infer<typeof TaskActivityTypeEnum>

export type TaskActivity = z.infer<typeof taskActivitySchema>
export type TaskSummary = z.infer<typeof taskSummarySchema>
export type Task = z.infer<typeof taskSchema>

export type TaskActivityInput = z.infer<typeof taskActivityInputSchema>
export type TaskUpsertPayload = z.infer<typeof taskUpsertPayloadSchema>

export type TaskListResponse = z.infer<typeof taskListResponseSchema>
export type TaskResponse = z.infer<typeof taskResponseSchema>
