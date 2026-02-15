import { Link } from 'react-router-dom'
import type { GameSummary } from '../lib/types'

interface GameCardProps {
  game: GameSummary
}

function GameCard({ game }: GameCardProps) {
  return (
    <Link
      to={`/game/${game.appid}`}
      className="group flex h-full flex-col justify-between rounded-2xl border border-ink-700/60 bg-ink-800/70 p-5 shadow-glow transition hover:-translate-y-1 hover:border-tide-300/60"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink-50">{game.name}</h3>
          <span className="badge">{game.players.type}</span>
        </div>
        <p className="text-sm text-ink-200">{game.short_description}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {game.genres.slice(0, 3).map((genre) => (
          <span key={genre} className="badge">
            {genre}
          </span>
        ))}
      </div>
    </Link>
  )
}

export default GameCard
