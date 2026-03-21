import { Link } from "react-router-dom"

import { BrandMark } from "@/shared/branding/brand-mark"

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
]

export function PortfolioFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <BrandMark />
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            CXNext ships product surfaces across ERP billing, portfolio websites, and online storefronts from a shared frontend foundation.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Navigation</h3>
            <div className="grid gap-3 text-sm">
              {quickLinks.map((link) => (
                <Link key={link.href} to={link.href} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contact</h3>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <p>ops@cxnext.local</p>
              <p>Chennai, India</p>
              <p>Design systems, frontend architecture, and rollout support.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

