import { authFoundationMigration } from './001-auth-foundation'
import { commonReferenceModulesMigration } from './002-common-reference-modules'
import { companyFoundationMigration } from './003-company-foundation'
import { contactFoundationMigration } from './004-contact-foundation'
import { productFoundationMigration } from './005-product-foundation'
import { mediaManagerMigration } from './006-media-manager'
import { commonUnknownDefaultsMigration } from './007-common-unknown-defaults'
import { productStorefrontMigration } from './008-product-storefront'
import { storefrontOrdersMigration } from './009-storefront-orders'
import { storefrontTemplatesMigration } from './010-storefront-templates'
import { storefrontRazorpayPaymentsMigration } from './011-storefront-razorpay-payments'
import { authContactVerificationsMigration } from './012-auth-contact-verifications'
import { mailboxFoundationMigration } from './013-mailbox-foundation'
import { sliderThemesMigration } from './014-slider-themes'
import { customerProfileMigration } from './015-customer-profile'
import { commerceOperationsMigration } from './016-commerce-operations'
import type { Migration } from './migration'

export const migrations: Migration[] = [
  authFoundationMigration,
  commonReferenceModulesMigration,
  companyFoundationMigration,
  contactFoundationMigration,
  productFoundationMigration,
  mediaManagerMigration,
  commonUnknownDefaultsMigration,
  productStorefrontMigration,
  storefrontOrdersMigration,
  storefrontTemplatesMigration,
  storefrontRazorpayPaymentsMigration,
  authContactVerificationsMigration,
  mailboxFoundationMigration,
  sliderThemesMigration,
  customerProfileMigration,
  commerceOperationsMigration,
]
