import type { RowDataPacket } from 'mysql2/promise'
import { db } from './orm'
import { migrations } from './migrations'
import { migrationTableName } from './table-names'

interface MigrationRow extends RowDataPacket {
  id: string
}

let migrationPromise: Promise<void> | null = null

async function ensureMigrationTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${migrationTableName} (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
}

async function readAppliedMigrationIds() {
  const rows = await db.query<MigrationRow>(`SELECT id FROM ${migrationTableName} ORDER BY id`)
  return new Set(rows.map((row) => row.id))
}

async function applyPendingMigrations() {
  if (!db.isEnabled()) {
    return
  }

  await ensureMigrationTable()
  const appliedIds = await readAppliedMigrationIds()

  for (const migration of migrations) {
    if (appliedIds.has(migration.id)) {
      continue
    }

    await migration.up({ db })
    await db.insert(migrationTableName, {
      id: migration.id,
      name: migration.name,
    })
  }
}

export async function runMigrations() {
  if (migrationPromise) {
    return migrationPromise
  }

  migrationPromise = applyPendingMigrations()

  try {
    await migrationPromise
  } finally {
    migrationPromise = null
  }
}
