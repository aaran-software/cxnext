import { useMemo } from "react"
import { useLocation, useParams } from "react-router-dom"

import { PublicPageShell, PublicSection } from "@/features/store/components/navigation/PublicPageShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const pageCopy: Record<string, { title: string; description: string }> = {
  "/search": {
    title: "Search",
    description: "Browse the storefront experience with the copied menu integrated into the public web layout.",
  },
  "/wishlist": {
    title: "Wishlist",
    description: "Saved products will appear here once the underlying commerce flow is connected.",
  },
  "/cart": {
    title: "Cart",
    description: "Your cart summary is ready for the checkout flow that will be wired next.",
  },
  "/account": {
    title: "Account",
    description: "Use this account area as the entry point for profile and order actions from the menu.",
  },
  "/account/profile": {
    title: "My Profile",
    description: "Manage your profile details from the public storefront account menu.",
  },
  "/account/orders": {
    title: "Orders",
    description: "Track order activity from the public storefront navigation.",
  },
  "/account/notifications": {
    title: "Notification Settings",
    description: "Manage storefront notifications and account alerts from here.",
  },
  "/support": {
    title: "Support",
    description: "Customer care, FAQs, and service contacts live here.",
  },
  "/vendor": {
    title: "Become a Seller",
    description: "Start your seller onboarding flow from this storefront entry point.",
  },
  "/advertise": {
    title: "Advertise",
    description: "Promotional and sponsored placement options will be managed here.",
  },
  "/download": {
    title: "Download App",
    description: "App download links and platform-specific installation details will be published here.",
  },
  "/help": {
    title: "Help Center",
    description: "Frequently asked questions and support workflows live on this surface.",
  },
  "/returns": {
    title: "Returns & Exchanges",
    description: "Return policy details and exchange flows will be managed here.",
  },
  "/shipping": {
    title: "Shipping Information",
    description: "Delivery policy, timelines, and shipping details will appear here.",
  },
  "/careers": {
    title: "Careers",
    description: "Career opportunities and recruiting information will be published here.",
  },
  "/press": {
    title: "Press & News",
    description: "Press releases and newsroom updates will be published here.",
  },
  "/investors": {
    title: "Investor Relations",
    description: "Investor-facing updates and corporate information will be managed here.",
  },
  "/terms": {
    title: "Terms & Conditions",
    description: "Storefront legal terms and policies will live here.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "Privacy notices and data handling policies will be managed here.",
  },
  "/cookie-policy": {
    title: "Cookie Policy",
    description: "Cookie usage and consent details will be published here.",
  },
  "/accessibility": {
    title: "Accessibility",
    description: "Accessibility commitments and support guidance will be published here.",
  },
  "/shipping-carriers": {
    title: "Shipping Carriers",
    description: "Carrier partnerships and delivery options will be listed here.",
  },
}

export function PlaceholderPage() {
  const location = useLocation()
  const { slug } = useParams()

  const content = useMemo(() => {
    if (location.pathname.startsWith("/category/")) {
      const normalized = slug?.replace(/-/g, " ") ?? "category"
      const title = normalized.replace(/\b\w/g, (char) => char.toUpperCase())

      return {
        title,
        description: `This category landing page keeps the copied storefront menu navigation functional for ${title}.`,
      }
    }

    return pageCopy[location.pathname] ?? pageCopy["/account"]
  }, [location.pathname, slug])

  return (
    <PublicPageShell eyebrow="Storefront" title={content.title} description={content.description}>
      <PublicSection
        title="Page Ready"
        description="The route is active so the menu works end-to-end without dropping users into a 404 page."
      >
        <Card>
          <CardHeader>
            <CardTitle>{content.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            This is a placeholder surface for the copied navigation target. It preserves the current UX shell while the business-specific page content is implemented.
          </CardContent>
        </Card>
      </PublicSection>
    </PublicPageShell>
  )
}

