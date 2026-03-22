import {
  BellIcon,
  ChevronDownIcon,
  CreditCardIcon,
  DownloadIcon,
  GiftIcon,
  HeadphonesIcon,
  HeartIcon,
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  PackageIcon,
  ShoppingCartIcon,
  StoreIcon,
  TrendingUpIcon,
  UserCircle2Icon,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { useAuth } from "@/features/auth/components/auth-provider"
import { BrandMark } from "@/shared/branding/brand-mark"
import { StorefrontMobileMenu } from "@/features/store/components/navigation/storefront-mobile-menu"
import { StorefrontSearchBar } from "@/features/store/components/navigation/storefront-search-bar"
import { ThemeSwitcher } from "@/shared/theme/theme-switcher"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { useStorefront } from "@/features/store/context/storefront-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type HeaderCategory = {
  label: string
  slug: string
}

export function StorefrontHeader({ categories }: { categories: HeaderCategory[] }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const { wishlistProductIds, cartCount } = useStorefront()
  const wishlistCount = wishlistProductIds.length
  const cartItemsCount = cartCount

  const handleLogout = () => {
    auth.logout()
    void navigate("/", { replace: true })
  }

  const dashboardHref = auth.isAuthenticated ? "/dashboard" : "/login"

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-6">
        <StorefrontMobileMenu links={[]} categories={categories.slice(0, 6)} wishlistCount={wishlistCount} cartCount={cartItemsCount} />
        <Link to="/" className="shrink-0">
          <BrandMark compact />
        </Link>

        <div className="hidden flex-1 lg:block">
          <StorefrontSearchBar />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/wishlist" className={buttonVariants({ variant: "ghost", size: "icon", className: "relative rounded-full" })}>
            <HeartIcon className="size-5" />
            {wishlistCount > 0 ? <Badge className="absolute -top-1 -right-1 min-w-5 justify-center rounded-full px-1 text-[10px]">{wishlistCount}</Badge> : null}
          </Link>
          <Link to="/cart" className={buttonVariants({ variant: "ghost", size: "icon", className: "relative rounded-full" })}>
            <ShoppingCartIcon className="size-5" />
            {cartItemsCount > 0 ? <Badge className="absolute -top-1 -right-1 min-w-5 justify-center rounded-full px-1 text-[10px]">{cartItemsCount}</Badge> : null}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="group cursor-pointer rounded-full px-3 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground md:px-4">
                <UserCircle2Icon className="size-5 md:mr-2" />
                <span className="hidden md:inline-block">{auth.isAuthenticated ? "Account" : "Login"}</span>
                <ChevronDownIcon className="hidden size-4 transition-transform group-data-open:-rotate-180 group-data-[state=open]:-rotate-180 md:ml-1 md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              {!auth.isAuthenticated ? (
                <>
                  <div className="mb-2 flex items-center justify-between px-2 py-2">
                    <span className="text-sm font-medium text-muted-foreground">New customer?</span>
                    <Link to="/register" className="text-sm font-bold text-primary hover:underline">
                      Sign Up
                    </Link>
                  </div>
                  <DropdownMenuSeparator className="mb-2" />
                  <DropdownMenuItem asChild className="cursor-pointer font-medium">
                    <Link to="/login">
                      <LogInIcon className="mr-3 size-4 text-muted-foreground" />
                      <span>Sign In</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                </>
              ) : (
                <>
                  <div className="mb-2 flex flex-col px-2 py-2">
                    <span className="text-sm font-semibold">{auth.session?.user.displayName ?? "Customer"}</span>
                    <span className="text-xs text-muted-foreground">{auth.session?.user.email}</span>
                  </div>
                  <DropdownMenuSeparator className="mb-2" />
                </>
              )}

              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to={dashboardHref}>
                  <UserCircle2Icon className="mr-3 size-4 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to={auth.isAuthenticated ? "/account/orders" : "/login"}>
                  <PackageIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>Orders</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/wishlist">
                  <HeartIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 ? <Badge className="ml-auto min-w-5 justify-center rounded-full px-1 text-[10px]">{wishlistCount}</Badge> : null}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/cart">
                  <ShoppingCartIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>Cart</span>
                  {cartItemsCount > 0 ? <Badge className="ml-auto min-w-5 justify-center rounded-full px-1 text-[10px]">{cartItemsCount}</Badge> : null}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/">
                  <GiftIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>Rewards</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/download">
                  <CreditCardIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>Gift Cards</span>
                </Link>
              </DropdownMenuItem>

              {auth.isAuthenticated ? (
                <>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard">
                      <LayoutDashboardIcon className="mr-3 size-4 text-muted-foreground" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
                    <LogOutIcon className="mr-3 size-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="group cursor-pointer rounded-full px-3 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground md:px-4">
                <span className="hidden text-sm font-medium md:inline-block">More</span>
                <ChevronDownIcon className="hidden size-4 transition-transform group-data-open:-rotate-180 group-data-[state=open]:-rotate-180 md:ml-1 md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2">
              <div className="mb-2 px-2 py-2">
                <span className="text-sm font-semibold">Explore More Options</span>
              </div>
              <DropdownMenuSeparator className="mb-2" />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/vendor">
                  <StoreIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>Become a Seller</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to={auth.isAuthenticated ? "/account/notifications" : "/login"}>
                  <BellIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>Notification Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/support">
                  <HeadphonesIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>24x7 Customer Care</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/advertise">
                  <TrendingUpIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>Advertise</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/download">
                  <DownloadIcon className="mr-3 size-4 text-muted-foreground" />
                  <span>Download App</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-3 lg:hidden">
        <StorefrontSearchBar />
      </div>
    </header>
  )
}

