import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { parseSteamCallback } from '../lib/steam'
import { useSession } from '../lib/session'

function AuthCallbackPage() {
  const location = useLocation()
  const [message, setMessage] = useState('Checking Steam callback...')
  const { signIn } = useSession()

  useEffect(() => {
    const user = parseSteamCallback(location.search)
    if (!user) {
      setMessage('Steam callback missing data. Please try again.')
      return
    }
    signIn(user)
    setMessage(`Welcome back, ${user.display_name}`)
  }, [location.search, signIn])

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="card space-y-4">
        <h1 className="text-3xl">Steam callback</h1>
        <p className="text-sm text-ink-200">{message}</p>
        <Link
          to="/games"
          className="inline-flex items-center justify-center rounded-xl border border-ink-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink-200 transition hover:border-tide-300 hover:text-tide-100"
        >
          Back to library
        </Link>
      </div>
    </div>
  )
}

export default AuthCallbackPage
