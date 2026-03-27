import type { LookupOption } from '@/shared/forms/common-lookup'
import type { TaskPriority, TaskStatus, TaskUpsertPayload } from '@shared/index'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, CheckCircle2, ClipboardList, Flag, Tags, UserRound } from 'lucide-react'
import { AutocompleteLookup } from '@/components/lookups/AutocompleteLookup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import { Textarea } from '@/components/ui/textarea'
import { createFieldErrors, inputErrorClassName, isBlank, setFieldError, summarizeFieldErrors, type FieldErrors, warningCardClassName } from '@/shared/forms/validation'
import { HttpError, createTask, getTask, listUsers, updateTask } from '@/shared/api/client'
import { showFailedActionToast, showSavedToast, showValidationToast } from '@/shared/notifications/toast'
import { useAuth } from '@framework-core/web/auth/components/auth-provider'

type TaskFormValues = TaskUpsertPayload

const taskStatusOptions: Array<LookupOption & { tone: 'manual' | 'publishing' | 'featured' | 'active' }> = [
  { value: 'pending', label: 'Pending', tone: 'manual' },
  { value: 'in_progress', label: 'In Progress', tone: 'publishing' },
  { value: 'review', label: 'Review', tone: 'featured' },
  { value: 'finalized', label: 'Finalized', tone: 'active' },
]

const taskPriorityOptions: Array<LookupOption & { tone: 'manual' | 'publishing' | 'featured' | 'active' }> = [
  { value: 'low', label: 'Low', tone: 'manual' },
  { value: 'medium', label: 'Medium', tone: 'publishing' },
  { value: 'high', label: 'High', tone: 'featured' },
  { value: 'urgent', label: 'Urgent', tone: 'active' },
]

function createDefaultValues(): TaskFormValues {
  return {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    tags: [],
    assigneeId: null,
    dueDate: null,
  }
}

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) return error.message
  if (error instanceof Error) return error.message
  return 'Failed to save task.'
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-[0.8rem] text-destructive">{message}</p> : null
}

function validateTask(values: TaskFormValues) {
  const errors = createFieldErrors()

  if (isBlank(values.title)) setFieldError(errors, 'title', 'Title is required.')

  return errors
}

function getStatusMeta(status: TaskStatus) {
  return taskStatusOptions.find((option) => option.value === status) ?? taskStatusOptions[0]
}

function getPriorityMeta(priority: TaskPriority) {
  return taskPriorityOptions.find((option) => option.value === priority) ?? taskPriorityOptions[1]
}

function TaskStat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: typeof ClipboardList
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/15 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-full border border-border/70 bg-background p-2">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

