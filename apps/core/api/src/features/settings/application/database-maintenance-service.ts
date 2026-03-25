import fs from 'node:fs'
import path from 'node:path'
import type { RowDataPacket } from 'mysql2/promise'
import {
  databaseBackupResponseSchema,
  databaseHardResetPayloadSchema,
  databaseManagerActionResponseSchema,
  databaseManagerResponseSchema,
  type AuthUser,
  type DatabaseManagerReport,
  type DatabaseManagerTable,
  type DatabaseVerificationSummary,
} from '@shared/index'
import { ApplicationError } from '@framework-core/runtime/errors/application-error'
import { environment } from '@framework-core/runtime/config/environment'
import { db } from '@framework-core/runtime/database/orm'
import { runMigrations } from '@framework-core/runtime/database/migrator'
import {
  authTableNames,
  commerceTableNames,
  commonTableNames,
  companyTableNames,
  contactTableNames,
  customerTableNames,
  mailboxTableNames,
  mediaTableNames,
  migrationTableName,
  productTableNames,
  seederTableName,
  storefrontTableNames,
} from '@framework-core/runtime/database/table-names'
import { getSystemVersion } from '@framework-core/runtime/version/system-version'
import { isApplicationSetupReady } from '@framework-core/runtime/database/database'

interface ExistingTableRow extends RowDataPacket {
  tableName: string
}

interface ColumnCountRow extends RowDataPacket {
  tableName: string
  columnCount: number
}

interface CountRow extends RowDataPacket {
  totalCount: number
}

interface CreateTableRow extends RowDataPacket {
  Table?: string
  ['Create Table']?: string
}

const hardResetConfirmation = 'RESET CXNEXT DATABASE'
const backupDownloadBasePath = '/admin/database-manager/backups'

function assertSuperAdmin(user: AuthUser) {
  if (!user.isSuperAdmin) {
    throw new ApplicationError('Super admin access is required.', {}, 403)
  }
}

function quoteIdentifier(value: string) {
  return '`' + value.replaceAll('`', '``') + '`'
}

function buildExpectedTableCategories() {
  return new Map<string, string>([
    [migrationTableName, 'system'],
    [seederTableName, 'system'],
    ...Object.values(authTableNames).map((tableName) => [tableName, 'auth'] as const),
    ...Object.values(commonTableNames).map((tableName) => [tableName, 'common'] as const),
    ...Object.values(companyTableNames).map((tableName) => [tableName, 'company'] as const),
    ...Object.values(contactTableNames).map((tableName) => [tableName, 'contact'] as const),
    ...Object.values(productTableNames).map((tableName) => [tableName, 'product'] as const),
    ...Object.values(mediaTableNames).map((tableName) => [tableName, 'media'] as const),
    ...Object.values(storefrontTableNames).map((tableName) => [tableName, 'storefront'] as const),
    ...Object.values(customerTableNames).map((tableName) => [tableName, 'customer'] as const),
    ...Object.values(commerceTableNames).map((tableName) => [tableName, 'commerce'] as const),
    ...Object.values(mailboxTableNames).map((tableName) => [tableName, 'mailbox'] as const),
  ])
}

const expectedTableCategories = buildExpectedTableCategories()
const expectedTableNames = Array.from(expectedTableCategories.keys()).sort((left, right) => left.localeCompare(right))

function ensureDatabaseReady() {
  if (!environment.database.enabled) {
    throw new ApplicationError('Database integration is disabled.', {}, 409)
  }

  if (!isApplicationSetupReady()) {
    throw new ApplicationError('Database setup is not ready for maintenance actions.', {}, 503)
  }
}

async function readExistingTableNames() {
  const rows = await db.query<ExistingTableRow>(
    `
      SELECT TABLE_NAME AS tableName
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `,
  )

  return rows.map((row) => row.tableName)
}

async function readColumnCounts() {
  const rows = await db.query<ColumnCountRow>(
    `
      SELECT TABLE_NAME AS tableName, COUNT(*) AS columnCount
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      GROUP BY TABLE_NAME
    `,
  )

  return new Map(rows.map((row) => [row.tableName, Number(row.columnCount ?? 0)]))
}

async function readExactRowCount(tableName: string) {
  const rows = await db.query<CountRow>(
    `SELECT COUNT(*) AS totalCount FROM ${quoteIdentifier(tableName)}`,
  )

  return Number(rows[0]?.totalCount ?? 0)
}

