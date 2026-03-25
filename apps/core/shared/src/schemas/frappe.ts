import { z } from 'zod'

export const frappeSettingsSchema = z.object({
  enabled: z.boolean(),
  baseUrl: z.string().trim(),
  siteName: z.string().trim(),
  apiKey: z.string().trim(),
  apiSecret: z.string().trim(),
  timeoutSeconds: z.number().int().min(1).max(120),
  defaultCompany: z.string().trim(),
  defaultWarehouse: z.string().trim(),
  defaultPriceList: z.string().trim(),
  defaultCustomerGroup: z.string().trim(),
  defaultItemGroup: z.string().trim(),
  isConfigured: z.boolean(),
})

export const frappeSettingsResponseSchema = z.object({
  settings: frappeSettingsSchema,
})

export const frappeSettingsUpdatePayloadSchema = z.object({
  enabled: z.boolean(),
  baseUrl: z.string().trim(),
  siteName: z.string().trim(),
  apiKey: z.string().trim(),
  apiSecret: z.string().trim(),
  timeoutSeconds: z.number().int().min(1).max(120),
  defaultCompany: z.string().trim(),
  defaultWarehouse: z.string().trim(),
  defaultPriceList: z.string().trim(),
  defaultCustomerGroup: z.string().trim(),
  defaultItemGroup: z.string().trim(),
})

export const frappeConnectionVerificationSchema = z.object({
  ok: z.boolean(),
  message: z.string().min(1),
  detail: z.string().trim(),
  serverUrl: z.string().trim(),
  siteName: z.string().trim(),
  connectedUser: z.string().trim(),
})

export const frappeConnectionVerificationResponseSchema = z.object({
  verification: frappeConnectionVerificationSchema,
})

export const frappeTodoStatusSchema = z.enum(['Open', 'Closed', 'Cancelled'])
export const frappeTodoPrioritySchema = z.enum(['Low', 'Medium', 'High'])

export const frappeTodoSchema = z.object({
  id: z.string().trim().min(1),
  description: z.string().trim(),
  status: frappeTodoStatusSchema,
  priority: frappeTodoPrioritySchema,
  dueDate: z.string().trim(),
  allocatedTo: z.string().trim(),
  owner: z.string().trim(),
  modifiedAt: z.string().trim(),
})

export const frappeTodoListSchema = z.object({
  items: z.array(frappeTodoSchema),
  syncedAt: z.string().trim().min(1),
})

export const frappeTodoListResponseSchema = z.object({
  todos: frappeTodoListSchema,
})

export const frappeTodoUpsertPayloadSchema = z.object({
  description: z.string().trim().min(1),
  status: frappeTodoStatusSchema,
  priority: frappeTodoPrioritySchema,
  dueDate: z.string().trim(),
  allocatedTo: z.string().trim(),
})

export const frappeTodoResponseSchema = z.object({
  item: frappeTodoSchema,
})

export type FrappeSettings = z.infer<typeof frappeSettingsSchema>
export type FrappeSettingsResponse = z.infer<typeof frappeSettingsResponseSchema>
export type FrappeSettingsUpdatePayload = z.infer<typeof frappeSettingsUpdatePayloadSchema>
export type FrappeConnectionVerification = z.infer<typeof frappeConnectionVerificationSchema>
export type FrappeConnectionVerificationResponse = z.infer<typeof frappeConnectionVerificationResponseSchema>
export type FrappeTodoStatus = z.infer<typeof frappeTodoStatusSchema>
export type FrappeTodoPriority = z.infer<typeof frappeTodoPrioritySchema>
export type FrappeTodo = z.infer<typeof frappeTodoSchema>
export type FrappeTodoList = z.infer<typeof frappeTodoListSchema>
export type FrappeTodoListResponse = z.infer<typeof frappeTodoListResponseSchema>
export type FrappeTodoUpsertPayload = z.infer<typeof frappeTodoUpsertPayloadSchema>
export type FrappeTodoResponse = z.infer<typeof frappeTodoResponseSchema>
