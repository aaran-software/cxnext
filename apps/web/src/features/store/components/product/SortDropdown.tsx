import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StorefrontSortOption } from "@/features/store/types/storefront"

const options: { label: string; value: StorefrontSortOption }[] = [
  { label: "Featured", value: "featured" },
  { label: "Latest", value: "latest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating-desc" },
  { label: "Name", value: "name-asc" },
]

export function SortDropdown({
  value,
  onChange,
}: {
  value: StorefrontSortOption
  onChange: (value: StorefrontSortOption) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as StorefrontSortOption)}>
      <SelectTrigger className="w-full rounded-full bg-card md:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
