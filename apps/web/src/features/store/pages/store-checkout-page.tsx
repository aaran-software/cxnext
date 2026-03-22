import { useEffect, useMemo, useState } from "react"
import { CheckCircle2Icon, CreditCardIcon, LoaderCircleIcon, MapPinIcon, TruckIcon } from "lucide-react"
import { Link } from "react-router-dom"

import type {
  StorefrontDeliveryMethod,
  StorefrontOrder,
  StorefrontPaymentMethod,
  StorefrontRazorpayCheckoutSession,
} from "@/features/store/types/storefront"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/components/auth-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStorefront } from "@/features/store/context/storefront-context"
import { formatCurrency, getPrimaryProductImage } from "@/features/store/lib/storefront-utils"
import { createStorefrontCheckout, HttpError, verifyStorefrontPayment } from "@/shared/api/client"
import { showFailedActionToast, showSuccessToast, showWarningToast } from "@/shared/notifications/toast"

type CheckoutFormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  postalCode: string
  note: string
  deliveryMethod: StorefrontDeliveryMethod
  paymentMethod: StorefrontPaymentMethod
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayFailureResponse = {
  error?: {
    description?: string
  }
}

type RazorpayCheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  image?: string
  order_id: string
  method?: "upi" | "card" | "wallet" | "netbanking" | "cod"
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  readonly?: {
    name?: boolean
    email?: boolean
    contact?: boolean
  }
  hidden?: {
    email?: boolean
    contact?: boolean
  }
  config?: {
    display: {
      blocks: Record<
        string,
        {
          name: string
          instruments: Array<{ method: "upi" | "wallet" | "card" }>
        }
      >
      sequence: string[]
      preferences: {
        show_default_blocks: boolean
      }
    }
  }
  theme?: {
    color?: string
  }
  modal?: {
    confirm_close?: boolean
    ondismiss?: () => void
  }
  handler: (response: RazorpaySuccessResponse) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void
      on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void
    }
  }
}

let razorpayScriptPromise: Promise<void> | null = null

function normalizeRazorpayContact(phone: string, country: string) {
  const trimmed = phone.trim()
  if (!trimmed) {
    return undefined
  }

  const normalized = trimmed.startsWith("+")
    ? `+${trimmed.slice(1).replace(/\D/g, "")}`
    : trimmed.replace(/\D/g, "")

  if (!normalized || normalized === "+") {
    return undefined
  }

  if (normalized.startsWith("+")) {
    return normalized
  }

  if (country.trim().toLowerCase() === "india" && normalized.length === 10) {
    return `+91${normalized}`
  }

  return `+${normalized}`
}

function getRazorpayDisplayConfig(paymentMethod: StorefrontPaymentMethod): RazorpayCheckoutOptions["config"] | undefined {
  if (paymentMethod === "cod") {
    return undefined
  }

  if (paymentMethod === "card") {
    return {
      display: {
        blocks: {
          cards_only: {
            name: "Pay via card",
            instruments: [{ method: "card" }],
          },
        },
        sequence: ["block.cards_only"],
        preferences: {
          show_default_blocks: false,
        },
      },
    }
  }

  return {
    display: {
      blocks: {
        instant_payments: {
          name: "Pay via UPI or wallet",
          instruments: [{ method: "upi" }, { method: "wallet" }],
        },
      },
      sequence: ["block.instant_payments"],
      preferences: {
        show_default_blocks: false,
      },
    },
  }
}

function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout can only load in the browser."))
  }

  if (window.Razorpay) {
    return Promise.resolve()
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise
  }

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true })
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Razorpay Checkout.")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Razorpay Checkout."))
    document.body.appendChild(script)
  }).catch((error) => {
    razorpayScriptPromise = null
    throw error
  })

  return razorpayScriptPromise
}

