export const frontendTargets = ["app", "web", "shop"] as const

export type FrontendTarget = (typeof frontendTargets)[number]

declare const __FRONTEND_TARGET__: string

function normalizeTarget(value: string | undefined): FrontendTarget {
  if (value === "app" || value === "web" || value === "shop") {
    return value
  }

  return "web"
}

export const frontendTarget = normalizeTarget(
  typeof __FRONTEND_TARGET__ === "string" ? __FRONTEND_TARGET__ : import.meta.env.VITE_FRONTEND_TARGET,
)

export const frontendLabels: Record<FrontendTarget, string> = {
  app: "ERP Billing",
  web: "Portfolio Sites",
  shop: "Online Store",
}
