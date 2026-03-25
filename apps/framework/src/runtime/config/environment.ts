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

const defaultFalseBooleanFlag = z
  .string()
  .optional()
  .transform((value) => ['1', 'true', 'yes', 'on'].includes((value ?? '').trim().toLowerCase()))
const defaultNonEmptyString = (fallback: string) =>
  z
    .string()
    .optional()
    .transform((value) => {
      const normalized = value?.trim()
      return normalized ? normalized : fallback
    })
const defaultIntegerString = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((value) => {
      const normalized = value?.trim()
      if (!normalized) {
        return fallback
      }

      const parsed = Number(normalized)
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error('Expected a positive integer.')
      }

      return parsed
    })

const environmentSchema = z.object({
  APP_MODE: appModeSchema.optional(),
  APP_DEBUG: defaultFalseBooleanFlag,
  APP_SKIP_SETUP_CHECK: defaultFalseBooleanFlag,
  PORT: defaultIntegerString(4000),
  CORS_ORIGIN: defaultNonEmptyString('http://localhost:5173'),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN_SECONDS: defaultIntegerString(28800),
  VITE_FRONTEND_TARGET: frontendTargetSchema.default('web'),
  DB_ENABLED: defaultFalseBooleanFlag,
  DB_HOST: optionalNonEmptyString,
  DB_PORT: optionalPositiveInteger,
  DB_USER: optionalNonEmptyString,
  DB_PASSWORD: z.string().optional().transform((value) => value ?? ''),
  DB_NAME: optionalNonEmptyString,
  WEB_DIST_ROOT: defaultNonEmptyString('apps/ecommerce/web/dist'),
  SEED_DEFAULT_USER: z
    .string()
    .optional()
    .transform((value) => value !== 'false'),
  SEED_DEFAULT_USER_NAME: defaultNonEmptyString('Sundar'),
  SEED_DEFAULT_USER_EMAIL: z.string().optional().transform((value) => value?.trim() || 'sundar@sundar.com').pipe(z.email()),
  SEED_DEFAULT_USER_PASSWORD: z.string().optional().transform((value) => value?.trim() || 'change-me-now'),
  SEED_DEFAULT_USER_AVATAR_URL: z.string().optional().transform((value) => value?.trim() || 'https://ui-avatars.com/api/?name=Platform+Admin&background=1f2937&color=ffffff').pipe(z.url()),
  SEED_DUMMY_PRODUCTS: z
    .string()
    .optional()
    .transform((value) => value !== 'false'),
  MEDIA_STORAGE_ROOT: defaultNonEmptyString('storage'),
  MEDIA_PUBLIC_BASE_URL: defaultNonEmptyString('/media/public'),
  MEDIA_WEB_PUBLIC_SYMLINK: defaultNonEmptyString('public/storage'),
  AUTH_OTP_DEBUG: z
    .string()
    .optional()
    .transform((value) => value !== 'false'),
  AUTH_OTP_EXPIRY_MINUTES: defaultIntegerString(10),
  SMTP_HOST: defaultNonEmptyString('smtp.gmail.com'),
  SMTP_PORT: defaultIntegerString(465),
  SMTP_SECURE: defaultFalseBooleanFlag,
  SMTP_USER: optionalNonEmptyString,
  SMTP_PASS: optionalNonEmptyString,
  SMTP_FROM_EMAIL: optionalNonEmptyString,
  SMTP_FROM_NAME: defaultNonEmptyString('CXNext'),
  MSG91_AUTH_KEY: optionalNonEmptyString,
  MSG91_TEMPLATE_ID: optionalNonEmptyString,
  MSG91_OTP_BASE_URL: defaultNonEmptyString('https://api.msg91.com/api/v5/otp'),
  MSG91_WIDGET_VERIFY_URL: defaultNonEmptyString('https://control.msg91.com/api/v5/widget/verifyAccessToken'),
  MSG91_COUNTRY_CODE: defaultNonEmptyString('91'),
  WHATSAPP_ACCESS_TOKEN: optionalNonEmptyString,
  WHATSAPP_PHONE_NUMBER_ID: optionalNonEmptyString,
  WHATSAPP_TEMPLATE_NAME: optionalNonEmptyString,
  WHATSAPP_TEMPLATE_LANGUAGE: defaultNonEmptyString('en'),
  WHATSAPP_GRAPH_API_VERSION: defaultNonEmptyString('v23.0'),
  RAZORPAY_KEY_ID: optionalNonEmptyString,
  RAZORPAY_KEY_SECRET: optionalNonEmptyString,
  RAZORPAY_BUSINESS_NAME: defaultNonEmptyString('CXNext'),
  RAZORPAY_CHECKOUT_IMAGE: optionalNonEmptyString,
  RAZORPAY_THEME_COLOR: optionalNonEmptyString,
  PAYMENT_TEST_BYPASS: defaultFalseBooleanFlag,
  SUPER_ADMIN_EMAILS: z.string().optional().transform((value) => value ?? ''),
  GIT_SYNC_ENABLED: defaultFalseBooleanFlag,
  GIT_AUTO_UPDATE_ON_START: defaultFalseBooleanFlag,
  GIT_FORCE_UPDATE_ON_START: defaultFalseBooleanFlag,
  GIT_REPOSITORY_URL: defaultNonEmptyString('https://github.com/aaran-software/cxnext.git'),
  GIT_BRANCH: defaultNonEmptyString('main'),
  INSTALL_DEPS_ON_START: defaultFalseBooleanFlag,
  BUILD_ON_START: defaultFalseBooleanFlag,
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

export const managedEnvironmentKeys = [
  'APP_MODE',
  'APP_DEBUG',
  'APP_SKIP_SETUP_CHECK',
  'PORT',
  'CORS_ORIGIN',
  'JWT_SECRET',
  'JWT_EXPIRES_IN_SECONDS',
  'VITE_FRONTEND_TARGET',
  'DB_ENABLED',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'WEB_DIST_ROOT',
  'SEED_DEFAULT_USER',
  'SEED_DEFAULT_USER_NAME',
  'SEED_DEFAULT_USER_EMAIL',
  'SEED_DEFAULT_USER_PASSWORD',
  'SEED_DEFAULT_USER_AVATAR_URL',
  'SEED_DUMMY_PRODUCTS',
  'MEDIA_STORAGE_ROOT',
  'MEDIA_PUBLIC_BASE_URL',
  'MEDIA_WEB_PUBLIC_SYMLINK',
  'AUTH_OTP_DEBUG',
  'AUTH_OTP_EXPIRY_MINUTES',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM_EMAIL',
  'SMTP_FROM_NAME',
  'MSG91_AUTH_KEY',
  'MSG91_TEMPLATE_ID',
  'MSG91_OTP_BASE_URL',
  'MSG91_WIDGET_VERIFY_URL',
  'MSG91_COUNTRY_CODE',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_TEMPLATE_NAME',
  'WHATSAPP_TEMPLATE_LANGUAGE',
  'WHATSAPP_GRAPH_API_VERSION',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_BUSINESS_NAME',
  'RAZORPAY_CHECKOUT_IMAGE',
  'RAZORPAY_THEME_COLOR',
  'PAYMENT_TEST_BYPASS',
  'SUPER_ADMIN_EMAILS',
  'GIT_SYNC_ENABLED',
  'GIT_AUTO_UPDATE_ON_START',
  'GIT_FORCE_UPDATE_ON_START',
  'GIT_REPOSITORY_URL',
  'GIT_BRANCH',
  'INSTALL_DEPS_ON_START',
  'BUILD_ON_START',
] as const

export type ManagedEnvironmentKey = typeof managedEnvironmentKeys[number]

const envFilePath = path.resolve(process.cwd(), '.env')

function readEnvironmentFile() {
  if (!fs.existsSync(envFilePath)) {
    throw new Error(`Missing .env file at ${envFilePath}. Copy .env.example to .env before starting CXNext.`)
  }

  const rawValue = fs.readFileSync(envFilePath, 'utf8')
  return dotenv.parse(rawValue)
}

function readEnvironmentFileRaw() {
  if (!fs.existsSync(envFilePath)) {
    throw new Error(`Missing .env file at ${envFilePath}. Copy .env.example to .env before starting CXNext.`)
  }

  return fs.readFileSync(envFilePath, 'utf8')
}

function buildUpdatedEnvironmentFileContent(existingRaw: string, updates: Record<string, string>) {
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

  return `${nextLines.join('\n').replace(/\n*$/, '\n')}`
}

function resolveEnvironment() {
  const parsedEnvironment = environmentSchema.parse(readEnvironmentFile())
  const resolvedStorageRoot = path.resolve(process.cwd(), parsedEnvironment.MEDIA_STORAGE_ROOT)
  const resolvedWebPublicSymlink = path.resolve(process.cwd(), parsedEnvironment.MEDIA_WEB_PUBLIC_SYMLINK)
  const resolvedWebDistRoot = path.resolve(process.cwd(), parsedEnvironment.WEB_DIST_ROOT)
  const superAdminEmails = Array.from(
    new Set(
      [
        ...parsedEnvironment.SUPER_ADMIN_EMAILS.split(',')
          .map((entry) => entry.trim().toLowerCase())
          .filter(Boolean),
        ...(parsedEnvironment.SEED_DEFAULT_USER ? [parsedEnvironment.SEED_DEFAULT_USER_EMAIL.trim().toLowerCase()] : []),
      ],
    ),
  )

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

export function readManagedEnvironmentValues() {
  const parsedEnvironment = readEnvironmentFile()

  return Object.fromEntries(
    managedEnvironmentKeys.map((key) => [key, parsedEnvironment[key] ?? '']),
  ) as Record<ManagedEnvironmentKey, string>
}

export function updateEnvironmentFile(updates: Record<string, string>) {
  if (!fs.existsSync(envFilePath)) {
    throw new Error(`Missing .env file at ${envFilePath}. Copy .env.example to .env before starting CXNext.`)
  }

  const existingRaw = readEnvironmentFileRaw()
  const nextRaw = buildUpdatedEnvironmentFileContent(existingRaw, updates)
  environmentSchema.parse(dotenv.parse(nextRaw))
  fs.writeFileSync(envFilePath, nextRaw, 'utf8')
  return reloadEnvironment()
}
