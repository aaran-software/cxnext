import type { CustomerHelpdeskSummary } from '@shared/index'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CircleUserRound, RefreshCcw, Search, ShieldAlert, ShoppingBag } from 'lucide-react'
import { CommonList, type CommonListColumn, type CommonListFilterOption } from '@/components/forms/CommonList'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/components/auth-provider'
import { HttpError, listCustomerHelpdeskCustomers } from '@/shared/api/client'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(value: string | null) {
  if (!value) {
    return 'No tracked order yet'
  }

  return new Date(value).toLocaleString()
}

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to load the customer helpdesk list.'
}

export function CustomerHelpdeskPage() {
  const { session } = useAuth()
  const token = session?.accessToken ?? null
  const [items, setItems] = useState<CustomerHelpdeskSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'attention'>('all')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    const search = searchValue.trim().toLowerCase()

    return items.filter((item) => {
      const matchesSearch = !search
        || item.displayName.toLowerCase().includes(search)
        || item.email.toLowerCase().includes(search)
        || (item.phoneNumber ?? '').toLowerCase().includes(search)
        || (item.lastOrderNumber ?? '').toLowerCase().includes(search)

      const matchesFilter = statusFilter === 'all'
        || (statusFilter === 'active' && item.isActive)
        || (statusFilter === 'disabled' && !item.isActive)
        || (statusFilter === 'attention' && item.issueCount > 0)

      return matchesSearch && matchesFilter
    })
  }, [items, searchValue, statusFilter])

  const totals = useMemo(() => ({
    customers: items.length,
    activeCustomers: items.filter((item) => item.isActive).length,
    attentionCustomers: items.filter((item) => item.issueCount > 0).length,
    orders: items.reduce((total, item) => total + item.orderCount, 0),
  }), [items])

  useEffect(() => {
    const accessToken = token
    if (!accessToken || (session?.user.actorType !== 'admin' && session?.user.actorType !== 'staff')) {
      return
    }

    let cancelled = false

    async function loadList() {
      const authToken = accessToken
      if (!authToken) {
        return
      }

      setLoading(true)
      setErrorMessage(null)

      try {
        const nextItems = await listCustomerHelpdeskCustomers(authToken)
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

    void loadList()

    return () => {
      cancelled = true
    }
  }, [session?.user.actorType, token])

  async function refreshList() {
    if (!token) {
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      setItems(await listCustomerHelpdeskCustomers(token))
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  if (session?.user.actorType !== 'admin' && session?.user.actorType !== 'staff') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer helpdesk</CardTitle>
          <CardDescription>This workspace is available only to internal support and operations users.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const filters: CommonListFilterOption[] = [
    { key: 'all', label: 'All customers', isActive: statusFilter === 'all', onSelect: () => setStatusFilter('all') },
    { key: 'active', label: 'Active', isActive: statusFilter === 'active', onSelect: () => setStatusFilter('active') },
    { key: 'disabled', label: 'Disabled', isActive: statusFilter === 'disabled', onSelect: () => setStatusFilter('disabled') },
    { key: 'attention', label: 'Needs attention', isActive: statusFilter === 'attention', onSelect: () => setStatusFilter('attention') },
  ]

  const columns: CommonListColumn<CustomerHelpdeskSummary>[] = [
    {
      id: 'customer',
      header: 'Customer',
      sortable: true,
      accessor: (row) => row.displayName,
      cell: (row) => (
        <Link to={`/admin/dashboard/customers/${row.id}`} className="group block space-y-1 text-left">
          <div className="font-medium text-foreground transition-colors group-hover:text-primary">{row.displayName}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
          <div className="pt-1 text-xs font-medium text-primary">Open customer page</div>
        </Link>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => row.isActive,
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{row.isActive ? 'active' : 'disabled'}</Badge>
          {row.issueCount > 0 ? <Badge variant="outline">{row.issueCount} issues</Badge> : null}
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'Mobile',
      cell: (row) => <span className="text-sm text-muted-foreground">{row.phoneNumber ?? 'Not available'}</span>,
    },
    {
      id: 'orders',
      header: 'Orders',
      sortable: true,
      accessor: (row) => row.orderCount,
      cell: (row) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{row.orderCount}</div>
          <div className="text-xs text-muted-foreground">{formatCurrency(row.totalSpent)}</div>
        </div>
      ),
    },
    {
      id: 'last-order',
      header: 'Latest order',
      sortable: true,
      accessor: (row) => row.lastOrderAt ?? '',
      cell: (row) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{row.lastOrderNumber ?? 'No order yet'}</div>
          <div className="text-xs text-muted-foreground">{formatDate(row.lastOrderAt)}</div>
        </div>
      ),
    },
    {
      id: 'open',
      header: '',
      cell: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/dashboard/customers/${row.id}`}>
              Open
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden border-border/60 shadow-none">
        <CardHeader className="border-b border-border/60 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]">Customer helpdesk</Badge>
              <CardDescription className="max-w-2xl text-sm leading-6">
                Search customers and open the support page for orders, addresses, recovery, and verification.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => void refreshList()} disabled={loading}>
              <RefreshCcw className="size-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Customers</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{totals.customers}</p>
              <p className="mt-2 text-sm text-muted-foreground">Total records available to support staff.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Active accounts</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{totals.activeCustomers}</p>
              <p className="mt-2 text-sm text-muted-foreground">Customers who can still sign in normally.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Needs attention</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{totals.attentionCustomers}</p>
              <p className="mt-2 text-sm text-muted-foreground">Accounts with recovery, address, or order flags.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Orders tracked</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{totals.orders}</p>
              <p className="mt-2 text-sm text-muted-foreground">Combined storefront orders across helpdesk customers.</p>
            </div>
          </div>

          <CommonList
            header={{
              pageTitle: 'Customer list',
              pageDescription: 'Open a customer to review the full support record.',
            }}
            search={{
              value: searchValue,
              onChange: setSearchValue,
              placeholder: 'Search customer, email, phone, or latest order',
            }}
            filters={{
              buttonLabel: 'Customer filters',
              options: filters,
              activeFilters: statusFilter === 'all' ? [] : [{ key: 'status', label: 'Status', value: statusFilter }],
              onClearAllFilters: () => setStatusFilter('all'),
              onRemoveFilter: () => setStatusFilter('all'),
            }}
            table={{
              columns,
              data: filteredItems,
              loading,
              loadingMessage: 'Loading customer helpdesk records...',
              emptyMessage: 'No customers match the current helpdesk search.',
              rowKey: (row) => row.id,
            }}
          />

          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            <div className="rounded-[1.35rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CircleUserRound className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Customer show page</p>
                  <p className="text-sm text-muted-foreground">Open a record for the full support view.</p>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>Identity, account status, recovery window, and saved profile data.</p>
                <p>Orders, delivery mismatches, and verification history.</p>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Call flow</p>
                  <p className="text-sm text-muted-foreground">Use saved records instead of credentials.</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                <div className="rounded-[1rem] border border-border/70 bg-muted/20 px-4 py-3 text-sm">
                  Verify mobile, email, and address details already on file.
                </div>
                <div className="rounded-[1rem] border border-border/70 bg-muted/20 px-4 py-3 text-sm">
                  Confirm order number, delivery destination, and item mismatch details.
                </div>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950">
              <div className="flex items-center gap-3">
                <ShieldAlert className="size-5" />
                <p className="font-semibold">Support guidance</p>
              </div>
              <p className="mt-3 leading-6">
                Ask the customer to confirm known data points and order facts. Do not request the current password.
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingBag className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Last order focus</p>
                  <p className="text-sm text-muted-foreground">Open recent cases quickly.</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {filteredItems.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    to={`/admin/dashboard/customers/${item.id}`}
                    className="block rounded-[1rem] border border-border/70 bg-muted/20 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <p className="font-medium text-foreground">{item.displayName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.lastOrderNumber ?? 'No order yet'}</p>
                  </Link>
                ))}
                {filteredItems.length === 0 ? (
                  <div className="rounded-[1rem] border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">
                    No customer records are available for quick-open suggestions.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-[1.25rem] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
