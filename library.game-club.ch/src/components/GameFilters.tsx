interface GameFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  genres: string[]
  selectedGenres: string[]
  onToggleGenre: (value: string) => void
  playerTypes: string[]
  selectedPlayerType: string
  onPlayerTypeChange: (value: string) => void
}

function GameFilters({
  search,
  onSearchChange,
  genres,
  selectedGenres,
  onToggleGenre,
  playerTypes,
  selectedPlayerType,
  onPlayerTypeChange
}: GameFiltersProps) {
  return (
    <div className="card glass space-y-6">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.2em] text-ink-300">Search</label>
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search games by title"
          className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 placeholder:text-ink-500 focus:border-tide-300 focus:outline-none"
        />
      </div>
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-[0.2em] text-ink-300">Genres</span>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => {
            const active = selectedGenres.includes(genre)
            return (
              <button
                type="button"
                key={genre}
                onClick={() => onToggleGenre(genre)}
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition ${
                  active
                    ? 'border-sun-300 bg-sun-300/20 text-sun-100'
                    : 'border-ink-700 text-ink-300 hover:border-ink-500'
                }`}
              >
                {genre}
              </button>
            )
          })}
        </div>
      </div>
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-[0.2em] text-ink-300">Players</span>
        <select
          value={selectedPlayerType}
          onChange={(event) => onPlayerTypeChange(event.target.value)}
          className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
        >
          <option value="">All types</option>
          {playerTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default GameFilters
