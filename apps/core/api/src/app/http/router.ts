import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { ZodError } from 'zod'
import type { CommonModuleKey } from '@shared/index'
import { getFrameworkManifest } from '@framework-core/manifest'
import { AuthService } from '@framework-core/auth/application/auth-service'
import { AuthUserRepository } from '@framework-core/auth/data/auth-user-repository'
import { MailboxService } from '@framework-core/mailbox/application/mailbox-service'
import { MailboxRepository } from '@framework-core/mailbox/data/mailbox-repository'
import { CommonModuleService } from '../../features/common-modules/application/common-module-service'
import { CommonModuleRepository } from '../../features/common-modules/data/common-module-repository'
import { CompanyService } from '../../features/company/application/company-service'
import { CompanyRepository } from '../../features/company/data/company-repository'
import { ContactService } from '../../features/contact/application/contact-service'
import { ContactRepository } from '../../features/contact/data/contact-repository'
import { ProductService } from '@ecommerce-api/features/product/application/product-service'
import { ProductRepository } from '@ecommerce-api/features/product/data/product-repository'
import { MediaService } from '../../features/media/application/media-service'
import { MediaRepository } from '../../features/media/data/media-repository'
import { StorefrontOrderService } from '@ecommerce-api/features/storefront/application/storefront-order-service'
import { StorefrontOrderRepository } from '@ecommerce-api/features/storefront/data/storefront-order-repository'
import { CustomerProfileService } from '@ecommerce-api/features/customer-profile/application/customer-profile-service'
import { CustomerProfileRepository } from '@ecommerce-api/features/customer-profile/data/customer-profile-repository'
import { CommerceOrderWorkflowService } from '@ecommerce-api/features/commerce/application/commerce-order-workflow-service'
import { CommerceOrderWorkflowRepository } from '@ecommerce-api/features/commerce/data/commerce-order-workflow-repository'
import { CustomerHelpdeskService } from '@ecommerce-api/features/customer-helpdesk/application/customer-helpdesk-service'
import { CustomerHelpdeskRepository } from '@ecommerce-api/features/customer-helpdesk/data/customer-helpdesk-repository'
import { UserManagementService } from '../../features/users/application/user-management-service'
import {
  createFrappeItem,
  getFrappeItem,
  listFrappeItems,
  syncFrappeItemsToProducts,
  updateFrappeItem,
} from '../../features/frappe/application/frappe-item-service'
import {
  readFrappeSettings,
  saveFrappeSettings,
  verifyFrappeSettings,
} from '../../features/frappe/application/frappe-settings-service'
import { createFrappeTodo, listFrappeTodos, updateFrappeTodo } from '../../features/frappe/application/frappe-todo-service'
import {
  readSystemEnvironment,
  readSystemSettings,
  runManualUpdate,
  saveSystemEnvironment,
  saveSystemEnvironmentAndUpdate,
  saveSystemSettings,
} from '../../features/settings/application/system-settings-service'
import {
  backupDatabase,
  getHardResetConfirmationText,
  hardResetDatabase,
  migrateDatabaseToLatest,
  readDatabaseManager,
  resolveBackupFilePath,
  verifyDatabaseManager,
} from '../../features/settings/application/database-maintenance-service'
import { GetBootstrapSnapshot } from '../../features/bootstrap/application/get-bootstrap-snapshot'
import { SystemOverviewRepository } from '../../features/bootstrap/data/system-overview-repository'
import { ApplicationError } from '@framework-core/runtime/errors/application-error'
import {
  applyDatabaseSetup,
  getDatabaseHealth,
  getSetupStatus,
} from '@framework-core/runtime/database/database'
import { servePublicMediaAsset } from '@framework-core/runtime/media/storage'
import { getBearerToken, readJsonBody } from '@framework-core/runtime/http/request'
import { writeDownload, writeEmpty, writeJson } from '@framework-core/runtime/http/response'
import { serveBuiltWebApp } from '@framework-core/runtime/http/static-web'
import { getSystemUpdateCheck, getSystemVersion } from '@framework-core/runtime/version/system-version'
import { environment } from '@framework-core/runtime/config/environment'

