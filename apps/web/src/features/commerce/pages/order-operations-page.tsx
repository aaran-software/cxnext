import type { CommerceOrderSummary } from '@shared/index'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PackageCheck, RefreshCcw, Search, ShieldAlert, Truck } from 'lucide-react'
import { CommonList, type CommonListColumn, type CommonListFilterOption } from '@/components/forms/CommonList'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/components/auth-provider'
import { HttpError, listCommerceOrders } from '@/shared/api/client'

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    const detail =
      error.context &&
      typeof error.context === 'object' &&
      'detail' in error.context &&
      typeof error.context.detail === 'string'
        ? error.context.detail
        : null

    return detail ? `${error.message} ${detail}` : error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to load order operations.'
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not recorded'
  }

  return new Date(value).toLocaleString()
}

function eventLabel(value: string) {
  return value.replaceAll('_', ' ')
}

function statusTone(value: string) {
  if (['delivered', 'delivery_confirmed', 'paid', 'issued'].includes(value)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }

  if (['cancelled'].includes(value)) {
    return 'border-rose-200 bg-rose-50 text-rose-800'
  }

  if (['pending_payment', 'draft', 'pending'].includes(value)) {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-sky-200 bg-sky-50 text-sky-800'
}

export function OrderOperationsPage() {
  const { session } = useAuth()
  const accessToken = session?.accessToken ?? null
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [orders, setOrders] = useState<CommerceOrderSummary[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'attention'>('all')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const filteredOrders = useMemo(() => {
    const search = searchValue.trim().toLowerCase()

    return orders.filter((item) => {
      const matchesSearch = !search
        || item.orderNumber.toLowerCase().includes(search)
        || item.customerName.toLowerCase().includes(search)
        || item.status.toLowerCase().includes(search)

      const matchesFilter = statusFilter === 'all'
        || (statusFilter === 'delivered' && ['delivered', 'delivery_confirmed'].includes(item.status))
        || (statusFilter === 'attention' && ['pending_payment', 'placed', 'preparing_delivery', 'packed', 'courier_assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(item.status))
        || (statusFilter === 'active' && !['delivered', 'delivery_confirmed', 'cancelled'].includes(item.status))

      return matchesSearch && matchesFilter
    })
  }, [orders, searchValue, statusFilter])

  const totals = useMemo(() => ({
    orders: orders.length,
    active: orders.filter((item) => !['delivered', 'delivery_confirmed', 'cancelled'].includes(item.status)).length,
    delivered: orders.filter((item) => ['delivered', 'delivery_confirmed'].includes(item.status)).length,
    revenue: orders.reduce((sum, item) => sum + item.totalAmount, 0),
  }), [orders])

  useEffect(() => {
    const token = accessToken
    if (typeof token !== 'string') {
      return
    }

    let cancelled = false

    async function loadOrders() {
      const authToken = token
      if (!authToken) {
        return
      }

      setLoading(true)
      setErrorMessage(null)

      try {
        const items = await listCommerceOrders(authToken)
        if (!cancelled) {
          setOrders(items)
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

    void loadOrders()

    return () => {
      cancelled = true
    }
  }, [accessToken])

  async function refreshOrders() {
    const token = accessToken
    if (typeof token !== 'string') {
      return
    }

    setRefreshing(true)
    setErrorMessage(null)

    try {
      setOrders(await listCommerceOrders(token))
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setRefreshing(false)
    }
  }

  if (session?.user.actorType !== 'admin' && session?.user.actorType !== 'staff') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>This operations board is available only for internal fulfillment teams.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const filters: CommonListFilterOption[] = [
    { key: 'all', label: 'All orders', isActive: statusFilter === 'all', onSelect: () => setStatusFilter('all') },
    { key: 'active', label: 'Active', isActive: statusFilter === 'active', onSelect: () => setStatusFilter('active') },
    { key: 'delivered', label: 'Delivered', isActive: statusFilter === 'delivered', onSelect: () => setStatusFilter('delivered') },
    { key: 'attention', label: 'Needs action', isActive: statusFilter === 'attention', onSelect: () => setStatusFilter('attention') },
  ]

  const columns: CommonListColumn<CommerceOrderSummary>[] = [
    {
      id: 'order',
      header: 'Order',
      sortable: true,
      accessor: (row) => row.orderNumber,
      cell: (row) => (
        <Link to={`/admin/dashboard/orders/${row.orderId}`} className="group block space-y-1 text-left">
          <div className="font-medium text-foreground transition-colors group-hover:text-primary">{row.orderNumber}</div>
          <div className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</div>
          <div className="pt-1 text-xs font-medium text-primary">Open order page</div>
        </Link>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      sortable: true,
      accessor: (row) => row.customerName,
      cell: (row) => <span className="text-sm text-foreground">{row.customerName}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={statusTone(row.status)}>{eventLabel(row.status)}</Badge>
          <Badge variant="outline" className={statusTone(row.paymentStatus)}>{eventLabel(row.paymentStatus)}</Badge>
        </div>
      ),
    },
    {
      id: 'shipment',
      header: 'Shipment',
      sortable: true,
      accessor: (row) => row.shipmentStatus ?? '',
      cell: (row) => <span className="text-sm text-muted-foreground">{row.shipmentStatus ? eventLabel(row.shipmentStatus) : 'Pending setup'}</span>,
    },
    {
      id: 'invoice',
      header: 'Invoice',
      sortable: true,
      accessor: (row) => row.invoiceStatus ?? '',
      cell: (row) => <span className="text-sm text-muted-foreground">{row.invoiceStatus ? eventLabel(row.invoiceStatus) : 'Not issued'}</span>,
    },
    {
      id: 'total',
      header: 'Total',
      sortable: true,
      accessor: (row) => row.totalAmount,
      cell: (row) => <span className="font-medium text-foreground">{formatCurrency(row.totalAmount, row.currency)}</span>,
    },
    {
      id: 'open',
      header: '',
      cell: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/dashboard/orders/${row.orderId}`}>
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
              <Badge className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]">Order operations</Badge>
              <CardDescription className="max-w-2xl text-sm leading-6">
                Search orders and open the workflow page for actions, shipment, invoice, and accounts.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => void refreshOrders()} disabled={loading || refreshing}>
              <RefreshCcw className="size-4" />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Orders</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{totals.orders}</p>
              <p className="mt-2 text-sm text-muted-foreground">Total storefront orders in the operations queue.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Active orders</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{totals.active}</p>
              <p className="mt-2 text-sm text-muted-foreground">Orders still moving through payment or delivery flow.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Delivered</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{totals.delivered}</p>
              <p className="mt-2 text-sm text-muted-foreground">Orders completed at courier or customer confirmation stage.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Order value</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{formatCurrency(totals.revenue, 'INR')}</p>
              <p className="mt-2 text-sm text-muted-foreground">Combined order total across the current operations list.</p>
            </div>
          </div>

          <CommonList
            header={{
              pageTitle: 'Order list',
              pageDescription: 'Open an order to review workflow control, shipment, invoice, and accounting.',
            }}
            search={{
              value: searchValue,
              onChange: setSearchValue,
              placeholder: 'Search order, customer, or status',
            }}
            filters={{
              buttonLabel: 'Order filters',
              options: filters,
              activeFilters: statusFilter === 'all' ? [] : [{ key: 'status', label: 'Status', value: statusFilter }],
              onClearAllFilters: () => setStatusFilter('all'),
              onRemoveFilter: () => setStatusFilter('all'),
            }}
            table={{
              columns,
              data: filteredOrders,
              loading,
              loadingMessage: 'Loading order operations...',
              emptyMessage: 'No orders match the current filter.',
              rowKey: (row) => row.orderId,
            }}
          />

          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            <div className="rounded-[1.35rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <PackageCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Order show page</p>
                  <p className="text-sm text-muted-foreground">Open a record for the full operations view.</p>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>Overview, line items, delivery address, payment state, and customer note.</p>
                <p>Workflow actions, shipment history, invoice rows, and accounting entries.</p>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Workflow flow</p>
                  <p className="text-sm text-muted-foreground">Keep actions structured and auditable.</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                <div className="rounded-[1rem] border border-border/70 bg-muted/20 px-4 py-3 text-sm">
                  Use the actions tab to update fulfillment, ETA, and tracking.
                </div>
                <div className="rounded-[1rem] border border-border/70 bg-muted/20 px-4 py-3 text-sm">
                  Review shipment, invoice, and accounts in separate clean sections.
                </div>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950">
              <div className="flex items-center gap-3">
                <ShieldAlert className="size-5" />
                <p className="font-semibold">Operations guidance</p>
              </div>
              <p className="mt-3 leading-6">
                Keep courier references, tracking updates, and invoice actions tied to the selected order record.
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Truck className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Quick open</p>
                  <p className="text-sm text-muted-foreground">Open recent operational cases.</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {filteredOrders.slice(0, 2).map((item) => (
                  <Link
                    key={item.orderId}
                    to={`/admin/dashboard/orders/${item.orderId}`}
                    className="block rounded-[1rem] border border-border/70 bg-muted/20 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <p className="font-medium text-foreground">{item.orderNumber}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.customerName}</p>
                  </Link>
                ))}
                {filteredOrders.length === 0 ? (
                  <div className="rounded-[1rem] border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">
                    No orders are available for quick-open suggestions.
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
