import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom'
import { RequireAuth } from '@/features/auth/components/require-auth'
import { frontendTarget } from '@/config/frontend'
import { AppLayout } from '@/app/layouts/app-layout'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { CustomerPortalLayout } from '@/app/layouts/customer-portal-layout'
import { ShopLayout } from '@/app/layouts/shop-layout'
import { WebLayout } from '@/app/layouts/web-layout'
import { AboutPage } from '@/features/marketing/pages/about-page'
import { ContactPage } from '@/features/marketing/pages/contact-page'
import { buildAdminPortalPath, buildCustomerPortalPath, customerPortalRoot } from '@/features/auth/lib/portal-routing'
import { useAuth } from '@/features/auth/components/auth-provider'
import { CustomerDashboardPage } from '@/features/customer-portal/pages/customer-dashboard-page'
import { CustomerSectionPage } from '@/features/customer-portal/pages/customer-section-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { CommonModulePage } from '@/features/common-modules/pages/common-module-page'
import { CommonModulesHomePage } from '@/features/common-modules/pages/common-modules-home-page'
import { CompanyFormPage } from '@/features/company/pages/company-form-page'
import { CompanyListPage } from '@/features/company/pages/company-list-page'
import { CompanyShowPage } from '@/features/company/pages/company-show-page'
import { ContactFormPage } from '@/features/contact/pages/contact-form-page'
import { ContactListPage } from '@/features/contact/pages/contact-list-page'
import { ContactShowPage } from '@/features/contact/pages/contact-show-page'
import { MediaFormPage } from '@/features/media/pages/media-form-page'
import { MediaListPage } from '@/features/media/pages/media-list-page'
import { ProductFormPage } from '@/features/product/pages/product-form-page'
import { ProductListPage } from '@/features/product/pages/product-list-page'
import { ProductShowPage } from '@/features/product/pages/product-show-page'
import { MailboxComposePage } from '@/features/mailbox/pages/mailbox-compose-page'
import { MailboxMessageListPage } from '@/features/mailbox/pages/mailbox-message-list-page'
import { MailboxMessageShowPage } from '@/features/mailbox/pages/mailbox-message-show-page'
import { MailboxTemplateFormPage } from '@/features/mailbox/pages/mailbox-template-form-page'
import { MailboxTemplateListPage } from '@/features/mailbox/pages/mailbox-template-list-page'
import { StorefrontTemplateFormPage } from '@/features/storefront-designer/pages/storefront-template-form-page'
import { StorefrontTemplateListPage } from '@/features/storefront-designer/pages/storefront-template-list-page'
import { StorefrontTemplateShowPage } from '@/features/storefront-designer/pages/storefront-template-show-page'
import { LoginPage } from '@/features/auth/pages/login-page'
import { NotFoundPage } from '@/features/marketing/pages/not-found-page'
import { PlaceholderPage } from '@/features/store/pages/placeholder-page'
import { PortfolioHomePage } from '@/features/marketing/pages/portfolio-home-page'
import { RegisterPage } from '@/features/auth/pages/register-page'
import { ServicesPage } from '@/features/marketing/pages/services-page'
import { StoreCartPage } from '@/features/store/pages/store-cart-page'
import { StoreCatalogPage } from '@/features/store/pages/store-catalog-page'
import { StoreCheckoutPage } from '@/features/store/pages/store-checkout-page'
import { StoreHomePage } from '@/features/store/pages/store-home-page'
import { StoreProductPage } from '@/features/store/pages/store-product-page'
import { StoreWishlistPage } from '@/features/store/pages/store-wishlist-page'

function LegacyAdminDashboardRedirect() {
  const location = useLocation()
  const { session } = useAuth()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (session.user.actorType === 'customer') {
    return <Navigate to={customerPortalRoot} replace />
  }

  const nextPath = location.pathname.replace(/^\/dashboard/, '') || ''
  return <Navigate to={`${buildAdminPortalPath(nextPath)}${location.search}${location.hash}`} replace />
}

const adminRoutes = {
  element: <RequireAuth allow={['admin', 'staff', 'vendor']} />,
  children: [
    {
      path: 'admin/dashboard',
      element: <AppLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'companies', element: <CompanyListPage /> },
        { path: 'companies/new', element: <CompanyFormPage /> },
        { path: 'companies/:companyId', element: <CompanyShowPage /> },
        { path: 'companies/:companyId/edit', element: <CompanyFormPage /> },
        { path: 'contacts', element: <ContactListPage /> },
        { path: 'contacts/new', element: <ContactFormPage /> },
        { path: 'contacts/:contactId', element: <ContactShowPage /> },
        { path: 'contacts/:contactId/edit', element: <ContactFormPage /> },
        { path: 'media', element: <MediaListPage /> },
        { path: 'media/new', element: <MediaFormPage /> },
        { path: 'media/:mediaId/edit', element: <MediaFormPage /> },
        { path: 'products', element: <ProductListPage /> },
        { path: 'products/new', element: <ProductFormPage /> },
        { path: 'products/:productId', element: <ProductShowPage /> },
        { path: 'products/:productId/edit', element: <ProductFormPage /> },
        { path: 'mailbox/messages', element: <MailboxMessageListPage /> },
        { path: 'mailbox/messages/:messageId', element: <MailboxMessageShowPage /> },
        { path: 'mailbox/compose', element: <MailboxComposePage /> },
        { path: 'mailbox/templates', element: <MailboxTemplateListPage /> },
        { path: 'mailbox/templates/new', element: <MailboxTemplateFormPage /> },
        { path: 'mailbox/templates/:templateId/edit', element: <MailboxTemplateFormPage /> },
        { path: 'storefront-designer', element: <StorefrontTemplateListPage /> },
        { path: 'storefront-designer/new', element: <StorefrontTemplateFormPage /> },
        { path: 'storefront-designer/:templateId', element: <StorefrontTemplateShowPage /> },
        { path: 'storefront-designer/:templateId/edit', element: <StorefrontTemplateFormPage /> },
        { path: 'common', element: <CommonModulesHomePage /> },
        { path: 'common/:moduleKey', element: <CommonModulePage /> },
        { path: '*', element: <DashboardPage /> },
      ],
    },
  ],
}

