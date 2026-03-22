import type { ActorType, AuthUser } from '@shared/index'

export const customerPortalRoot = '/dashboard'
export const adminPortalRoot = '/admin/dashboard'

export function isCustomerActor(actorType: ActorType) {
  return actorType === 'customer'
}

export function canAccessCustomerPortal(actorType: ActorType) {
  return isCustomerActor(actorType)
}

export function canAccessAdminPortal(actorType: ActorType) {
  return !isCustomerActor(actorType)
}

export function getDefaultPortalPath(actorType: ActorType) {
  return canAccessCustomerPortal(actorType) ? customerPortalRoot : adminPortalRoot
}

export function getPortalHomeHref(user: Pick<AuthUser, 'actorType'> | null | undefined) {
  return user ? getDefaultPortalPath(user.actorType) : '/login'
}

export function buildCustomerPortalPath(path = '') {
  return `${customerPortalRoot}${normalizeChildPath(path)}`
}

export function buildAdminPortalPath(path = '') {
  return `${adminPortalRoot}${normalizeChildPath(path)}`
}

export function resolveAuthorizedPath(actorType: ActorType, requestedPath?: string | null) {
  const trimmedPath = requestedPath?.trim()
  if (!trimmedPath) {
    return getDefaultPortalPath(actorType)
  }

  if (trimmedPath === customerPortalRoot || trimmedPath.startsWith(`${customerPortalRoot}/`)) {
    return canAccessCustomerPortal(actorType) ? trimmedPath : getDefaultPortalPath(actorType)
  }

  if (trimmedPath === adminPortalRoot || trimmedPath.startsWith(`${adminPortalRoot}/`)) {
    return canAccessAdminPortal(actorType) ? trimmedPath : getDefaultPortalPath(actorType)
  }

  if (trimmedPath === '/checkout' || trimmedPath.startsWith('/account/')) {
    return canAccessCustomerPortal(actorType) ? trimmedPath : getDefaultPortalPath(actorType)
  }

  return trimmedPath
}

function normalizeChildPath(path: string) {
  if (!path) {
    return ''
  }

  return path.startsWith('/') ? path : `/${path}`
}
