import { AppRouter } from '@/app/router'
import { GlobalLoader } from '@/components/ui/global-loader'
import { AppToaster } from '@/components/ui/sonner'
import { InitialSetupPage } from '@/features/setup/pages/initial-setup-page'
import { useSetup } from '@/features/setup/components/setup-provider'

export function App() {
  const { isLoading, status } = useSetup()

  if (isLoading || !status) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.16),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] px-6 py-10 text-slate-950">
        <GlobalLoader/>
      </main>
    )
  }

  if (status.status !== 'ready') {
    return <InitialSetupPage />
  }

  return (
    <>
      <AppRouter />
      <AppToaster />
    </>
  )
}
