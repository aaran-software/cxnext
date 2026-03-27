export interface CoreWorkspaceItem {
  id: string
  name: string
  route: string
  summary: string
}

export const coreWorkspaceItems: CoreWorkspaceItem[] = [
  {
    id: 'overview',
    name: 'Core Overview',
    route: '/admin/dashboard/core',
    summary: 'Shared organization, master-data, and admin operating surface.',
  },
  {
    id: 'companies',
    name: 'Companies',
    route: '/admin/dashboard/companies',
    summary: 'Company-level setup and organization records.',
  },
  {
    id: 'contacts',
    name: 'Contacts',
    route: '/admin/dashboard/contacts',
    summary: 'Shared contact and party management.',
  },
  {
    id: 'media',
    name: 'Media',
    route: '/admin/dashboard/media',
    summary: 'Shared storage-backed media and file management.',
  },
  {
    id: 'common-modules',
    name: 'Common Modules',
    route: '/admin/dashboard/common',
    summary: 'Geography and reusable master data shared across apps.',
  },
  {
    id: 'settings',
    name: 'Settings',
    route: '/admin/dashboard/settings',
    summary: 'Shared system configuration and admin-level controls.',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    route: '/admin/dashboard/tasks',
    summary: 'Manage your workload, assign tasks, and track organization progress.',
  },
]
