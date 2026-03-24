import { z } from 'zod'

export const frontendTargetSchema = z.enum(['app', 'web', 'shop'])
export const updateSourceModeSchema = z.enum(['embedded', 'git'])

export const systemUpdateSettingsSchema = z.object({
  gitSyncEnabled: z.boolean(),
  autoUpdateOnStart: z.boolean(),
  forceUpdateOnStart: z.boolean(),
  repositoryUrl: z.url(),
  branch: z.string().trim().min(1),
})

export const systemSettingsSchema = z.object({
  frontendTarget: frontendTargetSchema,
  sourceMode: updateSourceModeSchema,
  update: systemUpdateSettingsSchema,
})

export const systemSettingsResponseSchema = z.object({
  settings: systemSettingsSchema,
})

export const systemSettingsUpdatePayloadSchema = z.object({
  frontendTarget: frontendTargetSchema,
  update: z.object({
    gitSyncEnabled: z.boolean(),
    autoUpdateOnStart: z.boolean(),
    repositoryUrl: z.url(),
    branch: z.string().trim().min(1),
  }),
})

export const systemUpdateRunPayloadSchema = systemSettingsUpdatePayloadSchema

export const systemUpdateRunResponseSchema = z.object({
  message: z.string().min(1),
  restartScheduled: z.boolean(),
})

export type FrontendTarget = z.infer<typeof frontendTargetSchema>
export type UpdateSourceMode = z.infer<typeof updateSourceModeSchema>
export type SystemUpdateSettings = z.infer<typeof systemUpdateSettingsSchema>
export type SystemSettings = z.infer<typeof systemSettingsSchema>
export type SystemSettingsResponse = z.infer<typeof systemSettingsResponseSchema>
export type SystemSettingsUpdatePayload = z.infer<typeof systemSettingsUpdatePayloadSchema>
export type SystemUpdateRunPayload = z.infer<typeof systemUpdateRunPayloadSchema>
export type SystemUpdateRunResponse = z.infer<typeof systemUpdateRunResponseSchema>
