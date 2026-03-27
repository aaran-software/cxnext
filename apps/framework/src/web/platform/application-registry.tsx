import { suiteApps } from '../../app-suite'
import { defineFrontendShell, type FrontendShellDefinition, type FrontendShellId } from '../shells/shell-definition'

const frontendApplicationIds = new Set<FrontendShellId>(['billing', 'ecommerce'])
const defaultFrontendApplicationId: FrontendShellId = 'ecommerce'

function normalizeFrontendApplicationId(value: unknown): FrontendShellId {
  const normalized = String(value ?? '').trim().toLowerCase()
  return frontendApplicationIds.has(normalized as FrontendShellId)
    ? normalized as FrontendShellId
    : defaultFrontendApplicationId
}

function resolveApplicationName(id: FrontendShellId) {
  return suiteApps.find((app) => app.id === id)?.name ?? id
}

const frontendApplications: Record<FrontendShellId, FrontendShellDefinition> = {
  billing: {
    ...defineFrontendShell(
      'billing',
      resolveApplicationName('billing'),
      () => import('@billing-web/shell/billing-shell'),
      'BillingShellRoot',
    ),
  },
  ecommerce: {
    ...defineFrontendShell(
      'ecommerce',
      resolveApplicationName('ecommerce'),
      () => import('@ecommerce-web/shell/ecommerce-shell'),
      'EcommerceShellRoot',
    ),
  },
}

export function resolveFrontendApplication() {
  const applicationId = normalizeFrontendApplicationId(import.meta.env.VITE_PLATFORM_APP)
  return frontendApplications[applicationId]
}
