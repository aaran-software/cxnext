import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export const storefrontCategories = [
  {
    name: "All Products",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop&q=80",
    href: "/",
    slug: "all-products",
  },
  {
    name: "Ethnic Wear",
    image: "https://images.unsplash.com/photo-1583391733958-d25e07fac0ce?w=200&h=200&fit=crop&q=80",
    href: "/category/ethnic-wear",
    slug: "ethnic-wear",
  },
  {
    name: "Western Dresses",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop&q=80",
    href: "/category/western-dresses",
    slug: "western-dresses",
  },
  {
    name: "Menswear",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=200&h=200&fit=crop&q=80",
    href: "/category/menswear",
    slug: "menswear",
  },
  {
    name: "Footwear",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200&h=200&fit=crop&q=80",
    href: "/category/footwear",
    slug: "footwear",
  },
  {
    name: "Home Decor",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&h=200&fit=crop&q=80",
    href: "/category/home-decor",
    slug: "home-decor",
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=200&h=200&fit=crop&q=80",
    href: "/category/beauty",
    slug: "beauty",
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=200&h=200&fit=crop&q=80",
    href: "/category/accessories",
    slug: "accessories",
  },
  {
    name: "Grocery",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&q=80",
    href: "/category/grocery",
    slug: "grocery",
  },
]

export function StorefrontCategories({ className }: { className?: string }) {
  return (
    <div className={cn("w-full border-b border-border/40 bg-background/50 pb-4 pt-6 shadow-sm", className)}>
      <div
        className="mx-auto w-full max-w-7xl overflow-x-auto pb-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.18) transparent",
        }}
      >
        <div className="flex min-w-max items-center justify-start gap-4 px-4 sm:gap-6 md:justify-center md:gap-8 lg:gap-12">
          {storefrontCategories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="group flex w-16 flex-col items-center gap-2 transition-transform duration-300 hover:-translate-y-1 sm:w-20 md:w-24 lg:w-28"
            >
              <div className="relative flex aspect-square w-full shrink-0 flex-col items-center justify-end overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="aspect-square w-full rounded-md object-cover object-center mix-blend-multiply drop-shadow-md transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <span className="text-center text-[10px] font-medium leading-tight tracking-tight text-foreground/80 transition-all duration-300 group-hover:font-semibold group-hover:text-primary sm:text-xs lg:text-sm">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
