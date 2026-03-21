import type { ActorType, DatabaseHealth, PermissionKey, RoleKey } from '@shared/index'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'
import { randomUUID } from 'node:crypto'
import { environment } from '../config/environment'

let pool: mysql.Pool | null = null
let schemaEnsured = false
export const tableNames = {
  users: 'auth_users',
  roles: 'auth_roles',
  permissions: 'auth_permissions',
  userRoles: 'auth_user_roles',
  rolePermissions: 'auth_role_permissions',
} as const

const defaultPermissions: {
  key: PermissionKey
  name: string
  summary: string
}[] = [
  { key: 'dashboard:view', name: 'Dashboard View', summary: 'View dashboard surfaces.' },
  { key: 'users:manage', name: 'User Management', summary: 'Manage platform users.' },
  { key: 'roles:manage', name: 'Role Management', summary: 'Manage roles and assignments.' },
  {
    key: 'permissions:manage',
    name: 'Permission Management',
    summary: 'Manage permission mappings.',
  },
  { key: 'vendors:view', name: 'Vendor Access', summary: 'View vendor-facing records.' },
  {
    key: 'customers:view',
    name: 'Customer Access',
    summary: 'View customer-facing records.',
  },
]

const defaultRoles: {
  key: RoleKey
  actorType: ActorType
  name: string
  summary: string
  permissions: PermissionKey[]
}[] = [
  {
    key: 'admin_owner',
    actorType: 'admin',
    name: 'Admin Owner',
    summary: 'Full platform administration for bootstrap.',
    permissions: [
      'dashboard:view',
      'users:manage',
      'roles:manage',
      'permissions:manage',
      'vendors:view',
      'customers:view',
    ],
  },
  {
    key: 'staff_operator',
    actorType: 'staff',
    name: 'Staff Operator',
    summary: 'Operational staff access to the shared workspace.',
    permissions: ['dashboard:view', 'vendors:view', 'customers:view'],
  },
  {
    key: 'customer_portal',
    actorType: 'customer',
    name: 'Customer Portal',
    summary: 'Customer-facing authenticated access.',
    permissions: ['dashboard:view', 'customers:view'],
  },
  {
    key: 'vendor_portal',
    actorType: 'vendor',
    name: 'Vendor Portal',
    summary: 'Vendor-facing authenticated access.',
    permissions: ['dashboard:view', 'vendors:view'],
  },
]

export function isDatabaseEnabled() {
  return environment.database.enabled
}

export function getDatabasePool() {
  if (!environment.database.enabled) {
    throw new Error('MariaDB integration is disabled. Set DB_ENABLED=true to enable it.')
  }

  if (!pool) {
    pool = mysql.createPool({
      host: environment.database.host,
      port: environment.database.port,
      user: environment.database.user,
      password: environment.database.password,
      database: environment.database.name,
      connectionLimit: 10,
      namedPlaceholders: true,
    })
  }

  return pool
}