const bootstrapUseCase = new GetBootstrapSnapshot(new SystemOverviewRepository())
const mailboxService = new MailboxService(new MailboxRepository())
const authService = new AuthService(new AuthUserRepository(), mailboxService)
const userManagementService = new UserManagementService(new AuthUserRepository())
const commonModuleService = new CommonModuleService(new CommonModuleRepository())
const companyService = new CompanyService(new CompanyRepository())
const contactService = new ContactService(new ContactRepository())
const productService = new ProductService(new ProductRepository())
const mediaService = new MediaService(new MediaRepository())
const storefrontOrderService = new StorefrontOrderService(new StorefrontOrderRepository())
const customerProfileRepository = new CustomerProfileRepository()
const customerProfileService = new CustomerProfileService(customerProfileRepository)
const commerceOrderWorkflowService = new CommerceOrderWorkflowService(new CommerceOrderWorkflowRepository())
const customerHelpdeskService = new CustomerHelpdeskService(
  new CustomerHelpdeskRepository(),
  customerProfileRepository,
  authService,
)

function parseBooleanFlag(value: string | null) {
  if (!value) {
    return false
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

function resolveMediaPublicBaseUrl(request: IncomingMessage) {
  const forwardedProto = request.headers['x-forwarded-proto']
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto ?? 'http'
  const host = request.headers.host ?? `localhost:4000`
  return `${protocol}://${host}/media/public`
}

async function requireAuthenticatedUser(request: IncomingMessage) {
  const token = getBearerToken(request)
  if (!token) {
    throw new ApplicationError('Authorization token is required.', {}, 401)
  }

  return authService.getAuthenticatedUser(token)
}

async function requireBackofficeUser(request: IncomingMessage) {
  const user = await requireAuthenticatedUser(request)
  if (user.actorType !== 'admin' && user.actorType !== 'staff') {
    throw new ApplicationError('This route is available only to backoffice users.', { actorType: user.actorType }, 403)
  }

  return user
}

async function requireSuperAdminUser(request: IncomingMessage) {
  const user = await requireAuthenticatedUser(request)
  if (!user.isSuperAdmin) {
    throw new ApplicationError('Super admin access is required.', {}, 403)
  }

  return user
}

async function requireCustomerUser(request: IncomingMessage) {
  const user = await requireAuthenticatedUser(request)
  if (user.actorType !== 'customer') {
    throw new ApplicationError('This route is available only to customer users.', { actorType: user.actorType }, 403)
  }

  return user
}

export async function routeRequest(
  request: IncomingMessage,
  response: ServerResponse,
) {
  try {
    const method = request.method ?? 'GET'
    const url = new URL(request.url ?? '/', 'http://localhost')

    if (method === 'OPTIONS') {
      writeEmpty(response, 204)
      return
    }

    if (method === 'GET' && url.pathname === '/health') {
      const database = getDatabaseHealth()

      writeJson(response, 200, {
        status: 'ok',
        service: 'cxnext-api',
        timestamp: new Date().toISOString(),
        database,
        setup: getSetupStatus(),
      })
      return
    }

    if (method === 'GET' && url.pathname === '/health/db') {
      writeJson(response, 200, getDatabaseHealth())
      return
    }

    if (method === 'GET' && url.pathname === '/framework/manifest') {
      writeJson(response, 200, getFrameworkManifest())
      return
    }

    if (method === 'GET' && url.pathname === '/system/version') {
      writeJson(response, 200, await getSystemVersion())
      return
    }

    if (method === 'GET' && url.pathname === '/admin/system/update-check') {
      await requireAuthenticatedUser(request)
      writeJson(response, 200, await getSystemUpdateCheck())
      return
    }

    if (method === 'GET' && url.pathname === '/setup/status') {
      writeJson(response, 200, {
        status: getSetupStatus(),
      })
      return
    }

    if (method === 'POST' && url.pathname === '/setup/database') {
      writeJson(
        response,
        200,
        await applyDatabaseSetup(await readJsonBody(request), {
          mediaPublicBaseUrl: resolveMediaPublicBaseUrl(request),
        }),
      )
      return
    }

    if (method === 'GET' && url.pathname === '/admin/settings/system') {
      writeJson(response, 200, readSystemSettings(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/admin/settings/environment') {
      writeJson(response, 200, readSystemEnvironment(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/admin/frappe/settings') {
      writeJson(response, 200, readFrappeSettings(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/admin/frappe/todos') {
      writeJson(response, 200, await listFrappeTodos(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/admin/frappe/items') {
      writeJson(response, 200, await listFrappeItems(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/admin/database-manager') {
      writeJson(response, 200, await readDatabaseManager(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'PATCH' && url.pathname === '/admin/settings/system') {
      writeJson(
        response,
        200,
        saveSystemSettings(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    if (method === 'PATCH' && url.pathname === '/admin/settings/environment') {
      writeJson(
        response,
        200,
        saveSystemEnvironment(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    if (method === 'PATCH' && url.pathname === '/admin/frappe/settings') {
      writeJson(
        response,
        200,
        saveFrappeSettings(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    if (method === 'POST' && url.pathname === '/admin/frappe/todos') {
      writeJson(
        response,
        201,
        await createFrappeTodo(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    if (method === 'POST' && url.pathname === '/admin/frappe/items') {
      writeJson(
        response,
        201,
        await createFrappeItem(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    if (method === 'POST' && url.pathname === '/admin/frappe/items/sync-products') {
      writeJson(
        response,
        200,
        await syncFrappeItemsToProducts(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    if (method === 'POST' && url.pathname === '/admin/settings/system/update') {
      writeJson(
        response,
        202,
        runManualUpdate(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    if (method === 'POST' && url.pathname === '/admin/settings/environment/update') {
      writeJson(
        response,
        202,
        saveSystemEnvironmentAndUpdate(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    if (method === 'POST' && url.pathname === '/admin/frappe/settings/verify') {
      writeJson(
        response,
        200,
        await verifyFrappeSettings(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    const frappeTodoRecordMatch = url.pathname.match(/^\/admin\/frappe\/todos\/([^/]+)$/)
    if (frappeTodoRecordMatch && method === 'PATCH') {
      writeJson(
        response,
        200,
        await updateFrappeTodo(
          await requireAuthenticatedUser(request),
          decodeURIComponent(frappeTodoRecordMatch[1]),
          await readJsonBody(request),
        ),
      )
      return
    }

    const frappeItemRecordMatch = url.pathname.match(/^\/admin\/frappe\/items\/([^/]+)$/)
    if (frappeItemRecordMatch) {
      const itemId = decodeURIComponent(frappeItemRecordMatch[1])

      if (method === 'GET') {
        writeJson(
          response,
          200,
          await getFrappeItem(await requireAuthenticatedUser(request), itemId),
        )
        return
      }

      if (method === 'PATCH') {
        writeJson(
          response,
          200,
          await updateFrappeItem(
            await requireAuthenticatedUser(request),
            itemId,
            await readJsonBody(request),
          ),
        )
        return
      }
    }

    if (method === 'POST' && url.pathname === '/admin/database-manager/verify') {
      writeJson(response, 200, await verifyDatabaseManager(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/admin/database-manager/migrate') {
      writeJson(response, 200, await migrateDatabaseToLatest(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/admin/database-manager/backup') {
      writeJson(response, 200, await backupDatabase(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/admin/database-manager/hard-reset') {
      writeJson(
        response,
        200,
        await hardResetDatabase(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    const databaseBackupMatch = url.pathname.match(/^\/admin\/database-manager\/backups\/([^/]+)$/)
    if (method === 'GET' && databaseBackupMatch) {
      await requireSuperAdminUser(request)
      const fileName = databaseBackupMatch[1]
      const absolutePath = resolveBackupFilePath(fileName)

      if (!fs.existsSync(absolutePath)) {
        throw new ApplicationError('Backup file was not found.', { fileName }, 404)
      }

      writeDownload(response, 200, 'application/json; charset=utf-8', fileName, fs.readFileSync(absolutePath))
      return
    }

    if (method === 'GET' && url.pathname === '/admin/database-manager/hard-reset/confirmation') {
      await requireSuperAdminUser(request)
      writeJson(response, 200, { confirmation: getHardResetConfirmationText() })
      return
    }

    if (method === 'GET' && url.pathname === '/bootstrap') {
      writeJson(response, 200, bootstrapUseCase.execute())
      return
    }

    if (method === 'GET' && url.pathname === '/companies') {
      writeJson(response, 200, await companyService.list())
      return
    }

    if (method === 'GET' && url.pathname === '/contacts') {
      writeJson(response, 200, await contactService.list())
      return
    }

    if (method === 'GET' && url.pathname === '/products') {
      writeJson(response, 200, await productService.list())
      return
    }

    if (method === 'GET' && url.pathname === '/mailbox/messages') {
      writeJson(response, 200, await mailboxService.listMessages())
      return
    }

    if (method === 'POST' && url.pathname === '/mailbox/messages/send') {
      writeJson(response, 201, await mailboxService.send(await readJsonBody(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/mailbox/templates') {
      writeJson(
        response,
        200,
        await mailboxService.listTemplates(parseBooleanFlag(url.searchParams.get('includeInactive'))),
      )
      return
    }

    if (method === 'POST' && url.pathname === '/mailbox/templates') {
      writeJson(response, 201, await mailboxService.createTemplate(await readJsonBody(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/storefront/catalog') {
      writeJson(response, 200, await productService.getStorefrontCatalog())
      return
    }

    if (method === 'POST' && url.pathname === '/storefront/checkout') {
      writeJson(response, 201, await storefrontOrderService.create(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/storefront/checkout/verify-payment') {
      writeJson(response, 200, await storefrontOrderService.verifyPayment(await readJsonBody(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/customer/orders') {
      const customer = await requireCustomerUser(request)
      writeJson(response, 200, await storefrontOrderService.listCustomerOrders(customer.email))
      return
    }

    if (method === 'POST' && url.pathname === '/customer/account/change-password') {
      const customer = await requireCustomerUser(request)
      writeJson(response, 200, await authService.changePassword(customer, await readJsonBody(request)))
      return
    }

    if (method === 'DELETE' && url.pathname === '/customer/account') {
      const customer = await requireCustomerUser(request)
      writeJson(response, 200, await authService.deleteAccount(customer, await readJsonBody(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/admin/commerce/orders') {
      writeJson(response, 200, await commerceOrderWorkflowService.listOrders(await requireBackofficeUser(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/admin/customers/helpdesk') {
      writeJson(response, 200, await customerHelpdeskService.listCustomers(await requireBackofficeUser(request)))
      return
    }

    const mediaPublicMatch = url.pathname.match(/^\/media\/public\/(.+)$/)
    if (method === 'GET' && mediaPublicMatch) {
      await servePublicMediaAsset(response, mediaPublicMatch[1])
      return
    }

    if (method === 'GET' && url.pathname === '/media') {
      writeJson(response, 200, await mediaService.list())
      return
    }

    if (method === 'GET' && url.pathname === '/media/folders') {
      writeJson(response, 200, await mediaService.listFolders())
      return
    }

    const companyRestoreMatch = url.pathname.match(/^\/companies\/([^/]+)\/restore$/)
    if (method === 'POST' && companyRestoreMatch) {
      writeJson(response, 200, await companyService.restore(companyRestoreMatch[1]))
      return
    }

    const contactRestoreMatch = url.pathname.match(/^\/contacts\/([^/]+)\/restore$/)
    if (method === 'POST' && contactRestoreMatch) {
      writeJson(response, 200, await contactService.restore(contactRestoreMatch[1]))
      return
    }

    const productRestoreMatch = url.pathname.match(/^\/products\/([^/]+)\/restore$/)
    if (method === 'POST' && productRestoreMatch) {
      writeJson(response, 200, await productService.restore(productRestoreMatch[1]))
      return
    }

    const mailboxTemplateRestoreMatch = url.pathname.match(/^\/mailbox\/templates\/([^/]+)\/restore$/)
    if (method === 'POST' && mailboxTemplateRestoreMatch) {
      writeJson(response, 200, await mailboxService.restoreTemplate(mailboxTemplateRestoreMatch[1]))
      return
    }

    const mediaFolderRestoreMatch = url.pathname.match(/^\/media\/folders\/([^/]+)\/restore$/)
    if (method === 'POST' && mediaFolderRestoreMatch) {
      writeJson(response, 200, await mediaService.restoreFolder(mediaFolderRestoreMatch[1]))
      return
    }

    const mediaRestoreMatch = url.pathname.match(/^\/media\/([^/]+)\/restore$/)
    if (method === 'POST' && mediaRestoreMatch) {
      writeJson(response, 200, await mediaService.restore(mediaRestoreMatch[1]))
      return
    }

    const companyRecordMatch = url.pathname.match(/^\/companies\/([^/]+)$/)
    if (companyRecordMatch) {
      const companyId = companyRecordMatch[1]

      if (method === 'GET') {
        writeJson(response, 200, await companyService.getById(companyId))
        return
      }

      if (method === 'PATCH') {
        writeJson(response, 200, await companyService.update(companyId, await readJsonBody(request)))
        return
      }

      if (method === 'DELETE') {
        writeJson(response, 200, await companyService.deactivate(companyId))
        return
      }
    }

    const contactRecordMatch = url.pathname.match(/^\/contacts\/([^/]+)$/)
    if (contactRecordMatch) {
      const contactId = contactRecordMatch[1]

      if (method === 'GET') {
        writeJson(response, 200, await contactService.getById(contactId))
        return
      }

      if (method === 'PATCH') {
        writeJson(response, 200, await contactService.update(contactId, await readJsonBody(request)))
        return
      }

      if (method === 'DELETE') {
        writeJson(response, 200, await contactService.deactivate(contactId))
        return
      }
    }

    const productRecordMatch = url.pathname.match(/^\/products\/([^/]+)$/)
    if (productRecordMatch) {
      const productId = productRecordMatch[1]

      if (method === 'GET') {
        writeJson(response, 200, await productService.getById(productId))
        return
      }

      if (method === 'PATCH') {
        writeJson(response, 200, await productService.update(productId, await readJsonBody(request)))
        return
      }

      if (method === 'DELETE') {
        writeJson(response, 200, await productService.deactivate(productId))
        return
      }
    }

    const mailboxMessageRecordMatch = url.pathname.match(/^\/mailbox\/messages\/([^/]+)$/)
    if (mailboxMessageRecordMatch) {
      if (method === 'GET') {
        writeJson(response, 200, await mailboxService.getMessageById(mailboxMessageRecordMatch[1]))
        return
      }
    }

    const mailboxTemplateRecordMatch = url.pathname.match(/^\/mailbox\/templates\/([^/]+)$/)
    if (mailboxTemplateRecordMatch) {
      const templateId = mailboxTemplateRecordMatch[1]

      if (method === 'GET') {
        writeJson(response, 200, await mailboxService.getTemplateById(templateId))
        return
      }

      if (method === 'PATCH') {
        writeJson(response, 200, await mailboxService.updateTemplate(templateId, await readJsonBody(request)))
        return
      }

      if (method === 'DELETE') {
        writeJson(response, 200, await mailboxService.deactivateTemplate(templateId))
        return
      }
    }

    const mediaFolderRecordMatch = url.pathname.match(/^\/media\/folders\/([^/]+)$/)
    if (mediaFolderRecordMatch) {
      const folderId = mediaFolderRecordMatch[1]

      if (method === 'PATCH') {
        writeJson(response, 200, await mediaService.updateFolder(folderId, await readJsonBody(request)))
        return
      }

      if (method === 'DELETE') {
        writeJson(response, 200, await mediaService.deactivateFolder(folderId))
        return
      }
    }

    const mediaRecordMatch = url.pathname.match(/^\/media\/([^/]+)$/)
    if (mediaRecordMatch) {
      const mediaId = mediaRecordMatch[1]

      if (method === 'GET') {
        writeJson(response, 200, await mediaService.getById(mediaId))
        return
      }

      if (method === 'PATCH') {
        writeJson(response, 200, await mediaService.update(mediaId, await readJsonBody(request)))
        return
      }

      if (method === 'DELETE') {
        writeJson(response, 200, await mediaService.deactivate(mediaId))
        return
      }
    }

    const commerceWorkflowMatch = url.pathname.match(/^\/admin\/commerce\/orders\/([^/]+)\/workflow$/)
    if (commerceWorkflowMatch) {
      const orderId = commerceWorkflowMatch[1]

      if (method === 'GET') {
        writeJson(response, 200, await commerceOrderWorkflowService.getWorkflow(await requireBackofficeUser(request), orderId))
        return
      }

      if (method === 'POST') {
        writeJson(
          response,
          200,
          await commerceOrderWorkflowService.applyWorkflowAction(
            await requireBackofficeUser(request),
            orderId,
            await readJsonBody(request),
          ),
        )
        return
      }
    }

    const commerceInvoicePrintMatch = url.pathname.match(/^\/admin\/commerce\/orders\/([^/]+)\/invoice\/print$/)
    if (method === 'GET' && commerceInvoicePrintMatch) {
      const document = await commerceOrderWorkflowService.renderInvoice(
        await requireBackofficeUser(request),
        commerceInvoicePrintMatch[1],
      )
      response.writeHead(200, {
        'content-type': `${document.mediaType}; charset=utf-8`,
        'content-disposition': `inline; filename="${document.fileName}"`,
        'access-control-allow-origin': environment.corsOrigin,
        'access-control-allow-headers': 'authorization, content-type',
        'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      })
      response.end(document.html)
      return
    }

    const customerHelpdeskRecordMatch = url.pathname.match(/^\/admin\/customers\/helpdesk\/([^/]+)$/)
    if (customerHelpdeskRecordMatch && method === 'GET') {
      writeJson(
        response,
        200,
        await customerHelpdeskService.getCustomer(await requireBackofficeUser(request), customerHelpdeskRecordMatch[1]),
      )
      return
    }

    const customerHelpdeskPasswordResetMatch = url.pathname.match(/^\/admin\/customers\/helpdesk\/([^/]+)\/password-reset\/request$/)
    if (customerHelpdeskPasswordResetMatch && method === 'POST') {
      writeJson(
        response,
        200,
        await customerHelpdeskService.sendPasswordReset(await requireBackofficeUser(request), customerHelpdeskPasswordResetMatch[1]),
      )
      return
    }

    const customerHelpdeskRecoveryMatch = url.pathname.match(/^\/admin\/customers\/helpdesk\/([^/]+)\/account-recovery\/request$/)
    if (customerHelpdeskRecoveryMatch && method === 'POST') {
      writeJson(
        response,
        200,
        await customerHelpdeskService.sendRecoveryEmail(await requireBackofficeUser(request), customerHelpdeskRecoveryMatch[1]),
      )
      return
    }

    if (method === 'POST' && url.pathname === '/companies') {
      writeJson(response, 201, await companyService.create(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/contacts') {
      writeJson(response, 201, await contactService.create(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/products') {
      writeJson(response, 201, await productService.create(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/media') {
      writeJson(response, 201, await mediaService.create(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/media/upload-image') {
      writeJson(response, 201, await mediaService.uploadImage(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/media/folders') {
      writeJson(response, 201, await mediaService.createFolder(await readJsonBody(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/common/modules') {
      writeJson(response, 200, commonModuleService.listModuleMetadata())
      return
    }

    const commonModuleMetadataMatch = url.pathname.match(/^\/common\/modules\/([^/]+)$/)
    if (method === 'GET' && commonModuleMetadataMatch) {
      writeJson(
        response,
        200,
        commonModuleService.getModuleMetadata(commonModuleMetadataMatch[1] as CommonModuleKey),
      )
      return
    }

    const commonModuleRestoreMatch = url.pathname.match(/^\/common\/([^/]+)\/([^/]+)\/restore$/)
    if (method === 'POST' && commonModuleRestoreMatch) {
      writeJson(
        response,
        200,
        await commonModuleService.restore(
          commonModuleRestoreMatch[1] as CommonModuleKey,
          commonModuleRestoreMatch[2],
        ),
      )
      return
    }

    const commonModuleRecordMatch = url.pathname.match(/^\/common\/([^/]+)\/([^/]+)$/)
    if (commonModuleRecordMatch) {
      const moduleKey = commonModuleRecordMatch[1] as CommonModuleKey
      const recordId = commonModuleRecordMatch[2]

      if (method === 'GET') {
        writeJson(response, 200, await commonModuleService.getRecord(moduleKey, recordId))
        return
      }

      if (method === 'PATCH') {
        writeJson(
          response,
          200,
          await commonModuleService.update(moduleKey, recordId, await readJsonBody(request)),
        )
        return
      }

      if (method === 'DELETE') {
        writeJson(response, 200, await commonModuleService.deactivate(moduleKey, recordId))
        return
      }
    }

    const commonModuleCollectionMatch = url.pathname.match(/^\/common\/([^/]+)$/)
    if (commonModuleCollectionMatch) {
      const moduleKey = commonModuleCollectionMatch[1] as CommonModuleKey

      if (method === 'GET') {
        writeJson(
          response,
          200,
          await commonModuleService.list(
            moduleKey,
            parseBooleanFlag(url.searchParams.get('includeInactive')),
          ),
        )
        return
      }

      if (method === 'POST') {
        writeJson(
          response,
          201,
          await commonModuleService.create(moduleKey, await readJsonBody(request)),
        )
        return
      }
    }

    if (method === 'POST' && url.pathname === '/auth/register') {
      writeJson(response, 201, await authService.register(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/auth/register/request-otp') {
      writeJson(response, 200, await authService.requestRegisterOtp(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/auth/register/verify-otp') {
      writeJson(response, 200, await authService.verifyRegisterOtp(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/auth/account-recovery/request-otp') {
      writeJson(response, 200, await authService.requestAccountRecoveryOtp(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/auth/password-reset/request-otp') {
      writeJson(response, 200, await authService.requestPasswordResetOtp(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/auth/password-reset/confirm') {
      writeJson(response, 200, await authService.confirmPasswordReset(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/auth/account-recovery/restore') {
      writeJson(response, 200, await authService.restoreAccount(await readJsonBody(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/auth/login') {
      writeJson(response, 200, await authService.login(await readJsonBody(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/auth/me') {
      writeJson(response, 200, await requireAuthenticatedUser(request))
      return
    }

    if (method === 'GET' && url.pathname === '/admin/users') {
      writeJson(response, 200, await userManagementService.list(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'POST' && url.pathname === '/admin/users') {
      writeJson(
        response,
        201,
        await userManagementService.create(await requireAuthenticatedUser(request), await readJsonBody(request)),
      )
      return
    }

    const adminUserRestoreMatch = url.pathname.match(/^\/admin\/users\/([^/]+)\/restore$/)
    if (method === 'POST' && adminUserRestoreMatch) {
      writeJson(
        response,
        200,
        await userManagementService.restore(await requireAuthenticatedUser(request), adminUserRestoreMatch[1]),
      )
      return
    }

    const adminUserRecordMatch = url.pathname.match(/^\/admin\/users\/([^/]+)$/)
    if (adminUserRecordMatch) {
      const userId = adminUserRecordMatch[1]

      if (method === 'GET') {
        writeJson(response, 200, await userManagementService.getById(await requireAuthenticatedUser(request), userId))
        return
      }

      if (method === 'PATCH') {
        writeJson(
          response,
          200,
          await userManagementService.update(await requireAuthenticatedUser(request), userId, await readJsonBody(request)),
        )
        return
      }

      if (method === 'DELETE') {
        writeJson(response, 200, await userManagementService.deactivate(await requireAuthenticatedUser(request), userId))
        return
      }
    }

    if (method === 'GET' && url.pathname === '/customer/profile') {
      writeJson(response, 200, await customerProfileService.getProfile(await requireAuthenticatedUser(request)))
      return
    }

    if (method === 'PATCH' && url.pathname === '/customer/profile') {
      writeJson(
        response,
        200,
        await customerProfileService.saveProfile(
          await requireAuthenticatedUser(request),
          await readJsonBody(request),
        ),
      )
      return
    }

    if ((method === 'GET' || method === 'HEAD') && (await serveBuiltWebApp(response, url.pathname))) {
      return
    }

    throw new ApplicationError('Route not found.', { method, path: url.pathname }, 404)
  } catch (error) {
    if (error instanceof ZodError) {
      writeJson(response, 400, {
        error: 'Validation failed.',
        context: { issues: error.flatten() },
      })
      return
    }

    if (error instanceof ApplicationError) {
      writeJson(response, error.statusCode, {
        error: error.message,
        context: error.context,
      })
      return
    }

    const unknownError = error instanceof Error ? error.message : 'Unknown error'
    writeJson(response, 500, {
      error: 'Unhandled server error.',
      context: environment.app.debug ? { detail: unknownError } : undefined,
    })
  }
}
