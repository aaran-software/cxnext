export type AuthNavigationState = {
  from?: string
}

export function getAuthNavigationState(state: unknown): AuthNavigationState | null {
  if (!state || typeof state !== 'object') {
    return null
  }

  const candidate = state as { from?: unknown }
  return typeof candidate.from === 'string' ? { from: candidate.from } : {}
}

export function getRequestedPath(state: unknown, fallback: string | null = null) {
  const navigationState = getAuthNavigationState(state)
  return typeof navigationState?.from === 'string' ? navigationState.from : fallback
}
