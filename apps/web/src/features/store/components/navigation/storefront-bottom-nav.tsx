import { HeartIcon, HomeIcon, SearchIcon, ShoppingCartIcon, UserCircle2Icon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { getPortalHomeHref } from "@/features/auth/lib/portal-routing"
import { useAuth } from "@/features/auth/components/auth-provider"
import { useStorefront } from "@/features/store/context/storefront-context"
import { cn } from "@/lib/utils"

export function StorefrontBottomNav() {
  const location = useLocation()
  const auth = useAuth()
  const { wishlistProductIds, cartCount } = useStorefront()
  const items = [
    { label: "Home", url: "/", icon: HomeIcon },
    { label: "Search", url: "/search", icon: SearchIcon },
    { label: "Wishlist", url: "/wishlist", icon: HeartIcon },
    { label: "Cart", url: "/cart", icon: ShoppingCartIcon },
    { label: "Account", url: getPortalHomeHref(auth.session?.user), icon: UserCircle2Icon },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.url || location.pathname.startsWith(`${item.url}/`)
          const isWishlistItem = item.label === "Wishlist"
          const isCartItem = item.label === "Cart"
          const isAccountItem = item.label === "Account"
          const wishlistActive = isWishlistItem && wishlistProductIds.length > 0
          const cartActive = isCartItem && cartCount > 0
          const accountActive =
            isAccountItem &&
            (auth.isAuthenticated ||
              location.pathname === "/login" ||
              location.pathname === "/register" ||
              location.pathname.startsWith("/dashboard/") ||
              location.pathname === "/dashboard" ||
              location.pathname.startsWith("/admin/dashboard/") ||
              location.pathname === "/admin/dashboard" ||
              location.pathname.startsWith("/account/") ||
              location.pathname === "/account")

          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-all duration-300 ease-out",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : wishlistActive
                    ? "bg-primary/[0.08] text-primary"
                    : cartActive
                      ? "bg-primary/[0.08] text-primary"
                    : accountActive
                      ? "bg-primary/[0.08] text-primary"
                    : "text-muted-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-all duration-300 ease-out",
                  wishlistActive || cartActive || accountActive ? "fill-current text-current" : "",
                )}
                strokeWidth={isWishlistItem || isCartItem || isAccountItem ? 1.9 : undefined}
              />
              {isWishlistItem && wishlistProductIds.length > 0 ? (
                <Badge className="absolute top-1 right-3 min-w-5 justify-center rounded-full px-1 text-[10px]">
                  {wishlistProductIds.length}
                </Badge>
              ) : null}
              {item.label === "Cart" && cartCount > 0 ? (
                <Badge className="absolute top-1 right-3 min-w-5 justify-center rounded-full px-1 text-[10px]">
                  {cartCount}
                </Badge>
              ) : null}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
