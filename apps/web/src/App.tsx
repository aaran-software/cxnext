import { AppRouter } from '@/app/router'
import { AppToaster } from '@/components/ui/sonner'
import { InitialSetupPage } from '@/features/setup/pages/initial-setup-page'
import { useSetup } from '@/features/setup/components/setup-provider'

export function App() {
  const { isLoading, status } = useSetup()

  if (isLoading || !status) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="rounded-[2rem] border border-border/70 bg-card/90 px-8 py-10 text-center shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)]">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">CXNext</p>
          <h1 className="mt-4 text-3xl font-semibold">Checking application setup</h1>
          <p className="mt-3 text-muted-foreground">
            The API is verifying database configuration and schema state.
          </p>
        </div>
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
