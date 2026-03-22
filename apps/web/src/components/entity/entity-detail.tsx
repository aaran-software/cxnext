import type { PropsWithChildren, ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function formatDetailValue(value: unknown) {
  if (value == null) return '-'
  if (typeof value === 'string' && value.trim().length === 0) return '-'
  return String(value)
}

export function EntityDetailHeader({
  backHref,
  backLabel,
  title,
  description,
  isActive,
  actions,
}: {
  backHref: string
  backLabel: string
  title: string
  description: string
  isActive: boolean
  actions?: ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link to={backHref}>
              <ArrowLeft className="size-4" />
              {backLabel}
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  )
}

export function DetailSection({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

export function DetailGrid({ children }: PropsWithChildren) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
}

export function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mt-2 text-sm text-foreground">{value}</div>
    </div>
  )
}

export function DetailList<T>({
  items,
  emptyMessage,
  renderItem,
}: {
  items: readonly T[]
  emptyMessage: string
  renderItem: (item: T, index: number) => ReactNode
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return <div className="grid gap-3">{items.map((item, index) => renderItem(item, index))}</div>
}
