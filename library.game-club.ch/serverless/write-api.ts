import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Game, GameReview } from '../src/lib/types'

interface WriteRequest {
  game?: Game
  patch?: Partial<Game>
  review?: GameReview
  appid?: string
}

const githubApiBase = 'https://api.github.com'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function readBody(request: Request): Promise<WriteRequest> {
  try {
    return (await request.json()) as WriteRequest
  } catch {
    return {}
  }
}

function getEnv(name: string) {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value.trim() : undefined
}

async function writeLocalFile(appid: string, game: Game) {
  const filePath = path.join(process.cwd(), 'data', 'games', `${appid}.json`)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(game, null, 2) + '\n', 'utf8')
}

async function githubRequest(url: string, token: string, options: RequestInit) {
  return fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers ?? {})
    }
  })
}

async function upsertGameInGithub(game: Game) {
  const token = getEnv('GITHUB_TOKEN')
  const repo = getEnv('GITHUB_REPO')
  if (!token || !repo) {
    throw new Error('Missing GitHub credentials')
  }

  const [owner, name] = repo.split('/')
  if (!owner || !name) {
    throw new Error('GITHUB_REPO must be in the form owner/name')
  }

  const filePath = `data/games/${game.appid}.json`
  const content = Buffer.from(JSON.stringify(game, null, 2) + '\n').toString('base64')
  const getUrl = `${githubApiBase}/repos/${owner}/${name}/contents/${filePath}`
  const existing = await githubRequest(getUrl, token, { method: 'GET' })
  const payload: Record<string, unknown> = {
    message: `Update game ${game.appid}`,
    content
  }

  if (existing.ok) {
    const data = (await existing.json()) as { sha?: string }
    if (data.sha) {
      payload.sha = data.sha
    }
  }

  const putResponse = await githubRequest(getUrl, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!putResponse.ok) {
    throw new Error('GitHub write failed')
  }
}

async function upsertGame(appid: string, game: Game) {
  const localWrite = getEnv('LOCAL_WRITE')
  if (localWrite) {
    await writeLocalFile(appid, game)
    return
  }
  await upsertGameInGithub(game)
}

async function loadGameFromLocal(appid: string) {
  const filePath = path.join(process.cwd(), 'data', 'games', `${appid}.json`)
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as Game
}

export async function handler(request: Request) {
  const url = new URL(request.url)
  const body = await readBody(request)
  const appid = body.appid ?? body.game?.appid ?? url.pathname.split('/').pop()
  if (!appid) {
    return jsonResponse(400, { error: 'Missing appid' })
  }

  if (url.pathname.endsWith('/review')) {
    if (!body.review) {
      return jsonResponse(400, { error: 'Missing review' })
    }
    const existing = await loadGameFromLocal(appid)
    const updated: Game = { ...existing, reviews: [...existing.reviews, body.review] }
    await upsertGame(appid, updated)
    return jsonResponse(200, updated)
  }

  if (body.game) {
    await upsertGame(appid, body.game)
    return jsonResponse(200, body.game)
  }

  if (body.patch) {
    const existing = await loadGameFromLocal(appid)
    const updated: Game = { ...existing, ...body.patch }
    await upsertGame(appid, updated)
    return jsonResponse(200, updated)
  }

  return jsonResponse(400, { error: 'Invalid payload' })
}
