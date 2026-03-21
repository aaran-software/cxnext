import { ChevronDownIcon, LogInIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { useAuth } from "@/features/auth/components/auth-provider"
import { BrandMark } from "@/shared/branding/brand-mark"
import { frontendLabels, frontendTarget } from "@/config/frontend"
import { Navbar } from "@/features/marketing/components/navigation/navbar"
import { PortfolioMobileMenu } from "@/features/marketing/components/navigation/portfolio-mobile-menu"
import { ThemeSwitcher } from "@/shared/theme/theme-switcher"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { title: "Home", url: "/" },
  { title: "About", url: "/about" },
  { title: "Services", url: "/services" },
  { title: "Contact", url: "/contact" },
]

export function PortfolioHeader() {
  const auth = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-6">
        <PortfolioMobileMenu links={navItems} />
        <Link to="/" className="shrink-0">
          <BrandMark compact />
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <Navbar items={navItems} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to={auth.isAuthenticated ? "/dashboard" : "/login"}
            className={buttonVariants({ className: "rounded-full px-4" })}
          >
            <LogInIcon className="size-4" />
            {auth.isAuthenticated ? "Dashboard" : "Login"}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="group hidden rounded-full px-3 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground sm:inline-flex">
                <span className="text-sm font-medium">{frontendLabels[frontendTarget]}</span>
                <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:-rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <div className="px-2 py-2 text-sm font-semibold">Frontend Target</div>
              <DropdownMenuSeparator className="mb-2" />
              <DropdownMenuItem className="cursor-default">App: ERP Billing</DropdownMenuItem>
              <DropdownMenuItem className="cursor-default">Web: Portfolio Sites</DropdownMenuItem>
              <DropdownMenuItem className="cursor-default">Shop: Online Store</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}

