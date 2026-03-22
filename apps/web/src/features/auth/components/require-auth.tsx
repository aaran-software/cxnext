import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ActorType } from '@shared/index'
import { useAuth } from './auth-provider'
import { getDefaultPortalPath } from '../lib/portal-routing'

interface RequireAuthProps {
  allow?: ActorType[]
}

export function RequireAuth({ allow }: RequireAuthProps = {}) {
  const { isAuthenticated, session } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allow && session && !allow.includes(session.user.actorType)) {
    return <Navigate to={getDefaultPortalPath(session.user.actorType)} replace />
  }

  return <Outlet />
}
