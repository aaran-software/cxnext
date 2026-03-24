import { Link } from 'react-router-dom'
import { Check, ChevronDown, Home, Store } from 'lucide-react'
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
import { frontendTarget } from '@/config/frontend'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useDesk } from '@/features/framework/desk/desk-provider'
import { ThemeSwitcher } from '@/shared/theme/theme-switcher'

export function AppHeader() {
  const { logout } = useAuth()
  const { apps, currentApp, locationMeta } = useDesk()
  const storefrontAction = frontendTarget === 'shop'
    ? { label: 'Shop', href: '/', icon: Store }
    : { label: 'Home', href: '/', icon: Home }
  const StorefrontIcon = storefrontAction.icon

  return (
    <header className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border/60 px-4 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="hidden h-5 md:block" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  {currentApp ? <currentApp.icon className="size-4" /> : <Home className="size-4" />}
                  <span>{currentApp?.name ?? 'Framework'}</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Switch app</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/dashboard" className="flex items-center gap-2">
                    <Home className="size-4" />
                    <span className="flex-1">Framework</span>
                    {!currentApp ? <Check className="size-4" /> : null}
                  </Link>
                </DropdownMenuItem>
                {apps.map((app) => (
                  <DropdownMenuItem key={app.id} asChild>
                    <Link to={app.route} className="flex items-center gap-2">
                      <app.icon className="size-4" />
                      <span className="flex-1">{app.name}</span>
                      {currentApp?.id === app.id ? <Check className="size-4" /> : null}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm text-muted-foreground">/</span>
            <h1 className="truncate text-lg font-semibold text-foreground">{locationMeta.title}</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={storefrontAction.href}>
            <StorefrontIcon className="size-4" />
            {storefrontAction.label}
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
