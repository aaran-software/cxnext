import type { LookupOption } from '@/shared/forms/common-lookup'
import type { TaskPriority, TaskScopeType, TaskStatus, TaskTemplateSummary, TaskUpsertPayload } from '@shared/index'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, CheckCircle2, ClipboardList, Flag, Sparkles, Tags, UserRound } from 'lucide-react'
import { AutocompleteLookup } from '@/components/lookups/AutocompleteLookup'
import { TaskCreateWizard } from '@/features/task/components/task-create-wizard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import { Textarea } from '@/components/ui/textarea'
import { createFieldErrors, inputErrorClassName, isBlank, setFieldError, summarizeFieldErrors, type FieldErrors, warningCardClassName } from '@/shared/forms/validation'
import { HttpError, createTask, getTask, getTaskTemplate, listProducts, listTaskTemplates, listUsers, markNotificationsReadByTask, updateTask } from '@/shared/api/client'
import { showFailedActionToast, showSavedToast, showValidationToast } from '@/shared/notifications/toast'
import { useAuth } from '@framework-core/web/auth/components/auth-provider'

type TaskFormValues = TaskUpsertPayload
const TASK_DRAFT_STORAGE_KEY = 'task:create-draft'

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

const taskScopeOptions: LookupOption[] = [
  { value: 'general', label: 'General' },
  { value: 'product', label: 'Product' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'order', label: 'Order' },
  { value: 'customer', label: 'Customer' },
  { value: 'user', label: 'User' },
]

