import { useEffect, useMemo, useState, type FormEvent } from 'react'
import GameCard from '../components/GameCard'
import GameFilters from '../components/GameFilters'
import { fetchGames } from '../lib/api'
import { createGame } from '../lib/writeApi'
import { fuzzyMatch } from '../lib/search'
import { useSession } from '../lib/session'
import type { Game, GameSummary } from '../lib/types'

const playerTypes = ['Single', 'LocalCoop', 'OnlineCoop', 'Coop', 'PvP', 'Other']

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function GamesPage() {
  const [games, setGames] = useState<GameSummary[]>([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedPlayerType, setSelectedPlayerType] = useState('')
  const [formState, setFormState] = useState({
    appid: '',
    name: '',
    description: '',
    genres: '',
    tags: '',
    minPlayers: '1',
    maxPlayers: '4',
    playerType: 'Coop'
  })
  const { session } = useSession()

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load games'))
  }, [])

  const genreOptions = useMemo(() => {
    const allGenres = new Set<string>()
    games.forEach((game) => game.genres.forEach((genre) => allGenres.add(genre)))
    return Array.from(allGenres).sort()
  }, [games])

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (selectedGenres.length && !selectedGenres.every((genre) => game.genres.includes(genre))) {
        return false
      }
      if (selectedPlayerType && game.players.type !== selectedPlayerType) {
        return false
      }
      if (!fuzzyMatch(game.name, search)) {
        return false
      }
      return true
    })
  }, [games, search, selectedGenres, selectedPlayerType])

  const toggleGenre = (genre: string) => {
    setSelectedGenres((current) =>
      current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre]
    )
  }

  const handleCreateGame = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) {
      setError('Please sign in with Steam before adding games.')
      return
    }
    setError('')
    const appid = formState.appid.trim() || slugify(formState.name)
    const timestamp = new Date().toISOString()
    const game: Game = {
      appid,
      name: formState.name.trim(),
      description: formState.description.trim(),
      preview_image: '',
      hero_image: '',
      gallery: [],
      icon: '',
      thumbnail: '',
      genres: formState.genres
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      tags: formState.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      players: {
        min: Number(formState.minPlayers || 1),
        max: Number(formState.maxPlayers || 1),
        type: formState.playerType as Game['players']['type']
      },
      links: {},
      added_by: {
        steamid: session.steamid,
        display_name: session.display_name,
        timestamp
      },
      reviews: [],
      stats: { starts: 0, searches: 0, downloads: 0 }
    }

    try {
      await createGame(game)
      const summary: GameSummary = {
        appid: game.appid,
        name: game.name,
        thumbnail: game.thumbnail,
        genres: game.genres,
        players: game.players,
        short_description: game.description.slice(0, 140),
        stats: game.stats
      }
      setGames((current) => [summary, ...current])
      setFormState({
        appid: '',
        name: '',
        description: '',
        genres: '',
        tags: '',
        minPlayers: '1',
        maxPlayers: '4',
        playerType: 'Coop'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save game')
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr,2.1fr]">
        <div className="space-y-6">
          <GameFilters
            search={search}
            onSearchChange={setSearch}
            genres={genreOptions}
            selectedGenres={selectedGenres}
            onToggleGenre={toggleGenre}
            playerTypes={playerTypes}
            selectedPlayerType={selectedPlayerType}
            onPlayerTypeChange={setSelectedPlayerType}
          />

          <form className="card space-y-4" onSubmit={handleCreateGame}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg">Add a game</h3>
              <span className="text-xs uppercase tracking-[0.3em] text-ink-400">
                {session ? 'Signed in' : 'Steam required'}
              </span>
            </div>
            <input
              type="text"
              placeholder="Game name"
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
              required
            />
            <textarea
              placeholder="Description"
              value={formState.description}
              onChange={(event) => setFormState({ ...formState, description: event.target.value })}
              className="min-h-[120px] w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
              required
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                placeholder="Custom appid (optional)"
                value={formState.appid}
                onChange={(event) => setFormState({ ...formState, appid: event.target.value })}
                className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Genres (comma separated)"
                value={formState.genres}
                onChange={(event) => setFormState({ ...formState, genres: event.target.value })}
                className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={formState.tags}
              onChange={(event) => setFormState({ ...formState, tags: event.target.value })}
              className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
            />
            <div className="grid gap-3 md:grid-cols-3">
              <input
                type="number"
                min={1}
                value={formState.minPlayers}
                onChange={(event) => setFormState({ ...formState, minPlayers: event.target.value })}
                className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
              />
              <input
                type="number"
                min={1}
                value={formState.maxPlayers}
                onChange={(event) => setFormState({ ...formState, maxPlayers: event.target.value })}
                className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
              />
              <select
                value={formState.playerType}
                onChange={(event) => setFormState({ ...formState, playerType: event.target.value })}
                className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
              >
                {playerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-sun-300 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-ink-900 transition hover:bg-sun-200"
            >
              Save game
            </button>
            <p className="text-xs text-ink-400">
              Local mode stores data in your browser. Configure GitHub write mode for commits or
              pull requests.
            </p>
          </form>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Game library</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-ink-400">
              {filteredGames.length} results
            </span>
          </div>
          {error && <p className="text-sm text-sun-200">{error}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGames.map((game) => (
              <GameCard key={game.appid} game={game} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GamesPage
