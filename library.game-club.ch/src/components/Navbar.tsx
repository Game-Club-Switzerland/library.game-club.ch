import { Link, NavLink } from 'react-router-dom'
import { useSession } from '../lib/session'

const linkBase = 'rounded-full px-4 py-2 text-sm font-semibold transition'

function Navbar() {
  const { session, signOut } = useSession()

  return (
    <header className="sticky top-0 z-20 border-b border-ink-800/60 bg-ink-900/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 text-lg font-display">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-tide-400/20 text-tide-200">
            GL
          </span>
          <span>Game Library</span>
        </Link>
        <nav className="hidden items-center gap-3 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? 'bg-tide-400/20 text-tide-100'
                  : 'text-ink-200 hover:text-tide-100'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/games"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? 'bg-sun-300/20 text-sun-100'
                  : 'text-ink-200 hover:text-sun-100'
              }`
            }
          >
            Games
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? 'bg-ink-700 text-ink-50'
                  : 'text-ink-200 hover:text-ink-50'
              }`
            }
          >
            Admin
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-200 md:flex">
                {session.display_name}
              </div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-ink-700 px-4 py-2 text-xs uppercase tracking-wide text-ink-200 transition hover:border-sun-200 hover:text-sun-200"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth/steam"
              className="rounded-full bg-sun-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-900 shadow-lift transition hover:bg-sun-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
