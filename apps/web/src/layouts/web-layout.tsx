import { ArrowRight } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { publicNavigation } from '@/lib/site'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/branding/brand-mark'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'
import { Button } from '@/components/ui/button'

export function WebLayout() {
  return (
    <div className="page-frame min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col">
        <header className="mb-6 rounded-[2rem] border border-border/70 bg-card/75 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link to="/" className="w-fit">
              <BrandMark />
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <nav className="flex flex-wrap items-center gap-2 rounded-full border border-border/70 bg-background/80 p-1">
                {publicNavigation.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'rounded-full px-4 py-2 text-sm transition',
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <ThemeSwitcher />
              <Button asChild className="shadow-lg shadow-accent/20">
                <Link to="/login">
                  Operator login
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="mt-8 flex flex-col gap-2 border-t border-border/70 px-1 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>CXNext web foundation for marketing, auth, and operator workflows.</p>
          <p>React, Vite, Tailwind, reusable primitives, and theme tokens.</p>
        </footer>
      </div>
    </div>
  )
}
