import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import mysql from 'mysql2/promise'
import { getConfiguredDatabaseSettings } from './database-config'

type SqlPrimitive = string | number | boolean | Date | null
type SqlRecord = Record<string, SqlPrimitive>

let pool: mysql.Pool | null = null

function createPool() {
  const configuration = getConfiguredDatabaseSettings()

  if (!configuration) {
    throw new Error('MariaDB integration is not configured yet.')
  }

  return mysql.createPool({
    host: configuration.host,
    port: configuration.port,
    user: configuration.user,
    password: configuration.password,
    database: configuration.name,
    connectionLimit: 10,
    namedPlaceholders: true,
  })
}

function createTransactionClient(connection: PoolConnection) {
  return {
    execute(sql: string, params: SqlPrimitive[] = []) {
      return connection.execute<ResultSetHeader>(sql, params)
    },
    query<T extends RowDataPacket = RowDataPacket>(sql: string, params: SqlPrimitive[] = []) {
      return connection.query<T[]>(sql, params).then(([rows]) => rows)
    },
    first<T extends RowDataPacket = RowDataPacket>(sql: string, params: SqlPrimitive[] = []) {
      return connection.query<T[]>(sql, params).then(([rows]) => rows[0] ?? null)
    },
    insert(table: string, values: SqlRecord) {
      const columns = Object.keys(values)
      const placeholders = columns.map(() => '?').join(', ')
      const params = columns.map((column) => values[column] ?? null)
      return connection.execute<ResultSetHeader>(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
        params,
      )
    },
  }
}

export class DatabaseOrm {
  isEnabled() {
    return Boolean(getConfiguredDatabaseSettings())
  }

  getPool() {
    if (!this.isEnabled()) {
      throw new Error('MariaDB integration is disabled. Set DB_ENABLED=true to enable it.')
    }

    if (!pool) {
      pool = createPool()
    }

    return pool
  }

  async close() {
    if (!pool) {
      return
    }

    const activePool = pool
    pool = null
    await activePool.end()
  }

  async execute(sql: string, params: SqlPrimitive[] = []) {
    const [result] = await this.getPool().execute<ResultSetHeader>(sql, params)
    return result
  }

  async query<T extends RowDataPacket = RowDataPacket>(sql: string, params: SqlPrimitive[] = []) {
    const [rows] = await this.getPool().query<T[]>(sql, params)
    return rows
  }

  async first<T extends RowDataPacket = RowDataPacket>(sql: string, params: SqlPrimitive[] = []) {
    const rows = await this.query<T>(sql, params)
    return rows[0] ?? null
  }

  async insert(table: string, values: SqlRecord) {
    const columns = Object.keys(values)
    const placeholders = columns.map(() => '?').join(', ')
    const params = columns.map((column) => values[column] ?? null)
    return this.execute(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
      params,
    )
  }

  async transaction<T>(callback: (transaction: ReturnType<typeof createTransactionClient>) => Promise<T>) {
    const connection = await this.getPool().getConnection()

    try {
      await connection.beginTransaction()
      const transactionClient = createTransactionClient(connection)
      const result = await callback(transactionClient)
      await connection.commit()
      return result
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
}

export const db = new DatabaseOrm()
