import type {
  AuthLoginPayload,
  AuthRegisterPayload,
  AuthTokenResponse,
  AuthUser,
  CommonModuleKey,
  CommonModuleListResponse,
  CommonModuleMetadata,
  CommonModuleMetadataListResponse,
  CommonModuleRecordResponse,
  CommonModuleUpsertPayload,
} from '@shared/index'

const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000')

export class HttpError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly context?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => null)) as
    | T
    | { error?: string; context?: unknown }
    | null

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && payload.error
        ? payload.error
        : 'Request failed.'
    const context =
      payload && typeof payload === 'object' && 'context' in payload ? payload.context : undefined
    throw new HttpError(message, response.status, context)
  }

  return payload as T
}

export function login(payload: AuthLoginPayload) {
  return request<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: AuthRegisterPayload) {
  return request<AuthTokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCurrentUser(token: string) {
  return request<AuthUser>('/auth/me', {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
}

export async function listCommonModuleMetadata() {
  const response = await request<CommonModuleMetadataListResponse>('/common/modules')
  return response.modules
}

export async function getCommonModuleMetadata(moduleKey: CommonModuleKey) {
  const response = await request<{ module: CommonModuleMetadata }>(`/common/modules/${moduleKey}`)
  return response.module
}

export async function listCommonModuleItems(moduleKey: CommonModuleKey, includeInactive = true) {
  const response = await request<CommonModuleListResponse>(
    `/common/${moduleKey}?includeInactive=${includeInactive ? 'true' : 'false'}`,
  )
  return response.items
}

export async function getCommonModuleItem(moduleKey: CommonModuleKey, id: string) {
  const response = await request<CommonModuleRecordResponse>(`/common/${moduleKey}/${id}`)
  return response.item
}

export async function createCommonModuleItem(
  moduleKey: CommonModuleKey,
  payload: CommonModuleUpsertPayload,
) {
  const response = await request<CommonModuleRecordResponse>(`/common/${moduleKey}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function updateCommonModuleItem(
  moduleKey: CommonModuleKey,
  id: string,
  payload: CommonModuleUpsertPayload,
) {
  const response = await request<CommonModuleRecordResponse>(`/common/${moduleKey}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function deactivateCommonModuleItem(moduleKey: CommonModuleKey, id: string) {
  await request<CommonModuleRecordResponse>(`/common/${moduleKey}/${id}`, {
    method: 'DELETE',
  })
}

export async function restoreCommonModuleItem(moduleKey: CommonModuleKey, id: string) {
  await request<CommonModuleRecordResponse>(`/common/${moduleKey}/${id}/restore`, {
    method: 'POST',
  })
}
