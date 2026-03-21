import type { DatabaseOrm } from '../orm'

export interface MigrationContext {
  db: DatabaseOrm
}

export interface Migration {
  id: string
  name: string
  up: (context: MigrationContext) => Promise<void>
}
