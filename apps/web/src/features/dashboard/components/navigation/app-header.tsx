import type { CommonModuleKey } from '@shared/index'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Layers3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/features/auth/components/auth-provider'
import { commonModuleMenuGroups, getCommonModuleMenuItem } from '@/features/common-modules/config/common-module-navigation'
import { ThemeSwitcher } from '@/shared/theme/theme-switcher'

function resolveCurrentTitle(pathname: string) {
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return {
      section: 'Dashboard',
      title: 'Workspace overview',
    }
  }

  if (pathname === '/dashboard/common' || pathname === '/dashboard/common/') {
    return {
      section: 'Common Modules',
      title: 'Master workspace',
    }
  }

  const match = pathname.match(/^\/dashboard\/common\/([^/]+)$/)
  if (match) {
    const moduleItem = getCommonModuleMenuItem(match[1] as CommonModuleKey)
    if (moduleItem) {
      return {
        section: moduleItem.groupTitle,
        title: moduleItem.title,
      }
    }
  }

  return {
    section: 'Workspace',
    title: 'Application',
  }
}

export function AppHeader() {
  const location = useLocation()
  const { logout } = useAuth()
  const current = resolveCurrentTitle(location.pathname)

  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-border/60 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="hidden h-5 md:block" />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {current.section}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-foreground">{current.title}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Layers3 className="size-4" />
                  Modules
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuLabel>Common modules</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {commonModuleMenuGroups.map((group) => (
                  <div key={group.key}>
                    <DropdownMenuLabel className="text-[11px]">{group.title}</DropdownMenuLabel>
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.key} asChild>
                        <Link to={`/dashboard/common/${item.key}`} className="cursor-pointer">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="size-4" />
            Overview
          </Link>
        </Button>
        <ThemeSwitcher />
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
