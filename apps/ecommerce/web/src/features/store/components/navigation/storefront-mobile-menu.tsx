import { MenuIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type MobileMenuLink = {
  title: string
  url: string
}

type MobileMenuCategory = {
  label: string
  slug: string
}

export function StorefrontMobileMenu({
  links,
  categories = [],
  wishlistCount = 0,
  cartCount = 0,
}: {
  links: MobileMenuLink[]
  categories?: MobileMenuCategory[]
  wishlistCount?: number
  cartCount?: number
}) {
  const quickLinks = [
    { title: "Wishlist", url: "/wishlist", count: wishlistCount },
    { title: "Cart", url: "/cart", count: cartCount },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full md:hidden">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px]">
        <SheetHeader>
          <SheetTitle>Browse Store</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 grid gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.url}
              to={link.url}
              className="flex items-center justify-between rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-accent"
            >
              <span>{link.title}</span>
              {link.count > 0 ? <Badge className="min-w-5 justify-center rounded-full px-1 text-[10px]">{link.count}</Badge> : null}
            </Link>
          ))}
          {links.map((link) => (
            <Link
              key={link.url}
              to={link.url}
              className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-accent"
            >
              {link.title}
            </Link>
          ))}
        </nav>
        {categories.length > 0 ? (
          <div className="mt-8">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Popular Categories</div>
            <div className="grid gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className="rounded-2xl bg-muted/40 px-4 py-3 text-sm text-foreground transition hover:bg-accent"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
