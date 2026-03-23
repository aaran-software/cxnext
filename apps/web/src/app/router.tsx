import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom'
import { GlobalLoader } from '@/components/ui/global-loader'
import { RequireAuth } from '@/features/auth/components/require-auth'
import { RequireSuperAdmin } from '@/features/auth/components/require-super-admin'
import { frontendTarget } from '@/config/frontend'
import { buildAdminPortalPath, buildCustomerPortalPath, customerPortalRoot } from '@/features/auth/lib/portal-routing'
import { useAuth } from '@/features/auth/components/auth-provider'
import { CustomerSectionPage } from '@/features/customer-portal/pages/customer-section-page'
import { NotFoundPage } from '@/features/marketing/pages/not-found-page'
import { PlaceholderPage } from '@/features/store/pages/placeholder-page'

function lazyPage<T extends Record<string, unknown>>(loader: () => Promise<T>, key: keyof T) {
  return lazy(async () => ({ default: (await loader())[key] as never }))
}

function renderLazy(Component: ComponentType) {
  return (
    <Suspense
      fallback={<GlobalLoader fullScreen={false} size="sm" />}
    >
      <Component />
    </Suspense>
  )
}

const AppLayout = lazyPage(() => import('@/app/layouts/app-layout'), 'AppLayout')
const AuthLayout = lazyPage(() => import('@/app/layouts/auth-layout'), 'AuthLayout')
const CustomerPortalLayout = lazyPage(
  () => import('@/app/layouts/customer-portal-layout'),
  'CustomerPortalLayout',
)
const ShopLayout = lazyPage(() => import('@/app/layouts/shop-layout'), 'ShopLayout')
const WebLayout = lazyPage(() => import('@/app/layouts/web-layout'), 'WebLayout')
const AboutPage = lazyPage(() => import('@/features/marketing/pages/about-page'), 'AboutPage')
const ContactPage = lazyPage(() => import('@/features/marketing/pages/contact-page'), 'ContactPage')
const CustomerDashboardPage = lazyPage(
  () => import('@/features/customer-portal/pages/customer-dashboard-page'),
  'CustomerDashboardPage',
)
const CustomerProfilePage = lazyPage(
  () => import('@/features/customer-portal/pages/customer-profile-page'),
  'CustomerProfilePage',
)
const DashboardPage = lazyPage(() => import('@/features/dashboard/pages/dashboard-page'), 'DashboardPage')
const OrderOperationsPage = lazyPage(
  () => import('@/features/commerce/pages/order-operations-page'),
  'OrderOperationsPage',
)
const CommonModulePage = lazyPage(
  () => import('@/features/common-modules/pages/common-module-page'),
  'CommonModulePage',
)
const CommonModulesHomePage = lazyPage(
  () => import('@/features/common-modules/pages/common-modules-home-page'),
  'CommonModulesHomePage',
)
const CompanyFormPage = lazyPage(() => import('@/features/company/pages/company-form-page'), 'CompanyFormPage')
const CompanyListPage = lazyPage(() => import('@/features/company/pages/company-list-page'), 'CompanyListPage')
const CompanyShowPage = lazyPage(() => import('@/features/company/pages/company-show-page'), 'CompanyShowPage')
const ContactFormPage = lazyPage(() => import('@/features/contact/pages/contact-form-page'), 'ContactFormPage')
const ContactListPage = lazyPage(() => import('@/features/contact/pages/contact-list-page'), 'ContactListPage')
const ContactShowPage = lazyPage(() => import('@/features/contact/pages/contact-show-page'), 'ContactShowPage')
const MediaFormPage = lazyPage(() => import('@/features/media/pages/media-form-page'), 'MediaFormPage')
const MediaListPage = lazyPage(() => import('@/features/media/pages/media-list-page'), 'MediaListPage')
const ProductFormPage = lazyPage(() => import('@/features/product/pages/product-form-page'), 'ProductFormPage')
const ProductListPage = lazyPage(() => import('@/features/product/pages/product-list-page'), 'ProductListPage')
const ProductShowPage = lazyPage(() => import('@/features/product/pages/product-show-page'), 'ProductShowPage')
const MailboxComposePage = lazyPage(() => import('@/features/mailbox/pages/mailbox-compose-page'), 'MailboxComposePage')
const MailboxMessageListPage = lazyPage(
  () => import('@/features/mailbox/pages/mailbox-message-list-page'),
  'MailboxMessageListPage',
)
const MailboxMessageShowPage = lazyPage(
  () => import('@/features/mailbox/pages/mailbox-message-show-page'),
  'MailboxMessageShowPage',
)
const MailboxTemplateFormPage = lazyPage(
  () => import('@/features/mailbox/pages/mailbox-template-form-page'),
  'MailboxTemplateFormPage',
)
const MailboxTemplateListPage = lazyPage(
  () => import('@/features/mailbox/pages/mailbox-template-list-page'),
  'MailboxTemplateListPage',
)
const StorefrontTemplateFormPage = lazyPage(
  () => import('@/features/storefront-designer/pages/storefront-template-form-page'),
  'StorefrontTemplateFormPage',
)
const StorefrontTemplateListPage = lazyPage(
  () => import('@/features/storefront-designer/pages/storefront-template-list-page'),
  'StorefrontTemplateListPage',
)
const StorefrontTemplateShowPage = lazyPage(
  () => import('@/features/storefront-designer/pages/storefront-template-show-page'),
  'StorefrontTemplateShowPage',
)
const SliderThemeFormPage = lazyPage(
  () => import('@/features/slider-themes/pages/slider-theme-form-page'),
  'SliderThemeFormPage',
)
const SliderThemeListPage = lazyPage(
  () => import('@/features/slider-themes/pages/slider-theme-list-page'),
  'SliderThemeListPage',
)
const SliderThemeShowPage = lazyPage(
  () => import('@/features/slider-themes/pages/slider-theme-show-page'),
  'SliderThemeShowPage',
)
const LoginPage = lazyPage(() => import('@/features/auth/pages/login-page'), 'LoginPage')
const PortfolioHomePage = lazyPage(
  () => import('@/features/marketing/pages/portfolio-home-page'),
  'PortfolioHomePage',
)
const RegisterPage = lazyPage(() => import('@/features/auth/pages/register-page'), 'RegisterPage')
const ServicesPage = lazyPage(() => import('@/features/marketing/pages/services-page'), 'ServicesPage')
const StoreCartPage = lazyPage(() => import('@/features/store/pages/store-cart-page'), 'StoreCartPage')
const StoreCatalogPage = lazyPage(() => import('@/features/store/pages/store-catalog-page'), 'StoreCatalogPage')
const StoreCheckoutPage = lazyPage(() => import('@/features/store/pages/store-checkout-page'), 'StoreCheckoutPage')
const StoreHomePage = lazyPage(() => import('@/features/store/pages/store-home-page'), 'StoreHomePage')
const StoreProductPage = lazyPage(() => import('@/features/store/pages/store-product-page'), 'StoreProductPage')
const StoreWishlistPage = lazyPage(() => import('@/features/store/pages/store-wishlist-page'), 'StoreWishlistPage')
const SystemSettingsPage = lazyPage(() => import('@/features/settings/pages/system-settings-page'), 'SystemSettingsPage')
const SystemVersionPage = lazyPage(() => import('@/features/settings/pages/system-version-page'), 'SystemVersionPage')

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
      element: renderLazy(AppLayout),
      children: [
        { index: true, element: renderLazy(DashboardPage) },
        { path: 'orders', element: renderLazy(OrderOperationsPage) },
        { path: 'companies', element: renderLazy(CompanyListPage) },
        { path: 'companies/new', element: renderLazy(CompanyFormPage) },
        { path: 'companies/:companyId', element: renderLazy(CompanyShowPage) },
        { path: 'companies/:companyId/edit', element: renderLazy(CompanyFormPage) },
        { path: 'contacts', element: renderLazy(ContactListPage) },
        { path: 'contacts/new', element: renderLazy(ContactFormPage) },
        { path: 'contacts/:contactId', element: renderLazy(ContactShowPage) },
        { path: 'contacts/:contactId/edit', element: renderLazy(ContactFormPage) },
        { path: 'media', element: renderLazy(MediaListPage) },
        { path: 'media/new', element: renderLazy(MediaFormPage) },
        { path: 'media/:mediaId/edit', element: renderLazy(MediaFormPage) },
        { path: 'products', element: renderLazy(ProductListPage) },
        { path: 'products/new', element: renderLazy(ProductFormPage) },
        { path: 'products/:productId', element: renderLazy(ProductShowPage) },
        { path: 'products/:productId/edit', element: renderLazy(ProductFormPage) },
        { path: 'mailbox/messages', element: renderLazy(MailboxMessageListPage) },
        { path: 'mailbox/messages/:messageId', element: renderLazy(MailboxMessageShowPage) },
        { path: 'mailbox/compose', element: renderLazy(MailboxComposePage) },
        { path: 'mailbox/templates', element: renderLazy(MailboxTemplateListPage) },
        { path: 'mailbox/templates/new', element: renderLazy(MailboxTemplateFormPage) },
        { path: 'mailbox/templates/:templateId/edit', element: renderLazy(MailboxTemplateFormPage) },
        { path: 'storefront-designer', element: renderLazy(StorefrontTemplateListPage) },
        { path: 'storefront-designer/new', element: renderLazy(StorefrontTemplateFormPage) },
        { path: 'storefront-designer/:templateId', element: renderLazy(StorefrontTemplateShowPage) },
        { path: 'storefront-designer/:templateId/edit', element: renderLazy(StorefrontTemplateFormPage) },
        { path: 'slider-themes', element: renderLazy(SliderThemeListPage) },
        { path: 'slider-themes/new', element: renderLazy(SliderThemeFormPage) },
        { path: 'slider-themes/:themeId', element: renderLazy(SliderThemeShowPage) },
        { path: 'slider-themes/:themeId/edit', element: renderLazy(SliderThemeFormPage) },
        {
          element: <RequireSuperAdmin />,
          children: [
            { path: 'settings', element: renderLazy(SystemSettingsPage) },
            { path: 'version', element: renderLazy(SystemVersionPage) },
          ],
        },
        { path: 'common', element: renderLazy(CommonModulesHomePage) },
        { path: 'common/:moduleKey', element: renderLazy(CommonModulePage) },
        { path: '*', element: renderLazy(DashboardPage) },
      ],
    },
  ],
}

