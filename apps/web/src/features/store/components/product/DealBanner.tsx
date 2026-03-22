import { useEffect, useState } from 'react'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button, buttonVariants } from '@/components/ui/button'
import { useStorefront } from '@/features/store/context/storefront-context'
import { cn } from '@/lib/utils'

const backgroundGradients = [
  'linear-gradient(135deg, #f8efe7 0%, #f4d9be 100%)',
  'linear-gradient(135deg, #e8e1f2 0%, #cdbce7 100%)',
  'linear-gradient(135deg, #e3eee6 0%, #c0ddcb 100%)',
]

export function DealBanner() {
  const { products } = useStorefront()
  const promoProducts = products
    .filter((product) => product.promoSlider)
    .sort((left, right) => left.promoSliderOrder - right.promoSliderOrder || right.rating - left.rating)
    .slice(0, 3)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (promoProducts.length <= 1) {
      return
    }

    const autoPlayInterval = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % promoProducts.length)
    }, 5000)

    return () => window.clearInterval(autoPlayInterval)
  }, [promoProducts.length])

  if (promoProducts.length === 0) {
    return null
  }

  const activeSlide = promoProducts[selectedIndex] ?? promoProducts[0]

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 shadow-[0_22px_60px_-38px_rgba(86,52,18,0.25)] transition-all duration-700 ease-in-out">
      <div
        className="flex flex-col gap-6 p-6 sm:p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: backgroundGradients[selectedIndex % backgroundGradients.length] }}
      >
        <div className="space-y-3 lg:max-w-[70%]">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black/80 backdrop-blur-sm sm:text-xs">
            <SparklesIcon className="size-3.5 sm:size-4" />
            {activeSlide.catalogBadge ?? activeSlide.categoryName}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl md:text-4xl">
            {activeSlide.name}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-black/70 sm:text-base">
            {activeSlide.shortDescription ?? activeSlide.description ?? 'Promotional storefront feature.'}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 lg:flex-col lg:items-end">
          <Link
            to={`/product/${activeSlide.slug}`}
            className={buttonVariants({
              className:
                'group h-11 rounded-full bg-black px-6 text-sm font-semibold text-white shadow-md hover:bg-black/80 sm:h-12 sm:px-8 sm:text-base',
            })}
          >
            View product
            <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setSelectedIndex((current) => (current - 1 + promoProducts.length) % promoProducts.length)
              }
              className="size-10 rounded-full border-black/10 bg-white/40 text-black backdrop-blur-md hover:bg-white/60 hover:text-black"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedIndex((current) => (current + 1) % promoProducts.length)}
              className="size-10 rounded-full border-black/10 bg-white/40 text-black backdrop-blur-md hover:bg-white/60 hover:text-black"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 lg:hidden">
        {promoProducts.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === selectedIndex ? 'w-4 bg-black/60' : 'w-1.5 bg-black/20',
            )}
          />
        ))}
      </div>
    </section>
  )
}
