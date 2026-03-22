import { z } from 'zod'

export const actorTypeSchema = z.enum(['customer', 'staff', 'admin', 'vendor'])
export const permissionKeySchema = z.enum([
  'dashboard:view',
  'users:manage',
  'roles:manage',
  'permissions:manage',
  'vendors:view',
  'customers:view',
])

export const roleKeySchema = z.enum([
  'customer_portal',
  'staff_operator',
  'admin_owner',
  'vendor_portal',
])

export const permissionSchema = z.object({
  key: permissionKeySchema,
  name: z.string().min(1),
  summary: z.string().min(1),
})

export const roleSchema = z.object({
  key: roleKeySchema,
  name: z.string().min(1),
  summary: z.string().min(1),
  actorType: actorTypeSchema,
  permissions: z.array(permissionSchema),
})

export const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  phoneNumber: z.string().min(10).nullable(),
  displayName: z.string().min(1),
  actorType: actorTypeSchema,
  avatarUrl: z.url().nullable(),
  isActive: z.boolean(),
  organizationName: z.string().min(1).nullable(),
  roles: z.array(roleSchema),
  permissions: z.array(permissionSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const authOtpChannelSchema = z.enum(['email', 'mobile'])

export const authRegisterOtpRequestPayloadSchema = z.object({
  channel: authOtpChannelSchema,
  destination: z.string().trim().min(1),
})

export const authRegisterOtpRequestResponseSchema = z.object({
  verificationId: z.string().min(1),
  expiresAt: z.string().min(1),
  debugOtp: z.string().length(6).nullable(),
})

export const authRegisterOtpVerifyPayloadSchema = z.object({
  verificationId: z.string().min(1),
  otp: z.string().trim().length(6).optional(),
  accessToken: z.string().trim().min(1).optional(),
}).superRefine((value, context) => {
  if (!value.otp && !value.accessToken) {
    context.addIssue({
      code: 'custom',
      message: 'Provide either OTP or access token.',
      path: ['otp'],
    })
  }
})

export const authRegisterOtpVerifyResponseSchema = z.object({
  verificationId: z.string().min(1),
  verified: z.literal(true),
})

export const authRegisterPayloadSchema = z.object({
  email: z.email(),
  phoneNumber: z.string().trim().min(10).max(20),
  password: z.string().min(8),
  displayName: z.string().min(2),
  actorType: actorTypeSchema.default('customer'),
  emailVerificationId: z.string().min(1),
  mobileVerificationId: z.string().min(1).optional(),
  organizationName: z.string().trim().min(2).max(120).optional(),
})

export const authLoginPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const authTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresInSeconds: z.number().int().positive(),
  user: authUserSchema,
})

export const databaseHealthSchema = z.object({
  status: z.enum(['ok', 'disabled', 'error']),
  engine: z.literal('mariadb'),
  checkedAt: z.string().min(1),
  detail: z.string().min(1),
})

export type ActorType = z.infer<typeof actorTypeSchema>
export type PermissionKey = z.infer<typeof permissionKeySchema>
export type RoleKey = z.infer<typeof roleKeySchema>
export type AuthPermission = z.infer<typeof permissionSchema>
export type AuthRole = z.infer<typeof roleSchema>
export type AuthUser = z.infer<typeof authUserSchema>
export type AuthOtpChannel = z.infer<typeof authOtpChannelSchema>
export type AuthRegisterOtpRequestPayload = z.infer<typeof authRegisterOtpRequestPayloadSchema>
export type AuthRegisterOtpRequestResponse = z.infer<typeof authRegisterOtpRequestResponseSchema>
export type AuthRegisterOtpVerifyPayload = z.infer<typeof authRegisterOtpVerifyPayloadSchema>
export type AuthRegisterOtpVerifyResponse = z.infer<typeof authRegisterOtpVerifyResponseSchema>
export type AuthRegisterPayload = z.infer<typeof authRegisterPayloadSchema>
export type AuthLoginPayload = z.infer<typeof authLoginPayloadSchema>
export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>
export type DatabaseHealth = z.infer<typeof databaseHealthSchema>
