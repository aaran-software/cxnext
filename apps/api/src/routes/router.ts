import type { IncomingMessage, ServerResponse } from 'node:http'
import { GetBootstrapSnapshot } from '../application/get-bootstrap-snapshot'
import { ApplicationError } from '../infrastructure/errors'
import { writeJson } from '../infrastructure/http'
import { SystemOverviewRepository } from '../infrastructure/system-overview-repository'

const bootstrapUseCase = new GetBootstrapSnapshot(new SystemOverviewRepository())

export function routeRequest(request: IncomingMessage, response: ServerResponse) {
  try {
    const method = request.method ?? 'GET'
    const url = new URL(request.url ?? '/', 'http://localhost')

    if (method === 'GET' && url.pathname === '/health') {
      writeJson(response, 200, {
        status: 'ok',
        service: 'cxnext-api',
        timestamp: new Date().toISOString(),
      })
      return
    }

    if (method === 'GET' && url.pathname === '/bootstrap') {
      writeJson(response, 200, bootstrapUseCase.execute())
      return
    }

    throw new ApplicationError('Route not found.', { method, path: url.pathname }, 404)
  } catch (error) {
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
