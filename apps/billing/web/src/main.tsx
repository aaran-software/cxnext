import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BillingShellRoot } from './shell/billing-shell'
import '@ecommerce-web/css/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BillingShellRoot />
  </StrictMode>,
)
