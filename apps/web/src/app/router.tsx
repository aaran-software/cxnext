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
import { LoginPage } from '@/features/auth/pages/login-page'
import { NotFoundPage } from '@/features/marketing/pages/not-found-page'
import { PlaceholderPage } from '@/features/store/pages/placeholder-page'
import { PortfolioHomePage } from '@/features/marketing/pages/portfolio-home-page'
import { RegisterPage } from '@/features/auth/pages/register-page'
import { ServicesPage } from '@/features/marketing/pages/services-page'
import { StoreHomePage } from '@/features/store/pages/store-home-page'

const dashboardRoutes = {
  element: <RequireAuth />,
  children: [
    {
      path: 'dashboard',
      element: <AppLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
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
      { path: 'search', element: <PlaceholderPage /> },
      { path: 'wishlist', element: <PlaceholderPage /> },
      { path: 'cart', element: <PlaceholderPage /> },
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
      { path: 'category/:slug', element: <PlaceholderPage /> },
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
