import { useEffect, useState } from 'react'
import type { SessionUser } from './types'
import { loadJson, removeJson, saveJson } from './storage'

const sessionKey = 'session'

export function getSession(): SessionUser | null {
  return loadJson<SessionUser | null>(sessionKey, null)
}

export function setSession(user: SessionUser) {
  saveJson(sessionKey, user)
}

export function clearSession() {
  removeJson(sessionKey)
}

export function useSession() {
  const [session, setSessionState] = useState<SessionUser | null>(() => getSession())

  useEffect(() => {
    const handle = () => setSessionState(getSession())
    window.addEventListener('storage', handle)
    return () => window.removeEventListener('storage', handle)
  }, [])

  const signOut = () => {
    clearSession()
    setSessionState(null)
  }

  const signIn = (user: SessionUser) => {
    setSession(user)
    setSessionState(user)
  }

  return { session, signIn, signOut }
}