const customerPortalRoutes = {
  element: <RequireAuth allow={['customer']} />,
  children: [
    {
      path: 'dashboard',
      element: <CustomerPortalLayout />,
      children: [
        { index: true, element: <CustomerDashboardPage /> },
        {
          path: 'orders',
          element: <CustomerSectionPage title="Orders" description="Review order progress, payment confirmations, and delivery history in one place." />,
        },
        {
          path: 'profile',
          element: <CustomerSectionPage title="Profile" description="Manage the customer profile data used for purchases and account communication." />,
        },
        {
          path: 'wishlist',
          element: <CustomerSectionPage title="Wishlist" description="Keep saved products separate from the cart and return to them whenever you are ready." storeHref="/wishlist" storeLabel="Open wishlist" />,
        },
        {
          path: 'cart',
          element: <CustomerSectionPage title="Cart" description="Review items queued for checkout before moving back into the storefront purchase flow." storeHref="/cart" storeLabel="Open cart" />,
        },
        {
          path: 'notifications',
          element: <CustomerSectionPage title="Notifications" description="A dedicated customer notification center is reserved here without exposing admin communication tools." />,
        },
        {
          path: 'support',
          element: <CustomerSectionPage title="Support" description="Customer support requests and help touchpoints live in this portal, separate from operator mailboxes." storeHref="/contact" storeLabel="Contact support" />,
        },
      ],
    },
  ],
}

const legacyAdminRoutes = {
  element: <RequireAuth allow={['admin', 'staff', 'vendor', 'customer']} />,
  children: [
    {
      path: 'dashboard/*',
      element: <LegacyAdminDashboardRedirect />,
    },
  ],
}

const authRoutes = {
  element: <AuthLayout />,
  children: [
    { path: 'login', element: <LoginPage /> },
    { path: 'register', element: <RegisterPage /> },
  ],
}

const webRoutes = [
  {
    element: <WebLayout />,
    children: [
      { index: true, element: <PortfolioHomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },
  customerPortalRoutes,
  adminRoutes,
  legacyAdminRoutes,
  authRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
]

const shopRoutes = [
  {
    element: <ShopLayout />,
    children: [
      { index: true, element: <StoreHomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'search', element: <StoreCatalogPage /> },
      { path: 'wishlist', element: <StoreWishlistPage /> },
      { path: 'cart', element: <StoreCartPage /> },
      {
        element: <RequireAuth allow={['customer']} />,
        children: [
          { path: 'checkout', element: <StoreCheckoutPage /> },
          { path: 'account', element: <Navigate to={buildCustomerPortalPath()} replace /> },
          { path: 'account/profile', element: <Navigate to={buildCustomerPortalPath('/profile')} replace /> },
          { path: 'account/orders', element: <Navigate to={buildCustomerPortalPath('/orders')} replace /> },
          { path: 'account/notifications', element: <Navigate to={buildCustomerPortalPath('/notifications')} replace /> },
        ],
      },
      { path: 'product/:slug', element: <StoreProductPage /> },
      { path: 'support', element: <PlaceholderPage /> },
      { path: 'vendor', element: <PlaceholderPage /> },
      { path: 'advertise', element: <PlaceholderPage /> },
      { path: 'download', element: <PlaceholderPage /> },
      { path: 'help', element: <PlaceholderPage /> },
      { path: 'returns', element: <PlaceholderPage /> },
      { path: 'shipping', element: <PlaceholderPage /> },
      { path: 'careers', element: <PlaceholderPage /> },
      { path: 'press', element: <PlaceholderPage /> },
      { path: 'investors', element: <PlaceholderPage /> },
      { path: 'terms', element: <PlaceholderPage /> },
      { path: 'privacy', element: <PlaceholderPage /> },
      { path: 'cookie-policy', element: <PlaceholderPage /> },
      { path: 'accessibility', element: <PlaceholderPage /> },
      { path: 'shipping-carriers', element: <PlaceholderPage /> },
      { path: 'category/:slug', element: <StoreCatalogPage /> },
    ],
  },
  customerPortalRoutes,
  adminRoutes,
  legacyAdminRoutes,
  authRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
]

const appRoutes = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  customerPortalRoutes,
  adminRoutes,
  legacyAdminRoutes,
  authRoutes,
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]

const router = createBrowserRouter(
  frontendTarget === 'app' ? appRoutes : frontendTarget === 'shop' ? shopRoutes : webRoutes,
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
