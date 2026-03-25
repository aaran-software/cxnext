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

export const frappeReferenceOptionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim(),
  disabled: z.boolean(),
  isGroup: z.boolean(),
})

export const frappeItemSchema = z.object({
  id: z.string().trim().min(1),
  itemCode: z.string().trim().min(1),
  itemName: z.string().trim().min(1),
  description: z.string().trim(),
  itemGroup: z.string().trim(),
  stockUom: z.string().trim(),
  brand: z.string().trim(),
  gstHsnCode: z.string().trim(),
  defaultCompany: z.string().trim(),
  defaultWarehouse: z.string().trim(),
  disabled: z.boolean(),
  isStockItem: z.boolean(),
  hasVariants: z.boolean(),
  modifiedAt: z.string().trim(),
  syncedProductId: z.string().trim(),
  syncedProductName: z.string().trim(),
  syncedProductSlug: z.string().trim(),
  isSyncedToProduct: z.boolean(),
})

export const frappeItemReferencesSchema = z.object({
  itemGroups: z.array(frappeReferenceOptionSchema),
  stockUoms: z.array(frappeReferenceOptionSchema),
  warehouses: z.array(frappeReferenceOptionSchema),
  brands: z.array(frappeReferenceOptionSchema),
  gstHsnCodes: z.array(frappeReferenceOptionSchema),
  defaults: z.object({
    company: z.string().trim(),
    warehouse: z.string().trim(),
    itemGroup: z.string().trim(),
    priceList: z.string().trim(),
  }),
})

export const frappeItemManagerSchema = z.object({
  items: z.array(frappeItemSchema),
  references: frappeItemReferencesSchema,
  syncedAt: z.string().trim().min(1),
})

export const frappeItemManagerResponseSchema = z.object({
  manager: frappeItemManagerSchema,
})

export const frappeItemUpsertPayloadSchema = z.object({
  itemCode: z.string().trim().min(1),
  itemName: z.string().trim().min(1),
  description: z.string().trim(),
  itemGroup: z.string().trim().min(1),
  stockUom: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  gstHsnCode: z.string().trim().min(1),
  defaultWarehouse: z.string().trim(),
  disabled: z.boolean(),
  isStockItem: z.boolean(),
})

export const frappeItemResponseSchema = z.object({
  item: frappeItemSchema,
})

export const frappeItemProductSyncPayloadSchema = z.object({
  itemIds: z.array(z.string().trim().min(1)).min(1),
})

export const frappeItemProductSyncResultSchema = z.object({
  frappeItemId: z.string().trim().min(1),
  frappeItemCode: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  productName: z.string().trim().min(1),
  productSlug: z.string().trim().min(1),
  mode: z.enum(['create', 'update']),
})

export const frappeItemProductSyncResponseSchema = z.object({
  sync: z.object({
    items: z.array(frappeItemProductSyncResultSchema),
    syncedAt: z.string().trim().min(1),
  }),
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
export type FrappeReferenceOption = z.infer<typeof frappeReferenceOptionSchema>
export type FrappeItem = z.infer<typeof frappeItemSchema>
export type FrappeItemReferences = z.infer<typeof frappeItemReferencesSchema>
export type FrappeItemManager = z.infer<typeof frappeItemManagerSchema>
export type FrappeItemManagerResponse = z.infer<typeof frappeItemManagerResponseSchema>
export type FrappeItemUpsertPayload = z.infer<typeof frappeItemUpsertPayloadSchema>
export type FrappeItemResponse = z.infer<typeof frappeItemResponseSchema>
export type FrappeItemProductSyncPayload = z.infer<typeof frappeItemProductSyncPayloadSchema>
export type FrappeItemProductSyncResult = z.infer<typeof frappeItemProductSyncResultSchema>
export type FrappeItemProductSyncResponse = z.infer<typeof frappeItemProductSyncResponseSchema>
