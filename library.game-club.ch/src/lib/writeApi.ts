import { loadConfig } from './config'
import { fetchGame, loadOverrides, saveOverrides } from './api'
import { sanitizeMarkdown } from './sanitize'
import type { Game, GameReview, SessionUser } from './types'

function requireFields(game: Game) {
  if (!game.appid.trim() || !game.name.trim() || !game.description.trim()) {
    throw new Error('Name and description are required')
  }
  if (!game.players || game.players.min <= 0 || game.players.max <= 0) {
    throw new Error('Player counts must be positive')
  }
}

async function writeLocal(game: Game) {
  const overrides = loadOverrides()
  overrides[game.appid] = game
  saveOverrides(overrides)
}

async function writeGithub(payload: unknown, endpoint: string) {
  const config = await loadConfig()
  if (!config.githubApiUrl) {
    throw new Error('Missing githubApiUrl in config.json')
  }
  const response = await fetch(config.githubApiUrl + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    throw new Error('GitHub write request failed')
  }
}

export async function createGame(game: Game) {
  requireFields(game)
  const config = await loadConfig()
  if (config.writeMode === 'github') {
    await writeGithub({ game }, '/api/game')
    return game
  }
  await writeLocal(game)
  return game
}

export async function updateGame(appid: string, patch: Partial<Game>) {
  const existing = await fetchGame(appid)
  if (!existing) {
    throw new Error('Game not found')
  }
  const updated: Game = {
    ...existing,
    ...patch,
    modified_by: patch.modified_by ?? existing.modified_by
  }
  requireFields(updated)
  const config = await loadConfig()
  if (config.writeMode === 'github') {
    await writeGithub({ appid, patch }, `/api/game/${appid}`)
    return updated
  }
  await writeLocal(updated)
  return updated
}

export async function addReview(appid: string, review: GameReview, user: SessionUser) {
  const existing = await fetchGame(appid)
  if (!existing) {
    throw new Error('Game not found')
  }
  const sanitizedReview: GameReview = {
    ...review,
    steamid: user.steamid,
    display_name: user.display_name,
    text: sanitizeMarkdown(review.text)
  }
  const updated: Game = {
    ...existing,
    reviews: [...existing.reviews, sanitizedReview]
  }
  const config = await loadConfig()
  if (config.writeMode === 'github') {
    await writeGithub({ appid, review: sanitizedReview }, `/api/game/${appid}/review`)
    return updated
  }
  await writeLocal(updated)
  return updated
}
