import { Link, useLocation } from 'react-router-dom'
import { Building2, ChevronRight, Home, LayoutDashboard, ShoppingBag, Store, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { frontendTarget } from '@/config/frontend'
import { useAuth } from '@/features/auth/components/auth-provider'
import { ThemeSwitcher } from '@/shared/theme/theme-switcher'

function resolveCurrentTitle(pathname: string) {
  if (pathname === '/admin/dashboard' || pathname === '/admin/dashboard/') {
    return { section: 'Platform', title: 'Framework and app overview' }
  }

  if (pathname === '/admin/dashboard/core' || pathname === '/admin/dashboard/core/') {
    return { section: 'Core', title: 'Core workspace' }
  }

  if (pathname === '/admin/dashboard/ecommerce' || pathname === '/admin/dashboard/ecommerce/') {
    return { section: 'Ecommerce', title: 'Ecommerce workspace' }
  }

  if (pathname.startsWith('/admin/dashboard/orders')) {
    return { section: 'Ecommerce', title: pathname === '/admin/dashboard/orders' ? 'Order operations' : 'Order details' }
  }

  if (pathname.startsWith('/admin/dashboard/customers')) {
    return { section: 'Ecommerce', title: pathname === '/admin/dashboard/customers' ? 'Customer helpdesk' : 'Customer details' }
  }

  if (pathname.startsWith('/admin/dashboard/products')) {
    return { section: 'Ecommerce', title: pathname === '/admin/dashboard/products' ? 'Products' : 'Product workspace' }
  }

  if (pathname.startsWith('/admin/dashboard/storefront-designer')) {
    return { section: 'Ecommerce', title: 'Storefront designer' }
  }

  if (pathname.startsWith('/admin/dashboard/companies')) {
    return { section: 'Core', title: 'Companies' }
  }

  if (pathname.startsWith('/admin/dashboard/contacts')) {
    return { section: 'Core', title: 'Contacts' }
  }

  if (pathname.startsWith('/admin/dashboard/media')) {
    return { section: 'Core', title: 'Media manager' }
  }

  if (pathname.startsWith('/admin/dashboard/common')) {
    return { section: 'Core', title: 'Common modules' }
  }

  if (pathname.startsWith('/admin/dashboard/settings')) {
    return { section: 'Core', title: 'Settings' }
  }

  return { section: 'Workspace', title: 'Application' }
}

export function AppHeader() {
  const location = useLocation()
  const { logout } = useAuth()
  const current = resolveCurrentTitle(location.pathname)
  const storefrontAction = frontendTarget === 'shop'
    ? { label: 'Shop', href: '/', icon: Store }
    : { label: 'Home', href: '/', icon: Home }
  const StorefrontIcon = storefrontAction.icon

  return (
    <header className="flex min-h-12 shrink-0 items-center justify-between gap-4 border-b border-border/60 px-4 py-1.5">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="hidden h-5 md:block" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" asChild className="shrink-0">
              <Link to="/admin/dashboard" aria-label="Go to dashboard">
                <Home className="size-4" />
              </Link>
            </Button>
            <ChevronRight className="size-4 text-muted-foreground" />
            <span className="hidden text-sm uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              {current.section}
            </span>
            <h1 className="truncate text-lg font-semibold text-foreground">{current.title}</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/core">
            <Building2 className="size-4" />
            Core
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/ecommerce">
            <ShoppingBag className="size-4" />
            Ecommerce
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/orders">
            <LayoutDashboard className="size-4" />
            Operations
          </Link>
        </Button>
        <Button variant="outline" size="sm" disabled>
          <Wallet className="size-4" />
          Billing Base
        </Button>
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
