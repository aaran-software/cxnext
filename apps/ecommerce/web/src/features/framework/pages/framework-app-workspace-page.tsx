import type { SuiteAppId } from '@framework-core/app-suite'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@framework-core/web/auth/components/auth-provider'
import { getDeskApp } from '@/features/framework/desk/desk-registry'

const readinessTone = {
  active: 'default',
  foundation: 'secondary',
  scaffold: 'outline',
} as const

export function FrameworkAppWorkspacePage({ appId }: { appId: SuiteAppId }) {
  const { session } = useAuth()
  const app = getDeskApp(appId)

  if (!app) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="relative overflow-hidden border-b border-border/60 p-8">
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${app.accentClassName}`} />
          <div className="relative flex items-start justify-between gap-4">
            <Badge variant="outline" className="border-border/80 bg-background/90 px-4 py-1.5 text-sm font-semibold tracking-[0.16em] text-foreground shadow-sm">
              Signed in as {session?.user.displayName} ({session?.user.actorType})
            </Badge>
            <Badge variant={readinessTone[app.readiness]} className="px-4 py-1.5">
              {app.badge}
            </Badge>
          </div>
          <div className="relative mt-6 max-w-4xl space-y-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl xl:text-[2.6rem]">
                {app.workspaceTitle}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {app.workspaceSummary}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {app.modules.map((item) => {
            const ItemIcon = item.icon

            return (
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
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                    <ItemIcon className="size-5 text-accent" />
                  </div>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
