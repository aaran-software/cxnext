import { Outlet } from "react-router-dom"

import { StorefrontBottomNav } from "./storefront-bottom-nav"
import { StorefrontCategories } from "./storefront-categories"
import { StorefrontFooter } from "./storefront-footer"
import { StorefrontHeader } from "./storefront-header"
import { useStorefront } from "@/features/store/context/storefront-context"

export default function MainLayout() {
  const { categories } = useStorefront()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6efe6,transparent_30%),linear-gradient(180deg,#fcfbf8_0%,#f5efe7_100%)] text-foreground">
      <StorefrontHeader
        categories={categories.map((category) => ({
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
