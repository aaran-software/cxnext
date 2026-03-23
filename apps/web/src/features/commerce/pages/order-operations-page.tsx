import type {
  CommerceOrderEvent,
  CommerceOrderEventType,
  CommerceOrderSummary,
  CommerceOrderWorkflow,
  CommerceShipmentEvent,
  CommerceWorkflowActionPayload,
} from '@shared/index'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  CalendarClock,
  CircleDot,
  CreditCard,
  PackageCheck,
  Printer,
  RefreshCcw,
  Truck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/components/auth-provider'
import {
  applyCommerceWorkflowAction,
  getCommerceInvoicePrint,
  getCommerceOrderWorkflow,
  HttpError,
  listCommerceOrders,
} from '@/shared/api/client'
import { showErrorToast, showInfoToast, showSuccessToast } from '@/shared/notifications/toast'

type ActionFormState = {
  courierName: string
  courierService: string
  trackingNumber: string
  trackingUrl: string
  locationName: string
  estimatedDeliveryAt: string
  notes: string
  description: string
}

const initialActionFormState: ActionFormState = {
  courierName: '',
  courierService: '',
  trackingNumber: '',
  trackingUrl: '',
  locationName: '',
  estimatedDeliveryAt: '',
  notes: '',
  description: '',
}

const quickActions: Array<{
  eventType: CommerceOrderEventType
  label: string
  description: string
}> = [
  { eventType: 'prepare_delivery', label: 'Prepare', description: 'Move the order into warehouse preparation.' },
  { eventType: 'packed', label: 'Pack', description: 'Mark the garments as packed for handover.' },
  { eventType: 'courier_assigned', label: 'Assign courier', description: 'Record the courier, service, and tracking references.' },
  { eventType: 'picked_up', label: 'Picked up', description: 'Record the pickup handover from warehouse to courier.' },
  { eventType: 'in_transit', label: 'In transit', description: 'Mark the parcel as moving through the carrier network.' },
  { eventType: 'out_for_delivery', label: 'Out for delivery', description: 'Mark the parcel as out with the delivery rider.' },
  { eventType: 'delivered', label: 'Delivered', description: 'Record the courier-side delivery completion.' },
  { eventType: 'delivery_confirmed', label: 'Customer confirmed', description: 'Capture final delivery confirmation from the customer.' },
]

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

  return 'Unable to complete this order operation.'
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