function resolveVerificationStatus(
  databaseStatus: DatabaseManagerReport['database']['status'],
  missingTableCount: number,
  unexpectedTableCount: number,
  pendingMigrations: number,
): DatabaseVerificationSummary['status'] {
  if (databaseStatus === 'disabled') {
    return 'disabled'
  }

  if (databaseStatus === 'error') {
    return 'error'
  }

  if (missingTableCount > 0 || unexpectedTableCount > 0 || pendingMigrations > 0) {
    return 'warning'
  }

  return 'ready'
}

function buildVerificationDetail(
  missingTableCount: number,
  unexpectedTableCount: number,
  pendingMigrations: number,
) {
  const parts: string[] = []

  if (pendingMigrations > 0) {
    parts.push(`${pendingMigrations} migration(s) pending`)
  }

  if (missingTableCount > 0) {
    parts.push(`${missingTableCount} expected table(s) missing`)
  }

  if (unexpectedTableCount > 0) {
    parts.push(`${unexpectedTableCount} unexpected table(s) present`)
  }

  if (parts.length === 0) {
    return 'Schema verification passed. All expected tables are present and the migration tracker is current.'
  }

  return `${parts.join(', ')}.`
}

function getBackupDirectoryPath() {
  return path.join(environment.media.privateDirectory, 'backups', 'database')
}

function ensureBackupDirectory() {
  fs.mkdirSync(getBackupDirectoryPath(), { recursive: true })
}

function buildBackupSummary(fileName: string) {
  const absolutePath = resolveBackupFilePath(fileName)

  if (!fs.existsSync(absolutePath)) {
    return null
  }

  const stats = fs.statSync(absolutePath)

  return {
    fileName,
    createdAt: stats.mtime.toISOString(),
    byteSize: stats.size,
    downloadPath: `${backupDownloadBasePath}/${fileName}`,
  }
}

function readLatestBackupSummary() {
  ensureBackupDirectory()
  const entries = fs.readdirSync(getBackupDirectoryPath(), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left))

  const latestFileName = entries[0]
  return latestFileName ? buildBackupSummary(latestFileName) : null
}

export function resolveBackupFilePath(fileName: string) {
  if (!/^[A-Za-z0-9._-]+$/.test(fileName)) {
    throw new ApplicationError('Invalid backup file name.', { fileName }, 400)
  }

  return path.join(getBackupDirectoryPath(), fileName)
}

async function buildDatabaseReport(): Promise<DatabaseManagerReport> {
  const versionResponse = await getSystemVersion()
  const version = versionResponse.version
  const latestBackup = readLatestBackupSummary()

  if (version.database.status !== 'ready') {
    return databaseManagerResponseSchema.parse({
      report: {
        database: version.database,
        verification: {
          status: version.database.status === 'disabled' ? 'disabled' : 'error',
          checkedAt: version.database.checkedAt,
          detail: version.database.detail,
          expectedTableCount: expectedTableNames.length,
          existingTableCount: 0,
          existingManagedTableCount: 0,
          missingTableCount: expectedTableNames.length,
          unexpectedTableCount: 0,
          totalRowCount: 0,
        },
        tables: expectedTableNames.map((tableName) => ({
          name: tableName,
          category: expectedTableCategories.get(tableName) ?? 'unknown',
          exists: false,
          expected: true,
          status: 'missing',
          rowCount: null,
          columnCount: null,
        })),
        latestBackup,
      },
    }).report
  }

  const existingTableNames = await readExistingTableNames()
  const existingTableNameSet = new Set(existingTableNames)
  const columnCounts = await readColumnCounts()
  const tables: DatabaseManagerTable[] = []
  let totalRowCount = 0

  for (const tableName of expectedTableNames) {
    if (!existingTableNameSet.has(tableName)) {
      tables.push({
        name: tableName,
        category: expectedTableCategories.get(tableName) ?? 'unknown',
        exists: false,
        expected: true,
        status: 'missing',
        rowCount: null,
        columnCount: null,
      })
      continue
    }

    const rowCount = await readExactRowCount(tableName)
    totalRowCount += rowCount
    tables.push({
      name: tableName,
      category: expectedTableCategories.get(tableName) ?? 'unknown',
      exists: true,
      expected: true,
      status: 'ok',
      rowCount,
      columnCount: columnCounts.get(tableName) ?? 0,
    })
  }

  for (const tableName of existingTableNames) {
    if (expectedTableCategories.has(tableName)) {
      continue
    }

    const rowCount = await readExactRowCount(tableName)
    totalRowCount += rowCount
    tables.push({
      name: tableName,
      category: 'unexpected',
      exists: true,
      expected: false,
      status: 'unexpected',
      rowCount,
      columnCount: columnCounts.get(tableName) ?? 0,
    })
  }

  tables.sort((left, right) => {
    if (left.status !== right.status) {
      return left.status.localeCompare(right.status)
    }

    if (left.category !== right.category) {
      return left.category.localeCompare(right.category)
    }

    return left.name.localeCompare(right.name)
  })

  const missingTableCount = tables.filter((table) => table.status === 'missing').length
  const unexpectedTableCount = tables.filter((table) => table.status === 'unexpected').length
  const existingManagedTableCount = tables.filter((table) => table.expected && table.exists).length

  return databaseManagerResponseSchema.parse({
    report: {
      database: version.database,
      verification: {
        status: resolveVerificationStatus(
          version.database.status,
          missingTableCount,
          unexpectedTableCount,
          version.database.pendingMigrations,
        ),
        checkedAt: new Date().toISOString(),
        detail: buildVerificationDetail(
          missingTableCount,
          unexpectedTableCount,
          version.database.pendingMigrations,
        ),
        expectedTableCount: expectedTableNames.length,
        existingTableCount: existingTableNames.length,
        existingManagedTableCount,
        missingTableCount,
        unexpectedTableCount,
        totalRowCount,
      },
      tables,
      latestBackup,
    },
  }).report
}

