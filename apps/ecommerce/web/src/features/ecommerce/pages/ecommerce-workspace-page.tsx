import { ArrowUpRight, LayoutTemplate, ShoppingBag, Truck, Users } from 'lucide-react'
import { ecommerceWorkspaceItems } from '@ecommerce-domain/index'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

const ecommerceSignals = [
  {
    title: 'Storefront remains app-owned',
    summary: 'Catalog, shopping, checkout, and customer-facing flows stay inside Ecommerce.',
    icon: ShoppingBag,
  },
  {
    title: 'Commerce operations stay visible',
    summary: 'Order and support surfaces remain available inside the existing admin shell.',
    icon: Truck,
  },
  {
    title: 'Customer-facing flows stay connected',
    summary: 'Customer portal and storefront tooling stay grouped under the same app boundary.',
    icon: Users,
  },
]

export function EcommerceWorkspacePage() {
  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="flex flex-col gap-5 border-b border-border/60 p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge>Ecommerce</Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Storefront, orders, customers, and merchandising.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                This workspace re-groups the existing commerce-heavy build into a cleaner Ecommerce
                app boundary while preserving the current operator flows and UI language.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/">Open storefront</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/dashboard/orders">
                Review order operations
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-8 md:grid-cols-3">
          {ecommerceSignals.map((signal) => (
            <div key={signal.title} className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/15">
                <signal.icon className="size-5 text-accent" />
              </div>
              <p className="mt-4 font-semibold text-foreground">{signal.title}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{signal.summary}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ecommerce ownership map</CardTitle>
          <CardDescription>
            Existing commerce screens remain in place, but they now read as Ecommerce-owned
            surfaces.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ecommerceWorkspaceItems.map((item) => (
            <Link
              key={item.id}
              to={item.route}
              className="rounded-[1.5rem] border border-border/70 bg-card/70 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.summary}</p>
                </div>
                <LayoutTemplate className="mt-0.5 size-5 text-accent" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
