import type { IncomingMessage, ServerResponse } from 'node:http'
import { ZodError } from 'zod'
import { GetBootstrapSnapshot } from '../application/get-bootstrap-snapshot'
import { AuthService } from '../application/auth-service'
import { ApplicationError } from '../infrastructure/errors'
import { AuthUserRepository } from '../infrastructure/auth-user-repository'
import { getDatabaseHealth } from '../infrastructure/database'
import { writeEmpty, writeJson } from '../infrastructure/http'
import { getBearerToken, readJsonBody } from '../infrastructure/request'
import { SystemOverviewRepository } from '../infrastructure/system-overview-repository'

const bootstrapUseCase = new GetBootstrapSnapshot(new SystemOverviewRepository())
const authService = new AuthService(new AuthUserRepository())

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
