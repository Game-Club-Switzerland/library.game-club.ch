import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const apiDir = path.join(repoRoot, 'api');
const gameDir = path.join(apiDir, 'game');

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;
const token = process.env.GITHUB_TOKEN;
const newestLimit = Number.parseInt(process.env.NEW_GAMES_LIMIT || '6', 10);

const fetchGraphQL = async (query, variables) => {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GitHub API error: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
};

const extractJsonBlock = (body) => {
  const match = body.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    console.warn('Invalid JSON block in discussion body');
    return null;
  }
};

const buildSteamMedia = (steamAppId) => ({
  cover: `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/header.jpg`,
  hero: `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/library_hero.jpg`,
  icon: `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/capsule_184x69.jpg`,
});

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const readJsonFile = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Failed to read ${filePath}: ${error.message}`);
    return null;
  }
};

const loadExistingGames = async () => {
  try {
    const entries = await fs.readdir(gameDir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));
    const games = await Promise.all(
      files.map((entry) => readJsonFile(path.join(gameDir, entry.name)))
    );
    return games.filter((game) => game?.id);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const getNewestTimestamp = (game) => {
  const date = game.addedAt || game.updatedAt || 0;
  return new Date(date).getTime();
};

const getUpdatedTimestamp = (game) => {
  const date = game.updatedAt || game.addedAt || 0;
  return new Date(date).getTime();
};

const loadDiscussions = async () => {
  if (!owner || !repo || !token) {
    console.warn('Missing GitHub environment. Using existing JSON only.');
    return [];
  }

  const query = `
    query ($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        discussions(first: 50, categoryId: null) {
          nodes {
            title
            body
            updatedAt
            createdAt
            category { name }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { owner, repo });
  const nodes = data.repository.discussions.nodes || [];
  return nodes.filter((node) => node.category?.name === 'Game');
};

const buildGame = (discussion) => {
  const payload = extractJsonBlock(discussion.body);
  if (!payload?.id) return null;

  const steamAppId = payload.steamAppId || payload.steam?.appid || null;
  const steam = steamAppId
    ? {
        appid: steamAppId,
        steamdb: `https://steamdb.info/app/${steamAppId}/`,
        store: `https://store.steampowered.com/app/${steamAppId}/`,
      }
    : payload.steam || null;

  const media = {
    cover: payload.media?.cover || (steamAppId ? buildSteamMedia(steamAppId).cover : 'assets/img/placeholder-cover.svg'),
    hero: payload.media?.hero || (steamAppId ? buildSteamMedia(steamAppId).hero : 'assets/img/placeholder-hero.svg'),
    icon: payload.media?.icon || (steamAppId ? buildSteamMedia(steamAppId).icon : 'assets/img/placeholder-icon.svg'),
    screenshots: payload.media?.screenshots || ['assets/img/placeholder-cover.svg'],
    video: payload.media?.video || '',
  };

  return {
    id: payload.id,
    name: payload.name || discussion.title,
    description: payload.description || '',
    genres: payload.genres || [],
    tags: payload.tags || [],
    players: payload.players || { min: 1, max: 1 },
    addedAt: payload.addedAt || discussion.createdAt.slice(0, 10),
    updatedAt: discussion.updatedAt.slice(0, 10),
    homepage: payload.homepage || '',
    startLink: payload.startLink || '',
    downloads: payload.downloads || {},
    steam,
    media,
  };
};

const main = async () => {
  await ensureDir(gameDir);

  const existingGames = await loadExistingGames();
  const discussions = await loadDiscussions();
  const discussionGames = discussions.map(buildGame).filter(Boolean);

  const gameMap = new Map();
  existingGames.forEach((game) => gameMap.set(game.id, game));
  discussionGames.forEach((game) => gameMap.set(game.id, game));

  const games = Array.from(gameMap.values()).sort(
    (a, b) => getUpdatedTimestamp(b) - getUpdatedTimestamp(a)
  );

  if (!games.length) {
    console.warn('No games found. Keeping existing JSON.');
    return;
  }

  const summary = games.map((game) => ({
    id: game.id,
    name: game.name,
    description: game.description,
    genres: game.genres,
    tags: game.tags,
    players: game.players,
    addedAt: game.addedAt,
    updatedAt: game.updatedAt,
    homepage: game.homepage,
    steam: game.steam,
    media: {
      cover: game.media.cover,
      hero: game.media.hero,
      icon: game.media.icon,
    },
  }));

  await fs.writeFile(path.join(apiDir, 'games.json'), JSON.stringify(summary, null, 2));

  const newest = [...summary]
    .sort((a, b) => getNewestTimestamp(b) - getNewestTimestamp(a))
    .slice(0, newestLimit);

  await fs.writeFile(path.join(apiDir, 'new.json'), JSON.stringify(newest, null, 2));

  await Promise.all(
    games.map((game) =>
      fs.writeFile(path.join(gameDir, `${game.id}.json`), JSON.stringify(game, null, 2))
    )
  );

  console.log(`Updated ${games.length} games (discussions + existing files).`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
