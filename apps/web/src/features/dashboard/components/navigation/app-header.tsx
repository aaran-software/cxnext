import type { CommonModuleKey } from '@shared/index'
import { Link, useLocation } from 'react-router-dom'
import { Building2, ChevronRight, CircleUserRound, ContactRound, Home, Image, LayoutDashboard, Mail, Package, Store, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { frontendTarget } from '@/config/frontend'
import { useAuth } from '@/features/auth/components/auth-provider'
import { getCommonModuleMenuItem } from '@/features/common-modules/config/common-module-navigation'
import { ThemeSwitcher } from '@/shared/theme/theme-switcher'

function resolveCurrentTitle(pathname: string) {
  if (pathname === '/admin/dashboard' || pathname === '/admin/dashboard/') {
    return {
      section: 'Dashboard',
      title: 'Workspace overview',
    }
  }

  if (pathname === '/admin/dashboard/common' || pathname === '/admin/dashboard/common/') {
    return {
      section: 'Common Modules',
      title: 'Common workspace',
    }
  }

  if (pathname === '/admin/dashboard/orders' || pathname === '/admin/dashboard/orders/') {
    return {
      section: 'Commerce',
      title: 'Order Operations',
    }
  }

  if (/^\/admin\/dashboard\/orders\/[^/]+$/.test(pathname)) {
    return {
      section: 'Commerce',
      title: 'Order Details',
    }
  }

  if (pathname === '/admin/dashboard/customers' || pathname === '/admin/dashboard/customers/') {
    return {
      section: 'Support',
      title: 'Customer Helpdesk',
    }
  }

  if (/^\/admin\/dashboard\/customers\/[^/]+$/.test(pathname)) {
    return {
      section: 'Support',
      title: 'Customer Details',
    }
  }

  if (pathname === '/admin/dashboard/companies' || pathname === '/admin/dashboard/companies/') {
    return {
      section: 'Organization',
      title: 'Companies',
    }
  }

  if (pathname === '/admin/dashboard/companies/new') {
    return {
      section: 'Organization',
      title: 'New Company',
    }
  }

  if (/^\/admin\/dashboard\/companies\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'Organization',
      title: 'Edit Company',
    }
  }

  if (/^\/admin\/dashboard\/companies\/[^/]+$/.test(pathname)) {
    return {
      section: 'Organization',
      title: 'Company Details',
    }
  }

  if (pathname === '/admin/dashboard/contacts' || pathname === '/admin/dashboard/contacts/') {
    return {
      section: 'CRM',
      title: 'Contacts',
    }
  }

  if (pathname === '/admin/dashboard/contacts/new') {
    return {
      section: 'CRM',
      title: 'New Contact',
    }
  }

  if (/^\/admin\/dashboard\/contacts\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'CRM',
      title: 'Edit Contact',
    }
  }

  if (/^\/admin\/dashboard\/contacts\/[^/]+$/.test(pathname)) {
    return {
      section: 'CRM',
      title: 'Contact Details',
    }
  }

  if (pathname === '/admin/dashboard/products' || pathname === '/admin/dashboard/products/') {
    return {
      section: 'Catalog',
      title: 'Products',
    }
  }

  if (pathname === '/admin/dashboard/media' || pathname === '/admin/dashboard/media/') {
    return {
      section: 'Catalog',
      title: 'Media Manager',
    }
  }

  if (pathname === '/admin/dashboard/media/new') {
    return {
      section: 'Catalog',
      title: 'New Media Asset',
    }
  }

  if (/^\/admin\/dashboard\/media\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'Catalog',
      title: 'Edit Media Asset',
    }
  }

  if (pathname === '/admin/dashboard/products/new') {
    return {
      section: 'Catalog',
      title: 'New Product',
    }
  }

  if (pathname === '/admin/dashboard/mailbox/messages' || pathname === '/admin/dashboard/mailbox/messages/') {
    return {
      section: 'Communication',
      title: 'Mailbox',
    }
  }

  if (/^\/admin\/dashboard\/mailbox\/messages\/[^/]+$/.test(pathname)) {
    return {
      section: 'Communication',
      title: 'Mailbox Message',
    }
  }

  if (pathname === '/admin/dashboard/mailbox/compose') {
    return {
      section: 'Communication',
      title: 'Compose Email',
    }
  }

  if (pathname === '/admin/dashboard/mailbox/templates' || pathname === '/admin/dashboard/mailbox/templates/') {
    return {
      section: 'Communication',
      title: 'Mail Templates',
    }
  }

  if (pathname === '/admin/dashboard/mailbox/templates/new') {
    return {
      section: 'Communication',
      title: 'New Mail Template',
    }
  }

  if (/^\/admin\/dashboard\/mailbox\/templates\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'Communication',
      title: 'Edit Mail Template',
    }
  }

  if (/^\/admin\/dashboard\/products\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'Catalog',
      title: 'Edit Product',
    }
  }

  if (/^\/admin\/dashboard\/products\/[^/]+$/.test(pathname)) {
    return {
      section: 'Catalog',
      title: 'Product Details',
    }
  }

  if (pathname === '/admin/dashboard/storefront-designer' || pathname === '/admin/dashboard/storefront-designer/') {
    return {
      section: 'Storefront',
      title: 'Storefront Designer',
    }
  }

  if (pathname === '/admin/dashboard/storefront-designer/new') {
    return {
      section: 'Storefront',
      title: 'New Storefront Template',
    }
  }

  if (/^\/admin\/dashboard\/storefront-designer\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'Storefront',
      title: 'Edit Storefront Template',
    }
  }

  if (/^\/admin\/dashboard\/storefront-designer\/[^/]+$/.test(pathname)) {
    return {
      section: 'Storefront',
      title: 'Storefront Template Details',
    }
  }

  if (pathname === '/admin/dashboard/slider-themes' || pathname === '/admin/dashboard/slider-themes/') {
    return {
      section: 'Storefront',
      title: 'Slider Themes',
    }
  }

  if (pathname === '/admin/dashboard/slider-themes/new') {
    return {
      section: 'Storefront',
      title: 'New Slider Theme',
    }
  }

  if (/^\/admin\/dashboard\/slider-themes\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'Storefront',
      title: 'Edit Slider Theme',
    }
  }

  if (/^\/admin\/dashboard\/slider-themes\/[^/]+$/.test(pathname)) {
    return {
      section: 'Storefront',
      title: 'Slider Theme Details',
    }
  }

  const match = pathname.match(/^\/admin\/dashboard\/common\/([^/]+)$/)
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
            <h1 className="truncate text-lg font-semibold text-foreground">{current.title}</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/orders">
            <Truck className="size-4" />
            Orders
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/customers">
            <CircleUserRound className="size-4" />
            Customers
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/contacts">
            <ContactRound className="size-4" />
            Contacts
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/products">
            <Package className="size-4" />
            Products
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/mailbox/messages">
            <Mail className="size-4" />
            Mailbox
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/media">
            <Image className="size-4" />
            Media
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard/companies">
            <Building2 className="size-4" />
            Companies
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dashboard">
            <LayoutDashboard className="size-4" />
            Overview
          </Link>
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



