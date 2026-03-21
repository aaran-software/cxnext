import { authFoundationMigration } from './001-auth-foundation'
import { commonReferenceModulesMigration } from './002-common-reference-modules'
import type { Migration } from './migration'

export const migrations: Migration[] = [authFoundationMigration, commonReferenceModulesMigration]
