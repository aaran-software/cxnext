/* eslint-disable react-refresh/only-export-components */

import type { AuthLoginPayload, AuthRegisterPayload, AuthUser } from '@shared/index'
import {
  createContext,
  type PropsWithChildren,
  useEffect,
  useContext,
  useMemo,
  useState,
} from 'react'
import { getCurrentUser, login, register } from '@/shared/api/client'

const STORAGE_KEY = 'cxnext-auth-session-v2'

interface AuthSession {
  accessToken: string
  expiresInSeconds: number
  user: AuthUser
}

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (payload: AuthLoginPayload) => Promise<AuthSession>
  register: (payload: AuthRegisterPayload) => Promise<AuthSession>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<AuthSession> | null

    if (
      !parsedValue ||
      typeof parsedValue.accessToken !== 'string' ||
      typeof parsedValue.expiresInSeconds !== 'number' ||
      !parsedValue.user ||
      typeof parsedValue.user !== 'object'
    ) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return parsedValue as AuthSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession())

  useEffect(() => {
    if (!session?.accessToken || !session.user || typeof session.user !== 'object') {
      return
    }

    if (typeof session.user.isSuperAdmin === 'boolean') {
      return
    }

    let cancelled = false

    void getCurrentUser(session.accessToken)
      .then((user) => {
        if (cancelled) {
          return
        }

        const nextSession = {
          ...session,
          user,
        } satisfies AuthSession

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
        setSession(nextSession)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [session])

  async function handleLogin(payload: AuthLoginPayload) {
    const response = await login(payload)
    const nextSession = {
      accessToken: response.accessToken,
      expiresInSeconds: response.expiresInSeconds,
      user: response.user,
    } satisfies AuthSession

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
    return nextSession
  }

  async function handleRegister(payload: AuthRegisterPayload) {
    const response = await register(payload)
    const nextSession = {
      accessToken: response.accessToken,
      expiresInSeconds: response.expiresInSeconds,
      user: response.user,
    } satisfies AuthSession

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
    return nextSession
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login: handleLogin,
      register: handleRegister,
      logout,
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

