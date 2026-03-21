import type { DatabaseHealth } from '@shared/index'
import { db } from './orm'
import { runMigrations } from './migrator'

export function isDatabaseEnabled() {
  return db.isEnabled()
}

export function getDatabasePool() {
  return db.getPool()
}

export async function ensureDatabaseSchema() {
  await runMigrations()
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  if (!db.isEnabled()) {
    return {
      status: 'disabled',
      engine: 'mariadb',
      checkedAt: new Date().toISOString(),
      detail: 'Database integration is disabled.',
    }
  }

  try {
    await db.query('SELECT 1')

    return {
      status: 'ok',
      engine: 'mariadb',
      checkedAt: new Date().toISOString(),
      detail: 'Connected to MariaDB and migrations are available.',
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
