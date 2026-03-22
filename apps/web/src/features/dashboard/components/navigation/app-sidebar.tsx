"use client"

import * as React from "react"
import type { SystemVersion } from "@shared/index"
import {
  Building2,
  ChevronRight,
  ContactRound,
  Image,
  Mail,
  LayoutDashboard,
  Package,
  Settings2,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { NavLink, useLocation } from "react-router-dom"

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/features/auth/components/auth-provider"
import { buildAdminPortalPath } from "@/features/auth/lib/portal-routing"
import { commonModuleMenuGroups, getCommonModuleHref } from "@/features/common-modules/config/common-module-navigation"
import { NavUser } from "@/features/dashboard/components/navigation/nav-user"
import { getSystemVersion } from "@/shared/api/client"
import { BrandGlyph } from "@/shared/branding/brand-mark"
import { useBranding } from "@/shared/branding/branding-provider"

function getActiveGroupKey(pathname: string) {
  const moduleKey = pathname.startsWith(buildAdminPortalPath('/storefront-designer'))
    ? 'storefrontTemplates'
    : pathname.match(/^\/admin\/dashboard\/common\/([^/]+)$/)?.[1]

  if (!moduleKey) return null

  const activeItem = commonModuleMenuGroups
    .flatMap((group) => group.items.map((item) => ({ groupKey: group.key, itemKey: item.key })))
    .find((entry) => entry.itemKey === moduleKey)

  return activeItem?.groupKey ?? null
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session, logout } = useAuth()
  const branding = useBranding()
  const { state: sidebarState } = useSidebar()
  const location = useLocation()
  const [systemVersion, setSystemVersion] = React.useState<SystemVersion | null>(null)
  const [openGroupKey, setOpenGroupKey] = React.useState<string | null>(() =>
    getActiveGroupKey(location.pathname),
  )

  React.useEffect(() => {
    const activeGroupKey = getActiveGroupKey(location.pathname)
    setOpenGroupKey(activeGroupKey)
  }, [location.pathname])

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
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard">
                    <NavLink to={buildAdminPortalPath()}>
                      <LayoutDashboard />
                      <span>Overview</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Companies">
                    <NavLink to={buildAdminPortalPath('/companies')}>
                      <Building2 />
                      <span>Companies</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Contacts">
                    <NavLink to={buildAdminPortalPath('/contacts')}>
                      <ContactRound />
                      <span>Contacts</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Media">
                    <NavLink to={buildAdminPortalPath('/media')}>
                      <Image />
                      <span>Media</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Products">
                    <NavLink to={buildAdminPortalPath('/products')}>
                      <Package />
                      <span>Products</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Mailbox">
                    <NavLink to={buildAdminPortalPath('/mailbox/messages')}>
                      <Mail />
                      <span>Mailbox</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {session?.user.isSuperAdmin ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings">
                      <NavLink to={buildAdminPortalPath('/settings')}>
                        <Settings2 />
                        <span>Settings</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Common Modules</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="All masters">
                    <NavLink to={buildAdminPortalPath('/common')}>
                      <LayoutDashboard />
                      <span>Common Workspace</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {commonModuleMenuGroups.map((group) => (
                  <Collapsible
                    key={group.key}
                    asChild
                    open={openGroupKey === group.key}
                    onOpenChange={(open) => {
                      setOpenGroupKey(open ? group.key : null)
                    }}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={group.title} className="justify-between">
                          <span className="flex items-center gap-2">
                            <group.icon className="size-4" />
                            <span>{group.title}</span>
                          </span>
                          <ChevronRight className="transition-transform duration-200 group-data-[state=open]/menu-item:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.key}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={item.key === 'storefrontTemplates'
                                  ? location.pathname.startsWith(buildAdminPortalPath('/storefront-designer'))
                                  : location.pathname === buildAdminPortalPath(`/common/${item.key}`)}
                              >
                                <NavLink to={getCommonModuleHref(item.key)}>
                                  <item.icon />
                                  <span>{item.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={{
              name: session?.user.displayName ?? 'Workspace user',
              email: session?.user.email ?? 'No email',
              avatar: session?.user.avatarUrl ?? null,
              actorType: session?.user.actorType ?? 'operator',
            }}
            onLogout={logout}
            systemVersion={systemVersion}
            showAdminLinks={Boolean(session?.user.isSuperAdmin)}
          />
        </SidebarFooter>
      </Sidebar>
  )
}