async function createDatabaseBackupFile() {
  ensureDatabaseReady()
  ensureBackupDirectory()

  const existingTableNames = await readExistingTableNames()
  const backupTables = []

  for (const tableName of existingTableNames) {
    const createRows = await db.query<CreateTableRow>(`SHOW CREATE TABLE ${quoteIdentifier(tableName)}`)
    const dataRows = await db.query<RowDataPacket>(`SELECT * FROM ${quoteIdentifier(tableName)}`)

    backupTables.push({
      name: tableName,
      rowCount: dataRows.length,
      createStatement: String(createRows[0]?.['Create Table'] ?? ''),
      rows: dataRows,
    })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `cxnext-database-backup-${timestamp}.json`
  const absolutePath = resolveBackupFilePath(fileName)
  const payload = {
    generatedAt: new Date().toISOString(),
    databaseName: environment.database.name,
    tableCount: backupTables.length,
    tables: backupTables,
  }

  fs.writeFileSync(absolutePath, JSON.stringify(payload, null, 2), 'utf8')

  return buildBackupSummary(fileName)
}

async function dropManagedTables() {
  const existingTableNames = new Set(await readExistingTableNames())
  const managedExistingTables = expectedTableNames.filter((tableName) => existingTableNames.has(tableName))

  if (managedExistingTables.length === 0) {
    return
  }

  await db.execute('SET FOREIGN_KEY_CHECKS = 0')

  try {
    for (const tableName of managedExistingTables) {
      await db.execute(`DROP TABLE IF EXISTS ${quoteIdentifier(tableName)}`)
    }
  } finally {
    await db.execute('SET FOREIGN_KEY_CHECKS = 1')
  }
}

export async function readDatabaseManager(user: AuthUser) {
  assertSuperAdmin(user)
  return databaseManagerResponseSchema.parse({
    report: await buildDatabaseReport(),
  })
}

export async function verifyDatabaseManager(user: AuthUser) {
  assertSuperAdmin(user)

  return databaseManagerActionResponseSchema.parse({
    message: 'Database verification finished.',
    report: await buildDatabaseReport(),
  })
}

export async function migrateDatabaseToLatest(user: AuthUser) {
  assertSuperAdmin(user)
  ensureDatabaseReady()
  await runMigrations()

  return databaseManagerActionResponseSchema.parse({
    message: 'Database migrations and seeders were applied up to the latest known version.',
    report: await buildDatabaseReport(),
  })
}

export async function backupDatabase(user: AuthUser) {
  assertSuperAdmin(user)
  const backup = await createDatabaseBackupFile()

  if (!backup) {
    throw new ApplicationError('Backup generation failed.', {}, 500)
  }

  return databaseBackupResponseSchema.parse({
    message: 'Database backup created.',
    backup,
    report: await buildDatabaseReport(),
  })
}

export async function hardResetDatabase(user: AuthUser, payload: unknown) {
  assertSuperAdmin(user)
  ensureDatabaseReady()

  const parsedPayload = databaseHardResetPayloadSchema.parse(payload)
  if (parsedPayload.confirmation !== hardResetConfirmation) {
    throw new ApplicationError(
      `Enter "${hardResetConfirmation}" to continue.`,
      { expectedConfirmation: hardResetConfirmation },
      400,
    )
  }

  await dropManagedTables()
  await runMigrations()

  return databaseManagerActionResponseSchema.parse({
    message: 'Managed CXNext tables were dropped and rebuilt from the latest migrations.',
    report: await buildDatabaseReport(),
  })
}

export function getHardResetConfirmationText() {
  return hardResetConfirmation
}
