import {
  frappeTodoListResponseSchema,
  frappeTodoResponseSchema,
  frappeTodoSchema,
  frappeTodoUpsertPayloadSchema,
  type AuthUser,
} from '@shared/index'
import { ApplicationError } from '@framework-core/runtime/errors/application-error'
import { environment } from '@framework-core/runtime/config/environment'

function assertSuperAdmin(user: AuthUser) {
  if (!user.isSuperAdmin) {
    throw new ApplicationError('Super admin access is required.', {}, 403)
  }
}

function getConfiguredFrappeConnection() {
  if (!environment.frappe.enabled || !environment.frappe.baseUrl || !environment.frappe.apiKey || !environment.frappe.apiSecret) {
    throw new ApplicationError(
      'Frappe integration is not configured. Open ERPNext Connection and save valid credentials first.',
      {},
      409,
    )
  }

  return environment.frappe
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null
    return [
      typeof payload?.message === 'string' ? payload.message : '',
      typeof payload?.exception === 'string' ? payload.exception : '',
      typeof payload?.exc_type === 'string' ? payload.exc_type : '',
    ]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(' | ') || `HTTP ${response.status}`
  }

  return (await response.text().catch(() => '')).trim() || `HTTP ${response.status}`
}

async function requestFrappeJson(path: string, init?: RequestInit) {
  const connection = getConfiguredFrappeConnection()
  const headers = new Headers({
    authorization: `token ${connection.apiKey}:${connection.apiSecret}`,
    accept: 'application/json',
  })

  if (connection.siteName) {
    headers.set('x-frappe-site-name', connection.siteName)
  }

  if (init?.body) {
    headers.set('content-type', 'application/json')
  }

  const response = await fetch(`${connection.baseUrl}${path}`, {
    ...init,
    headers,
    signal: AbortSignal.timeout(connection.timeoutSeconds * 1000),
  })

  if (!response.ok) {
    throw new ApplicationError('Frappe request failed.', {
      detail: await readErrorMessage(response),
      statusCode: response.status,
    }, 502)
  }

  return response.json().catch(() => null) as Promise<Record<string, unknown> | null>
}

function toTodoItem(record: Record<string, unknown>) {
  return frappeTodoSchema.parse({
    id: typeof record.name === 'string' ? record.name : '',
    description: typeof record.description === 'string' ? record.description : '',
    status: typeof record.status === 'string' ? record.status : 'Open',
    priority: typeof record.priority === 'string' ? record.priority : 'Medium',
    dueDate: typeof record.date === 'string' ? record.date : '',
    allocatedTo: typeof record.allocated_to === 'string' ? record.allocated_to : '',
    owner: typeof record.owner === 'string' ? record.owner : '',
    modifiedAt: typeof record.modified === 'string' ? record.modified : '',
  })
}

async function readTodoById(todoId: string) {
  const payload = await requestFrappeJson(`/api/resource/ToDo/${encodeURIComponent(todoId)}`)
  const item = payload && typeof payload.data === 'object' && payload.data
    ? payload.data as Record<string, unknown>
    : {}

  return toTodoItem(item)
}

function toTodoRequestBody(payload: { description: string; status: string; priority: string; dueDate: string; allocatedTo: string }) {
  return JSON.stringify({
    description: payload.description,
    status: payload.status,
    priority: payload.priority,
    date: payload.dueDate || null,
    allocated_to: payload.allocatedTo || null,
  })
}

export async function listFrappeTodos(user: AuthUser) {
  assertSuperAdmin(user)

  const query = new URLSearchParams({
    fields: JSON.stringify(['name', 'description', 'status', 'priority', 'date', 'allocated_to', 'owner', 'modified']),
    order_by: 'modified desc',
    limit_page_length: '100',
  })

  const payload = await requestFrappeJson(`/api/resource/ToDo?${query.toString()}`)
  const items = Array.isArray(payload?.data)
    ? payload.data.map((entry) => toTodoItem(entry as Record<string, unknown>))
    : []

  return frappeTodoListResponseSchema.parse({
    todos: {
      items,
      syncedAt: new Date().toISOString(),
    },
  })
}

export async function createFrappeTodo(user: AuthUser, payload: unknown) {
  assertSuperAdmin(user)

  const parsedPayload = frappeTodoUpsertPayloadSchema.parse(payload)
  const createdPayload = await requestFrappeJson('/api/resource/ToDo', {
    method: 'POST',
    body: toTodoRequestBody(parsedPayload),
  })
  const createdRecord = createdPayload && typeof createdPayload.data === 'object' && createdPayload.data
    ? createdPayload.data as Record<string, unknown>
    : null
  const todoId = createdRecord && typeof createdRecord.name === 'string'
    ? createdRecord.name
    : ''

  if (!todoId) {
    throw new ApplicationError('Frappe ToDo create response did not include a document id.', {}, 502)
  }

  return frappeTodoResponseSchema.parse({
    item: await readTodoById(todoId),
  })
}

export async function updateFrappeTodo(user: AuthUser, todoId: string, payload: unknown) {
  assertSuperAdmin(user)

  const parsedPayload = frappeTodoUpsertPayloadSchema.parse(payload)
  await requestFrappeJson(`/api/resource/ToDo/${encodeURIComponent(todoId)}`, {
    method: 'PUT',
    body: toTodoRequestBody(parsedPayload),
  })

  return frappeTodoResponseSchema.parse({
    item: await readTodoById(todoId),
  })
}
