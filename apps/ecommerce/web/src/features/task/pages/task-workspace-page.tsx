import type { TaskPriority, TaskStatus, TaskSummary } from '@shared/index'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock3, ListTodo, Plus, UserRound } from 'lucide-react'
import { useAuth } from '@framework-core/web/auth/components/auth-provider'
import { AnimatedTabs, type AnimatedContentTab } from '@/components/ui/animated-tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { HttpError, listTasks } from '@/shared/api/client'

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) return error.message
  if (error instanceof Error) return error.message
  return 'Failed to load tasks.'
}

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled'

  const parsedValue = new Date(value)
  if (Number.isNaN(parsedValue.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(parsedValue)
}

function getStatusConfig(status: TaskStatus) {
  switch (status) {
    case 'pending':
      return { label: 'Pending', tone: 'manual' as const }
    case 'in_progress':
      return { label: 'In Progress', tone: 'publishing' as const }
    case 'review':
      return { label: 'Review', tone: 'featured' as const }
    case 'finalized':
      return { label: 'Finalized', tone: 'active' as const }
  }
}

function getPriorityConfig(priority: TaskPriority) {
  switch (priority) {
    case 'low':
      return { label: 'Low', tone: 'manual' as const }
    case 'medium':
      return { label: 'Medium', tone: 'publishing' as const }
    case 'high':
      return { label: 'High', tone: 'featured' as const }
    case 'urgent':
      return { label: 'Urgent', tone: 'active' as const }
  }
}

function WorkspaceMetric({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: number
  hint: string
  icon: typeof ListTodo
}) {
  return (
    <Card className="rounded-md border-border/70 shadow-none">
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-full border border-border/70 bg-muted/30 p-2.5">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyTaskState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card className="rounded-md border-border/70 shadow-none">
      <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="rounded-full border border-border/70 bg-muted/25 p-3">
          <ListTodo className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function TaskListSection({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: TaskSummary[]
}) {
  const navigate = useNavigate()

  if (items.length === 0) {
    return <EmptyTaskState title={`No ${title.toLowerCase()} yet`} description={description} />
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {items.map((item, index) => {
          const status = getStatusConfig(item.status)
          const priority = getPriorityConfig(item.priority)
          const taskHref = `/admin/dashboard/tasks/${item.id}/edit`

          return (
            <div key={item.id} className="relative">
              <div className="pointer-events-none absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <div className="flex size-10 items-center justify-center rounded-full border border-foreground/80 bg-foreground/60 text-sm font-semibold text-background shadow-sm">
                  {index + 1}
                </div>
              </div>

              <Card
                className="cursor-pointer rounded-md border-border/70 shadow-none transition-colors hover:border-border hover:bg-muted/10"
                role="link"
                tabIndex={0}
                onClick={() => { void navigate(taskHref) }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    void navigate(taskHref)
                  }
                }}
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Task ID {item.id}</p>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                      {item.description?.trim() || 'No task description added yet.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <StatusBadge tone={priority.tone}>{priority.label}</StatusBadge>
                      {item.tags.map((tag) => (
                        <StatusBadge key={tag} tone="manual">{tag}</StatusBadge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                      <CardDescription>
                        Created {formatDate(item.createdAt)} · Updated {formatDate(item.updatedAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-sm">
                    <span className="text-muted-foreground">Due date <span className="font-medium text-foreground">{formatDate(item.dueDate)}</span></span>
                    <span className="text-muted-foreground">Assignee <span className="font-medium text-foreground">{item.assigneeName ?? 'Unassigned'}</span></span>
                    <span className="text-muted-foreground">Creator <span className="font-medium text-foreground">{item.creatorName}</span></span>
                    <span className="ml-auto inline-flex items-center gap-1 font-medium text-foreground">
                      Open task
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TaskWorkspacePage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [items, setItems] = useState<TaskSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.accessToken) {
      setLoading(false)
      setItems([])
      return
    }

    const accessToken = session.accessToken
    let cancelled = false

    async function load() {
      setLoading(true)
      setErrorMessage(null)

      try {
        const nextItems = await listTasks(accessToken)
        if (!cancelled) {
          setItems(nextItems)
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(toErrorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [session?.accessToken])

  const currentUserId = session?.user.id ?? ''
  const myTasks = useMemo(() => items.filter((item) => item.assigneeId === currentUserId), [currentUserId, items])
  const openTasks = useMemo(() => items.filter((item) => item.status !== 'finalized'), [items])
  const createdByMe = useMemo(() => items.filter((item) => item.creatorId === currentUserId), [currentUserId, items])
  const reviewTasks = useMemo(() => items.filter((item) => item.status === 'review'), [items])
  const finalizedTasks = useMemo(() => items.filter((item) => item.status === 'finalized'), [items])

  const taskTabs: AnimatedContentTab[] = [
    {
      label: 'My Tasks',
      value: 'my',
      content: (
        <TaskListSection
          title="My Tasks"
          description="Tasks assigned to you will appear here once work is distributed."
          items={myTasks}
        />
      ),
      contentClassName: 'border-0 bg-transparent p-0 shadow-none',
    },
    {
      label: 'Open Tasks',
      value: 'open',
      content: (
        <TaskListSection
          title="Open Tasks"
          description="No active queue items are waiting right now."
          items={openTasks}
        />
      ),
      contentClassName: 'border-0 bg-transparent p-0 shadow-none',
    },
    {
      label: 'Created By Me',
      value: 'created',
      content: (
        <TaskListSection
          title="Created By Me"
          description="Tasks you create for the team will be collected here."
          items={createdByMe}
        />
      ),
      contentClassName: 'border-0 bg-transparent p-0 shadow-none',
    },
  ]

  if (loading) {
    return (
      <Card className="rounded-md border-border/70 shadow-none">
        <CardContent className="p-8 text-sm text-muted-foreground">Loading task workspace...</CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 pt-1">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <UserRound className="size-3.5" />
            Task Management
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Keep assignment, ownership, and follow-through in one place.</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Review your queue, track active execution, and move tasks forward with the same operational rhythm used across product editing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button type="button" onClick={() => { void navigate('/admin/dashboard/tasks/new') }}>
            <Plus className="size-4" />
            New Task
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <Card className="rounded-md border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="p-4 text-sm text-destructive">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMetric label="Assigned To Me" value={myTasks.length} hint="Items currently under your ownership." icon={UserRound} />
        <WorkspaceMetric label="Open Queue" value={openTasks.length} hint="All work that is not finalized yet." icon={Clock3} />
        <WorkspaceMetric label="In Review" value={reviewTasks.length} hint="Tasks waiting for sign-off or feedback." icon={ListTodo} />
        <WorkspaceMetric label="Finalized" value={finalizedTasks.length} hint="Completed tasks closed by the team." icon={CheckCircle2} />
      </div>

      <AnimatedTabs defaultTabValue="my" tabs={taskTabs} />
    </div>
  )
}
