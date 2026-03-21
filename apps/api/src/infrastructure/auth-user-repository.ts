import type {
  ActorType,
  AuthPermission,
  AuthRole,
  AuthUser,
  PermissionKey,
  RoleKey,
} from '@shared/index'
import type { RowDataPacket } from 'mysql2'
import { randomUUID } from 'node:crypto'
import { ensureDatabaseSchema, getDatabasePool, tableNames } from './database'

interface UserRow extends RowDataPacket {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  actor_type: ActorType
  password_hash: string
  organization_name: string | null
  is_active: number
  created_at: Date
  updated_at: Date
}

interface RoleRow extends RowDataPacket {
  role_key: RoleKey
  role_name: string
  role_summary: string
  role_actor_type: ActorType
  permission_key: PermissionKey | null
  permission_name: string | null
  permission_summary: string | null
}

export interface StoredAuthUser {
  user: AuthUser
  passwordHash: string
}

export class AuthUserRepository {
  async findByEmail(email: string) {
    await ensureDatabaseSchema()

    const databasePool = getDatabasePool()
    const [userRows] = await databasePool.execute<UserRow[]>(
      `
        SELECT
          id,
          email,
          display_name,
          avatar_url,
          actor_type,
          password_hash,
          organization_name,
          is_active,
          created_at,
          updated_at
        FROM ${tableNames.users}
        WHERE email = ?
      `,
      [email],
    )

    return Promise.all(
      userRows.map(async (userRow) => {
        const rolesAndPermissions = await this.getUserRolesAndPermissions(userRow.id)

        return {
          user: {
            id: userRow.id,
            email: userRow.email,
            displayName: userRow.display_name,
            avatarUrl: userRow.avatar_url,
            actorType: userRow.actor_type,
            isActive: Boolean(userRow.is_active),
            organizationName: userRow.organization_name,
            roles: rolesAndPermissions.roles,
            permissions: rolesAndPermissions.permissions,
            createdAt: userRow.created_at.toISOString(),
            updatedAt: userRow.updated_at.toISOString(),
          },
          passwordHash: userRow.password_hash,
        } satisfies StoredAuthUser
      }),
    )
  }

  async findByEmailAndActorType(email: string, actorType: ActorType) {
    await ensureDatabaseSchema()

    const databasePool = getDatabasePool()
    const [userRows] = await databasePool.execute<UserRow[]>(
      `
        SELECT
          id,
          email,
          display_name,
          avatar_url,
          actor_type,
          password_hash,
          organization_name,
          is_active,
          created_at,
          updated_at
        FROM ${tableNames.users}
        WHERE email = ? AND actor_type = ?
        LIMIT 1
      `,
      [email, actorType],
    )

    const userRow = userRows[0]
    if (!userRow) {
      return null
    }

    const [storedUser] = await this.findByEmail(userRow.email)
    return storedUser ?? null
  }

  async create(input: {
    email: string
    displayName: string
    actorType: ActorType
    avatarUrl: string | null
    passwordHash: string
    organizationName: string | null
  }) {
    await ensureDatabaseSchema()

    const databasePool = getDatabasePool()
    const id = randomUUID()
    const roleKeyByActorType: Record<ActorType, RoleKey> = {
      admin: 'admin_owner',
      staff: 'staff_operator',
      customer: 'customer_portal',
      vendor: 'vendor_portal',
    }
    const roleKey = roleKeyByActorType[input.actorType]

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
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        input.email,
        input.displayName,
        input.avatarUrl,
        input.actorType,
        input.passwordHash,
        input.organizationName,
      ],
    )

    await databasePool.execute(
      `
        INSERT INTO ${tableNames.userRoles} (id, user_id, role_id)
        VALUES (?, ?, ?)
      `,
      [`${id}:${roleKey}`, id, roleKey],
    )

    const storedUser = await this.findByEmailAndActorType(input.email, input.actorType)
    if (!storedUser) {
      throw new Error('Expected newly created user to be retrievable.')
    }

    return storedUser.user
  }

  private async getUserRolesAndPermissions(userId: string) {
    const databasePool = getDatabasePool()
    const [rows] = await databasePool.execute<RoleRow[]>(
      `
        SELECT
          r.role_key,
          r.name AS role_name,
          r.summary AS role_summary,
          r.actor_type AS role_actor_type,
          p.permission_key,
          p.name AS permission_name,
          p.summary AS permission_summary
        FROM ${tableNames.userRoles} ur
        INNER JOIN ${tableNames.roles} r
          ON r.id = ur.role_id
          AND r.is_active = 1
        LEFT JOIN ${tableNames.rolePermissions} rp
          ON rp.role_id = r.id
          AND rp.is_active = 1
        LEFT JOIN ${tableNames.permissions} p
          ON p.id = rp.permission_id
          AND p.is_active = 1
        WHERE ur.user_id = ?
          AND ur.is_active = 1
      `,
      [userId],
    )

    const permissionsByKey = new Map<PermissionKey, AuthPermission>()
    const rolesByKey = new Map<RoleKey, AuthRole>()

    for (const row of rows) {
      let role = rolesByKey.get(row.role_key)
      if (!role) {
        role = {
          key: row.role_key,
          name: row.role_name,
          summary: row.role_summary,
          actorType: row.role_actor_type,
          permissions: [],
        }
        rolesByKey.set(row.role_key, role)
      }

      if (row.permission_key && row.permission_name && row.permission_summary) {
        const permission = {
          key: row.permission_key,
          name: row.permission_name,
          summary: row.permission_summary,
        } satisfies AuthPermission

        if (!permissionsByKey.has(row.permission_key)) {
          permissionsByKey.set(row.permission_key, permission)
        }

        if (!role.permissions.some((entry) => entry.key === permission.key)) {
          role.permissions.push(permission)
        }
      }
    }

    return {
      roles: Array.from(rolesByKey.values()),
      permissions: Array.from(permissionsByKey.values()),
    }
  }
}
