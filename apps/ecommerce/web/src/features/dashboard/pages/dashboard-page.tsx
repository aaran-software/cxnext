import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useDesk } from '@/features/framework/desk/desk-provider'

export function DashboardPage() {
  const { session } = useAuth()
  const { apps, services } = useDesk()

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="border-b border-border/60 p-8">
          <div className="flex items-start justify-between gap-4">
            <Badge variant="outline" className="shrink-0 border-border/80 bg-background/90 px-4 py-1.5 text-sm font-semibold tracking-[0.16em] text-foreground shadow-sm">
              Signed in as {session?.user.displayName} ({session?.user.actorType})
            </Badge>
            <Badge className="px-4 py-1.5">Framework</Badge>
          </div>
          <div className="mt-6 max-w-4xl space-y-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl xl:text-[2.6rem]">
                One framework. Every app. One operating shell.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                Launch apps from a single framework desk and keep each workspace isolated.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            Click any app icon to open its workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((app) => {
            const AppIcon = app.icon

            return (
              <Link
                key={app.id}
                to={app.route}
                className="group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/75 p-6 transition hover:-translate-y-1 hover:border-accent/40 hover:bg-card"
              >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${app.accentClassName}`} />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-background/90 shadow-sm">
                      <AppIcon className="size-7 text-foreground" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xl font-semibold text-foreground">{app.name}</p>
                        <Badge variant="secondary">{app.readiness}</Badge>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{app.summary}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="size-5 text-muted-foreground transition group-hover:text-foreground" />
                </div>
                <div className="relative mt-6 flex flex-wrap gap-2">
                  <Badge variant="outline">{app.badge}</Badge>
                  <Badge variant="outline">{app.modules.length} modules</Badge>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Framework services</CardTitle>
            <CardDescription>
              Shared runtime blocks that every app workspace can rely on.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {services.map((service) => {
              const ServiceIcon = service.icon

              return (
                <div key={service.id} className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-muted/60 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-background">
                      <ServiceIcon className="size-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.summary}</p>
                    </div>
                  </div>
                  <Badge variant={service.readiness === 'active' ? 'default' : 'secondary'}>
                    {service.readiness}
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
