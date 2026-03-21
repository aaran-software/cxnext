import { authFoundationMigration } from './001-auth-foundation'
import { commonReferenceModulesMigration } from './002-common-reference-modules'
import { companyFoundationMigration } from './003-company-foundation'
import { contactFoundationMigration } from './004-contact-foundation'
import { productFoundationMigration } from './005-product-foundation'
import type { Migration } from './migration'

export const migrations: Migration[] = [
  authFoundationMigration,
  commonReferenceModulesMigration,
  companyFoundationMigration,
  contactFoundationMigration,
  productFoundationMigration,
]