async function openRazorpayCheckout(
  session: StorefrontRazorpayCheckoutSession,
  values: CheckoutFormValues,
  storefrontOrderId: string,
) {
  await loadRazorpayCheckoutScript()

  if (!window.Razorpay) {
    throw new Error("Razorpay Checkout is unavailable in this browser session.")
  }

  return new Promise<StorefrontOrder>((resolve, reject) => {
    const prefillContact = normalizeRazorpayContact(values.phone, values.country)
    const razorpay = new window.Razorpay({
      key: session.keyId,
      amount: session.amount,
      currency: session.currency,
      name: session.name,
      description: session.description ?? undefined,
      image: session.image ?? undefined,
      order_id: session.orderId,
      method: values.paymentMethod === "card" ? "card" : values.paymentMethod === "upi" ? "upi" : undefined,
      prefill: {
        name: session.prefillName ?? undefined,
        email: session.prefillEmail ?? undefined,
        contact: prefillContact ?? session.prefillContact ?? undefined,
      },
      readonly: {
        name: true,
        email: true,
        contact: true,
      },
      hidden: {
        email: false,
        contact: false,
      },
      config: getRazorpayDisplayConfig(values.paymentMethod),
      theme: session.themeColor ? { color: session.themeColor } : undefined,
      modal: {
        confirm_close: true,
        ondismiss: () => reject(new Error("Payment cancelled before completion.")),
      },
      handler: async (response) => {
        try {
          const order = await verifyStorefrontPayment({
            storefrontOrderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          resolve(order)
        } catch (error) {
          reject(error)
        }
      },
    })

    razorpay.on("payment.failed", (response) => {
      reject(new Error(response.error?.description ?? "Razorpay payment failed."))
    })

    razorpay.open()
  })
}

const defaultFormValues: CheckoutFormValues = {
  firstName: "Sundar",
  lastName: "Raj",
  email: "sundar@cxnext.app",
  phone: "+91 98765 43210",
  addressLine1: "27 Residency Road",
  addressLine2: "",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  postalCode: "560025",
  note: "",
  deliveryMethod: "standard",
  paymentMethod: "upi",
}

function splitDisplayName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: "", lastName: "" }
  }

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  }
}

const deliveryOptions: Array<{ value: StorefrontDeliveryMethod; label: string; detail: string }> = [
  { value: "standard", label: "Standard delivery", detail: "3-5 business days. Free over INR 5,000." },
  { value: "priority", label: "Priority delivery", detail: "1-2 business days. INR 299." },
  { value: "signature", label: "Signature packaging", detail: "Occasion-ready packaging with premium handoff." },
]

const paymentOptions: Array<{ value: StorefrontPaymentMethod; label: string; detail: string }> = [
  { value: "upi", label: "UPI / Wallet", detail: "Opens Razorpay Checkout with UPI and wallet payment methods." },
  { value: "card", label: "Credit or debit card", detail: "Opens Razorpay Checkout and completes payment before confirmation." },
  { value: "cod", label: "Cash on delivery", detail: "Skip online payment and place the order directly where supported." },
]

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Failed to place storefront order."
}

function isBlank(value: string) {
  return value.trim().length === 0
}

