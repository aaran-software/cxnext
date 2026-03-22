import { Navigate, Outlet } from 'react-router-dom'
import { buildAdminPortalPath } from '../lib/portal-routing'
import { useAuth } from './auth-provider'

export function RequireSuperAdmin() {
  const { session } = useAuth()

  if (!session?.user.isSuperAdmin) {
    return <Navigate to={buildAdminPortalPath()} replace />
  }

  return <Outlet />
}
