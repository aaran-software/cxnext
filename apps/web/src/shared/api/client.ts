import type {
  AuthLoginPayload,
  AuthRegisterPayload,
  AuthRegisterOtpRequestPayload,
  AuthRegisterOtpRequestResponse,
  AuthRegisterOtpVerifyPayload,
  AuthRegisterOtpVerifyResponse,
  AuthTokenResponse,
  AuthUser,
  CustomerProfile,
  CustomerProfileResponse,
  CustomerProfileUpdatePayload,
  CompanyListResponse,
  CompanyResponse,
  CompanyUpsertPayload,
  ContactListResponse,
  ContactResponse,
  ContactUpsertPayload,
  MediaFolderListResponse,
  MediaFolderResponse,
  MediaFolderUpsertPayload,
  MediaImageUploadPayload,
  MediaListResponse,
  MediaResponse,
  MediaUpsertPayload,
  ProductListResponse,
  ProductResponse,
  ProductUpsertPayload,
  MailboxMessageListResponse,
  MailboxMessageResponse,
  MailboxSendPayload,
  MailboxTemplateListResponse,
  MailboxTemplateResponse,
  MailboxTemplateUpsertPayload,
  StorefrontCatalogResponse,
  StorefrontCheckoutPayload,
  StorefrontCheckoutResponse,
  StorefrontCheckoutSessionResponse,
  StorefrontPaymentVerificationPayload,
  CommonModuleKey,
  CommonModuleListResponse,
  CommonModuleMetadata,
  CommonModuleMetadataListResponse,
  CommonModuleRecordResponse,
  CommonModuleUpsertPayload,
  DatabaseSetupPayload,
  SetupStatusResponse,
  SystemSettingsResponse,
  SystemSettingsUpdatePayload,
  SystemUpdateRunResponse,
  SystemVersionResponse,
  SystemUpdateCheckResponse,
} from '@shared/index'

const configuredApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').trim()
const defaultLocalApiBaseUrl = 'http://localhost:4000'

function isViteLocalDevOrigin(origin: string) {
  try {
    const url = new URL(origin)
    return (
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
      url.port === '5173'
    )
  } catch {
    return false
  }
}

function resolveApiBaseUrl() {
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    if (isViteLocalDevOrigin(window.location.origin)) {
      return defaultLocalApiBaseUrl
    }

    return window.location.origin
  }

  return defaultLocalApiBaseUrl
}

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
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
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

function createAuthorizationHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
  }
}

export async function fetchSetupStatus() {
  const response = await request<SetupStatusResponse>('/setup/status')
  return response.status
}

