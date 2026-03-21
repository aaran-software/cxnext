import { HeartIcon, HomeIcon, SearchIcon, ShoppingCartIcon, UserCircle2Icon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { cn } from "@/lib/utils"

const items = [
  { label: "Home", url: "/", icon: HomeIcon },
  { label: "Search", url: "/search", icon: SearchIcon },
  { label: "Wishlist", url: "/wishlist", icon: HeartIcon },
  { label: "Cart", url: "/cart", icon: ShoppingCartIcon },
  { label: "Account", url: "/login", icon: UserCircle2Icon },
]

export function StorefrontBottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.url || location.pathname.startsWith(`${item.url}/`)

          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
