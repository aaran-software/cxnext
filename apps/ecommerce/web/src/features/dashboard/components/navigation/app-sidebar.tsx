"use client"

import * as React from "react"
import type { SystemVersion } from "@shared/index"
import { LayoutDashboard, Settings2, ShieldCheck } from "lucide-react"
import { Link, NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/features/auth/components/auth-provider"
import { buildAdminPortalPath } from "@/features/auth/lib/portal-routing"
import { NavUser } from "@/features/dashboard/components/navigation/nav-user"
import { useDesk } from "@/features/framework/desk/desk-provider"
import { matchesDeskRoute } from "@/features/framework/desk/desk-registry"
import { getSystemVersion } from "@/shared/api/client"
import { BrandGlyph } from "@/shared/branding/brand-mark"
import { useBranding } from "@/shared/branding/branding-provider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session, logout } = useAuth()
  const branding = useBranding()
  const { state: sidebarState } = useSidebar()
  const { apps, currentApp, services } = useDesk()
  const location = useLocation()
  const [systemVersion, setSystemVersion] = React.useState<SystemVersion | null>(null)

  React.useEffect(() => {
    let cancelled = false

    void getSystemVersion()
      .then((version) => {
        if (!cancelled) {
          setSystemVersion(version)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto min-h-0 overflow-visible px-2 py-2 group-data-[collapsible=icon]:-ml-1 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0"
            >
              <NavLink to={buildAdminPortalPath()}>
                <div className="flex min-w-0 items-center gap-3">
                  <BrandGlyph
                    shadowless
                    className="size-10 shrink-0 rounded-xl"
                    iconClassName="size-5"
                  />
                  {sidebarState === "expanded" ? (
                    <div className="min-w-0 flex-1 text-left leading-tight">
                      <p className="truncate text-base font-semibold uppercase tracking-[0.2em] text-foreground">
                        {branding.brandName}
                      </p>
                      <p className="truncate text-xs font-medium text-muted-foreground">
                        {branding.tagline}
                      </p>
                    </div>
                  ) : null}
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {!currentApp ? (
          <SidebarGroup>
            <SidebarGroupLabel>Desk</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Application desk">
                    <NavLink to={buildAdminPortalPath()}>
                      <LayoutDashboard />
                      <span>All Apps</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {apps.map((app) => {
                  const AppIcon = app.icon

                  return (
                    <SidebarMenuItem key={app.id}>
                      <SidebarMenuButton asChild tooltip={app.name}>
                        <NavLink to={app.route}>
                          <AppIcon />
                          <span>{app.name}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {currentApp ? (
          currentApp.menuGroups.map((group) => (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.name}
                          isActive={matchesDeskRoute(location.pathname, item.route, item.matchRoutes)}
                        >
                          <Link to={item.route}>
                            <ItemIcon />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        ) : null}

        {!currentApp ? (
          <SidebarGroup>
            <SidebarGroupLabel>Framework</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {services.map((service) => {
                  const ServiceIcon = service.icon

                  return (
                    <SidebarMenuItem key={service.id}>
                      <SidebarMenuButton disabled tooltip={service.name} className="cursor-default opacity-80">
                        <ServiceIcon />
                        <span>{service.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
                    <NavLink to={buildAdminPortalPath('/settings')}>
                      <Settings2 />
                      <span>Settings</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Version">
                    <NavLink to={buildAdminPortalPath('/version')}>
                      <ShieldCheck />
                      <span>Version</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user.displayName ?? "Workspace user",
            email: session?.user.email ?? "No email",
            avatar: session?.user.avatarUrl ?? null,
            actorType: session?.user.actorType ?? "operator",
          }}
          onLogout={logout}
          systemVersion={systemVersion}
          showAdminLinks={Boolean(session?.user.isSuperAdmin)}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
