# Game Library - Game Club

Static webapp for library.game-club.ch with SteamDB-like styling. Data is served from JSON in /api and updated from GitHub Discussions (category: Game).

## Project structure

```
.
├─ api/
│  ├─ games.json
│  └─ game/
│     ├─ flatout-2.json
│     └─ ...
├─ assets/
│  ├─ css/styles.css
│  ├─ js/
│  └─ img/
├─ scripts/build-games.py
├─ .github/workflows/build-games.yml
├─ index.html
├─ library.html
├─ game.html
└─ random.html
```

## Pages

- Start page: latest games and featured card.
- Library: table with search and filters.
- Game detail: full data, media, links.
- Random: filterable random picker.

## UI components

- Sticky header with Game Club logo and navigation
- Hero card with featured game
- Card grid for latest games
- Filters panel (search, genre, players, tags)
- SteamDB-style table view
- Detail layout with media gallery and link list
- Random picker result card

## Data model

Every game entry uses the same core schema. `id` is used for routing and the API file name (e.g. /api/game/{id}.json).

```json
{
  "id": "flatout-2",
  "name": "FlatOut 2",
  "description": "Arcade racing chaos.",
  "genres": ["Racing", "Action"],
  "tags": ["Arcade", "Destruction"],
  "players": {"min": 1, "max": 4},
  "addedAt": "2026-02-10",
  "updatedAt": "2026-02-16",
  "homepage": "https://example.com",
  "startLink": "https://library.game-club.ch/downloads/flatout2/start",
  "downloads": {
    "windows": "https://.../windows.zip",
    "linux": "https://.../linux.tar.gz"
  },
  "steam": {
    "appid": 2990,
    "steamdb": "https://steamdb.info/app/2990/",
    "store": "https://store.steampowered.com/app/2990/"
  },
  "media": {
    "cover": "https://.../header.jpg",
    "hero": "https://.../library_hero.jpg",
    "icon": "https://.../capsule_184x69.jpg",
    "screenshots": ["..."],
    "video": ""
  }
}
```

## API outputs

- /api/games.json

```json
[
  {
    "id": "flatout-2",
    "name": "FlatOut 2",
    "description": "Arcade racing chaos with crash physics and split-screen action.",
    "genres": ["Racing", "Action"],
    "tags": ["Arcade", "Destruction", "Split-Screen"],
    "players": {"min": 1, "max": 4},
    "addedAt": "2026-02-10",
    "updatedAt": "2026-02-16",
    "steam": {"appid": 2990, "steamdb": "https://steamdb.info/app/2990/", "store": "https://store.steampowered.com/app/2990/"},
    "media": {
      "cover": "https://cdn.akamai.steamstatic.com/steam/apps/2990/header.jpg",
      "hero": "https://cdn.akamai.steamstatic.com/steam/apps/2990/library_hero.jpg",
      "icon": "https://cdn.akamai.steamstatic.com/steam/apps/2990/capsule_184x69.jpg"
    }
  }
]
```

- /api/game/{id}.json (full detail entry)

## GitHub Discussions input

Create or update a discussion in category Game. Add a JSON block in the body:

```json
{
  "id": "my-game-id",
  "name": "My Game",
  "description": "Short summary.",
  "genres": ["Strategy"],
  "tags": ["Coop", "LAN"],
  "players": {"min": 2, "max": 8},
  "steamAppId": 123456,
  "homepage": "https://example.com",
  "startLink": "https://library.game-club.ch/downloads/my-game/start",
  "downloads": {"windows": "https://..."},
  "media": {
    "screenshots": ["assets/img/placeholder-cover.svg"],
    "video": ""
  }
}
```

If `steamAppId` is present, the build script auto-fills SteamDB links and fetches `header_image`, `short_description`, `capsule_image`, `website`, `categories` (mapped to `tags`), `genres`, `screenshots`, and `movies` from Steam appdetails.

## GitHub Actions workflow sketch

See .github/workflows/build-games.yml:
- Trigger: discussion created/edited, schedule (every 6h), manual, or push to api/game/*.json
- Steps: checkout, setup python, run scripts/build-games.py, commit updated JSON

## Example data

The repository already includes sample games in /api, such as FlatOut 2, World in Conflict, Hedgewars, Teeworlds, Beyond All Reason, Soldat, SuperTuxKart, OpenRA, Renegade X, Unreal Tournament, and Unreal Tournament 2004.
