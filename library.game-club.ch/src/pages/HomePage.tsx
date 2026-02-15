import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GameCard from '../components/GameCard'
import { fetchGames } from '../lib/api'
import type { GameSummary } from '../lib/types'

function HomePage() {
  const [games, setGames] = useState<GameSummary[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load games'))
  }, [])

  const recentGames = useMemo(() => {
    return [...games].slice(0, 4)
  }, [games])

  const trendingGames = useMemo(() => {
    return [...games]
      .sort((a, b) => (b.stats?.starts ?? 0) - (a.stats?.starts ?? 0))
      .slice(0, 4)
  }, [games])

  const searchedGames = useMemo(() => {
    return [...games]
      .sort((a, b) => (b.stats?.searches ?? 0) - (a.stats?.searches ?? 0))
      .slice(0, 4)
  }, [games])

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="card relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-6 top-6 h-32 w-32 rounded-full bg-tide-400/30 blur-3xl" />
          <div className="absolute right-10 top-16 h-44 w-44 rounded-full bg-sun-300/30 blur-3xl" />
        </div>
        <div className="relative grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            <span className="badge">Game Club Edition</span>
            <h1 className="text-4xl md:text-5xl">
              Discover, catalog, and share the games your club actually plays.
            </h1>
            <p className="text-lg text-ink-200">
              The Game Library keeps every favorite in one place. Search by genre, filter by
              player count, and drop reviews with your Steam login.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/games"
                className="rounded-full bg-sun-300 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ink-900 shadow-lift transition hover:bg-sun-200"
              >
                Browse the library
              </Link>
              <Link
                to="/auth/steam"
                className="rounded-full border border-ink-600 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ink-200 transition hover:border-tide-300 hover:text-tide-100"
              >
                Connect Steam
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-ink-700/60 bg-ink-900/70 p-5 shadow-glow">
              <div className="text-xs uppercase tracking-[0.3em] text-ink-300">Now tracking</div>
              <div className="mt-2 text-3xl font-semibold text-sun-200">
                {games.length || '0'} games
              </div>
              <p className="mt-2 text-sm text-ink-300">
                Add new titles or refresh metadata from Steam without leaving the page.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-700/60 bg-ink-900/70 p-5 text-sm text-ink-200">
              <div className="text-xs uppercase tracking-[0.3em] text-ink-300">Write mode</div>
              <p className="mt-2">
                Local dev stores changes in the browser. Serverless mode can create commits or PRs
                against the repository.
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && <p className="mt-6 text-sm text-sun-200">{error}</p>}

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Recently added</h2>
          <Link to="/games" className="text-sm uppercase tracking-wide text-ink-300">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recentGames.map((game) => (
            <GameCard key={game.appid} game={game} />
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl">Most searched</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {searchedGames.map((game) => (
            <GameCard key={game.appid} game={game} />
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl">Most started</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trendingGames.map((game) => (
            <GameCard key={game.appid} game={game} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