function createDefaultValues(): TaskFormValues {
  return {
    title: '',
    description: null,
    status: 'pending',
    priority: 'medium',
    tags: [],
    scopeType: 'general',
    entityType: null,
    entityId: null,
    entityLabel: null,
    templateId: null,
    assigneeId: null,
    dueDate: null,
    reviewComment: null,
    checklistItems: [],
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

function TaskStat({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: typeof ClipboardList }) {
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
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [templates, setTemplates] = useState<TaskTemplateSummary[]>([])
  const [checklistLabels, setChecklistLabels] = useState<Record<string, string>>({})
  const [wizardOpen, setWizardOpen] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadBootstrap() {
      if (!session?.accessToken) return
      try {
        const [userList, templateList, productList] = await Promise.all([
          listUsers(session.accessToken),
          listTaskTemplates(session.accessToken),
          listProducts(),
        ])
        if (!cancelled) {
          setUsers(userList.map((user) => ({ id: user.id, name: user.displayName || user.email })))
          setTemplates(templateList)
          setProducts(productList.map((product) => ({ id: product.id, name: product.name })))
        }
      } catch {
        if (!cancelled) {
          setUsers([])
          setProducts([])
          setTemplates([])
        }
      }
    }
    void loadBootstrap()
    return () => { cancelled = true }
  }, [session?.accessToken])

  useEffect(() => {
    if (taskId) {
      return
    }

    const rawDraft = sessionStorage.getItem(TASK_DRAFT_STORAGE_KEY)
    if (!rawDraft) {
      return
    }

    try {
      const draft = JSON.parse(rawDraft) as TaskUpsertPayload
      setValues((current) => ({
        ...current,
        ...draft,
      }))
      setDraftLoaded(true)
    } catch {
      sessionStorage.removeItem(TASK_DRAFT_STORAGE_KEY)
      return
    }

    sessionStorage.removeItem(TASK_DRAFT_STORAGE_KEY)
  }, [taskId])

  useEffect(() => {
    let cancelled = false
    async function loadTask() {
      if (!taskId || !session?.accessToken) return
      setLoading(true)
      setErrorMessage(null)
      try {
        const task = await getTask(session.accessToken, taskId)
        if (!cancelled) {
          setChecklistLabels(Object.fromEntries(task.checklistItems.map((item) => [item.id, item.label])))
          setValues({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            tags: task.tags,
            scopeType: task.scopeType,
            entityType: task.entityType,
            entityId: task.entityId,
            entityLabel: task.entityLabel,
            templateId: task.templateId,
            assigneeId: task.assigneeId,
            dueDate: task.dueDate,
            reviewComment: task.reviewComment,
            checklistItems: task.checklistItems.map((item) => ({
              id: item.id,
              isChecked: item.isChecked,
              note: item.note,
            })),
          })
        }
      } catch (error) {
        if (!cancelled) setErrorMessage(toErrorMessage(error))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void loadTask()
    return () => { cancelled = true }
  }, [session?.accessToken, taskId])

  useEffect(() => {
    if (!taskId || !session?.accessToken) {
      return
    }

    void markNotificationsReadByTask(session.accessToken, taskId).catch(() => null)
  }, [session?.accessToken, taskId])

  const assigneeOptions = useMemo<LookupOption[]>(() => users.map((user) => ({ value: user.id, label: user.name })), [users])
  const templateOptions = useMemo<LookupOption[]>(() => templates.map((template) => ({ value: template.id, label: template.name })), [templates])
  const selectedStatus = getStatusMeta(values.status)
  const selectedPriority = getPriorityMeta(values.priority)
  const selectedAssigneeLabel = users.find((user) => user.id === values.assigneeId)?.name ?? 'Unassigned'
  const headerTitle = values.title?.trim() || (isEditMode ? 'Untitled Task' : 'New Task')

  async function handleTemplateSelect(templateId: string) {
    if (!session?.accessToken) return
    setValues((current) => ({ ...current, templateId: templateId || null }))
    if (!templateId) return
    const template = await getTaskTemplate(session.accessToken, templateId)
    setChecklistLabels(Object.fromEntries(template.checklistItems.map((item) => [item.id, item.label])))
    setValues((current) => ({
      ...current,
      templateId: template.id,
      title: current.title.trim() ? current.title : template.titleTemplate,
      description: current.description?.trim() ? current.description : template.descriptionTemplate,
      priority: template.defaultPriority,
      tags: template.defaultTags,
      scopeType: template.scopeType,
      entityType: template.scopeType === 'general' ? null : template.scopeType,
      checklistItems: template.checklistItems.map((item) => ({
        id: item.id,
        isChecked: false,
        note: null,
      })),
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.accessToken) {
      setErrorMessage('Authorization token is required.')
      return
    }
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
        ? await updateTask(session.accessToken, taskId, values)
        : await createTask(session.accessToken, values)
      showSavedToast({
        entityLabel: 'task',
        recordName: savedTask.title,
        referenceId: savedTask.id,
        mode: taskId ? 'update' : 'create',
      })
      void navigate(taskId ? `/admin/dashboard/task/tasks/${savedTask.id}` : `/admin/dashboard/task/tasks/${savedTask.id}`)
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showFailedActionToast({ entityLabel: 'task', action: taskId ? 'update' : 'save', detail: message })
    } finally {
      setSaving(false)
    }
  }

  async function handleWizardContinue(payload: TaskUpsertPayload) {
    sessionStorage.setItem(TASK_DRAFT_STORAGE_KEY, JSON.stringify(payload))
    await navigate('/admin/dashboard/task/tasks/new')
  }

  if (loading) {
    return <Card className="rounded-md border-border/70 shadow-none"><CardContent className="p-8 text-sm text-muted-foreground">Loading task...</CardContent></Card>
  }

  return (
    <form className="space-y-4 pt-1" onSubmit={(event) => { void handleSubmit(event) }}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link to={taskId ? `/admin/dashboard/task/tasks/${taskId}` : '/admin/dashboard/task/tasks'}><ArrowLeft className="size-4" />Back to tasks</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{headerTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{isEditMode ? 'Task Brief' : 'Create a task with template, ownership, checklist, and due date.'}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditMode ? (
            <Button type="button" variant="outline" onClick={() => setWizardOpen(true)}>
              <Sparkles className="size-4" />
              Try IFZ Beta
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => { void navigate(taskId ? `/admin/dashboard/task/tasks/${taskId}` : '/admin/dashboard/task/tasks') }}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Task'}</Button>
        </div>
      </div>

      {!isEditMode ? (
        <TaskCreateWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          templates={templates}
          users={users}
          products={products}
          currentUserId={session?.user.id ?? null}
          currentUserName={session?.user.displayName ?? null}
          onContinue={handleWizardContinue}
        />
      ) : null}

      {!isEditMode && draftLoaded ? (
        <Card className="rounded-md border-border/70 bg-muted/10 shadow-none">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <div className="rounded-full border border-border/70 bg-background p-2">
              <Sparkles className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Prefilled from IFZ Beta</p>
              <p className="text-muted-foreground">Review and adjust the draft before creating the task.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card className={`${warningCardClassName} rounded-md`}>
          <CardContent className="rounded-md p-3 text-sm">
            <p className="font-medium">{errorMessage}</p>
            {Object.keys(fieldErrors).length > 0 ? <ul className="mt-2 list-disc space-y-1 pl-5">{summarizeFieldErrors(fieldErrors).map((message) => <li key={message}>{message}</li>)}</ul> : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.9fr)]">
        <Card className="rounded-md border-border/70 shadow-none">
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Template</Label>
                <AutocompleteLookup value={values.templateId ?? ''} onChange={(value) => { void handleTemplateSelect(value) }} options={templateOptions} placeholder="Select task template" allowEmptyOption emptyOptionLabel="No template" />
              </div>
              <div className="grid gap-2">
                <Label>Scope</Label>
                <AutocompleteLookup value={values.scopeType} onChange={(value) => setValues((current) => ({ ...current, scopeType: value as TaskScopeType, entityType: value === 'general' ? null : value as TaskScopeType }))} options={taskScopeOptions} placeholder="Select scope" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className={fieldErrors.title ? 'text-destructive' : undefined}>Title</Label>
              <Input className={inputErrorClassName(Boolean(fieldErrors.title))} value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} placeholder="Ex: Verify product price update" />
              <FieldError message={fieldErrors.title} />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Entity ID</Label>
                <Input value={values.entityId ?? ''} onChange={(event) => setValues((current) => ({ ...current, entityId: event.target.value || null }))} placeholder="Ex: product:cxnext-polo" />
              </div>
              <div className="grid gap-2">
                <Label>Entity Label</Label>
                <Input value={values.entityLabel ?? ''} onChange={(event) => setValues((current) => ({ ...current, entityLabel: event.target.value || null }))} placeholder="Ex: CXNext Polo" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea rows={8} value={values.description ?? ''} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value || null }))} placeholder="Add scope, expected output, and verification notes." className="min-h-40" />
            </div>

            <div className="grid gap-2">
              <Label>Tags</Label>
              <Input value={values.tags.join(', ')} onChange={(event) => setValues((current) => ({ ...current, tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) }))} placeholder="Ex: product, price, verification" />
            </div>

            {values.checklistItems.length > 0 ? (
              <div className="grid gap-3 rounded-md border border-border/60 bg-muted/10 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Checklist</p>
                  <p className="text-xs text-muted-foreground">Required checks from the task template.</p>
                </div>
                {values.checklistItems.map((item, index) => (
                  <div key={item.id} className="grid gap-2 rounded-md border border-border/50 bg-background p-3">
                    <label className="flex items-center gap-3">
                      <Checkbox checked={item.isChecked} onCheckedChange={(checked) => setValues((current) => ({
                        ...current,
                        checklistItems: current.checklistItems.map((entry, entryIndex) => entryIndex === index ? { ...entry, isChecked: Boolean(checked) } : entry),
                      }))} />
                      <span className="text-sm font-medium text-foreground">{checklistLabels[item.id] ?? item.id}</span>
                    </label>
                    <Input value={item.note ?? ''} onChange={(event) => setValues((current) => ({
                      ...current,
                      checklistItems: current.checklistItems.map((entry, entryIndex) => entryIndex === index ? { ...entry, note: event.target.value || null } : entry),
                    }))} placeholder="Optional note" />
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-md border-border/70 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle>Assignment</CardTitle>
              <CardDescription>Set workflow, urgency, owner, and deadline.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <AutocompleteLookup value={values.status} onChange={(value) => setValues((current) => ({ ...current, status: value as TaskStatus }))} options={taskStatusOptions} placeholder="Search status" />
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <AutocompleteLookup value={values.priority} onChange={(value) => setValues((current) => ({ ...current, priority: value as TaskPriority }))} options={taskPriorityOptions} placeholder="Search priority" />
              </div>
              <div className="grid gap-2">
                <Label>Assignee</Label>
                <AutocompleteLookup value={values.assigneeId ?? ''} onChange={(value) => setValues((current) => ({ ...current, assigneeId: value || null }))} options={assigneeOptions} placeholder="Search assignee" allowEmptyOption emptyOptionLabel="Unassigned" />
                {session?.user.id ? (
                  <div className="flex justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValues((current) => ({ ...current, assigneeId: session.user.id }))}
                    >
                      My Self
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Input type="date" value={values.dueDate ?? ''} onChange={(event) => setValues((current) => ({ ...current, dueDate: event.target.value || null }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-border/70 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle>At A Glance</CardTitle>
              <CardDescription>Quick readback before saving.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <TaskStat label="Workflow State" value={selectedStatus.label} hint="Current execution phase for the task." icon={CheckCircle2} />
              <TaskStat label="Priority" value={selectedPriority.label} hint="Relative urgency for scheduling and follow-through." icon={Flag} />
              <TaskStat label="Owner" value={selectedAssigneeLabel} hint="Person responsible for moving the task." icon={UserRound} />
              <TaskStat label="Due" value={values.dueDate || 'Not scheduled'} hint="Deadline visible to the team." icon={CalendarClock} />
              <TaskStat label="Tags" value={values.tags.length > 0 ? values.tags.join(', ') : 'No tags'} hint="Keywords attached to the task record." icon={Tags} />
              <TaskStat label="Checklist" value={`${values.checklistItems.filter((item) => item.isChecked).length}/${values.checklistItems.length}`} hint="Completed checks from the selected template." icon={ClipboardList} />

              <div className="rounded-md border border-border/60 bg-muted/15 p-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Status And Priority</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={selectedStatus.tone}>{selectedStatus.label}</StatusBadge>
                  <StatusBadge tone={selectedPriority.tone}>{selectedPriority.label}</StatusBadge>
                  {values.tags.map((tag) => <StatusBadge key={tag} tone="manual">{tag}</StatusBadge>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
