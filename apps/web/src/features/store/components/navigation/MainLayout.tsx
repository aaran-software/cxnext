import { Outlet } from "react-router-dom"

import { StorefrontBottomNav } from "./storefront-bottom-nav"
import { storefrontCategories, StorefrontCategories } from "./storefront-categories"
import { StorefrontFooter } from "./storefront-footer"
import { StorefrontHeader } from "./storefront-header"

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6efe6,transparent_30%),linear-gradient(180deg,#fcfbf8_0%,#f5efe7_100%)] text-foreground">
      <StorefrontHeader
        categories={storefrontCategories.map((category) => ({
          label: category.name,
          slug: category.slug,
        }))}
      />
      <StorefrontCategories />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <StorefrontFooter />
      <StorefrontBottomNav />
    </div>
  )
}
