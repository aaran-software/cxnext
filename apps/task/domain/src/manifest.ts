export interface TaskWorkspaceItem {
  id: string
  name: string
  route: string
  summary: string
}

export const taskWorkspaceItems: TaskWorkspaceItem[] = [
  {
    id: 'overview',
    name: 'Task Overview',
    route: '/admin/dashboard/task',
    summary: 'Checklist-driven verification, assignment, and follow-through workspace.',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    route: '/admin/dashboard/task/tasks',
    summary: 'Manage assigned work, linked entity tasks, and verification queues.',
  },
  {
    id: 'templates',
    name: 'Templates',
    route: '/admin/dashboard/task/templates',
    summary: 'Control reusable task logic, checklist rules, and scope-specific verification templates.',
  },
  {
    id: 'bulk',
    name: 'Bulk Generator',
    route: '/admin/dashboard/task/bulk',
    summary: 'Generate template-backed product tasks in batches using category and tag filters.',
  },
  {
    id: 'insights',
    name: 'Insights',
    route: '/admin/dashboard/task/insights',
    summary: 'Operational command view for workload, urgency, and derived task signals.',
  },
  {
    id: 'audit',
    name: 'Audit',
    route: '/admin/dashboard/task/audit',
    summary: 'Filterable proof-focused task table exposing incomplete verification and overdue execution.',
  },
]
