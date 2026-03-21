"use client"

import * as React from "react"
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { NavLink } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/components/auth-provider"
import { commonModuleMenuGroups } from "@/features/common-modules/config/common-module-navigation"
import { BrandMark } from "@/shared/branding/brand-mark"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session, logout } = useAuth()

  return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <NavLink to="/dashboard">
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
                    <NavLink to="/dashboard">
                      <LayoutDashboard />
                      <span>Overview</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Common Modules</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="All masters">
                    <NavLink to="/dashboard/common">
                      <LayoutDashboard />
                      <span>Master Workspace</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {commonModuleMenuGroups.map((group) => (
                  <Collapsible key={group.key} asChild defaultOpen>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={group.title}>
                        <group.icon />
                        <span>{group.title}</span>
                      </SidebarMenuButton>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle {group.title}</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.key}>
                              <SidebarMenuSubButton asChild>
                                <NavLink to={`/dashboard/common/${item.key}`}>
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