export function StoreCheckoutPage() {
  const auth = useAuth()
  const { cartItems, products, cartSubtotal, clearCart } = useStorefront()
  const [values, setValues] = useState<CheckoutFormValues>(defaultFormValues)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [placedOrder, setPlacedOrder] = useState<StorefrontOrder | null>(null)

  const shipping = cartSubtotal > 5000 ? 0 : 199
  const handling = cartItems.length > 0 ? 99 : 0
  const total = cartSubtotal + shipping + handling
  const orderItems = useMemo(
    () =>
      cartItems
        .map((item) => ({ item, product: products.find((entry) => entry.id === item.productId) }))
        .filter((entry): entry is { item: typeof cartItems[number]; product: typeof products[number] } => Boolean(entry.product)),
    [cartItems, products],
  )

  const canSubmit = cartItems.length > 0 && !submitting
  const isOnlinePayment = values.paymentMethod !== "cod"

  useEffect(() => {
    const user = auth.session?.user
    if (!user) {
      return
    }

    const { firstName, lastName } = splitDisplayName(user.displayName)
    setValues((current) => ({
      ...current,
      firstName: current.firstName === defaultFormValues.firstName ? firstName || current.firstName : current.firstName,
      lastName: current.lastName === defaultFormValues.lastName ? (lastName || current.lastName) : current.lastName,
      email: current.email === defaultFormValues.email ? user.email : current.email,
    }))
  }, [auth.session?.user])

  async function handleSubmit() {
    if (cartItems.length === 0) {
      showWarningToast({
        title: "Checkout not ready",
        description: "Add products to the cart before placing an order.",
      })
      return
    }

    if (
      isBlank(values.firstName)
      || isBlank(values.lastName)
      || isBlank(values.email)
      || isBlank(values.phone)
      || isBlank(values.addressLine1)
      || isBlank(values.city)
      || isBlank(values.state)
      || isBlank(values.country)
      || isBlank(values.postalCode)
    ) {
      setErrorMessage("Complete the delivery address and contact fields before placing the order.")
      showWarningToast({
        title: "Checkout not submitted",
        description: "Complete the address and contact fields before placing the order.",
      })
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const checkout = await createStorefrontCheckout({
        ...values,
        addressLine2: values.addressLine2 || null,
        note: values.note || null,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      })

      const order = checkout.requiresPayment && checkout.paymentSession
        ? await openRazorpayCheckout(checkout.paymentSession, values, checkout.order.id)
        : checkout.order

      setPlacedOrder(order)
      clearCart()
      showSuccessToast({
        title: checkout.requiresPayment ? "Payment received" : "Order placed",
        description: `Storefront order ${order.orderNumber} is confirmed.`,
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      if (message === "Payment cancelled before completion.") {
        showWarningToast({
          title: "Payment cancelled",
          description: "You can continue checkout whenever you are ready.",
        })
      } else {
        showFailedActionToast({
          entityLabel: isOnlinePayment ? "payment" : "order",
          action: isOnlinePayment ? "process" : "place",
          detail: message,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (cartItems.length === 0 && !placedOrder) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-[2rem] border border-dashed border-border/70 bg-white/75 p-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Your checkout is waiting for cart items.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Add products to the cart first so the checkout flow has an order to process.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/cart">Back to cart</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (placedOrder) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#eef7ef_0%,#d9eddd_100%)] p-8 shadow-[0_24px_60px_-44px_rgba(32,85,44,0.22)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                <CheckCircle2Icon className="size-4" />
                {placedOrder.paymentGateway === "razorpay" ? "Payment verified" : "Order confirmed"}
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-emerald-950">Order {placedOrder.orderNumber} has been placed.</h2>
              <p className="max-w-2xl text-sm leading-6 text-emerald-900/80">
                {placedOrder.paymentGateway === "razorpay"
                  ? "Razorpay payment was verified on the backend and the cart has been cleared."
                  : "Cash-on-delivery checkout was stored in the backend order tables and the cart has been cleared."}
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/search">Continue shopping</Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[1.8rem] border border-white/70 bg-white/82 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPinIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Delivery address</h2>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{placedOrder.firstName} {placedOrder.lastName}</p>
              <p>{placedOrder.addressLine1}</p>
              {placedOrder.addressLine2 ? <p>{placedOrder.addressLine2}</p> : null}
              <p>{placedOrder.city}, {placedOrder.state} {placedOrder.postalCode}</p>
              <p>{placedOrder.country}</p>
              <p>{placedOrder.email}</p>
              <p>{placedOrder.phone}</p>
            </div>
          </section>

          <aside className="rounded-[1.8rem] border border-white/70 bg-white/82 p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">Order summary</h2>
            <div className="grid gap-4">
              {placedOrder.items.map((item) => (
                <div key={item.id} className="rounded-[1.4rem] border border-border/70 bg-background/70 p-3">
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.size} � {item.color} � Qty {item.quantity}
                  </div>
                  <div className="mt-1 text-sm font-semibold">{formatCurrency(item.lineTotal)}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(placedOrder.subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Shipping</span><span>{placedOrder.shippingAmount === 0 ? "Free" : formatCurrency(placedOrder.shippingAmount)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Handling</span><span>{formatCurrency(placedOrder.handlingAmount)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Payment</span><span>{placedOrder.paymentGateway === "razorpay" ? "Razorpay" : "Cash on delivery"}</span></div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatCurrency(placedOrder.totalAmount)}</span></div>
            </div>
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2.2rem] border border-white/70 bg-white/78 p-6 shadow-[0_24px_60px_-44px_rgba(40,28,18,0.25)] sm:p-8">
        <div className="space-y-3">
          <Badge variant="outline" className="w-fit">
            Checkout
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Backend-connected checkout.</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Address, delivery method, payment method, and order items now submit into the storefront order tables. Online payments open Razorpay Checkout without changing this page layout.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-[1.2rem] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5">
          <div className="rounded-[1.8rem] border border-white/70 bg-white/82 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPinIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Delivery address</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="checkout-first-name">First name</Label><Input id="checkout-first-name" value={values.firstName} onChange={(event) => setValues((current) => ({ ...current, firstName: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="checkout-last-name">Last name</Label><Input id="checkout-last-name" value={values.lastName} onChange={(event) => setValues((current) => ({ ...current, lastName: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="checkout-email">Email</Label><Input id="checkout-email" type="email" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="checkout-phone">Phone</Label><Input id="checkout-phone" value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="checkout-address-line-1">Address line 1</Label><Textarea id="checkout-address-line-1" value={values.addressLine1} rows={3} onChange={(event) => setValues((current) => ({ ...current, addressLine1: event.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="checkout-address-line-2">Address line 2</Label><Input id="checkout-address-line-2" value={values.addressLine2} onChange={(event) => setValues((current) => ({ ...current, addressLine2: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="checkout-city">City</Label><Input id="checkout-city" value={values.city} onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="checkout-state">State</Label><Input id="checkout-state" value={values.state} onChange={(event) => setValues((current) => ({ ...current, state: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="checkout-country">Country</Label><Input id="checkout-country" value={values.country} onChange={(event) => setValues((current) => ({ ...current, country: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="checkout-postal-code">Postal code</Label><Input id="checkout-postal-code" value={values.postalCode} onChange={(event) => setValues((current) => ({ ...current, postalCode: event.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="checkout-note">Order note</Label><Textarea id="checkout-note" value={values.note} rows={3} onChange={(event) => setValues((current) => ({ ...current, note: event.target.value }))} /></div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/70 bg-white/82 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TruckIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Delivery options</h2>
            </div>
            <div className="grid gap-3">
              {deliveryOptions.map((option) => (
                <label key={option.value} className="flex items-start gap-3 rounded-[1.4rem] border border-border bg-background/70 px-4 py-3 text-sm">
                  <input
                    type="radio"
                    name="delivery"
                    checked={values.deliveryMethod === option.value}
                    onChange={() => setValues((current) => ({ ...current, deliveryMethod: option.value }))}
                  />
                  <span>
                    <span className="block font-medium text-foreground">{option.label}</span>
                    <span className="text-muted-foreground">{option.detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/70 bg-white/82 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CreditCardIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Payment</h2>
            </div>
            <div className="grid gap-3">
              {paymentOptions.map((option) => (
                <label key={option.value} className="flex items-start gap-3 rounded-[1.4rem] border border-border bg-background/70 px-4 py-3 text-sm">
                  <input
                    type="radio"
                    name="payment"
                    checked={values.paymentMethod === option.value}
                    onChange={() => setValues((current) => ({ ...current, paymentMethod: option.value }))}
                  />
                  <span>
                    <span className="block font-medium text-foreground">{option.label}</span>
                    <span className="text-muted-foreground">{option.detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[1.8rem] border border-white/70 bg-white/82 p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">Order summary</h2>
            <div className="grid gap-4">
              {orderItems.map(({ item, product }) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 rounded-[1.4rem] border border-border/70 bg-background/70 p-3">
                  {getPrimaryProductImage(product) ? (
                    <img src={getPrimaryProductImage(product)} alt={product.name} className="size-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex size-20 items-center justify-center rounded-2xl bg-muted text-xs text-muted-foreground">No image</div>
                  )}
                  <div className="space-y-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.size} � {item.color} � Qty {item.quantity}
                    </div>
                    <div className="text-sm font-semibold">{formatCurrency(product.price * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(cartSubtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Handling</span><span>{formatCurrency(handling)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Payment flow</span><span>{isOnlinePayment ? "Razorpay Checkout" : "Direct order placement"}</span></div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>

            <Button className="mt-5 w-full rounded-full" disabled={!canSubmit} onClick={() => { void handleSubmit() }}>
              {submitting ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  {isOnlinePayment ? "Preparing payment..." : "Placing order..."}
                </>
              ) : (
                isOnlinePayment ? "Continue to pay" : "Place order"
              )}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
