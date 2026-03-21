import { z } from 'zod'

const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1).default('*'),
  JWT_SECRET: z.string().min(16).default('cxnext-dev-insecure-secret-change-me'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 8),
  DB_ENABLED: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  DB_HOST: z.string().min(1).optional(),
  DB_PORT: z.coerce.number().int().positive().optional(),
  DB_USER: z.string().min(1).optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().min(1).optional(),
  SEED_DEFAULT_USER: z
    .string()
    .optional()
    .transform((value) => value !== 'false'),
  SEED_DEFAULT_USER_NAME: z.string().min(1).default('Sundar'),
  SEED_DEFAULT_USER_EMAIL: z.email().default('sundar@sundar.com'),
  SEED_DEFAULT_USER_PASSWORD: z.string().min(8).default('kalarani'),
  SEED_DEFAULT_USER_AVATAR_URL: z
    .url()
    .default('https://ui-avatars.com/api/?name=Sundar&background=1f2937&color=ffffff'),
})

const parsedEnvironment = environmentSchema.parse(process.env)

export const environment = {
  port: parsedEnvironment.PORT,
  corsOrigin: parsedEnvironment.CORS_ORIGIN,
  jwtSecret: parsedEnvironment.JWT_SECRET,
  jwtExpiresInSeconds: parsedEnvironment.JWT_EXPIRES_IN_SECONDS,
  database: {
    enabled: parsedEnvironment.DB_ENABLED,
    host: parsedEnvironment.DB_HOST ?? '127.0.0.1',
    port: parsedEnvironment.DB_PORT ?? 3306,
    user: parsedEnvironment.DB_USER ?? 'root',
    password: parsedEnvironment.DB_PASSWORD ?? '',
    name: parsedEnvironment.DB_NAME ?? 'cxnext',
  },
  seed: {
    enabled: parsedEnvironment.SEED_DEFAULT_USER,
    defaultUser: {
      displayName: parsedEnvironment.SEED_DEFAULT_USER_NAME,
      email: parsedEnvironment.SEED_DEFAULT_USER_EMAIL,
      password: parsedEnvironment.SEED_DEFAULT_USER_PASSWORD,
      avatarUrl: parsedEnvironment.SEED_DEFAULT_USER_AVATAR_URL,
    },
  },
}
