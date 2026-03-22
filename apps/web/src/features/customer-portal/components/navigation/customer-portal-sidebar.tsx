"use client"

import * as React from 'react'
import { LogOut } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/sidebar'
import { useAuth } from '@/features/auth/components/auth-provider'
import { customerPortalLinks } from '@/features/customer-portal/lib/customer-portal-nav'
import { BrandMark } from '@/shared/branding/brand-mark'
import { buildCustomerPortalPath } from '@/features/auth/lib/portal-routing'

export function CustomerPortalSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session, logout } = useAuth()
  const location = useLocation()

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to={buildCustomerPortalPath()}>
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
          <SidebarGroupLabel>My Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {customerPortalLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild tooltip={link.title} isActive={location.pathname === link.href}>
                    <NavLink to={link.href}>
                      <link.icon />
                      <span>{link.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="rounded-xl border border-sidebar-border/70 p-3">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {session?.user.displayName ?? 'Customer'}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">
            {session?.user.email ?? 'No email'}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
            Customer portal
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