export async function ensureDatabaseSchema() {
  if (schemaEnsured || !environment.database.enabled) {
    return
  }

  const databasePool = getDatabasePool()

  await databasePool.execute(`
    CREATE TABLE IF NOT EXISTS ${tableNames.users} (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(320) NOT NULL UNIQUE,
      display_name VARCHAR(120) NOT NULL,
      avatar_url VARCHAR(500) NULL,
      actor_type VARCHAR(32) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      organization_name VARCHAR(120) NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await databasePool.execute(`
    CREATE TABLE IF NOT EXISTS ${tableNames.roles} (
      id VARCHAR(64) PRIMARY KEY,
      role_key VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      summary VARCHAR(255) NOT NULL,
      actor_type VARCHAR(32) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await databasePool.execute(`
    CREATE TABLE IF NOT EXISTS ${tableNames.permissions} (
      id VARCHAR(64) PRIMARY KEY,
      permission_key VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      summary VARCHAR(255) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await databasePool.execute(`ALTER TABLE ${tableNames.users} ENGINE=InnoDB`)
  await databasePool.execute(`ALTER TABLE ${tableNames.roles} ENGINE=InnoDB`)
  await databasePool.execute(`ALTER TABLE ${tableNames.permissions} ENGINE=InnoDB`)

  await databasePool.execute(`
    CREATE TABLE IF NOT EXISTS ${tableNames.userRoles} (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      role_id VARCHAR(64) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_roles_user_role (user_id, role_id),
      CONSTRAINT fk_auth_user_roles_user FOREIGN KEY (user_id) REFERENCES ${tableNames.users} (id),
      CONSTRAINT fk_auth_user_roles_role FOREIGN KEY (role_id) REFERENCES ${tableNames.roles} (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await databasePool.execute(`
    CREATE TABLE IF NOT EXISTS ${tableNames.rolePermissions} (
      id VARCHAR(64) PRIMARY KEY,
      role_id VARCHAR(64) NOT NULL,
      permission_id VARCHAR(64) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_role_permissions_role_permission (role_id, permission_id),
      CONSTRAINT fk_auth_role_permissions_role FOREIGN KEY (role_id) REFERENCES ${tableNames.roles} (id),
      CONSTRAINT fk_auth_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES ${tableNames.permissions} (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await seedDefaults(databasePool)

  schemaEnsured = true
}

async function seedDefaults(databasePool: mysql.Pool) {
  for (const permission of defaultPermissions) {
    await databasePool.execute(
      `
        INSERT INTO ${tableNames.permissions} (id, permission_key, name, summary)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          summary = VALUES(summary),
          is_active = 1
      `,
      [permission.key, permission.key, permission.name, permission.summary],
    )
  }

  for (const role of defaultRoles) {
    await databasePool.execute(
      `
        INSERT INTO ${tableNames.roles} (id, role_key, name, summary, actor_type)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          summary = VALUES(summary),
          actor_type = VALUES(actor_type),
          is_active = 1
      `,
      [role.key, role.key, role.name, role.summary, role.actorType],
    )

    for (const permissionKey of role.permissions) {
      await databasePool.execute(
        `
          INSERT INTO ${tableNames.rolePermissions} (id, role_id, permission_id)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            is_active = 1
        `,
        [`${role.key}:${permissionKey}`, role.key, permissionKey],
      )
    }
  }

  if (!environment.seed.enabled) {
    return
  }

  const [rows] = await databasePool.execute<mysql.RowDataPacket[]>(
    `SELECT id FROM ${tableNames.users} WHERE email = ? LIMIT 1`,
    [environment.seed.defaultUser.email],
  )

  if (rows.length === 0) {
    const userId = randomUUID()
    const passwordHash = await bcrypt.hash(environment.seed.defaultUser.password, 10)
    await databasePool.execute(
      `
        INSERT INTO ${tableNames.users} (
          id,
          email,
          display_name,
          avatar_url,
          actor_type,
          password_hash,
          organization_name
        )
        VALUES (?, ?, ?, ?, 'admin', ?, ?)
      `,
      [
        userId,
        environment.seed.defaultUser.email,
        environment.seed.defaultUser.displayName,
        environment.seed.defaultUser.avatarUrl,
        passwordHash,
        'CXNext',
      ],
    )

    await databasePool.execute(
      `
        INSERT INTO ${tableNames.userRoles} (id, user_id, role_id)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          is_active = 1
      `,
      [`${userId}:admin_owner`, userId, 'admin_owner'],
    )
  }
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  if (!environment.database.enabled) {
    return {
      status: 'disabled',
      engine: 'mariadb',
      checkedAt: new Date().toISOString(),
      detail: 'Database integration is disabled.',
    }
  }

  try {
    const databasePool = getDatabasePool()
    await databasePool.query('SELECT 1')

    return {
      status: 'ok',
      engine: 'mariadb',
      checkedAt: new Date().toISOString(),
      detail: `Connected to ${environment.database.host}:${environment.database.port}/${environment.database.name}.`,
    }
  } catch (error) {
    return {
      status: 'error',
      engine: 'mariadb',
      checkedAt: new Date().toISOString(),
      detail: error instanceof Error ? error.message : 'Unknown database error.',
    }
  }
}
