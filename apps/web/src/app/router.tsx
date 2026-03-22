import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { RequireAuth } from '@/features/auth/components/require-auth'
import { frontendTarget } from '@/config/frontend'
import { AppLayout } from '@/app/layouts/app-layout'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { ShopLayout } from '@/app/layouts/shop-layout'
import { WebLayout } from '@/app/layouts/web-layout'
import { AboutPage } from '@/features/marketing/pages/about-page'
import { ContactPage } from '@/features/marketing/pages/contact-page'
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

const dashboardRoutes = {
  element: <RequireAuth />,
  children: [
    {
      path: 'dashboard',
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
  dashboardRoutes,
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
        element: <RequireAuth />,
        children: [{ path: 'checkout', element: <StoreCheckoutPage /> }],
      },
      { path: 'product/:slug', element: <StoreProductPage /> },
      { path: 'account', element: <PlaceholderPage /> },
      { path: 'account/profile', element: <PlaceholderPage /> },
      { path: 'account/orders', element: <PlaceholderPage /> },
      { path: 'account/notifications', element: <PlaceholderPage /> },
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
  dashboardRoutes,
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
  dashboardRoutes,
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
