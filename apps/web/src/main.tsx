import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AuthProvider } from './features/auth/components/auth-provider'
import { SetupProvider } from './features/setup/components/setup-provider'
import { ThemeProvider } from './shared/theme/theme-provider'
import './css/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SetupProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SetupProvider>
    </ThemeProvider>
  </StrictMode>,
)