export async function saveDatabaseSetup(payload: DatabaseSetupPayload) {
  const response = await request<SetupStatusResponse>('/setup/database', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.status
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

export function requestRegisterOtp(payload: AuthRegisterOtpRequestPayload) {
  return request<AuthRegisterOtpRequestResponse>('/auth/register/request-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyRegisterOtp(payload: AuthRegisterOtpVerifyPayload) {
  return request<AuthRegisterOtpVerifyResponse>('/auth/register/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCurrentUser(token: string) {
  return request<AuthUser>('/auth/me', {
    headers: createAuthorizationHeaders(token),
  })
}

export async function getCustomerProfile(token: string) {
  const response = await request<CustomerProfileResponse>('/customer/profile', {
    headers: createAuthorizationHeaders(token),
  })
  return response.profile
}

export async function updateCustomerProfile(token: string, payload: CustomerProfileUpdatePayload) {
  const response = await request<CustomerProfileResponse>('/customer/profile', {
    method: 'PATCH',
    headers: createAuthorizationHeaders(token),
    body: JSON.stringify(payload),
  })
  return response.profile
}

export async function getSystemSettings(token: string) {
  const response = await request<SystemSettingsResponse>('/admin/settings/system', {
    headers: createAuthorizationHeaders(token),
  })
  return response.settings
}

export async function updateSystemSettings(token: string, payload: SystemSettingsUpdatePayload) {
  const response = await request<SystemSettingsResponse>('/admin/settings/system', {
    method: 'PATCH',
    headers: createAuthorizationHeaders(token),
    body: JSON.stringify(payload),
  })
  return response.settings
}

export async function runSystemUpdate(token: string, payload: SystemSettingsUpdatePayload) {
  return request<SystemUpdateRunResponse>('/admin/settings/system/update', {
    method: 'POST',
    headers: createAuthorizationHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function getSystemVersion() {
  const response = await request<SystemVersionResponse>('/system/version')
  return response.version
}

export async function getSystemUpdateCheck(token: string) {
  const response = await request<SystemUpdateCheckResponse>('/admin/system/update-check', {
    headers: createAuthorizationHeaders(token),
  })
  return response.update
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

export async function listCompanies() {
  const response = await request<CompanyListResponse>('/companies')
  return response.items
}

export async function getCompany(id: string) {
  const response = await request<CompanyResponse>(`/companies/${id}`)
  return response.item
}

export async function createCompany(payload: CompanyUpsertPayload) {
  const response = await request<CompanyResponse>('/companies', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function updateCompany(id: string, payload: CompanyUpsertPayload) {
  const response = await request<CompanyResponse>(`/companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function deactivateCompany(id: string) {
  const response = await request<CompanyResponse>(`/companies/${id}`, {
    method: 'DELETE',
  })
  return response.item
}

export async function restoreCompany(id: string) {
  const response = await request<CompanyResponse>(`/companies/${id}/restore`, {
    method: 'POST',
  })
  return response.item
}

export async function listContacts() {
  const response = await request<ContactListResponse>('/contacts')
  return response.items
}

export async function getContact(id: string) {
  const response = await request<ContactResponse>(`/contacts/${id}`)
  return response.item
}

export async function createContact(payload: ContactUpsertPayload) {
  const response = await request<ContactResponse>('/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function updateContact(id: string, payload: ContactUpsertPayload) {
  const response = await request<ContactResponse>(`/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function deactivateContact(id: string) {
  const response = await request<ContactResponse>(`/contacts/${id}`, { method: 'DELETE' })
  return response.item
}

export async function restoreContact(id: string) {
  const response = await request<ContactResponse>(`/contacts/${id}/restore`, { method: 'POST' })
  return response.item
}

export async function listProducts() {
  const response = await request<ProductListResponse>('/products')
  return response.items
}

export async function getProduct(id: string) {
  const response = await request<ProductResponse>(`/products/${id}`)
  return response.item
}

export async function createProduct(payload: ProductUpsertPayload) {
  const response = await request<ProductResponse>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function updateProduct(id: string, payload: ProductUpsertPayload) {
  const response = await request<ProductResponse>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function deactivateProduct(id: string) {
  const response = await request<ProductResponse>(`/products/${id}`, { method: 'DELETE' })
  return response.item
}

export async function restoreProduct(id: string) {
  const response = await request<ProductResponse>(`/products/${id}/restore`, { method: 'POST' })
  return response.item
}

export async function listMailboxMessages() {
  const response = await request<MailboxMessageListResponse>('/mailbox/messages')
  return response.items
}

export async function getMailboxMessage(id: string) {
  const response = await request<MailboxMessageResponse>(`/mailbox/messages/${id}`)
  return response.item
}

export async function sendMailboxMessage(payload: MailboxSendPayload) {
  const response = await request<MailboxMessageResponse>('/mailbox/messages/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function listMailboxTemplates(includeInactive = true) {
  const response = await request<MailboxTemplateListResponse>(`/mailbox/templates?includeInactive=${includeInactive ? 'true' : 'false'}`)
  return response.items
}

export async function getMailboxTemplate(id: string) {
  const response = await request<MailboxTemplateResponse>(`/mailbox/templates/${id}`)
  return response.item
}

export async function createMailboxTemplate(payload: MailboxTemplateUpsertPayload) {
  const response = await request<MailboxTemplateResponse>('/mailbox/templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function updateMailboxTemplate(id: string, payload: MailboxTemplateUpsertPayload) {
  const response = await request<MailboxTemplateResponse>(`/mailbox/templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function deactivateMailboxTemplate(id: string) {
  const response = await request<MailboxTemplateResponse>(`/mailbox/templates/${id}`, {
    method: 'DELETE',
  })
  return response.item
}

export async function restoreMailboxTemplate(id: string) {
  const response = await request<MailboxTemplateResponse>(`/mailbox/templates/${id}/restore`, {
    method: 'POST',
  })
  return response.item
}

export function getStorefrontCatalog() {
  return request<StorefrontCatalogResponse>('/storefront/catalog')
}

export async function createStorefrontCheckout(payload: StorefrontCheckoutPayload) {
  const response = await request<StorefrontCheckoutSessionResponse>('/storefront/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response
}

export async function verifyStorefrontPayment(payload: StorefrontPaymentVerificationPayload) {
  const response = await request<StorefrontCheckoutResponse>('/storefront/checkout/verify-payment', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.order
}

export async function listMedia() {
  const response = await request<MediaListResponse>('/media')
  return response.items
}

export async function getMedia(id: string) {
  const response = await request<MediaResponse>(`/media/${id}`)
  return response.item
}

export async function createMedia(payload: MediaUpsertPayload) {
  const response = await request<MediaResponse>('/media', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function uploadMediaImage(payload: MediaImageUploadPayload) {
  const response = await request<MediaResponse>('/media/upload-image', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function updateMedia(id: string, payload: MediaUpsertPayload) {
  const response = await request<MediaResponse>(`/media/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function deactivateMedia(id: string) {
  await request<MediaResponse>(`/media/${id}`, { method: 'DELETE' })
}

export async function restoreMedia(id: string) {
  await request<MediaResponse>(`/media/${id}/restore`, { method: 'POST' })
}

export async function listMediaFolders() {
  const response = await request<MediaFolderListResponse>('/media/folders')
  return response.items
}

export async function createMediaFolder(payload: MediaFolderUpsertPayload) {
  const response = await request<MediaFolderResponse>('/media/folders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function updateMediaFolder(id: string, payload: MediaFolderUpsertPayload) {
  const response = await request<MediaFolderResponse>(`/media/folders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.item
}

export async function deactivateMediaFolder(id: string) {
  await request<MediaFolderResponse>(`/media/folders/${id}`, { method: 'DELETE' })
}

export async function restoreMediaFolder(id: string) {
  await request<MediaFolderResponse>(`/media/folders/${id}/restore`, { method: 'POST' })
}
