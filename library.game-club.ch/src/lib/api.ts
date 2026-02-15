import type { Game, GameSummary } from './types'
import { loadJson, saveJson } from './storage'

const overridesKey = 'game-overrides'

function getApiUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

export function loadOverrides() {
  return loadJson<Record<string, Game>>(overridesKey, {})
}

export function saveOverrides(overrides: Record<string, Game>) {
  saveJson(overridesKey, overrides)
}

export async function fetchGames(): Promise<GameSummary[]> {
  const response = await fetch(getApiUrl('api/games.json'))
  if (!response.ok) {
    throw new Error('Unable to load games list')
  }
  const games = (await response.json()) as GameSummary[]
  const overrides = loadOverrides()
  const merged = games.map((game) => {
    const override = overrides[game.appid]
    if (!override) {
      return game
    }
    return {
      appid: override.appid,
      name: override.name,
      thumbnail: override.thumbnail,
      genres: override.genres,
      players: override.players,
      short_description: override.description.slice(0, 140),
      stats: override.stats
    }
  })

  const overrideOnly = Object.values(overrides).filter(
    (override) => !games.find((game) => game.appid === override.appid)
  )

  const overrideSummaries = overrideOnly.map((override) => ({
    appid: override.appid,
    name: override.name,
    thumbnail: override.thumbnail,
    genres: override.genres,
    players: override.players,
    short_description: override.description.slice(0, 140),
    stats: override.stats
  }))

  return [...merged, ...overrideSummaries]
}

export async function fetchGame(appid: string): Promise<Game | null> {
  const overrides = loadOverrides()
  if (overrides[appid]) {
    return overrides[appid]
  }
  const response = await fetch(getApiUrl(`api/game/${appid}.json`))
  if (!response.ok) {
    return null
  }
  return (await response.json()) as Game
}
