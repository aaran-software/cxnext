import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AuthProvider } from './features/auth/components/auth-provider'
import { SetupProvider } from './features/setup/components/setup-provider'
import { BrandingProvider } from './shared/branding/branding-provider'
import { ThemeProvider } from './shared/theme/theme-provider'
import './css/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SetupProvider>
        <BrandingProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrandingProvider>
      </SetupProvider>
    </ThemeProvider>
  </StrictMode>,
)
