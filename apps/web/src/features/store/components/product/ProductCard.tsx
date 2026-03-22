import { HeartIcon, ShoppingCartIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStorefront } from "@/features/store/context/storefront-context"
import { formatCurrency, getPrimaryProductImage } from "@/features/store/lib/storefront-utils"
import type { StorefrontProduct } from "@/features/store/types/storefront"
import { RatingStars } from "./RatingStars"

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStorefront()
  const imageUrl = getPrimaryProductImage(product)
  const wished = isInWishlist(product.id)
  const isOutOfStock = product.inventory <= 0

  return (
    <Card className="overflow-hidden rounded-[1.8rem] border-white/70 bg-white/86 shadow-[0_24px_60px_-34px_rgba(40,28,18,0.28)] transition hover:-translate-y-1">
      <Link to={`/product/${product.slug}`} className="block aspect-[4/4.8] overflow-hidden bg-[linear-gradient(135deg,#efe6db,#f9f5ef)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-foreground/60">
            {product.name}
          </div>
        )}
      </Link>
      <CardContent className="space-y-3 p-5">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            {product.catalogBadge ?? product.categoryName}
          </div>
          <Link to={`/product/${product.slug}`} className="line-clamp-2 text-lg font-semibold text-foreground">
            {product.name}
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">{product.brand}</div>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">{formatCurrency(product.price)}</div>
            {product.compareAtPrice ? (
              <div className="text-xs text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</div>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">
            {product.inventory > 0 ? `${product.inventory} in stock` : "Out of stock"}
          </div>
        </div>
      </CardContent>
      <div className="grid grid-cols-[1fr_auto] gap-3 p-5 pt-0">
        <Button className="rounded-full" disabled={isOutOfStock} onClick={() => addToCart(product.id, 1)}>
          <ShoppingCartIcon className="size-4" />
          {isOutOfStock ? "Out of stock" : "Add to Cart"}
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => toggleWishlist(product.id)}>
          <HeartIcon className={wished ? "size-4 fill-current" : "size-4"} />
        </Button>
      </div>
    </Card>
  )
}
