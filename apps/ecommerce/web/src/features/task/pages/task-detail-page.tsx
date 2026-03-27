import type { Task, TaskActivity, TaskChecklistItem } from '@shared/index'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, ClipboardList, Flag, UserRound } from 'lucide-react'
import { AnimatedTabs, type AnimatedContentTab } from '@/components/ui/animated-tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import { Textarea } from '@/components/ui/textarea'
import { addTaskActivity, getTask, HttpError, markNotificationsReadByTask, updateTask } from '@/shared/api/client'
import { showFailedActionToast, showSavedToast } from '@/shared/notifications/toast'
import { useAuth } from '@framework-core/web/auth/components/auth-provider'

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) return error.message
  if (error instanceof Error) return error.message
  return 'Failed to load task.'
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not available'
  const parsedValue = new Date(value)
  if (Number.isNaN(parsedValue.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(parsedValue)
}

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled'
  const parsedValue = new Date(value)
  if (Number.isNaN(parsedValue.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(parsedValue)
}

function getVerificationStatus(task: Task) {
  if (task.checklistTotalCount === 0 || task.checklistCompletionCount === 0) {
    return { label: 'Not started', tone: 'manual' as const }
  }
  if (task.checklistCompletionCount >= task.checklistTotalCount) {
    return { label: 'Complete', tone: 'active' as const }
  }
  return { label: 'Partial', tone: 'featured' as const }
}

function isOverdueTask(task: Task) {
  if (!task.dueDate || task.status === 'finalized') {
    return false
  }
  const dueDate = new Date(task.dueDate)
  if (Number.isNaN(dueDate.getTime())) {
    return false
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
}

function isStuckTask(task: Task) {
  if (task.status !== 'in_progress') {
    return false
  }
  const updatedAt = new Date(task.updatedAt)
  if (Number.isNaN(updatedAt.getTime())) {
    return false
  }
  const threshold = new Date()
  threshold.setHours(0, 0, 0, 0)
  threshold.setDate(threshold.getDate() - 3)
  return updatedAt < threshold
}

function isIncompleteVerificationTask(task: Task) {
  return task.checklistTotalCount > 0 && task.checklistCompletionCount < task.checklistTotalCount
}

function canUserEditTask(task: Task, user: { id: string; actorType: string; isSuperAdmin: boolean; roles: Array<{ key: string; name: string }> } | null) {
  if (!user || task.status === 'finalized') {
    return false
  }

  const isManagerLike = user.isSuperAdmin || user.roles.some((role) => {
    const key = role.key.toLowerCase()
    const name = role.name.toLowerCase()
    return key.includes('manager') || name.includes('manager')
  })

  if (user.actorType === 'admin' || isManagerLike) {
    return true
  }

  return task.assigneeId === user.id || task.creatorId === user.id || task.reviewAssignedTo === user.id
}

function isReviewerForTask(task: Task, user: { id: string } | null) {
  return Boolean(user && task.reviewAssignedTo === user.id)
}

function toTaskPayload(task: Task) {
  return {
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
  }
}

function TaskInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-border/60 bg-muted/10 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function ActivityItem({ item }: { item: TaskActivity }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/10 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{item.content}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.activityType.replace('_', ' ')}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{item.authorName ?? 'System'}</p>
          <p>{formatDateTime(item.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}

function ChecklistItemCard({ item }: { item: TaskChecklistItem }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/10 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <StatusBadge tone={item.isChecked ? 'active' : 'manual'}>{item.isChecked ? 'Checked' : 'Pending'}</StatusBadge>
            {item.isRequired ? <StatusBadge tone="featured">Required</StatusBadge> : <StatusBadge tone="manual">Optional</StatusBadge>}
          </div>
          <p className="text-xs text-muted-foreground">
            {item.checkedByName ? `Checked by ${item.checkedByName}` : 'Not checked yet'}
            {item.checkedAt ? ` on ${formatDateTime(item.checkedAt)}` : ''}
          </p>
          <p className="text-sm text-muted-foreground">{item.note?.trim() || 'No checklist note added.'}</p>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Step {item.sortOrder + 1}</p>
      </div>
    </div>
  )
}

export function TaskDetailPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { taskId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [commentSaving, setCommentSaving] = useState(false)
  const [actionSaving, setActionSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'details')

  useEffect(() => {
    let cancelled = false

    async function loadTask() {
      if (!taskId || !session?.accessToken) {
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMessage(null)

      try {
        const item = await getTask(session.accessToken, taskId)
        if (!cancelled) {
          setTask(item)
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
    return () => { cancelled = true }
  }, [session?.accessToken, taskId])

  useEffect(() => {
    if (!taskId || !session?.accessToken) {
      return
    }

    void markNotificationsReadByTask(session.accessToken, taskId).catch(() => null)
  }, [session?.accessToken, taskId])

  useEffect(() => {
    const nextTab = searchParams.get('tab') || 'details'
    setActiveTab(nextTab)
  }, [searchParams])

  const verificationStatus = task ? getVerificationStatus(task) : null
  const comments = useMemo(() => task?.activities.filter((item) => item.activityType === 'comment') ?? [], [task])
  const systemActivity = useMemo(() => task?.activities.filter((item) => item.activityType !== 'comment') ?? [], [task])
  const userCanEdit = task ? canUserEditTask(task, session?.user ?? null) : false
  const userIsReviewer = task ? isReviewerForTask(task, session?.user ?? null) : false
  const overdue = task ? isOverdueTask(task) : false
  const incomplete = task ? isIncompleteVerificationTask(task) : false
  const stuck = task ? isStuckTask(task) : false

  async function handleWorkflowAction(nextStatus: Task['status']) {
    if (!taskId || !task || !session?.accessToken) {
      return
    }

    setActionSaving(true)
    setErrorMessage(null)
    try {
      const nextTask = await updateTask(session.accessToken, taskId, {
        ...toTaskPayload(task),
        status: nextStatus,
      })
      setTask(nextTask)
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams)
        nextParams.set('tab', nextStatus === 'review' ? 'activity' : nextStatus === 'finalized' ? 'progress' : nextParams.get('tab') || 'details')
        return nextParams
      })
      showSavedToast({
        entityLabel: 'task',
        recordName: nextTask.title,
        referenceId: nextTask.id,
        mode: 'update',
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showFailedActionToast({ entityLabel: 'task', action: 'update', detail: message })
    } finally {
      setActionSaving(false)
    }
  }

  async function handleAddComment() {
    if (!taskId || !session?.accessToken || !commentDraft.trim()) {
      return
    }

    setCommentSaving(true)
    try {
      const nextTask = await addTaskActivity(session.accessToken, taskId, {
        activityType: 'comment',
        content: commentDraft.trim(),
      })
      setTask(nextTask)
      setCommentDraft('')
      showSavedToast({
        entityLabel: 'task comment',
        recordName: nextTask.title,
        referenceId: nextTask.id,
        mode: 'update',
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showFailedActionToast({ entityLabel: 'task comment', action: 'save', detail: message })
    } finally {
      setCommentSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="rounded-md border-border/70 shadow-none">
        <CardContent className="p-8 text-sm text-muted-foreground">Loading task record...</CardContent>
      </Card>
    )
  }

  if (!task) {
    return (
      <Card className="rounded-md border-border/70 shadow-none">
        <CardContent className="p-8 text-sm text-muted-foreground">{errorMessage ?? 'Task not found.'}</CardContent>
      </Card>
    )
  }

  const taskTabs: AnimatedContentTab[] = [
    {
      label: 'Details',
      value: 'details',
      content: (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
          <Card className="rounded-md border-border/70 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle>Task Details</CardTitle>
              <CardDescription>Read the instruction, linked entity, and execution context without changing the record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border/60 bg-muted/10 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Description</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{task.description?.trim() || 'No task description added yet.'}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <TaskInfoRow label="Entity Type" value={task.entityType ?? 'General'} />
                <TaskInfoRow label="Entity Label" value={task.entityLabel ?? task.entityId ?? 'Not linked'} />
                <TaskInfoRow label="Entity ID" value={task.entityId ?? 'Not linked'} />
                <TaskInfoRow label="Template" value={task.templateName ?? 'No template'} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-md border-border/70 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle>At A Glance</CardTitle>
                <CardDescription>Current ownership, timing, and review state.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <TaskInfoRow label="Status" value={task.status.replace('_', ' ')} />
                <TaskInfoRow label="Priority" value={task.priority} />
                <TaskInfoRow label="Assignee" value={task.assigneeName ?? 'Unassigned'} />
                <TaskInfoRow label="Reviewer" value={task.reviewAssignedToName ?? 'Not assigned'} />
                <TaskInfoRow label="Creator" value={task.creatorName} />
                <TaskInfoRow label="Due Date" value={formatDate(task.dueDate)} />
                <TaskInfoRow label="Tags" value={task.tags.length > 0 ? task.tags.join(', ') : 'No tags'} />
                <TaskInfoRow label="Verification Status" value={verificationStatus?.label ?? 'Not started'} />
              </CardContent>
            </Card>

            <Card className="rounded-md border-border/70 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle>Review</CardTitle>
                <CardDescription>Approval ownership and final sign-off details.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <TaskInfoRow label="Assigned Reviewer" value={task.reviewAssignedToName ?? 'Not assigned'} />
                <TaskInfoRow label="Reviewed By" value={task.reviewedByName ?? 'Not reviewed'} />
                <TaskInfoRow label="Reviewed At" value={task.reviewedAt ? formatDateTime(task.reviewedAt) : 'Not reviewed'} />
                <TaskInfoRow label="Review Comment" value={task.reviewComment?.trim() || 'No review comment added.'} />
              </CardContent>
            </Card>
          </div>
        </div>
      ),
      contentClassName: 'border-0 bg-transparent p-0 shadow-none',
    },
    {
      label: 'Activity',
      value: 'activity',
      content: (
        <Card className="rounded-md border-border/70 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle>Activity</CardTitle>
            <CardDescription>Status changes, assignments, and review actions for this record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No system activity recorded yet.</p>
            ) : systemActivity.map((item) => <ActivityItem key={item.id} item={item} />)}
          </CardContent>
        </Card>
      ),
      contentClassName: 'border-0 bg-transparent p-0 shadow-none',
    },
    {
      label: 'Comments',
      value: 'comments',
      content: (
        <div className="space-y-4">
          <Card className="rounded-md border-border/70 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle>Comments</CardTitle>
              <CardDescription>Use comments for working notes without editing the task record itself.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="task-comment">Add Comment</Label>
                <Textarea
                  id="task-comment"
                  rows={4}
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Add a comment for the task record."
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => { void handleAddComment() }} disabled={commentSaving || !commentDraft.trim()}>
                  {commentSaving ? 'Saving...' : 'Add Comment'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-border/70 shadow-none">
            <CardContent className="space-y-3 pt-6">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments added yet.</p>
              ) : comments.map((item) => <ActivityItem key={item.id} item={item} />)}
            </CardContent>
          </Card>
        </div>
      ),
      contentClassName: 'border-0 bg-transparent p-0 shadow-none',
    },
    {
      label: 'Attachments',
      value: 'attachments',
      content: (
        <Card className="rounded-md border-border/70 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle>Attachments</CardTitle>
            <CardDescription>Attachment handling can be added here without mixing it into the core task record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>No attachments have been added for this task yet.</p>
            <p>Use this tab for file evidence later instead of overloading comments or checklist notes.</p>
          </CardContent>
        </Card>
      ),
      contentClassName: 'border-0 bg-transparent p-0 shadow-none',
    },
    {
      label: 'Progress',
      value: 'progress',
      content: (
        <Card className="rounded-md border-border/70 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle>Progress</CardTitle>
            <CardDescription>Verification proof and checklist completion for this task.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone={verificationStatus?.tone ?? 'manual'}>{verificationStatus?.label ?? 'Not started'}</StatusBadge>
              <p className="text-sm text-muted-foreground">
                Checklist completion <span className="font-medium text-foreground">{task.checklistCompletionCount}/{task.checklistTotalCount}</span>
              </p>
            </div>
            {task.checklistItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No checklist items exist for this task.</p>
            ) : (
              <div className="space-y-3">
                {task.checklistItems.map((item) => <ChecklistItemCard key={item.id} item={item} />)}
              </div>
            )}
          </CardContent>
        </Card>
      ),
      contentClassName: 'border-0 bg-transparent p-0 shadow-none',
    },
  ]

  const contextualActions = [
    task.status === 'pending' && userCanEdit
      ? (
          <Button key="start" type="button" variant="outline" disabled={actionSaving} onClick={() => { void handleWorkflowAction('in_progress') }}>
            Start
          </Button>
        )
      : null,
    task.status === 'in_progress' && userCanEdit
      ? (
          <Button key="review" type="button" variant="outline" disabled={actionSaving} onClick={() => { void handleWorkflowAction('review') }}>
            Move To Review
          </Button>
        )
      : null,
    task.status === 'review' && userIsReviewer
      ? (
          <Button key="reject" type="button" variant="outline" disabled={actionSaving} onClick={() => { void handleWorkflowAction('in_progress') }}>
            Reject
          </Button>
        )
      : null,
    task.status === 'review' && userIsReviewer
      ? (
          <Button key="approve" type="button" disabled={actionSaving} onClick={() => { void handleWorkflowAction('finalized') }}>
            Finalize
          </Button>
        )
      : null,
  ].filter(Boolean)

  return (
    <div className="space-y-4 pt-1">
      <div className="sticky top-3 z-20 rounded-md border border-border/70 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-start">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" asChild className="-ml-3">
              <Link to="/admin/dashboard/task/tasks"><ArrowLeft className="size-4" />Back to tasks</Link>
            </Button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Task ID {task.id}</p>
                <StatusBadge tone={verificationStatus?.tone ?? 'manual'}>{verificationStatus?.label ?? 'Not started'}</StatusBadge>
                {overdue ? <StatusBadge tone="manual">Overdue</StatusBadge> : null}
                {incomplete ? <StatusBadge tone="featured">Incomplete</StatusBadge> : null}
                {stuck ? <StatusBadge tone="publishing">Stuck</StatusBadge> : null}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Read the task record, proof, and activity before making controlled changes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {userCanEdit ? (
              <Button type="button" variant="outline" onClick={() => { void navigate(`/admin/dashboard/task/tasks/${task.id}/edit`) }}>
                Edit
              </Button>
            ) : null}
            {contextualActions}
          </div>
        </div>
      </div>

      {errorMessage ? (
        <Card className="rounded-md border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="p-4 text-sm text-destructive">{errorMessage}</CardContent>
        </Card>
      ) : null}

      <Card className="rounded-md border-border/70 shadow-none">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <ClipboardList className="size-3.5" />
            Task Record
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={task.status === 'finalized' ? 'active' : task.status === 'review' ? 'featured' : task.status === 'in_progress' ? 'publishing' : 'manual'}>
              {task.status.replace('_', ' ')}
            </StatusBadge>
            <StatusBadge tone={task.priority === 'urgent' ? 'active' : task.priority === 'high' ? 'featured' : task.priority === 'medium' ? 'publishing' : 'manual'}>
              {task.priority}
            </StatusBadge>
            {task.tags.map((tag) => <StatusBadge key={tag} tone="manual">{tag}</StatusBadge>)}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><UserRound className="size-4" />{task.assigneeName ?? 'Unassigned'}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-4" />{formatDate(task.dueDate)}</span>
            <span className="inline-flex items-center gap-1.5"><Flag className="size-4" />{task.priority}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/70 shadow-none">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Progress</p>
            <p className="text-lg font-semibold text-foreground">{task.checklistCompletionCount} / {task.checklistTotalCount} completed</p>
            <p className="text-sm text-muted-foreground">Status signal stays visible without needing to open the progress tab.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={verificationStatus?.tone ?? 'manual'}>{verificationStatus?.label ?? 'Not started'}</StatusBadge>
            {incomplete ? <StatusBadge tone="featured">Incomplete verification</StatusBadge> : null}
            {task.reviewAssignedToName ? <StatusBadge tone="publishing">Reviewer {task.reviewAssignedToName}</StatusBadge> : null}
          </div>
        </CardContent>
      </Card>

      <AnimatedTabs
        defaultTabValue="details"
        selectedTabValue={activeTab}
        onTabChange={(value) => {
          setActiveTab(value)
          setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams)
            if (value === 'details') {
              nextParams.delete('tab')
            } else {
              nextParams.set('tab', value)
            }
            return nextParams
          })
        }}
        tabs={taskTabs}
      />
    </div>
  )
}
