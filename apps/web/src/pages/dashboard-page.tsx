import { ArrowUpRight, Clock3, Sparkles } from 'lucide-react'
import { navigationSections, productModules } from '@shared/index'
import { RoleGate } from '@/components/auth/role-gate'
import { useAuth } from '@/components/auth/auth-provider'
import { dashboardStats, workspaceSignals } from '@/lib/site'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const { session } = useAuth()

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="flex flex-col gap-6 border-b border-border/60 p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge>Operator dashboard</Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                One surface for orders, finance, stock, and team coordination.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                This dashboard is intentionally a UI shell. It mirrors the requested sidebar-led application layout and uses shared module metadata where available.
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Signed in as {session?.user.displayName} ({session?.user.actorType})
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {session?.user.roles.map((role) => (
                  <Badge key={role.key} variant="outline">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Export snapshot</Button>
            <Button>
              Run close checklist
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
            <CardTitle>Operational signals</CardTitle>
            <CardDescription>
              Cross-functional status cards that can later bind to backend summary endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {workspaceSignals.map((signal) => (
              <div key={signal.title} className="flex gap-4 rounded-[1.5rem] border border-border/70 p-5">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/15">
                  <signal.icon className="size-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{signal.title}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{signal.summary}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Module readiness board</CardTitle>
            <CardDescription>
              Shared module definitions keep the roadmap visible inside the app shell.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {productModules.slice(0, 8).map((module) => (
              <div key={module.id} className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-muted/60 px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{module.name}</p>
                  <p className="text-sm text-muted-foreground">{module.summary}</p>
                </div>
                <Badge variant={module.readiness === 'foundation' ? 'default' : 'secondary'}>
                  {module.readiness}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workstream lanes</CardTitle>
            <CardDescription>
              The dashboard keeps the same shared navigation groupings used on the public site.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {navigationSections.map((section) => (
              <div key={section.title} className="rounded-[1.5rem] border border-border/70 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                  {section.title}
                </p>
                <div className="mt-4 space-y-2">
                  {section.moduleIds.map((moduleId) => (
                    <div key={moduleId} className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-foreground">
                      {productModules.find((module) => module.id === moduleId)?.name ?? moduleId}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mesh-panel">
          <CardHeader>
            <Badge variant="outline">Next step</Badge>
            <CardTitle>Backend hooks still to be added</CardTitle>
            <CardDescription>
              This screen intentionally stops at visual scaffolding and shared static data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              'Replace placeholder search with module-aware command data.',
              'Connect the sidebar counts to real order, stock, and compliance endpoints.',
              'Back the login surface with an audited authentication flow.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.25rem] bg-background/60 p-4">
                <Clock3 className="mt-0.5 size-5 text-accent" />
                <p className="text-sm leading-7 text-muted-foreground">{item}</p>
              </div>
            ))}
            <div className="rounded-[1.5rem] border border-dashed border-border/80 p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-accent" />
                <p className="font-medium text-foreground">
                  UI foundation complete enough for feature-by-feature expansion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RoleGate
        allow={['admin', 'staff']}
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Authorization preview</CardTitle>
              <CardDescription>
                Elevated operations are hidden for the current actor type.
              </CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Privileged operator actions</CardTitle>
            <CardDescription>
              Example authorization-aware surface for admin and staff roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {session?.user.permissions.map((permission) => (
                <Badge key={permission.key} variant="secondary">
                  {permission.key}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
            <Button variant="outline">Manage staff access</Button>
            <Button variant="outline">Review vendor onboarding</Button>
            <Button>Open control center</Button>
            </div>
          </CardContent>
        </Card>
      </RoleGate>
    </div>
  )
}
