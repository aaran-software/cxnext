import { useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon, StarIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button, buttonVariants } from "@/components/ui/button"
import { useStorefront } from "@/features/store/context/storefront-context"
import { formatCurrency, getPrimaryProductImage } from "@/features/store/lib/storefront-utils"
import { cn } from "@/lib/utils"

const gradients = [
  "bg-[linear-gradient(135deg,#21140f_0%,#5e241b_48%,#c5873a_100%)]",
  "bg-[linear-gradient(135deg,#282235_0%,#5f4ca7_52%,#d1b7ea_100%)]",
  "bg-[linear-gradient(135deg,#18352c_0%,#1d6a5b_50%,#a7d9cb_100%)]",
]

export function HeroSlider() {
  const { products, addToCart } = useStorefront()
  const featuredProducts = products
    .filter((product) => product.homeSlider)
    .sort((left, right) => left.homeSliderOrder - right.homeSliderOrder || right.rating - left.rating)
    .slice(0, 3)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (featuredProducts.length <= 1) return
    const timer = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % featuredProducts.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [featuredProducts.length])

  if (featuredProducts.length === 0) return null

  const activeProduct = featuredProducts[selectedIndex] ?? featuredProducts[0]
  const activeGradient = gradients[selectedIndex % gradients.length]

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border border-border/60 text-white shadow-[0_35px_90px_-42px_rgba(49,20,9,0.72)] transition-colors duration-700 ease-in-out",
        activeGradient,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="flex flex-col-reverse items-center justify-between gap-6 px-6 py-6 sm:px-10 sm:py-8 md:flex-row md:gap-10">
          <div className="flex w-full flex-1 flex-col justify-center space-y-5 md:w-1/2">
            <div className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              {activeProduct.catalogBadge ?? activeProduct.categoryName}
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.05]">
              {activeProduct.name}
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              {activeProduct.description ?? activeProduct.shortDescription ?? 'Featured storefront highlight.'}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-1">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white/60">Special Price</span>
                <span className="text-2xl font-bold text-white sm:text-3xl">
                  {formatCurrency(activeProduct.price)}
                </span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white/60">Rating & Reviews</span>
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <StarIcon className="size-4 fill-current sm:size-5" />
                  <span className="text-base font-bold text-white sm:text-lg">
                    {activeProduct.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                className="h-10 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90 sm:h-11 sm:px-8 sm:text-base"
                onClick={() => addToCart(activeProduct.id, 1)}
              >
                <ShoppingBagIcon className="mr-2 size-4 sm:size-5" />
                Add to cart
              </Button>
              <Link
                to={`/product/${activeProduct.slug}`}
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "h-10 rounded-full border-white/20 bg-transparent px-6 text-sm font-medium text-white hover:bg-white/10 sm:h-11 sm:px-8 sm:text-base",
                })}
              >
                View details
              </Link>
            </div>
          </div>

          <div className="relative flex w-full flex-1 items-center justify-center md:w-1/2">
            <div className="relative aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md lg:aspect-square lg:max-w-[420px]">
              <img
                src={getPrimaryProductImage(activeProduct)}
                alt={activeProduct.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 flex items-center gap-3 sm:bottom-10 sm:right-10 md:bottom-12 md:right-12">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSelectedIndex(
                (current) => (current - 1 + featuredProducts.length) % featuredProducts.length,
              )
            }
            className="size-10 rounded-full border-white/20 bg-black/20 text-white backdrop-blur-md hover:bg-black/40 hover:text-white"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>
          <div className="flex items-center gap-1.5 px-2">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === selectedIndex ? "w-6 bg-white" : "w-1.5 bg-white/30",
                )}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedIndex((current) => (current + 1) % featuredProducts.length)}
            className="size-10 rounded-full border-white/20 bg-black/20 text-white backdrop-blur-md hover:bg-black/40 hover:text-white"
          >
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
