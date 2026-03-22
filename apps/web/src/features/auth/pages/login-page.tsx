import type { FormEvent } from 'react'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showErrorToast, showSuccessToast } from '@/shared/notifications/toast'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const redirectTo = typeof location.state?.from === 'string' ? location.state.from : '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await login({ email, password })
      showSuccessToast({
        title: 'Signed in',
        description: redirectTo === '/dashboard'
          ? 'You are now authenticated and redirected to the dashboard.'
          : 'You are now authenticated and redirected to checkout.',
      })
      void navigate(redirectTo, { replace: true })
    } catch (submissionError) {
      const message = submissionError instanceof Error
        ? submissionError.message
        : 'Unable to login right now.'
      setError(message)
      showErrorToast({
        title: 'Sign in failed',
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="items-center p-8 text-center">
        <CardTitle className="text-3xl">Welcome</CardTitle>
        <CardDescription>
          Access your workspace securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
              {error}
            </div>
          ) : null}
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
            <ArrowRight className="size-4" />
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Need an account?{' '}
          <Link to="/register" state={location.state} className="font-medium text-foreground underline underline-offset-4">
            Request access
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

