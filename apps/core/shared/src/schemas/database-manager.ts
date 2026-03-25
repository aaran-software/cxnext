import { z } from 'zod'
import { databaseVersionSummarySchema } from './version'

export const databaseManagerTableStatusSchema = z.enum(['ok', 'missing', 'unexpected'])
export const databaseManagerReportStatusSchema = z.enum(['ready', 'warning', 'error', 'disabled'])

export const databaseManagerTableSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  exists: z.boolean(),
  expected: z.boolean(),
  status: databaseManagerTableStatusSchema,
  rowCount: z.number().int().nonnegative().nullable(),
  columnCount: z.number().int().nonnegative().nullable(),
})

export const databaseBackupSummarySchema = z.object({
  fileName: z.string().min(1),
  createdAt: z.string().min(1),
  byteSize: z.number().int().nonnegative(),
  downloadPath: z.string().min(1),
})

export const databaseVerificationSummarySchema = z.object({
  status: databaseManagerReportStatusSchema,
  checkedAt: z.string().min(1),
  detail: z.string().min(1),
  expectedTableCount: z.number().int().nonnegative(),
  existingTableCount: z.number().int().nonnegative(),
  existingManagedTableCount: z.number().int().nonnegative(),
  missingTableCount: z.number().int().nonnegative(),
  unexpectedTableCount: z.number().int().nonnegative(),
  totalRowCount: z.number().int().nonnegative(),
})

export const databaseManagerReportSchema = z.object({
  database: databaseVersionSummarySchema,
  verification: databaseVerificationSummarySchema,
  tables: z.array(databaseManagerTableSchema),
  latestBackup: databaseBackupSummarySchema.nullable(),
})

export const databaseManagerResponseSchema = z.object({
  report: databaseManagerReportSchema,
})

export const databaseManagerActionResponseSchema = z.object({
  message: z.string().min(1),
  report: databaseManagerReportSchema,
})

export const databaseBackupResponseSchema = z.object({
  message: z.string().min(1),
  backup: databaseBackupSummarySchema,
  report: databaseManagerReportSchema,
})

export const databaseHardResetPayloadSchema = z.object({
  confirmation: z.string().trim().min(1),
})

export type DatabaseManagerTableStatus = z.infer<typeof databaseManagerTableStatusSchema>
export type DatabaseManagerReportStatus = z.infer<typeof databaseManagerReportStatusSchema>
export type DatabaseManagerTable = z.infer<typeof databaseManagerTableSchema>
export type DatabaseBackupSummary = z.infer<typeof databaseBackupSummarySchema>
export type DatabaseVerificationSummary = z.infer<typeof databaseVerificationSummarySchema>
export type DatabaseManagerReport = z.infer<typeof databaseManagerReportSchema>
export type DatabaseManagerResponse = z.infer<typeof databaseManagerResponseSchema>
export type DatabaseManagerActionResponse = z.infer<typeof databaseManagerActionResponseSchema>
export type DatabaseBackupResponse = z.infer<typeof databaseBackupResponseSchema>
export type DatabaseHardResetPayload = z.infer<typeof databaseHardResetPayloadSchema>
