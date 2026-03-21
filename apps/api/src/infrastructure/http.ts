import type { ServerResponse } from 'node:http'
import { environment } from '../config/environment'

export function writeJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': environment.corsOrigin,
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
  })
  response.end(JSON.stringify(payload))
}

export function writeEmpty(response: ServerResponse, statusCode: number) {
  response.writeHead(statusCode, {
    'access-control-allow-origin': environment.corsOrigin,
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
  })
  response.end()
}
