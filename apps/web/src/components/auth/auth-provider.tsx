/* eslint-disable react-refresh/only-export-components */

import type { AuthLoginPayload, AuthRegisterPayload, AuthUser } from '@shared/index'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import { login, register } from '@/lib/api'

const STORAGE_KEY = 'cxnext-auth-session-v2'

interface AuthSession {
  accessToken: string
  expiresInSeconds: number
  user: AuthUser
}

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (payload: AuthLoginPayload) => Promise<void>
  register: (payload: AuthRegisterPayload) => Promise<void>
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
    return JSON.parse(rawValue) as AuthSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession())

  async function handleLogin(payload: AuthLoginPayload) {
    const response = await login(payload)
    const nextSession = {
      accessToken: response.accessToken,
      expiresInSeconds: response.expiresInSeconds,
      user: response.user,
    } satisfies AuthSession

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
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
