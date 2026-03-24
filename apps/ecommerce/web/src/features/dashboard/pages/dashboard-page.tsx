import { ArrowUpRight, Blocks, Database, ShoppingBag, Wallet } from 'lucide-react'
import { frameworkServices, suiteApps } from '@framework-core/index'
import { coreWorkspaceItems } from '@core-domain/index'
import { ecommerceWorkspaceItems } from '@ecommerce-domain/index'
import { useAuth } from '@/features/auth/components/auth-provider'
import { dashboardStats } from '@/lib/site'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { session } = useAuth()

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="flex flex-col gap-6 border-b border-border/60 p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge>Platform overview</Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Framework, Core, Ecommerce, and Billing on one working baseline.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                The current host app now exposes an explicit architecture split: framework services
                below, Core as the shared foundation, Ecommerce as the active business app, and
                Billing as the next standalone product base.
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Signed in as {session?.user.displayName} ({session?.user.actorType})
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/dashboard/core">Open Core</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/dashboard/ecommerce">Open Ecommerce</Link>
            </Button>
            <Button disabled>
              Billing base in progress
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-8 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.delta}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Framework service blocks</CardTitle>
            <CardDescription>
              The base architecture is now described as explicit framework services instead of one
              generic platform box.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {frameworkServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-muted/60 px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{service.name}</p>
                  <p className="text-sm text-muted-foreground">{service.summary}</p>
                </div>
                <Badge variant={service.readiness === 'active' ? 'default' : 'secondary'}>
                  {service.readiness}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App suite readiness</CardTitle>
            <CardDescription>
              The current project is being split into explicit app ownership boundaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {suiteApps.map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-muted/60 px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{app.name}</p>
                  <p className="text-sm text-muted-foreground">{app.summary}</p>
                </div>
                <Badge variant={app.readiness === 'active' ? 'default' : 'secondary'}>
                  {app.readiness}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Blocks className="size-5 text-accent" />
              <CardTitle>Core surface</CardTitle>
            </div>
            <CardDescription>Shared masters and admin foundations grouped under Core.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {coreWorkspaceItems.slice(0, 4).map((item) => (
              <Link key={item.id} to={item.route} className="block rounded-xl bg-muted/50 px-3 py-3 text-sm text-foreground transition hover:bg-muted">
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-muted-foreground">{item.summary}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-accent" />
              <CardTitle>Ecommerce surface</CardTitle>
            </div>
            <CardDescription>Existing storefront and commerce operations grouped under Ecommerce.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ecommerceWorkspaceItems.slice(0, 4).map((item) => (
              <Link key={item.id} to={item.route} className="block rounded-xl bg-muted/50 px-3 py-3 text-sm text-foreground transition hover:bg-muted">
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-muted-foreground">{item.summary}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="mesh-panel">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="size-5 text-accent" />
              <CardTitle>Billing base</CardTitle>
            </div>
            <CardDescription>Billing is now scaffolded as the next standalone app path.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              'Billing API and desktop scaffolds exist as the initial app base.',
              'Billing web base will share the same design system without pretending workflows are complete.',
              'Accounts, inventory, and billing documents will remain billing-owned, not pushed into Core.',
            ].map((item) => (
              <div key={item} className="rounded-[1.25rem] bg-background/60 p-4 text-sm leading-7 text-muted-foreground">
                {item}
              </div>
            ))}
            <div className="rounded-[1.5rem] border border-dashed border-border/80 p-5">
              <div className="flex items-center gap-3">
                <Database className="size-5 text-accent" />
                <p className="font-medium text-foreground">
                  Current host remains stable while app boundaries are extracted incrementally.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
