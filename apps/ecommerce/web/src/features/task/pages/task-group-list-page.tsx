import type { TaskGroupStatus, TaskGroupSummary, TaskGroupType, TaskGroupUpsertPayload } from '@shared/index'
import { useEffect, useMemo, useState } from 'react'
import { Boxes, Plus } from 'lucide-react'
import { useAuth } from '@framework-core/web/auth/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import { AutocompleteLookup } from '@/components/lookups/AutocompleteLookup'
import { createTaskGroup, HttpError, listTaskGroups, updateTaskGroup } from '@/shared/api/client'
import { showFailedActionToast, showSavedToast } from '@/shared/notifications/toast'

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) return error.message
  if (error instanceof Error) return error.message
  return 'Failed to load task groups.'
}

function createDefaultForm(): TaskGroupUpsertPayload {
  return {
    title: '',
    type: 'focus',
    status: 'active',
    description: null,
  }
}

function formatDate(value: string) {
  const parsedValue = new Date(value)
  if (Number.isNaN(parsedValue.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(parsedValue)
}

export function TaskGroupListPage() {
  const { session } = useAuth()
  const [items, setItems] = useState<TaskGroupSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TaskGroupStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | TaskGroupType>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<TaskGroupUpsertPayload>(createDefaultForm())

  useEffect(() => {
    if (!session?.accessToken) {
      setItems([])
      setLoading(false)
      return
    }
    const accessToken = session.accessToken

    let cancelled = false
    async function load() {
      setLoading(true)
      setErrorMessage(null)
      try {
        const nextItems = await listTaskGroups(accessToken)
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
    return () => { cancelled = true }
  }, [session?.accessToken])

  const filteredItems = useMemo(() => items.filter((item) => {
    const normalizedQuery = query.trim().toLowerCase()
    if (normalizedQuery && ![item.title, item.type, item.status].some((value) => value.toLowerCase().includes(normalizedQuery))) {
      return false
    }
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false
    }
    if (typeFilter !== 'all' && item.type !== typeFilter) {
      return false
    }
    return true
  }), [items, query, statusFilter, typeFilter])

  async function handleCreate() {
    if (!session?.accessToken) {
      setErrorMessage('Authorization token is required.')
      return
    }
    if (form.title.trim().length < 3) {
      setErrorMessage('Task group title is required.')
      return
    }

    setSaving(true)
    setErrorMessage(null)
    try {
      const created = await createTaskGroup(session.accessToken, {
        ...form,
        title: form.title.trim(),
      })
      setItems((current) => [created, ...current])
      setDialogOpen(false)
      setForm(createDefaultForm())
      showSavedToast({
        entityLabel: 'task group',
        recordName: created.title,
        referenceId: created.id,
        mode: 'create',
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showFailedActionToast({ entityLabel: 'task group', action: 'create', detail: message })
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(item: TaskGroupSummary, status: TaskGroupStatus) {
    if (!session?.accessToken || item.status === status) {
      return
    }
    try {
      const updated = await updateTaskGroup(session.accessToken, item.id, {
        title: item.title,
        type: item.type,
        status,
        description: null,
      })
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry))
      showSavedToast({
        entityLabel: 'task group',
        recordName: updated.title,
        referenceId: updated.id,
        mode: 'update',
      })
    } catch (error) {
      showFailedActionToast({ entityLabel: 'task group', action: 'update', detail: toErrorMessage(error) })
    }
  }

  if (loading) {
    return (
      <Card className="rounded-md border-border/70 shadow-none">
        <CardContent className="p-8 text-sm text-muted-foreground">Loading task groups...</CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 pt-1">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <Boxes className="size-3.5" />
            Task Groups
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Keep lightweight execution groups separate from milestones.</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">Use task groups for quick batching, sprinting, and focus lanes without adding milestone-style governance.</p>
          </div>
        </div>

        <Button type="button" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          New Group
        </Button>
      </div>

      {errorMessage ? (
        <Card className="rounded-md border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="p-4 text-sm text-destructive">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-md border-border/70 shadow-none"><CardContent className="p-4"><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Groups</p><p className="mt-1 text-2xl font-semibold tracking-tight">{items.length}</p></CardContent></Card>
        <Card className="rounded-md border-border/70 shadow-none"><CardContent className="p-4"><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Active</p><p className="mt-1 text-2xl font-semibold tracking-tight">{items.filter((item) => item.status === 'active').length}</p></CardContent></Card>
        <Card className="rounded-md border-border/70 shadow-none"><CardContent className="p-4"><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Archived</p><p className="mt-1 text-2xl font-semibold tracking-tight">{items.filter((item) => item.status === 'archived').length}</p></CardContent></Card>
      </div>

      <Card className="rounded-md border-border/70 shadow-none">
        <CardContent className="grid gap-4 p-4 md:grid-cols-[minmax(0,1.4fr)_220px_220px]">
          <div className="space-y-2">
            <Label htmlFor="task-group-query">Search</Label>
            <Input id="task-group-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, type, status" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-group-status">Status</Label>
            <select id="task-group-status" className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | TaskGroupStatus)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-group-type">Type</Label>
            <select id="task-group-type" className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | TaskGroupType)}>
              <option value="all">All</option>
              <option value="focus">Focus</option>
              <option value="batch">Batch</option>
              <option value="sprint">Sprint</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="rounded-md border-border/70 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <StatusBadge tone={item.status === 'active' ? 'active' : 'manual'}>{item.status}</StatusBadge>
                  <StatusBadge tone="publishing">{item.type}</StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">Updated {formatDate(item.updatedAt)} · ID {item.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'active' ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => { void handleStatusChange(item, 'archived') }}>Archive</Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => { void handleStatusChange(item, 'active') }}>Activate</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[min(94vw,32rem)] max-w-2xl border border-border/70 bg-background p-0">
          <DialogHeader className="border-b border-border/70 px-5 py-4">
            <DialogTitle>New Task Group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 px-5 py-5">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Ex: Pricing sweep batch" />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <AutocompleteLookup
                value={form.type}
                onChange={(value) => setForm((current) => ({ ...current, type: (value || 'focus') as TaskGroupType }))}
                options={[
                  { value: 'focus', label: 'Focus' },
                  { value: 'batch', label: 'Batch' },
                  { value: 'sprint', label: 'Sprint' },
                ]}
                placeholder="Select group type"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border/70 px-5 py-3">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={() => { void handleCreate() }} disabled={saving}>
              {saving ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