const customerPortalRoutes = {
  element: <RequireAuth allow={['customer']} />,
  children: [
    {
      path: 'dashboard',
      element: renderLazy(CustomerPortalLayout),
      children: [
        { index: true, element: renderLazy(CustomerDashboardPage) },
        {
          path: 'orders',
          element: <CustomerSectionPage title="Orders" description="Review order progress, payment confirmations, and delivery history in one place." />,
        },
        {
          path: 'profile',
          element: renderLazy(CustomerProfilePage),
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
    { path: 'login', element: renderLazy(LoginPage) },
    { path: 'register', element: renderLazy(RegisterPage) },
  ],
}

const webRoutes = [
  {
    element: renderLazy(WebLayout),
    children: [
      { index: true, element: renderLazy(PortfolioHomePage) },
      { path: 'about', element: renderLazy(AboutPage) },
      { path: 'services', element: renderLazy(ServicesPage) },
      { path: 'contact', element: renderLazy(ContactPage) },
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
    element: renderLazy(ShopLayout),
    children: [
      { index: true, element: renderLazy(StoreHomePage) },
      { path: 'about', element: renderLazy(AboutPage) },
      { path: 'contact', element: renderLazy(ContactPage) },
      { path: 'search', element: renderLazy(StoreCatalogPage) },
      { path: 'wishlist', element: renderLazy(StoreWishlistPage) },
      { path: 'cart', element: renderLazy(StoreCartPage) },
      {
        element: <RequireAuth allow={['customer']} />,
        children: [
          { path: 'checkout', element: renderLazy(StoreCheckoutPage) },
          { path: 'account', element: <Navigate to={buildCustomerPortalPath()} replace /> },
          { path: 'account/profile', element: <Navigate to={buildCustomerPortalPath('/profile')} replace /> },
          { path: 'account/orders', element: <Navigate to={buildCustomerPortalPath('/orders')} replace /> },
          { path: 'account/notifications', element: <Navigate to={buildCustomerPortalPath('/notifications')} replace /> },
        ],
      },
      { path: 'product/:slug', element: renderLazy(StoreProductPage) },
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
