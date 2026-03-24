import { ArrowUpRight, Building2, MapPinned, Settings2, ShieldCheck } from 'lucide-react'
import { coreWorkspaceItems } from '@core-domain/index'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const coreSignals = [
  {
    title: 'Shared masters stay centralized',
    summary: 'Core owns company, contact, and reusable business master records for all apps.',
    icon: MapPinned,
  },
  {
    title: 'Admin setup remains reusable',
    summary: 'Setup, settings, and reusable admin flows stay in one shared operational surface.',
    icon: Settings2,
  },
  {
    title: 'Access control remains cross-app',
    summary: 'Framework authentication and Core-facing admin operations keep backoffice access coherent.',
    icon: ShieldCheck,
  },
]

export function CoreWorkspacePage() {
  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="flex flex-col gap-5 border-b border-border/60 p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge>Core</Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Shared masters, setup, and admin foundations.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                This workspace gathers the existing project areas that now belong to the shared Core
                app boundary without changing the working operator UX.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/dashboard/common">Open common modules</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/dashboard/companies">
                Review shared masters
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-8 md:grid-cols-3">
          {coreSignals.map((signal) => (
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
          <CardTitle>Core ownership map</CardTitle>
          <CardDescription>
            Existing screens remain intact, but they are now grouped under the Core app boundary.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coreWorkspaceItems.map((item) => (
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
                <Building2 className="mt-0.5 size-5 text-accent" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
