import type { CommonModuleKey } from '@shared/index'
import { Link, useLocation } from 'react-router-dom'
import { Building2, ChevronRight, ContactRound, Home, Image, LayoutDashboard, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/components/auth-provider'
import { getCommonModuleMenuItem } from '@/features/common-modules/config/common-module-navigation'
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
      title: 'Common workspace',
    }
  }

  if (pathname === '/dashboard/companies' || pathname === '/dashboard/companies/') {
    return {
      section: 'Organization',
      title: 'Companies',
    }
  }

  if (pathname === '/dashboard/companies/new') {
    return {
      section: 'Organization',
      title: 'New Company',
    }
  }

  if (/^\/dashboard\/companies\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'Organization',
      title: 'Edit Company',
    }
  }

  if (pathname === '/dashboard/contacts' || pathname === '/dashboard/contacts/') {
    return {
      section: 'CRM',
      title: 'Contacts',
    }
  }

  if (pathname === '/dashboard/contacts/new') {
    return {
      section: 'CRM',
      title: 'New Contact',
    }
  }

  if (/^\/dashboard\/contacts\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'CRM',
      title: 'Edit Contact',
    }
  }

  if (pathname === '/dashboard/products' || pathname === '/dashboard/products/') {
    return {
      section: 'Catalog',
      title: 'Products',
    }
  }

  if (pathname === '/dashboard/media' || pathname === '/dashboard/media/') {
    return {
      section: 'Catalog',
      title: 'Media Manager',
    }
  }

  if (pathname === '/dashboard/media/new') {
    return {
      section: 'Catalog',
      title: 'New Media Asset',
    }
  }

  if (/^\/dashboard\/media\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'Catalog',
      title: 'Edit Media Asset',
    }
  }

  if (pathname === '/dashboard/products/new') {
    return {
      section: 'Catalog',
      title: 'New Product',
    }
  }

  if (/^\/dashboard\/products\/[^/]+\/edit$/.test(pathname)) {
    return {
      section: 'Catalog',
      title: 'Edit Product',
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
    <header className="flex min-h-12 shrink-0 items-center justify-between gap-4 border-b border-border/60 px-4 py-1.5">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="hidden h-5 md:block" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" asChild className="shrink-0">
              <Link to="/dashboard" aria-label="Go to dashboard">
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
          <Link to="/dashboard/contacts">
            <ContactRound className="size-4" />
            Contacts
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/products">
            <Package className="size-4" />
            Products
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/media">
            <Image className="size-4" />
            Media
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/companies">
            <Building2 className="size-4" />
            Companies
          </Link>
        </Button>
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