export function TaskFormPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { taskId } = useParams()
  const isEditMode = Boolean(taskId)
  const [values, setValues] = useState<TaskFormValues>(createDefaultValues())
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(createFieldErrors())
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadUsers() {
      if (!session?.accessToken) {
        return
      }

      try {
        const userList = await listUsers(session.accessToken)
        if (!cancelled) {
          setUsers(userList.map((user) => ({ id: user.id, name: user.displayName || user.email })))
        }
      } catch {
        if (!cancelled) {
          setUsers([])
        }
      }
    }

    void loadUsers()
    return () => {
      cancelled = true
    }
  }, [session?.accessToken])

  useEffect(() => {
    let cancelled = false

    async function loadTask() {
      if (!taskId || !session?.accessToken) {
        return
      }

      const accessToken = session.accessToken
      setLoading(true)
      setErrorMessage(null)

      try {
        const task = await getTask(accessToken, taskId)
        if (!cancelled) {
          setValues({
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            tags: task.tags,
            assigneeId: task.assigneeId,
            dueDate: task.dueDate,
          })
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

    void loadTask()
    return () => {
      cancelled = true
    }
  }, [session?.accessToken, taskId])

  const assigneeOptions = useMemo<LookupOption[]>(
    () => users.map((user) => ({ value: user.id, label: user.name })),
    [users],
  )
  const selectedStatus = getStatusMeta(values.status)
  const selectedPriority = getPriorityMeta(values.priority)
  const selectedAssigneeLabel = users.find((user) => user.id === values.assigneeId)?.name ?? 'Unassigned'
  const headerTitle = values.title.trim() || (isEditMode ? 'Untitled Task' : 'New Task')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.accessToken) {
      setErrorMessage('Authorization token is required.')
      return
    }

    const accessToken = session.accessToken

    const nextFieldErrors = validateTask(values)
    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) {
      setErrorMessage('Validation failed.')
      showValidationToast('task')
      return
    }

    setSaving(true)
    setErrorMessage(null)

    try {
      const savedTask = taskId
        ? await updateTask(accessToken, taskId, values)
        : await createTask(accessToken, values)

      showSavedToast({
        entityLabel: 'task',
        recordName: savedTask.title,
        referenceId: savedTask.id,
        mode: taskId ? 'update' : 'create',
      })

      void navigate('/admin/dashboard/tasks')
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showFailedActionToast({
        entityLabel: 'task',
        action: taskId ? 'update' : 'save',
        detail: message,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="rounded-md border-border/70 shadow-none">
        <CardContent className="p-8 text-sm text-muted-foreground">Loading task...</CardContent>
      </Card>
    )
  }

  return (
    <form className="space-y-4 pt-1" onSubmit={(event) => { void handleSubmit(event) }}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link to="/admin/dashboard/tasks">
              <ArrowLeft className="size-4" />
              Back to tasks
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{headerTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditMode
              ? 'Task Brief'
              : 'Create a task with clear ownership, status, and due date from the start.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => { void navigate('/admin/dashboard/tasks') }}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Task'}</Button>
        </div>
      </div>

      {errorMessage ? (
        <Card className={`${warningCardClassName} rounded-md`}>
          <CardContent className="rounded-md p-3 text-sm">
            <p className="font-medium">{errorMessage}</p>
            {Object.keys(fieldErrors).length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {summarizeFieldErrors(fieldErrors).map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.9fr)]">
        <Card className="rounded-md border-border/70 shadow-none">
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-2">
              <Label className={fieldErrors.title ? 'text-destructive' : undefined}>Title</Label>
              <Input
                className={inputErrorClassName(Boolean(fieldErrors.title))}
                value={values.title}
                onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                placeholder="Ex: Review product imagery for summer capsule"
              />
              <FieldError message={fieldErrors.title} />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                rows={10}
                value={values.description ?? ''}
                onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                placeholder="Add scope, expected output, dependencies, and any review notes."
                className="min-h-48"
              />
              <p className="text-xs text-muted-foreground">Keep the brief operational: what needs to happen, what done looks like, and anything that blocks execution.</p>
            </div>

            <div className="grid gap-2">
              <Label>Tags</Label>
              <Input
                value={values.tags.join(', ')}
                onChange={(event) => setValues((current) => ({
                  ...current,
                  tags: event.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }))}
                placeholder="Ex: content, catalog, review"
              />
              <p className="text-xs text-muted-foreground">Add comma-separated tags to group or filter similar tasks later.</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-md border-border/70 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle>Assignment</CardTitle>
              <CardDescription>Use searchable dropdowns for workflow state and owner selection.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <AutocompleteLookup
                  value={values.status}
                  onChange={(value) => setValues((current) => ({ ...current, status: value as TaskStatus }))}
                  options={taskStatusOptions}
                  placeholder="Search status"
                />
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <AutocompleteLookup
                  value={values.priority}
                  onChange={(value) => setValues((current) => ({ ...current, priority: value as TaskPriority }))}
                  options={taskPriorityOptions}
                  placeholder="Search priority"
                />
              </div>

              <div className="grid gap-2">
                <Label>Assignee</Label>
                <AutocompleteLookup
                  value={values.assigneeId ?? ''}
                  onChange={(value) => setValues((current) => ({ ...current, assigneeId: value || null }))}
                  options={assigneeOptions}
                  placeholder="Search assignee"
                  allowEmptyOption
                  emptyOptionLabel="Unassigned"
                />
              </div>

              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={values.dueDate ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, dueDate: event.target.value || null }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-border/70 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle>At A Glance</CardTitle>
              <CardDescription>Quick readback of the task record before it is saved.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <TaskStat label="Workflow State" value={selectedStatus.label} hint="Current execution phase for the task." icon={CheckCircle2} />
              <TaskStat label="Priority" value={selectedPriority.label} hint="Relative urgency for scheduling and follow-through." icon={Flag} />
              <TaskStat label="Owner" value={selectedAssigneeLabel} hint="Person responsible for moving the task." icon={UserRound} />
              <TaskStat label="Due" value={values.dueDate || 'Not scheduled'} hint="Deadline visible to the team." icon={CalendarClock} />
              <TaskStat label="Tags" value={values.tags.length > 0 ? values.tags.join(', ') : 'No tags'} hint="Keywords attached to the task record." icon={Tags} />

              <div className="rounded-md border border-border/60 bg-muted/15 p-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Status And Priority</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={selectedStatus.tone}>{selectedStatus.label}</StatusBadge>
                  <StatusBadge tone={selectedPriority.tone}>{selectedPriority.label}</StatusBadge>
                  {values.tags.map((tag) => (
                    <StatusBadge key={tag} tone="manual">{tag}</StatusBadge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
