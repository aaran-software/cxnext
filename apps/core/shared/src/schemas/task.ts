import { z } from 'zod'

export const TaskStatusEnum = z.enum([
  'pending',
  'in_progress',
  'review',
  'finalized',
])

export const TaskPriorityEnum = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
])

export const TaskActivityTypeEnum = z.enum([
  'status_change',
  'comment',
  'assignment',
  'checklist',
  'reviewed',
])

export const TaskVerificationStateEnum = z.enum([
  'not_started',
  'partial',
  'completed',
])

export const TaskScopeTypeEnum = z.enum([
  'general',
  'product',
  'invoice',
  'order',
  'customer',
  'user',
])

const trimmedNullableString = z.string().trim().nullish().transform((value) => value?.trim() || null)
const trimmedStringArray = z.array(z.string().trim().min(1)).default([])

export const taskChecklistItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  isRequired: z.boolean(),
  isChecked: z.boolean(),
  checkedBy: z.string().nullable(),
  checkedByName: z.string().nullable(),
  checkedAt: z.string().nullable(),
  note: z.string().nullable(),
  sortOrder: z.number().int().nonnegative(),
})

export const taskTemplateChecklistItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  isRequired: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
})

export const taskTemplateSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  scopeType: TaskScopeTypeEnum,
  titleTemplate: z.string().min(1),
  descriptionTemplate: z.string().nullable(),
  defaultPriority: TaskPriorityEnum,
  defaultTags: trimmedStringArray,
  isActive: z.boolean(),
  checklistItemCount: z.number().int().nonnegative(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const taskTemplateSchema = taskTemplateSummarySchema.extend({
  checklistItems: z.array(taskTemplateChecklistItemSchema),
})

export const taskActivitySchema = z.object({
  id: z.string().min(1),
  taskId: z.string().min(1),
  authorId: z.string().min(1),
  authorName: z.string().nullable(),
  activityType: TaskActivityTypeEnum,
  content: z.string().min(1),
  createdAt: z.string().min(1),
})

export const taskSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  tags: trimmedStringArray,
  scopeType: TaskScopeTypeEnum,
  entityType: TaskScopeTypeEnum.nullable(),
  entityId: z.string().nullable(),
  entityLabel: z.string().nullable(),
  templateId: z.string().nullable(),
  templateName: z.string().nullable(),
  assigneeId: z.string().nullable(),
  assigneeName: z.string().nullable(),
  reviewAssignedTo: z.string().nullable(),
  reviewAssignedToName: z.string().nullable(),
  creatorId: z.string().min(1),
  creatorName: z.string().min(1),
  reviewedBy: z.string().nullable(),
  reviewedByName: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  reviewComment: z.string().nullable(),
  dueDate: z.string().nullable(),
  checklistCompletionCount: z.number().int().nonnegative(),
  checklistTotalCount: z.number().int().nonnegative(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const taskSchema = taskSummarySchema.extend({
  checklistItems: z.array(taskChecklistItemSchema),
  activities: z.array(taskActivitySchema),
})

export const taskInsightsSchema = z.object({
  systemStatus: z.object({
    totalTasks: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    inProgress: z.number().int().nonnegative(),
    inReview: z.number().int().nonnegative(),
    finalized: z.number().int().nonnegative(),
  }),
  ownership: z.object({
    assignedToMe: z.number().int().nonnegative(),
    createdByMe: z.number().int().nonnegative(),
    unassigned: z.number().int().nonnegative(),
  }),
  urgency: z.object({
    overdue: z.number().int().nonnegative(),
    dueToday: z.number().int().nonnegative(),
    dueThisWeek: z.number().int().nonnegative(),
  }),
  signals: z.object({
    stuck: z.number().int().nonnegative(),
    incompleteVerification: z.number().int().nonnegative(),
    completionRate: z.number().min(0).max(1),
  }),
})

export const taskAuditItemSchema = taskSummarySchema.extend({
  verificationState: TaskVerificationStateEnum,
  isOverdue: z.boolean(),
  isStuck: z.boolean(),
  isIncompleteVerification: z.boolean(),
})

export const taskAuditListResponseSchema = z.object({
  items: z.array(taskAuditItemSchema),
})

export const taskTemplateChecklistItemInputSchema = z.object({
  label: z.string().trim().min(1),
  isRequired: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
})

export const taskTemplateUpsertPayloadSchema = z.object({
  name: z.string().trim().min(3),
  scopeType: TaskScopeTypeEnum,
  titleTemplate: z.string().trim().min(3),
  descriptionTemplate: trimmedNullableString,
  defaultPriority: TaskPriorityEnum.default('medium'),
  defaultTags: trimmedStringArray,
  isActive: z.boolean().default(true),
  checklistItems: z.array(taskTemplateChecklistItemInputSchema).min(1),
})

export const taskChecklistItemUpdateSchema = z.object({
  id: z.string().min(1),
  isChecked: z.boolean(),
  note: trimmedNullableString,
})

export const taskActivityInputSchema = z.object({
  activityType: TaskActivityTypeEnum,
  content: z.string().min(1),
})

export const taskUpsertPayloadSchema = z.object({
  title: z.string().trim().min(3),
  description: trimmedNullableString,
  status: TaskStatusEnum.default('pending'),
  priority: TaskPriorityEnum.default('medium'),
  tags: trimmedStringArray,
  scopeType: TaskScopeTypeEnum.default('general'),
  entityType: TaskScopeTypeEnum.nullable().optional().default(null),
  entityId: trimmedNullableString,
  entityLabel: trimmedNullableString,
  templateId: trimmedNullableString,
  assigneeId: trimmedNullableString,
  dueDate: trimmedNullableString,
  reviewComment: trimmedNullableString.optional().default(null),
  checklistItems: z.array(taskChecklistItemUpdateSchema).default([]),
})

export const taskBulkAssignmentModeEnum = z.enum([
  'specific',
  'self',
  'unassigned',
])

export const taskBulkCreatePayloadSchema = z.object({
  templateId: z.string().min(1),
  entityType: TaskScopeTypeEnum,
  entityIds: z.array(z.string().trim().min(1)).min(1),
  assigneeMode: taskBulkAssignmentModeEnum.default('unassigned'),
  assigneeId: trimmedNullableString,
  dueDate: trimmedNullableString,
  tags: trimmedStringArray,
  priority: TaskPriorityEnum.optional(),
})

export const taskListResponseSchema = z.object({
  items: z.array(taskSummarySchema),
})

export const taskResponseSchema = z.object({
  item: taskSchema,
})

export const taskTemplateListResponseSchema = z.object({
  items: z.array(taskTemplateSummarySchema),
})

export const taskTemplateResponseSchema = z.object({
  item: taskTemplateSchema,
})

export const taskBulkCreateResponseSchema = z.object({
  items: z.array(taskSummarySchema),
  createdCount: z.number().int().nonnegative(),
})

export const taskInsightsResponseSchema = z.object({
  insights: taskInsightsSchema,
})

export type TaskStatus = z.infer<typeof TaskStatusEnum>
export type TaskPriority = z.infer<typeof TaskPriorityEnum>
export type TaskActivityType = z.infer<typeof TaskActivityTypeEnum>
export type TaskVerificationState = z.infer<typeof TaskVerificationStateEnum>
export type TaskScopeType = z.infer<typeof TaskScopeTypeEnum>

export type TaskActivity = z.infer<typeof taskActivitySchema>
export type TaskChecklistItem = z.infer<typeof taskChecklistItemSchema>
export type TaskTemplateChecklistItem = z.infer<typeof taskTemplateChecklistItemSchema>
export type TaskTemplateSummary = z.infer<typeof taskTemplateSummarySchema>
export type TaskTemplate = z.infer<typeof taskTemplateSchema>
export type TaskSummary = z.infer<typeof taskSummarySchema>
export type Task = z.infer<typeof taskSchema>
export type TaskInsights = z.infer<typeof taskInsightsSchema>
export type TaskAuditItem = z.infer<typeof taskAuditItemSchema>

export type TaskTemplateChecklistItemInput = z.infer<typeof taskTemplateChecklistItemInputSchema>
export type TaskTemplateUpsertPayload = z.infer<typeof taskTemplateUpsertPayloadSchema>
export type TaskChecklistItemUpdate = z.infer<typeof taskChecklistItemUpdateSchema>
export type TaskActivityInput = z.infer<typeof taskActivityInputSchema>
export type TaskUpsertPayload = z.infer<typeof taskUpsertPayloadSchema>
export type TaskBulkAssignmentMode = z.infer<typeof taskBulkAssignmentModeEnum>
export type TaskBulkCreatePayload = z.infer<typeof taskBulkCreatePayloadSchema>

export type TaskListResponse = z.infer<typeof taskListResponseSchema>
export type TaskResponse = z.infer<typeof taskResponseSchema>
export type TaskTemplateListResponse = z.infer<typeof taskTemplateListResponseSchema>
export type TaskTemplateResponse = z.infer<typeof taskTemplateResponseSchema>
export type TaskBulkCreateResponse = z.infer<typeof taskBulkCreateResponseSchema>
export type TaskInsightsResponse = z.infer<typeof taskInsightsResponseSchema>
export type TaskAuditListResponse = z.infer<typeof taskAuditListResponseSchema>
