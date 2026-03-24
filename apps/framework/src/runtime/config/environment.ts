import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { z } from 'zod'

const frontendTargetSchema = z.enum(['app', 'web', 'shop'])
const appModeSchema = frontendTargetSchema
const optionalNonEmptyString = z
  .string()
  .optional()
  .transform((value) => {
    const normalized = value?.trim()
    return normalized ? normalized : undefined
  })

const optionalPositiveInteger = z
  .string()
  .optional()
  .transform((value) => {
    const normalized = value?.trim()
    if (!normalized) {
      return undefined
    }

    const parsed = Number(normalized)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error('Expected a positive integer.')
    }

    return parsed
  })

const optionalBooleanFlag = z
  .string()
  .transform((value) => {
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
  })

const requiredBooleanFlag = z.string().transform((value) => ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase()))
const defaultFalseBooleanFlag = z
  .string()
  .optional()
  .transform((value) => ['1', 'true', 'yes', 'on'].includes((value ?? '').trim().toLowerCase()))

const environmentSchema = z.object({
  APP_MODE: appModeSchema.optional(),
  APP_DEBUG: requiredBooleanFlag,
  APP_SKIP_SETUP_CHECK: requiredBooleanFlag,
  PORT: z.coerce.number().int().positive(),
  CORS_ORIGIN: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive(),
  VITE_FRONTEND_TARGET: frontendTargetSchema,
  DB_ENABLED: requiredBooleanFlag,
  DB_HOST: optionalNonEmptyString,
  DB_PORT: optionalPositiveInteger,
  DB_USER: optionalNonEmptyString,
  DB_PASSWORD: z.string().optional().transform((value) => value ?? ''),
  DB_NAME: optionalNonEmptyString,
  WEB_DIST_ROOT: z.string().min(1),
  SEED_DEFAULT_USER: z
    .string()
    .transform((value) => value !== 'false'),
  SEED_DEFAULT_USER_NAME: z.string().min(1),
  SEED_DEFAULT_USER_EMAIL: z.email(),
  SEED_DEFAULT_USER_PASSWORD: z.string().min(8),
  SEED_DEFAULT_USER_AVATAR_URL: z.url(),
  SEED_DUMMY_PRODUCTS: z
    .string()
    .transform((value) => value !== 'false'),
  MEDIA_STORAGE_ROOT: z.string().min(1),
  MEDIA_PUBLIC_BASE_URL: z.string().min(1),
  MEDIA_WEB_PUBLIC_SYMLINK: z.string().min(1),
  AUTH_OTP_DEBUG: z
    .string()
    .transform((value) => value !== 'false'),
  AUTH_OTP_EXPIRY_MINUTES: z.coerce.number().int().positive(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: optionalBooleanFlag,
  SMTP_USER: optionalNonEmptyString,
  SMTP_PASS: optionalNonEmptyString,
  SMTP_FROM_EMAIL: optionalNonEmptyString,
  SMTP_FROM_NAME: z.string().min(1),
  MSG91_AUTH_KEY: optionalNonEmptyString,
  MSG91_TEMPLATE_ID: optionalNonEmptyString,
  MSG91_OTP_BASE_URL: z.string().min(1),
  MSG91_WIDGET_VERIFY_URL: z.string().min(1),
  MSG91_COUNTRY_CODE: z.string().min(1),
  WHATSAPP_ACCESS_TOKEN: optionalNonEmptyString,
  WHATSAPP_PHONE_NUMBER_ID: optionalNonEmptyString,
  WHATSAPP_TEMPLATE_NAME: optionalNonEmptyString,
  WHATSAPP_TEMPLATE_LANGUAGE: z.string().min(1),
  WHATSAPP_GRAPH_API_VERSION: z.string().min(1),
  RAZORPAY_KEY_ID: optionalNonEmptyString,
  RAZORPAY_KEY_SECRET: optionalNonEmptyString,
  RAZORPAY_BUSINESS_NAME: z.string().min(1),
  RAZORPAY_CHECKOUT_IMAGE: optionalNonEmptyString,
  RAZORPAY_THEME_COLOR: optionalNonEmptyString,
  PAYMENT_TEST_BYPASS: defaultFalseBooleanFlag,
  SUPER_ADMIN_EMAILS: z.string(),
  GIT_SYNC_ENABLED: requiredBooleanFlag,
  GIT_AUTO_UPDATE_ON_START: requiredBooleanFlag,
  GIT_FORCE_UPDATE_ON_START: requiredBooleanFlag,
  GIT_REPOSITORY_URL: z.string().min(1),
  GIT_BRANCH: z.string().min(1),
  INSTALL_DEPS_ON_START: requiredBooleanFlag,
  BUILD_ON_START: requiredBooleanFlag,
}).superRefine((value, context) => {
  if (value.DB_ENABLED && (!value.DB_HOST || !value.DB_PORT || !value.DB_USER || value.DB_PASSWORD === undefined || !value.DB_NAME)) {
    context.addIssue({
      code: 'custom',
      message: 'Database settings are required when DB_ENABLED=true.',
      path: ['DB_ENABLED'],
    })
  }

  if (value.GIT_SYNC_ENABLED && !value.GIT_REPOSITORY_URL.trim()) {
    context.addIssue({
      code: 'custom',
      message: 'GIT_REPOSITORY_URL is required when GIT_SYNC_ENABLED=true.',
      path: ['GIT_REPOSITORY_URL'],
    })
  }
})

const envFilePath = path.resolve(process.cwd(), '.env')

function readEnvironmentFile() {
  if (!fs.existsSync(envFilePath)) {
    throw new Error(`Missing .env file at ${envFilePath}. Copy .env.example to .env before starting CXNext.`)
  }

  const rawValue = fs.readFileSync(envFilePath, 'utf8')
  return dotenv.parse(rawValue)
}

function resolveEnvironment() {
  const parsedEnvironment = environmentSchema.parse(readEnvironmentFile())
  const resolvedStorageRoot = path.resolve(process.cwd(), parsedEnvironment.MEDIA_STORAGE_ROOT)
  const resolvedWebPublicSymlink = path.resolve(process.cwd(), parsedEnvironment.MEDIA_WEB_PUBLIC_SYMLINK)
  const resolvedWebDistRoot = path.resolve(process.cwd(), parsedEnvironment.WEB_DIST_ROOT)
  const superAdminEmails = parsedEnvironment.SUPER_ADMIN_EMAILS.split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  return {
    envFilePath,
    app: {
      mode: parsedEnvironment.APP_MODE ?? parsedEnvironment.VITE_FRONTEND_TARGET,
      debug: parsedEnvironment.APP_DEBUG,
      skipSetupCheck: parsedEnvironment.APP_SKIP_SETUP_CHECK,
    },
    port: parsedEnvironment.PORT,
    corsOrigin: parsedEnvironment.CORS_ORIGIN,
    jwtSecret: parsedEnvironment.JWT_SECRET,
    jwtExpiresInSeconds: parsedEnvironment.JWT_EXPIRES_IN_SECONDS,
    frontend: {
      target: parsedEnvironment.APP_MODE ?? parsedEnvironment.VITE_FRONTEND_TARGET,
    },
    database: {
      enabled: parsedEnvironment.DB_ENABLED,
      host: parsedEnvironment.DB_HOST ?? '',
      port: parsedEnvironment.DB_PORT ?? 0,
      user: parsedEnvironment.DB_USER ?? '',
      password: parsedEnvironment.DB_PASSWORD ?? '',
      name: parsedEnvironment.DB_NAME ?? '',
    },
    web: {
      distRoot: resolvedWebDistRoot,
    },
    superAdminEmails,
    seed: {
      enabled: parsedEnvironment.SEED_DEFAULT_USER,
      defaultUser: {
        displayName: parsedEnvironment.SEED_DEFAULT_USER_NAME,
        email: parsedEnvironment.SEED_DEFAULT_USER_EMAIL,
        password: parsedEnvironment.SEED_DEFAULT_USER_PASSWORD,
        avatarUrl: parsedEnvironment.SEED_DEFAULT_USER_AVATAR_URL,
      },
      products: {
        enabled: parsedEnvironment.SEED_DUMMY_PRODUCTS,
      },
    },
    media: {
      storageRoot: resolvedStorageRoot,
      publicDirectory: path.join(resolvedStorageRoot, 'public'),
      privateDirectory: path.join(resolvedStorageRoot, 'private'),
      publicBaseUrl: parsedEnvironment.MEDIA_PUBLIC_BASE_URL.replace(/\/$/, ''),
      webPublicSymlink: resolvedWebPublicSymlink,
    },
    auth: {
      otp: {
        debug: parsedEnvironment.AUTH_OTP_DEBUG,
        expiryMinutes: parsedEnvironment.AUTH_OTP_EXPIRY_MINUTES,
      },
    },
    notifications: {
      email: {
        enabled: Boolean(
          parsedEnvironment.SMTP_USER &&
            parsedEnvironment.SMTP_PASS &&
            parsedEnvironment.SMTP_FROM_EMAIL,
        ),
        host: parsedEnvironment.SMTP_HOST,
        port: parsedEnvironment.SMTP_PORT,
        secure: parsedEnvironment.SMTP_SECURE,
        user: parsedEnvironment.SMTP_USER ?? '',
        password: parsedEnvironment.SMTP_PASS ?? '',
        fromEmail: parsedEnvironment.SMTP_FROM_EMAIL ?? '',
        fromName: parsedEnvironment.SMTP_FROM_NAME,
      },
      msg91: {
        enabled: Boolean(parsedEnvironment.MSG91_AUTH_KEY),
        authKey: parsedEnvironment.MSG91_AUTH_KEY ?? '',
        templateId: parsedEnvironment.MSG91_TEMPLATE_ID ?? '',
        otpBaseUrl: parsedEnvironment.MSG91_OTP_BASE_URL.replace(/\/$/, ''),
        widgetVerifyUrl: parsedEnvironment.MSG91_WIDGET_VERIFY_URL,
        countryCode: parsedEnvironment.MSG91_COUNTRY_CODE.replace(/\D/g, '') || '91',
      },
      whatsapp: {
        enabled: Boolean(
          parsedEnvironment.WHATSAPP_ACCESS_TOKEN &&
            parsedEnvironment.WHATSAPP_PHONE_NUMBER_ID &&
            parsedEnvironment.WHATSAPP_TEMPLATE_NAME,
        ),
        accessToken: parsedEnvironment.WHATSAPP_ACCESS_TOKEN ?? '',
        phoneNumberId: parsedEnvironment.WHATSAPP_PHONE_NUMBER_ID ?? '',
        templateName: parsedEnvironment.WHATSAPP_TEMPLATE_NAME ?? '',
        templateLanguage: parsedEnvironment.WHATSAPP_TEMPLATE_LANGUAGE,
        graphApiVersion: parsedEnvironment.WHATSAPP_GRAPH_API_VERSION,
      },
    },
    payments: {
      razorpay: {
        enabled: Boolean(parsedEnvironment.RAZORPAY_KEY_ID && parsedEnvironment.RAZORPAY_KEY_SECRET),
        keyId: parsedEnvironment.RAZORPAY_KEY_ID ?? '',
        keySecret: parsedEnvironment.RAZORPAY_KEY_SECRET ?? '',
        businessName: parsedEnvironment.RAZORPAY_BUSINESS_NAME,
        checkoutImage: parsedEnvironment.RAZORPAY_CHECKOUT_IMAGE ?? null,
        themeColor: parsedEnvironment.RAZORPAY_THEME_COLOR ?? '',
      },
      testBypass: parsedEnvironment.PAYMENT_TEST_BYPASS,
    },
    runtime: {
      git: {
        syncEnabled: parsedEnvironment.GIT_SYNC_ENABLED,
        autoUpdateOnStart: parsedEnvironment.GIT_AUTO_UPDATE_ON_START,
        forceUpdateOnStart: parsedEnvironment.GIT_FORCE_UPDATE_ON_START,
        repositoryUrl: parsedEnvironment.GIT_REPOSITORY_URL,
        branch: parsedEnvironment.GIT_BRANCH,
      },
      startup: {
        installDepsOnStart: parsedEnvironment.INSTALL_DEPS_ON_START,
        buildOnStart: parsedEnvironment.BUILD_ON_START,
      },
    },
  }
}

export let environment = resolveEnvironment()

export function reloadEnvironment() {
  environment = resolveEnvironment()
  return environment
}

export function isSuperAdminEmail(email: string, actorType: string) {
  return actorType === 'admin' && environment.superAdminEmails.includes(email.trim().toLowerCase())
}

export function updateEnvironmentFile(updates: Record<string, string>) {
  if (!fs.existsSync(envFilePath)) {
    throw new Error(`Missing .env file at ${envFilePath}. Copy .env.example to .env before starting CXNext.`)
  }

  const existingRaw = fs.readFileSync(envFilePath, 'utf8')
  const lines = existingRaw.split(/\r?\n/)
  const pendingEntries = new Map(Object.entries(updates))
  const nextLines = lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)

    if (!match) {
      return line
    }

    const key = match[1]
    const nextValue = pendingEntries.get(key)
    if (nextValue === undefined) {
      return line
    }

    pendingEntries.delete(key)
    return `${key}=${nextValue}`
  })

  if (pendingEntries.size > 0) {
    if (nextLines.length > 0 && nextLines[nextLines.length - 1] !== '') {
      nextLines.push('')
    }

    for (const [key, value] of pendingEntries.entries()) {
      nextLines.push(`${key}=${value}`)
    }
  }

  fs.writeFileSync(envFilePath, `${nextLines.join('\n').replace(/\n*$/, '\n')}`, 'utf8')
  return reloadEnvironment()
}
