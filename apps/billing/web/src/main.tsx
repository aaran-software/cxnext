import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BillingApp } from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BillingApp />
  </StrictMode>,
)
