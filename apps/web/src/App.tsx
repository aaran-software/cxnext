import { AppRouter } from '@/app/router'
import { AppToaster } from '@/components/ui/sonner'

export function App() {
  return (
    <>
      <AppRouter />
      <AppToaster />
    </>
  )
}