function statusTone(value: string) {
  if (['delivered', 'delivery_confirmed', 'paid'].includes(value)) {
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

function eventLabel(value: string) {
  return value.replaceAll('_', ' ')
}

function buildPayload(eventType: CommerceOrderEventType, values: ActionFormState): CommerceWorkflowActionPayload {
  return {
    eventType,
    courierName: values.courierName || undefined,
    courierService: values.courierService || undefined,
    trackingNumber: values.trackingNumber || undefined,
    trackingUrl: values.trackingUrl || undefined,
    locationName: values.locationName || undefined,
    estimatedDeliveryAt: values.estimatedDeliveryAt || undefined,
    notes: values.notes || undefined,
    description: values.description || undefined,
  }
}

function TimelineList({
  items,
  emptyText,
}: {
  items: Array<CommerceOrderEvent | CommerceShipmentEvent>
  emptyText: string
}) {
  if (items.length === 0) {
    return <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-background/50 px-4 py-5 text-sm text-muted-foreground">{emptyText}</div>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const timestamp = 'occurredAt' in item ? item.occurredAt : item.eventTime
        return (
          <div key={item.id} className="flex gap-3 rounded-[1.35rem] border border-border/70 bg-background/65 p-4">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <CircleDot className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{item.title}</p>
                <Badge variant="outline" className="capitalize">
                  {eventLabel(item.eventType)}
                </Badge>
              </div>
              {item.description ? (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              ) : null}
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {formatDate(timestamp)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function OrderOperationsPage() {
  const { session } = useAuth()
  const accessToken = session?.accessToken ?? null
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [workingAction, setWorkingAction] = useState<CommerceOrderEventType | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [orders, setOrders] = useState<CommerceOrderSummary[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [workflow, setWorkflow] = useState<CommerceOrderWorkflow | null>(null)
  const [actionValues, setActionValues] = useState<ActionFormState>(initialActionFormState)

  const selectedOrder = useMemo(
    () => orders.find((item) => item.orderId === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  )

  useEffect(() => {
    const token = accessToken
    if (typeof token !== 'string') {
      return
    }

    let cancelled = false

    async function loadInitialBoard() {
      const authToken = accessToken
      if (!authToken) {
        return
      }
      setLoading(true)
      setErrorMessage(null)

      try {
        const items = await listCommerceOrders(authToken)
        if (cancelled) {
          return
        }

        setOrders(items)
        const nextOrderId = selectedOrderId && items.some((item) => item.orderId === selectedOrderId)
          ? selectedOrderId
          : items[0]?.orderId ?? null
        setSelectedOrderId(nextOrderId)

        if (nextOrderId) {
          const nextWorkflow = await getCommerceOrderWorkflow(authToken, nextOrderId)
          if (!cancelled) {
            setWorkflow(nextWorkflow)
          }
        } else {
          setWorkflow(null)
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

    void loadInitialBoard()

    return () => {
      cancelled = true
    }
  }, [accessToken, selectedOrderId])

  async function refreshBoard(targetOrderId = selectedOrderId) {
    const token = accessToken
    if (typeof token !== 'string') {
      return
    }
    const authToken: string = token

    setRefreshing(true)
    setErrorMessage(null)

    try {
      const items = await listCommerceOrders(authToken)
      setOrders(items)

      const resolvedOrderId = targetOrderId && items.some((item) => item.orderId === targetOrderId)
        ? targetOrderId
        : items[0]?.orderId ?? null

      setSelectedOrderId(resolvedOrderId)

      if (resolvedOrderId) {
        setWorkflow(await getCommerceOrderWorkflow(authToken, resolvedOrderId))
      } else {
        setWorkflow(null)
      }
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setRefreshing(false)
    }
  }

  async function runAction(eventType: CommerceOrderEventType) {
    const token = accessToken
    if (typeof token !== 'string' || !selectedOrderId) {
      return
    }

    setWorkingAction(eventType)
    setErrorMessage(null)

    try {
      const nextWorkflow = await applyCommerceWorkflowAction(
        token,
        selectedOrderId,
        buildPayload(eventType, actionValues),
      )
      setWorkflow(nextWorkflow)
      await refreshBoard(selectedOrderId)
      showSuccessToast({
        title: 'Workflow updated',
        description: `${eventLabel(eventType)} recorded for ${nextWorkflow.order.orderNumber}.`,
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showErrorToast({
        title: 'Unable to update workflow',
        description: message,
      })
    } finally {
      setWorkingAction(null)
    }
  }

  async function handlePrintInvoice() {
    const token = accessToken
    if (typeof token !== 'string' || !selectedOrderId) {
      return
    }

    try {
      const document = await getCommerceInvoicePrint(token, selectedOrderId)
      const popup = window.open('', '_blank', 'noopener,noreferrer')
      if (!popup) {
        showInfoToast({
          title: 'Popup blocked',
          description: 'Allow popups to open the print-ready invoice preview.',
        })
        return
      }

      popup.document.open()
      popup.document.write(document.html)
      popup.document.close()
      popup.focus()
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showErrorToast({
        title: 'Unable to open invoice',
        description: message,
      })
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

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge>Order operations</Badge>
              <div>
                <CardTitle className="text-3xl">Fulfillment board for online orders</CardTitle>
                <CardDescription className="mt-2 max-w-3xl text-sm leading-6">
                  Keep order intake, warehouse handling, courier handoff, invoice readiness, and accounting visibility inside one audited workflow.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void refreshBoard()} disabled={refreshing || loading}>
                <RefreshCcw className="size-4" />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" onClick={() => void runAction('estimated_delivery_updated')} disabled={!selectedOrderId || workingAction !== null}>
                <CalendarClock className="size-4" />
                Update ETA
              </Button>
              <Button variant="outline" onClick={() => void runAction('tracking_updated')} disabled={!selectedOrderId || workingAction !== null}>
                <Truck className="size-4" />
                Update tracking
              </Button>
              <Button onClick={() => void handlePrintInvoice()} disabled={!workflow?.invoice}>
                <Printer className="size-4" />
                Print invoice
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-xl">Order queue</CardTitle>
              <CardDescription>Recent storefront orders with live workflow state, invoice state, and shipment readiness.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-background/55 px-4 py-5 text-sm text-muted-foreground">
                  Loading order operations board.
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-background/55 px-4 py-5 text-sm text-muted-foreground">
                  No storefront orders are available yet.
                </div>
              ) : (
                orders.map((item) => {
                  const active = item.orderId === selectedOrderId
                  return (
                    <button
                      key={item.orderId}
                      type="button"
                      onClick={() => setSelectedOrderId(item.orderId)}
                      className={`w-full rounded-[1.4rem] border p-4 text-left transition ${
                        active
                          ? 'border-primary bg-accent/30 shadow-sm'
                          : 'border-border/70 bg-background/60 hover:bg-accent/15'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{item.orderNumber}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.customerName}</p>
                        </div>
                        <Badge variant="outline" className={statusTone(item.status)}>
                          {eventLabel(item.status)}
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between gap-4">
                          <span>Shipment</span>
                          <span className="font-medium text-foreground">{item.shipmentStatus ? eventLabel(item.shipmentStatus) : 'Pending setup'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span>Invoice</span>
                          <span className="font-medium text-foreground">{item.invoiceStatus ? eventLabel(item.invoiceStatus) : 'Not issued'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span>Total</span>
                          <span className="font-medium text-foreground">{formatCurrency(item.totalAmount, item.currency)}</span>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {workflow ? (
              <>
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <Card className="border-border/70">
                    <CardHeader>
                      <CardTitle className="text-xl">Order control</CardTitle>
                      <CardDescription>
                        Operate the fulfillment lifecycle from intake to final customer confirmation for {workflow.order.orderNumber}.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-[1.2rem] border border-border/70 bg-background/60 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Order</p>
                          <div className="mt-3">
                            <Badge variant="outline" className={statusTone(workflow.order.status)}>
                              {eventLabel(workflow.order.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="rounded-[1.2rem] border border-border/70 bg-background/60 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Shipment</p>
                          <div className="mt-3">
                            <Badge variant="outline" className={statusTone(workflow.shipment?.status ?? 'pending')}>
                              {eventLabel(workflow.shipment?.status ?? 'pending')}
                            </Badge>
                          </div>
                        </div>
                        <div className="rounded-[1.2rem] border border-border/70 bg-background/60 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Invoice</p>
                          <div className="mt-3">
                            <Badge variant="outline" className={statusTone(workflow.invoice?.status ?? 'draft')}>
                              {eventLabel(workflow.invoice?.status ?? 'draft')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {quickActions.map((action) => (
                          <button
                            key={action.eventType}
                            type="button"
                            onClick={() => void runAction(action.eventType)}
                            disabled={workingAction !== null}
                            className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4 text-left transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <p className="font-medium text-foreground">{action.label}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.description}</p>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/70">
                    <CardHeader>
                      <CardTitle className="text-xl">Dispatch details</CardTitle>
                      <CardDescription>
                        Use the same data block for courier assignment, ETA changes, and tracking refresh actions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="order-courier-name">Courier name</Label>
                        <Input
                          id="order-courier-name"
                          value={actionValues.courierName}
                          onChange={(event) => setActionValues((current) => ({ ...current, courierName: event.target.value }))}
                          placeholder="Delhivery, Blue Dart, DTDC"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="order-courier-service">Courier service</Label>
                        <Input
                          id="order-courier-service"
                          value={actionValues.courierService}
                          onChange={(event) => setActionValues((current) => ({ ...current, courierService: event.target.value }))}
                          placeholder="Surface, air, express"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="order-tracking-number">Tracking number</Label>
                        <Input
                          id="order-tracking-number"
                          value={actionValues.trackingNumber}
                          onChange={(event) => setActionValues((current) => ({ ...current, trackingNumber: event.target.value }))}
                          placeholder="AWB / tracking reference"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="order-location">Current location</Label>
                        <Input
                          id="order-location"
                          value={actionValues.locationName}
                          onChange={(event) => setActionValues((current) => ({ ...current, locationName: event.target.value }))}
                          placeholder="Tiruppur hub, Chennai, customer city"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="order-tracking-url">Tracking URL</Label>
                        <Input
                          id="order-tracking-url"
                          value={actionValues.trackingUrl}
                          onChange={(event) => setActionValues((current) => ({ ...current, trackingUrl: event.target.value }))}
                          placeholder="https://courier.example/track/..."
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="order-eta">Estimated delivery</Label>
                        <Input
                          id="order-eta"
                          type="datetime-local"
                          value={actionValues.estimatedDeliveryAt}
                          onChange={(event) => setActionValues((current) => ({ ...current, estimatedDeliveryAt: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="order-action-description">Event description</Label>
                        <Textarea
                          id="order-action-description"
                          value={actionValues.description}
                          onChange={(event) => setActionValues((current) => ({ ...current, description: event.target.value }))}
                          placeholder="Operator note for the next event."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="order-action-notes">Shipment notes</Label>
                        <Textarea
                          id="order-action-notes"
                          value={actionValues.notes}
                          onChange={(event) => setActionValues((current) => ({ ...current, notes: event.target.value }))}
                          placeholder="Permanent notes stored on the shipment record."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="timeline" className="space-y-4">
                  <TabsList className="flex w-full flex-wrap justify-start gap-2 rounded-[1.2rem] border border-border/70 bg-background/60 p-2">
                    <TabsTrigger value="timeline">Order timeline</TabsTrigger>
                    <TabsTrigger value="shipment">Shipment</TabsTrigger>
                    <TabsTrigger value="invoice">Invoice</TabsTrigger>
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="timeline" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Workflow timeline</CardTitle>
                        <CardDescription>Every state transition is recorded as an explicit backend event for audit and support traceability.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TimelineList items={workflow.events} emptyText="No order events have been recorded yet." />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="shipment" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="size-5" />
                          Shipment tracking
                        </CardTitle>
                        <CardDescription>Courier references, promised dates, and parcel event scans live together here.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                        <div className="space-y-3">
                          <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Shipment number</p>
                            <p className="mt-2 font-semibold text-foreground">{workflow.shipment?.shipmentNumber ?? 'Not created'}</p>
                          </div>
                          <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Courier</p>
                            <p className="mt-2 text-foreground">{workflow.shipment?.courierName ?? 'Not assigned'}</p>
                            <p className="text-sm text-muted-foreground">{workflow.shipment?.courierService ?? 'No service selected'}</p>
                          </div>
                          <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tracking</p>
                            <p className="mt-2 text-foreground">{workflow.shipment?.trackingNumber ?? 'No tracking number'}</p>
                            {workflow.shipment?.trackingUrl ? (
                              <a
                                href={workflow.shipment.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-sm text-accent underline-offset-4 hover:underline"
                              >
                                Open tracking
                                <ArrowUpRight className="size-4" />
                              </a>
                            ) : null}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4 text-sm">
                              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Picked up</p>
                              <p className="mt-2 text-foreground">{formatDate(workflow.shipment?.pickedUpAt ?? null)}</p>
                            </div>
                            <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4 text-sm">
                              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">ETA</p>
                              <p className="mt-2 text-foreground">{formatDate(workflow.shipment?.estimatedDeliveryAt ?? null)}</p>
                            </div>
                          </div>
                        </div>
                        <TimelineList items={workflow.shipmentEvents} emptyText="Shipment events will appear here once fulfillment begins." />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="invoice" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PackageCheck className="size-5" />
                          Invoice and order lines
                        </CardTitle>
                        <CardDescription>Sales invoice child rows are generated from storefront order items and stay linked to the order.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {workflow.invoice ? (
                          (() => {
                            const invoice = workflow.invoice
                            return <>
                            <div className="grid gap-3 md:grid-cols-4">
                              <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Invoice</p>
                                <p className="mt-2 font-semibold text-foreground">{invoice.invoiceNumber}</p>
                              </div>
                              <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Status</p>
                                <div className="mt-2">
                                  <Badge variant="outline" className={statusTone(invoice.status)}>
                                    {eventLabel(invoice.status)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Payment</p>
                                <p className="mt-2 font-semibold text-foreground">{eventLabel(invoice.paymentStatus)}</p>
                              </div>
                              <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total</p>
                                <p className="mt-2 font-semibold text-foreground">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {invoice.items.map((item) => (
                                <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                                  <div>
                                    <p className="font-medium text-foreground">{item.description}</p>
                                    <p className="text-sm text-muted-foreground">Qty {item.quantity} x {formatCurrency(item.unitPrice, invoice.currency)}</p>
                                  </div>
                                  <p className="font-semibold text-foreground">{formatCurrency(item.lineTotal, invoice.currency)}</p>
                                </div>
                              ))}
                            </div>
                          </>
                          })()
                        ) : (
                          <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-background/55 px-4 py-5 text-sm text-muted-foreground">
                            Invoice has not been created for this order.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="accounts" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="size-5" />
                          Accounting postings
                        </CardTitle>
                        <CardDescription>Each order can generate a linked voucher so sales and collection flows remain auditable.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {workflow.accountingVouchers.length > 0 ? workflow.accountingVouchers.map((voucher) => (
                          <div key={voucher.id} className="rounded-[1.35rem] border border-border/70 bg-background/60 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-foreground">{voucher.voucherNumber}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{voucher.voucherType} · Posted {formatDate(voucher.postingDate)}</p>
                              </div>
                              <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-800">
                                {eventLabel(voucher.voucherType)}
                              </Badge>
                            </div>
                            <div className="mt-4 space-y-3">
                              {voucher.lines.map((line) => (
                                <div key={line.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.1rem] border border-border/70 bg-background/70 px-4 py-3 text-sm">
                                  <div>
                                    <p className="font-medium text-foreground">{line.ledgerName}</p>
                                    <p className="text-muted-foreground">{line.ledgerCode}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-foreground">Dr {line.debitAmount.toFixed(2)}</p>
                                    <p className="text-muted-foreground">Cr {line.creditAmount.toFixed(2)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-background/55 px-4 py-5 text-sm text-muted-foreground">
                            Accounting voucher is not posted yet for this order.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Order details</CardTitle>
                  <CardDescription>Select an order from the left queue to open its workflow board.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedOrder ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm">
            <div>
              <p className="font-medium text-foreground">{selectedOrder.orderNumber}</p>
              <p className="text-muted-foreground">Created {formatDate(selectedOrder.createdAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={statusTone(selectedOrder.status)}>
                {eventLabel(selectedOrder.status)}
              </Badge>
              <Badge variant="outline" className={statusTone(selectedOrder.paymentStatus)}>
                {eventLabel(selectedOrder.paymentStatus)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{errorMessage}</CardContent>
        </Card>
      ) : null}
    </div>
  )
}
