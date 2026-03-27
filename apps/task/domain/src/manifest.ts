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
]
