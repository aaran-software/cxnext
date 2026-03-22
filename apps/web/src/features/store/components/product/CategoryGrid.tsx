import { Link } from "react-router-dom"

import type { StorefrontCategory } from "@/features/store/types/storefront"

export function CategoryGrid({ categories }: { categories: StorefrontCategory[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.slug}`}
          className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 shadow-[0_24px_65px_-42px_rgba(60,40,22,0.28)] transition hover:-translate-y-1"
        >
          <div className="aspect-[4/3] overflow-hidden">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-card text-lg font-semibold text-foreground/70">
                {category.name}
              </div>
            )}
          </div>
          <div className="space-y-3 p-5">
            <div className="text-xl font-semibold tracking-tight">{category.name}</div>
            {category.description ? (
              <div className="text-sm leading-6 text-muted-foreground">{category.description}</div>
            ) : null}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{category.productCount} curated styles</span>
              <span className="text-muted-foreground">Explore</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
