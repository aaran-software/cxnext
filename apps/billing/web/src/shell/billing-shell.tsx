import { BrowserRouter } from 'react-router-dom'
import { AppToaster } from '@admin-web/components/ui/sonner'
import { ThemeProvider } from '@ecommerce-web/shared/theme/theme-provider'
import { BillingApp } from '@billing-web/app'

export function BillingShellRoot() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <BillingApp />
        <AppToaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}
