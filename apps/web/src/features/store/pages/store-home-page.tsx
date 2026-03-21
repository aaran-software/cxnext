import { ArrowRight, ShieldCheck, ShoppingBag, Truck } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const highlights = [
  {
    icon: ShoppingBag,
    title: "Catalog-first storefront",
    copy: "Product discovery, categories, and account actions stay visible from the shared store shell.",
  },
  {
    icon: Truck,
    title: "Checkout-ready structure",
    copy: "Cart, wishlist, and order routes stay active while commerce workflows are filled in incrementally.",
  },
  {
    icon: ShieldCheck,
    title: "Auth handoff",
    copy: "Store visitors can enter the same login flow without leaving the public shopping surface.",
  },
]

export function StoreHomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <section className="grid gap-6 rounded-[2rem] border border-border/60 bg-card px-6 py-8 shadow-[0_24px_60px_-40px_rgba(40,28,18,0.18)] lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-5">
          <Badge>Online Store</Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            A storefront shell that can grow into full catalog, cart, and order flows.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            This mode keeps the copied store navigation active while separating it cleanly from the portfolio and ERP entry experiences.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/search">
                Start shopping
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
        <Card className="border-border/60 bg-muted/25 shadow-none">
          <CardHeader>
            <CardTitle>Store target</CardTitle>
            <CardDescription>
              When `VITE_FRONTEND_TARGET=shop`, the app boots into the storefront shell and keeps commerce navigation visible.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/15">
                <item.icon className="size-5 text-accent" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.copy}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}
