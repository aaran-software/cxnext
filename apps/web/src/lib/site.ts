import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BadgeIndianRupee,
  Boxes,
  Building2,
  Contact2,
  CreditCard,
  LayoutDashboard,
  PackageCheck,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react'

export type AccentTheme = 'neutral' | 'orange' | 'blue' | 'purple'
export type ColorMode = 'light' | 'dark' | 'system'

export const publicNavigation = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Dashboard', href: '/dashboard' },
]

export const modeOptions: { value: ColorMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export const accentOptions: { value: AccentTheme; label: string }[] = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'orange', label: 'Orange' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
]

export interface SidebarGroup {
  title: string
  items: {
    title: string
    href: string
    icon: LucideIcon
    badge?: string
  }[]
}

export const dashboardSidebar: SidebarGroup[] = [
  {
    title: 'Operate',
    items: [
      { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Orders', href: '/dashboard/orders', icon: ReceiptText, badge: '24' },
      { title: 'Inventory', href: '/dashboard/inventory', icon: Boxes },
      { title: 'Logistics', href: '/dashboard/logistics', icon: Truck },
    ],
  },
  {
    title: 'Finance',
    items: [
      { title: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { title: 'Cash Flow', href: '/dashboard/cash-flow', icon: BadgeIndianRupee },
      { title: 'Compliance', href: '/dashboard/compliance', icon: ShieldCheck },
    ],
  },
  {
    title: 'Admin',
    items: [
      { title: 'Workspace', href: '/dashboard/workspace', icon: Building2 },
      { title: 'Teams', href: '/dashboard/teams', icon: Users },
      { title: 'Settings', href: '/dashboard/settings', icon: Settings2 },
    ],
  },
]

export const dashboardStats = [
  { label: 'Open orders', value: '124', delta: '+18% this week' },
  { label: 'Ready to dispatch', value: '39', delta: '8 high priority' },
  { label: 'Receivables due', value: 'Rs. 8.4L', delta: '12 invoices this week' },
  { label: 'Stock alerts', value: '07', delta: '2 severe shortages' },
]

export const workspaceSignals = [
  {
    title: 'Cash and collections',
    summary: 'Collections are on plan, but two enterprise accounts need follow-up before month end.',
    icon: Activity,
  },
  {
    title: 'Catalog health',
    summary: 'Three fast-moving SKUs have less than six days of cover across western warehouses.',
    icon: PackageCheck,
  },
  {
    title: 'CRM handoff',
    summary: 'New distributor leads need qualification rules before they move into quotes and invoicing.',
    icon: Contact2,
  },
]
