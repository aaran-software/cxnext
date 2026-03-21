import type { IncomingMessage, ServerResponse } from 'node:http'
import { ZodError } from 'zod'
import type { CommonModuleKey } from '@shared/index'
import { CommonModuleService } from '../../features/common-modules/application/common-module-service'
import { CommonModuleRepository } from '../../features/common-modules/data/common-module-repository'
import { CompanyService } from '../../features/company/application/company-service'
import { CompanyRepository } from '../../features/company/data/company-repository'
import { ContactService } from '../../features/contact/application/contact-service'
import { ContactRepository } from '../../features/contact/data/contact-repository'
import { ProductService } from '../../features/product/application/product-service'
import { ProductRepository } from '../../features/product/data/product-repository'
import { AuthService } from '../../features/auth/application/auth-service'
import { AuthUserRepository } from '../../features/auth/data/auth-user-repository'
import { GetBootstrapSnapshot } from '../../features/bootstrap/application/get-bootstrap-snapshot'
import { SystemOverviewRepository } from '../../features/bootstrap/data/system-overview-repository'
import { ApplicationError } from '../../shared/errors/application-error'
import { getDatabaseHealth } from '../../shared/database/database'
import { getBearerToken, readJsonBody } from '../../shared/http/request'
import { writeEmpty, writeJson } from '../../shared/http/response'

const bootstrapUseCase = new GetBootstrapSnapshot(new SystemOverviewRepository())
const authService = new AuthService(new AuthUserRepository())
const commonModuleService = new CommonModuleService(new CommonModuleRepository())
const companyService = new CompanyService(new CompanyRepository())
const contactService = new ContactService(new ContactRepository())
const productService = new ProductService(new ProductRepository())

function parseBooleanFlag(value: string | null) {
  if (!value) {
    return false
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
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
      const database = await getDatabaseHealth()

      writeJson(response, 200, {
        status: 'ok',
        service: 'cxnext-api',
        timestamp: new Date().toISOString(),
        database,
      })
      return
    }

    if (method === 'GET' && url.pathname === '/health/db') {
      writeJson(response, 200, await getDatabaseHealth())
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

    if (method === 'POST' && url.pathname === '/auth/login') {
      writeJson(response, 200, await authService.login(await readJsonBody(request)))
      return
    }

    if (method === 'GET' && url.pathname === '/auth/me') {
      const token = getBearerToken(request)
      if (!token) {
        throw new ApplicationError('Authorization token is required.', {}, 401)
      }

      writeJson(response, 200, await authService.getAuthenticatedUser(token))
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
      context: { detail: unknownError },
    })
  }
}
