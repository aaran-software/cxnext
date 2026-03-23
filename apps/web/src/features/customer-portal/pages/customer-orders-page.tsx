import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/features/store/lib/storefront-utils'
import { describeCustomerOrder, getCustomerPaymentLabel, useCustomerOrders } from '../lib/customer-orders'

export function CustomerOrdersPage() {
  const { orders, isLoading, errorMessage } = useCustomerOrders()

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="gap-4 border-b border-border/60 p-8">
          <Badge className="w-fit">Orders</Badge>
          <div className="space-y-3">
            <CardTitle className="text-4xl tracking-tight sm:text-5xl">Your live order history.</CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Review placed storefront orders, payment status, totals, and delivery details without leaving the customer portal.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {errorMessage ? (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{errorMessage}</CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading orders...</CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">No storefront orders are linked to your account yet.</p>
            <Button asChild>
              <Link to="/search">Start shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
                  <CardDescription className="mt-2">{describeCustomerOrder(order)}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{order.status}</Badge>
                  <Badge variant="outline">{order.paymentStatus}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Placed</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Payment</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{getCustomerPaymentLabel(order)}</p>
                </div>
                <div className="rounded-xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Items</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{order.items.reduce((total, item) => total + item.quantity, 0)}</p>
                </div>
                <div className="rounded-xl border border-border/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                    <div>
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.size} / {item.color} / Qty {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-foreground">{formatCurrency(item.lineTotal)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.25rem] border border-border/70 bg-background/55 p-4 text-sm text-muted-foreground">
                Delivering to {order.firstName} {order.lastName}, {order.addressLine1}, {order.city}, {order.state} {order.postalCode}, {order.country}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
