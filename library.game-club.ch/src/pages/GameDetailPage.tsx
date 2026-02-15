import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReviewList from '../components/ReviewList'
import { fetchGame } from '../lib/api'
import { addReview, updateGame } from '../lib/writeApi'
import { useSession } from '../lib/session'
import type { Game } from '../lib/types'

function GameDetailPage() {
  const { appid } = useParams<{ appid: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [error, setError] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState('5')
  const [editState, setEditState] = useState({
    description: '',
    genres: '',
    tags: '',
    startLink: '',
    downloadWindows: '',
    downloadLinux: ''
  })
  const { session } = useSession()

  useEffect(() => {
    if (!appid) {
      return
    }
    fetchGame(appid)
      .then((data) => {
        if (!data) {
          setError('Game not found')
          return
        }
        setGame(data)
        setEditState({
          description: data.description,
          genres: data.genres.join(', '),
          tags: data.tags.join(', '),
          startLink: data.links.start_link ?? '',
          downloadWindows: data.links.download_windows ?? '',
          downloadLinux: data.links.download_linux ?? ''
        })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load game'))
  }, [appid])

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!game || !session) {
      setError('Sign in before leaving a review.')
      return
    }
    setError('')
    try {
      const updated = await addReview(
        game.appid,
        {
          steamid: session.steamid,
          display_name: session.display_name,
          rating: Number(reviewRating),
          text: reviewText,
          timestamp: new Date().toISOString()
        },
        session
      )
      setGame(updated)
      setReviewText('')
      setReviewRating('5')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit review')
    }
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!game || !session) {
      setError('Sign in before editing a game.')
      return
    }
    setError('')
    try {
      const updated = await updateGame(game.appid, {
        description: editState.description,
        genres: editState.genres.split(',').map((item) => item.trim()).filter(Boolean),
        tags: editState.tags.split(',').map((item) => item.trim()).filter(Boolean),
        links: {
          start_link: editState.startLink,
          download_windows: editState.downloadWindows,
          download_linux: editState.downloadLinux
        },
        modified_by: {
          steamid: session.steamid,
          display_name: session.display_name,
          timestamp: new Date().toISOString()
        }
      })
      setGame(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save changes')
    }
  }

  if (!game) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <p className="text-sm text-ink-300">{error || 'Loading game...'}</p>
        <Link to="/games" className="mt-4 inline-block text-sm uppercase tracking-wide text-ink-400">
          Back to games
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.4fr,0.6fr]">
        <section className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl">{game.name}</h1>
                <p className="mt-2 text-sm text-ink-300">{game.appid}</p>
              </div>
              <span className="badge">{game.players.type}</span>
            </div>
            <p className="text-sm text-ink-200">{game.description}</p>
            <div className="flex flex-wrap gap-2">
              {game.genres.map((genre) => (
                <span key={genre} className="badge">
                  {genre}
                </span>
              ))}
              {game.tags.map((tag) => (
                <span key={tag} className="badge">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {game.links.start_link && (
                <a
                  className="rounded-xl border border-tide-300/40 px-4 py-3 text-center text-sm font-semibold text-tide-100"
                  href={game.links.start_link}
                >
                  Launch game
                </a>
              )}
              {game.links.download_windows && (
                <a
                  className="rounded-xl border border-sun-300/40 px-4 py-3 text-center text-sm font-semibold text-sun-100"
                  href={game.links.download_windows}
                >
                  Download (Windows)
                </a>
              )}
              {game.links.download_linux && (
                <a
                  className="rounded-xl border border-ink-600 px-4 py-3 text-center text-sm font-semibold text-ink-100"
                  href={game.links.download_linux}
                >
                  Download (Linux)
                </a>
              )}
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-xl">Reviews</h2>
            <ReviewList reviews={game.reviews} />
            <form className="space-y-3" onSubmit={handleReviewSubmit}>
              <div className="grid gap-3 md:grid-cols-[0.3fr,0.7fr]">
                <select
                  value={reviewRating}
                  onChange={(event) => setReviewRating(event.target.value)}
                  className="rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Write a review (Markdown supported)"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  className="rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-sun-300 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-ink-900 transition hover:bg-sun-200"
              >
                Submit review
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-6">
          <form className="card space-y-4" onSubmit={handleEditSubmit}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Edit details</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-ink-400">
                {session ? 'Signed in' : 'Steam required'}
              </span>
            </div>
            <textarea
              value={editState.description}
              onChange={(event) => setEditState({ ...editState, description: event.target.value })}
              className="min-h-[140px] w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
            />
            <input
              type="text"
              value={editState.genres}
              onChange={(event) => setEditState({ ...editState, genres: event.target.value })}
              placeholder="Genres"
              className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
            />
            <input
              type="text"
              value={editState.tags}
              onChange={(event) => setEditState({ ...editState, tags: event.target.value })}
              placeholder="Tags"
              className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
            />
            <input
              type="text"
              value={editState.startLink}
              onChange={(event) => setEditState({ ...editState, startLink: event.target.value })}
              placeholder="Start link"
              className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
            />
            <input
              type="text"
              value={editState.downloadWindows}
              onChange={(event) => setEditState({ ...editState, downloadWindows: event.target.value })}
              placeholder="Download (Windows)"
              className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
            />
            <input
              type="text"
              value={editState.downloadLinux}
              onChange={(event) => setEditState({ ...editState, downloadLinux: event.target.value })}
              placeholder="Download (Linux)"
              className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-ink-50 focus:border-tide-300 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl border border-ink-600 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-ink-200 transition hover:border-tide-300 hover:text-tide-100"
            >
              Save changes
            </button>
            {error && <p className="text-sm text-sun-200">{error}</p>}
          </form>

          <div className="card space-y-2 text-xs text-ink-300">
            <div className="text-xs uppercase tracking-[0.3em] text-ink-400">Players</div>
            <div>
              {game.players.min} - {game.players.max} ({game.players.type})
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-ink-400">Added by</div>
            <div>
              {game.added_by.display_name} · {new Date(game.added_by.timestamp).toLocaleDateString()}
            </div>
            {game.modified_by && (
              <>
                <div className="text-xs uppercase tracking-[0.3em] text-ink-400">Last edit</div>
                <div>
                  {game.modified_by.display_name} ·{' '}
                  {new Date(game.modified_by.timestamp).toLocaleDateString()}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default GameDetailPage
