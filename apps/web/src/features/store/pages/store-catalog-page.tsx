import { useEffect, useMemo, useState } from "react"
import { Grid2X2Icon, SlidersHorizontalIcon } from "lucide-react"
import { useParams, useSearchParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FilterSidebar } from "@/features/store/components/product/FilterSidebar"
import { ProductGrid } from "@/features/store/components/product/ProductGrid"
import { SortDropdown } from "@/features/store/components/product/SortDropdown"
import { useStorefront } from "@/features/store/context/storefront-context"
import {
  buildDefaultFilters,
  filterProducts,
  getCategoryBySlug,
  getFilterOptions,
  sortProducts,
} from "@/features/store/lib/storefront-utils"
import type { StorefrontDepartment, StorefrontSortOption } from "@/features/store/types/storefront"

export function StoreCatalogPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const { categories, products, isLoading, errorMessage } = useStorefront()
  const [sort, setSort] = useState<StorefrontSortOption>("featured")
  const [filters, setFilters] = useState(() => buildDefaultFilters(slug))
  const query = searchParams.get("q") ?? ""
  const routeCategory = getCategoryBySlug(categories, slug)

  useEffect(() => {
    const nextFilters = buildDefaultFilters(slug)
    const department = searchParams.get("department")
    const occasion = searchParams.get("occasion")

    if (
      department === "women" ||
      department === "men" ||
      department === "kids" ||
      department === "accessories"
    ) {
      nextFilters.department = department as StorefrontDepartment
    }

    if (occasion) {
      nextFilters.occasions = [occasion]
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(nextFilters)
  }, [searchParams, slug])

  const filteredProducts = useMemo(
    () => sortProducts(filterProducts(products, filters, query), sort),
    [filters, products, query, sort],
  )
  const filterOptions = useMemo(() => getFilterOptions(products), [products])

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading catalog...</div>
  }

  if (errorMessage) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-destructive sm:px-6">{errorMessage}</div>
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2.2rem] border border-white/70 bg-white/78 p-6 shadow-[0_24px_60px_-44px_rgba(40,28,18,0.25)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit">
              Catalog
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {routeCategory ? routeCategory.name : query ? `Results for "${query}"` : "All styles"}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Category browsing, filter values, pricing, and product cards are now sourced from the backend storefront catalog.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground">
              {filteredProducts.length} styles
            </div>
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <FilterSidebar
          filters={filters}
          categories={categories}
          options={filterOptions}
          onChange={setFilters}
          onReset={() => setFilters(buildDefaultFilters(slug))}
        />

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.8rem] border border-white/70 bg-white/76 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Grid2X2Icon className="size-4" />
              <span>Live catalog view with backend-driven browsing controls</span>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full">
              <SlidersHorizontalIcon className="size-4" />
              Filtered catalog view
            </Button>
          </div>
          <ProductGrid
            products={filteredProducts}
            emptyMessage="No styles match the current filters. Adjust the garment filters to broaden the selection."
          />
        </section>
      </div>
    </div>
  )
}
