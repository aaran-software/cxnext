import { FilterIcon, RotateCcwIcon, SparklesIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CatalogFilters, StorefrontCategory } from "@/features/store/types/storefront"

type FilterOptions = {
  sizes: string[]
  colors: string[]
  fabrics: string[]
  fits: string[]
  sleeves: string[]
  occasions: string[]
}

type ToggleOption = {
  value: string
  label: string
}

function FilterSection({
  title,
  subtitle,
  count,
  children,
}: {
  title: string
  subtitle?: string
  count?: number
  children: ReactNode
}) {
  return (
    <section className="rounded-[1.35rem] border border-border/70 bg-white/84 p-4 shadow-[0_18px_40px_-34px_rgba(45,29,19,0.24)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-[0.8rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {title}
          </h3>
          {subtitle ? <p className="text-xs leading-5 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {count && count > 0 ? (
          <Badge variant="outline" className="shrink-0 px-2.5 py-1 normal-case tracking-normal">
            {count}
          </Badge>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function ToggleGroup({
  title,
  subtitle,
  options,
  selected,
  onToggle,
}: {
  title: string
  subtitle?: string
  options: ToggleOption[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  if (options.length === 0) return null

  const shouldScroll = options.length > 8

  return (
    <FilterSection title={title} subtitle={subtitle} count={selected.length}>
      <div className={shouldScroll ? "max-h-40 overflow-y-auto pr-1" : undefined}>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isActive = selected.includes(option.value)

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onToggle(option.value)}
                className={isActive
                  ? "rounded-full border border-foreground bg-foreground px-3 py-1.5 text-sm text-white shadow-sm"
                  : "rounded-full border border-border bg-white px-3 py-1.5 text-sm text-foreground transition hover:border-foreground/30 hover:bg-accent/50"}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </FilterSection>
  )
}

function countActiveFilters(filters: CatalogFilters) {
  return [
    filters.department !== "all",
    filters.categories.length,
    filters.sizes.length,
    filters.colors.length,
    filters.fabrics.length,
    filters.fits.length,
    filters.sleeves.length,
    filters.occasions.length,
    filters.rating > 0,
    filters.availabilityOnly,
    filters.minPrice > 0,
    filters.maxPrice < 10000,
  ].reduce((total, value) => total + (typeof value === "number" ? Number(value > 0) : Number(Boolean(value))), 0)
}

export function FilterSidebar({
  filters,
  categories,
  options,
  onChange,
  onReset,
}: {
  filters: CatalogFilters
  categories: StorefrontCategory[]
  options: FilterOptions
  onChange: (next: CatalogFilters) => void
  onReset: () => void
}) {
  const toggleValue = (key: keyof CatalogFilters, value: string) => {
    const current = filters[key]
    if (!Array.isArray(current)) return

    onChange({
      ...filters,
      [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    })
  }

  const activeCount = countActiveFilters(filters)
  const departmentOptions: ToggleOption[] = [
    { value: "all", label: "All" },
    { value: "women", label: "Women" },
    { value: "men", label: "Men" },
    { value: "kids", label: "Kids" },
    { value: "accessories", label: "Accessories" },
  ]

  return (
    <aside className="space-y-4 self-start xl:sticky xl:top-24">
      <section className="rounded-[1.8rem] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(249,246,241,0.94)_100%)] p-5 shadow-[0_24px_50px_-38px_rgba(45,29,19,0.22)]">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <FilterIcon className="size-3.5" />
              Filters
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">Refine the catalog</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Clean garment filters with grouped sections, better hierarchy, and controlled scrolling.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onReset}>
            <RotateCcwIcon className="size-4" />
            Reset
          </Button>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-border/70 bg-white/78 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SparklesIcon className="size-4 text-muted-foreground" />
              Active filters
            </div>
            <Badge variant={activeCount > 0 ? "default" : "outline"} className="px-2.5 py-1 normal-case tracking-normal">
              {activeCount}
            </Badge>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {activeCount > 0
              ? "The product grid updates instantly as you adjust sections below."
              : "Start with department or category, then narrow with garment-specific attributes."}
          </p>
        </div>
      </section>

      <div className="space-y-3">
        <FilterSection
          title="Department"
          subtitle="Use one master segment before narrowing into specific product attributes."
          count={filters.department === "all" ? 0 : 1}
        >
          <div className="flex flex-wrap gap-2">
            {departmentOptions.map((department) => {
              const active = filters.department === department.value

              return (
                <button
                  key={department.value}
                  type="button"
                  onClick={() => onChange({ ...filters, department: department.value as CatalogFilters["department"] })}
                  className={active
                    ? "rounded-full border border-foreground bg-foreground px-3 py-1.5 text-sm text-white shadow-sm"
                    : "rounded-full border border-border bg-white px-3 py-1.5 text-sm text-foreground transition hover:border-foreground/30 hover:bg-accent/50"}
                >
                  {department.label}
                </button>
              )
            })}
          </div>
        </FilterSection>

        <ToggleGroup
          title="Categories"
          subtitle="Catalog groupings from backend category records."
          options={categories.map((category) => ({ value: category.slug, label: category.name }))}
          selected={filters.categories}
          onToggle={(value) => toggleValue("categories", value)}
        />

        <ToggleGroup
          title="Sizes"
          subtitle="Variant sizes resolved from live product attribute rows."
          options={options.sizes.map((value) => ({ value, label: value }))}
          selected={filters.sizes}
          onToggle={(value) => toggleValue("sizes", value)}
        />

        <ToggleGroup
          title="Colors"
          subtitle="Color values available in the current catalog view."
          options={options.colors.map((value) => ({ value, label: value }))}
          selected={filters.colors}
          onToggle={(value) => toggleValue("colors", value)}
        />

        <ToggleGroup
          title="Fabrics"
          subtitle="Material-level filtering for quicker browsing."
          options={options.fabrics.map((value) => ({ value, label: value }))}
          selected={filters.fabrics}
          onToggle={(value) => toggleValue("fabrics", value)}
        />

        <ToggleGroup
          title="Fits"
          subtitle="Silhouette and fit labels managed from product publishing."
          options={options.fits.map((value) => ({ value, label: value }))}
          selected={filters.fits}
          onToggle={(value) => toggleValue("fits", value)}
        />

        <ToggleGroup
          title="Sleeves"
          subtitle="Sleeve styling options from storefront attributes."
          options={options.sleeves.map((value) => ({ value, label: value }))}
          selected={filters.sleeves}
          onToggle={(value) => toggleValue("sleeves", value)}
        />

        <ToggleGroup
          title="Occasions"
          subtitle="Use-case tags for festive, workwear, travel, and more."
          options={options.occasions.map((value) => ({ value, label: value }))}
          selected={filters.occasions}
          onToggle={(value) => toggleValue("occasions", value)}
        />

        <FilterSection title="Price range" subtitle="Set the minimum and maximum visible product price.">
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-sm">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Min</span>
              <Input
                type="number"
                value={filters.minPrice}
                onChange={(event) => onChange({ ...filters, minPrice: Number(event.target.value || 0) })}
                className="h-10 rounded-xl bg-white"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Max</span>
              <Input
                type="number"
                value={filters.maxPrice}
                onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value || 0) })}
                className="h-10 rounded-xl bg-white"
              />
            </label>
          </div>
        </FilterSection>

        <FilterSection title="Rating" subtitle="Prefer products with stronger review scores.">
          <div className="flex flex-wrap gap-2">
            {[0, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => onChange({ ...filters, rating })}
                className={filters.rating === rating
                  ? "rounded-full border border-foreground bg-foreground px-3 py-1.5 text-sm text-white shadow-sm"
                  : "rounded-full border border-border bg-white px-3 py-1.5 text-sm text-foreground transition hover:border-foreground/30 hover:bg-accent/50"}
              >
                {rating === 0 ? "All ratings" : `${rating}+ stars`}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Availability" subtitle="Keep only products that can be added to cart immediately.">
          <label className="flex items-center gap-3 rounded-[1rem] border border-border/70 bg-white px-4 py-3 text-sm transition hover:border-foreground/20">
            <input
              type="checkbox"
              checked={filters.availabilityOnly}
              onChange={(event) => onChange({ ...filters, availabilityOnly: event.target.checked })}
            />
            <span className="font-medium">Show only in-stock styles</span>
          </label>
        </FilterSection>
      </div>
    </aside>
  )
}
