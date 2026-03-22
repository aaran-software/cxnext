"use client"

import * as React from "react"
import {
  Building2,
  ChevronRight,
  ContactRound,
  Image,
  Mail,
  LayoutDashboard,
  LogOut,
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/components/auth-provider"
import { buildAdminPortalPath } from "@/features/auth/lib/portal-routing"
import { commonModuleMenuGroups, getCommonModuleHref } from "@/features/common-modules/config/common-module-navigation"
import { BrandMark } from "@/shared/branding/brand-mark"

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
  const location = useLocation()
  const [openGroupKey, setOpenGroupKey] = React.useState<string | null>(() =>
    getActiveGroupKey(location.pathname),
  )

  React.useEffect(() => {
    const activeGroupKey = getActiveGroupKey(location.pathname)
    setOpenGroupKey(activeGroupKey)
  }, [location.pathname])

  return (
      <Sidebar variant="inset" collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <NavLink to={buildAdminPortalPath()}>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <BrandMark compact className="items-start" />
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
          <div className="rounded-xl border border-sidebar-border/70 p-3">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {session?.user.displayName ?? 'Workspace user'}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              {session?.user.email ?? 'No email'}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
              {session?.user.actorType ?? 'operator'}
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={logout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
  )
}

