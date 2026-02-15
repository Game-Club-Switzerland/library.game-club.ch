import { useMemo } from 'react'
import { buildSteamLoginUrl } from '../lib/steam'
import { useConfig } from '../lib/config'

function AuthSteamPage() {
  const config = useConfig()

  const loginUrl = useMemo(
    () => buildSteamLoginUrl(config.steamRealm, config.steamReturnUrl),
    [config]
  )

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="card space-y-4">
        <h1 className="text-3xl">Steam login</h1>
        <p className="text-sm text-ink-200">
          Steam OpenID requires a return URL and realm that match your deployment. Update
          <span className="text-sun-200"> public/config.json </span>before going live.
        </p>
        <a
          href={loginUrl}
          className="inline-flex items-center justify-center rounded-xl bg-sun-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink-900 shadow-lift transition hover:bg-sun-200"
        >
          Continue with Steam
        </a>
        <div className="rounded-2xl border border-ink-700/60 bg-ink-900/60 p-4 text-xs text-ink-300">
          This demo stores a session locally after the callback. Production deployments must verify
          the OpenID response server-side.
        </div>
      </div>
    </div>
  )
}

export default AuthSteamPage
