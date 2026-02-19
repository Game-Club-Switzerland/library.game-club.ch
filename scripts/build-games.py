import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

def resolve_repo_root() -> Path:
    script_dir = Path(__file__).resolve().parent
    candidates: list[Path] = []

    github_workspace = os.environ.get('GITHUB_WORKSPACE')
    if github_workspace:
        candidates.append(Path(github_workspace).resolve())

    candidates.extend(
        [
            Path.cwd().resolve(),
            script_dir,
            script_dir.parent,
        ]
    )

    for candidate in candidates:
        if (candidate / 'api' / 'game').exists():
            return candidate

    for parent in script_dir.parents:
        if (parent / 'api' / 'game').exists():
            return parent

    return script_dir.parent


repo_root = resolve_repo_root()
api_dir = repo_root / 'api'
game_dir = api_dir / 'game'

owner = os.environ.get('REPO_OWNER')
repo = os.environ.get('REPO_NAME')
token = os.environ.get('GITHUB_TOKEN')
newest_limit = int(os.environ.get('NEW_GAMES_LIMIT', '6'))
steam_appdetails_cache: dict[str, dict | None] = {}


def fetch_graphql(query: str, variables: dict) -> dict:
    payload = json.dumps({'query': query, 'variables': variables}).encode('utf-8')
    request = Request(
        url='https://api.github.com/graphql',
        data=payload,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    try:
        with urlopen(request) as response:
            if response.status < 200 or response.status >= 300:
                raise RuntimeError(f'GitHub API error: {response.status}')
            result = json.loads(response.read().decode('utf-8'))
    except HTTPError as error:
        raise RuntimeError(f'GitHub API error: {error.code}') from error
    except URLError as error:
        raise RuntimeError(f'GitHub API error: {error.reason}') from error

    if result.get('errors'):
        raise RuntimeError(f"GitHub API error: {json.dumps(result['errors'])}")

    return result['data']


def extract_json_block(body: str):
    match = re.search(r'```json\s*([\s\S]*?)```', body or '', re.IGNORECASE)
    if not match:
        return None

    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        print('Invalid JSON block in discussion body', file=sys.stderr)
        return None


def build_steam_media(steam_app_id: int | str) -> dict:
    base = f'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{steam_app_id}'
    return {
        'cover': f'{base}/header.jpg',
        'hero': f'{base}/library_hero.jpg',
        'icon': f'{base}/capsule_231x87.jpg',
    }


def fetch_steam_app_details(steam_app_id: int | str) -> dict | None:
    app_id = str(steam_app_id).strip()
    if not app_id:
        return None

    if app_id in steam_appdetails_cache:
        return steam_appdetails_cache[app_id]

    request = Request(
        url=f'https://store.steampowered.com/api/appdetails/?appids={app_id}&l=de',
        headers={
            'User-Agent': 'game-club-library-build/1.0',
            'Accept': 'application/json',
        },
        method='GET',
    )

    try:
        with urlopen(request) as response:
            if response.status < 200 or response.status >= 300:
                raise RuntimeError(f'Steam API error: {response.status}')
            payload = json.loads(response.read().decode('utf-8'))
    except Exception as error:
        print(f'Failed to fetch Steam appdetails for {app_id}: {error}', file=sys.stderr)
        steam_appdetails_cache[app_id] = None
        return None

    app_payload = payload.get(app_id)
    if not isinstance(app_payload, dict) or not app_payload.get('success'):
        steam_appdetails_cache[app_id] = None
        return None

    data = app_payload.get('data')
    if not isinstance(data, dict):
        steam_appdetails_cache[app_id] = None
        return None

    steam_appdetails_cache[app_id] = data
    return data


def extract_steam_movie_url(movies) -> str:
    return extract_movie_url(movies)


def extract_movie_url(value) -> str:
    if isinstance(value, str):
        return value.strip()

    if isinstance(value, list):
        for item in value:
            url = extract_movie_url(item)
            if url:
                return url
        return ''

    if not isinstance(value, dict):
        return ''

    if isinstance(value.get('hls_h264'), str) and value.get('hls_h264').strip():
        return value.get('hls_h264').strip()

    if isinstance(value.get('hls'), dict):
        hls = value.get('hls')
        hls_url = hls.get('hls_h264') or hls.get('max') or hls.get('480') or ''
        if isinstance(hls_url, str) and hls_url.strip():
            return hls_url.strip()

    if isinstance(value.get('hls'), str) and value.get('hls').strip():
        return value.get('hls').strip()

    if isinstance(value.get('url'), str) and value.get('url').strip():
        return value.get('url').strip()

    if isinstance(value.get('webm'), dict):
        webm = value.get('webm')
        return (webm.get('max') or webm.get('480') or '').strip()

    if isinstance(value.get('mp4'), dict):
        mp4 = value.get('mp4')
        return (mp4.get('max') or mp4.get('480') or '').strip()

    return ''


def extract_steam_app_id(game: dict):
    steam_payload = game.get('steam') if isinstance(game.get('steam'), dict) else {}
    return game.get('steamAppId') or steam_payload.get('appid')


def has_non_empty_items(values) -> bool:
    return isinstance(values, list) and any(
        isinstance(item, str) and item.strip() for item in values
    )


def normalize_categories(game: dict) -> dict:
    categories_value = game.get('categories')
    if not has_non_empty_items(categories_value):
        categories_value = game.get('tags')

    categories = []
    if isinstance(categories_value, list):
        categories = [
            item.strip()
            for item in categories_value
            if isinstance(item, str) and item.strip()
        ]

    normalized_game = dict(game)
    normalized_game['categories'] = categories
    normalized_game.pop('tags', None)
    return normalized_game


def is_placeholder_asset(value) -> bool:
    return isinstance(value, str) and value.strip().startswith('assets/img/placeholder-')


def has_meaningful_media_value(value) -> bool:
    return isinstance(value, str) and value.strip() and not is_placeholder_asset(value)


def has_meaningful_screenshots(values) -> bool:
    if not has_non_empty_items(values):
        return False
    return any(not is_placeholder_asset(item) for item in values if isinstance(item, str) and item.strip())


def normalize_media_with_steam(game: dict) -> dict:
    normalized_game = normalize_categories(game)
    steam_app_id = extract_steam_app_id(normalized_game)
    if not steam_app_id:
        return normalized_game

    steam_media = build_steam_media(steam_app_id)
    steam_details = fetch_steam_app_details(steam_app_id)

    steam_header_image = steam_details.get('header_image') if isinstance(steam_details, dict) else None
    steam_capsule_image = steam_details.get('capsule_image') if isinstance(steam_details, dict) else None
    steam_screenshots = (
        [item.get('path_full') for item in steam_details.get('screenshots', []) if item.get('path_full')]
        if isinstance(steam_details, dict)
        else []
    )
    steam_video = extract_steam_movie_url(steam_details.get('movies')) if isinstance(steam_details, dict) else ''

    payload_media = (
        normalized_game.get('media')
        if isinstance(normalized_game.get('media'), dict)
        else {}
    )
    payload_screenshots = payload_media.get('screenshots')
    payload_video = payload_media.get('video')
    payload_movies_video = extract_movie_url(
        payload_media.get('movies') or normalized_game.get('movies')
    )

    normalized_game = dict(normalized_game)
    normalized_game['media'] = {
        'cover': payload_media.get('cover') if has_meaningful_media_value(payload_media.get('cover')) else (steam_header_image or steam_media.get('cover') or 'assets/img/placeholder-cover.svg'),
        'hero': payload_media.get('hero') if has_meaningful_media_value(payload_media.get('hero')) else (steam_media.get('hero') or 'assets/img/placeholder-hero.svg'),
        'icon': payload_media.get('icon') if has_meaningful_media_value(payload_media.get('icon')) else (steam_capsule_image or steam_media.get('icon') or 'assets/img/placeholder-icon.svg'),
        'screenshots': payload_screenshots if has_meaningful_screenshots(payload_screenshots) else (steam_screenshots or ['assets/img/placeholder-cover.svg']),
        'video': payload_video if isinstance(payload_video, str) and payload_video.strip() else (payload_movies_video or steam_video or ''),
    }

    return normalized_game


def read_json_file(file_path: Path):
    try:
        return json.loads(file_path.read_text(encoding='utf-8'))
    except Exception as error:
        print(f'Failed to read {file_path}: {error}', file=sys.stderr)
        return None


def load_existing_games() -> list[dict]:
    if not game_dir.exists():
        return []

    games = []
    for file_path in game_dir.glob('*.json'):
        game = read_json_file(file_path)
        if isinstance(game, dict) and game.get('id'):
            games.append(game)
    return games


def parse_timestamp(value) -> float:
    if not value:
        return 0.0

    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip()
    if not text:
        return 0.0

    try:
        return datetime.fromisoformat(text.replace('Z', '+00:00')).timestamp()
    except ValueError:
        return 0.0


def get_newest_timestamp(game: dict) -> float:
    return parse_timestamp(game.get('addedAt') or game.get('updatedAt'))


def get_updated_timestamp(game: dict) -> float:
    return parse_timestamp(game.get('updatedAt') or game.get('addedAt'))


def load_discussions() -> list[dict]:
    if not owner or not repo or not token:
        print('Missing GitHub environment. Using existing JSON only.', file=sys.stderr)
        return []

    query = '''
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
    '''

    data = fetch_graphql(query, {'owner': owner, 'repo': repo})
    nodes = data.get('repository', {}).get('discussions', {}).get('nodes', [])
    return [node for node in nodes if node.get('category', {}).get('name') == 'Game']


def build_game(discussion: dict):
    payload = extract_json_block(discussion.get('body', ''))
    if not isinstance(payload, dict) or not payload.get('id'):
        return None

    steam_payload = payload.get('steam') if isinstance(payload.get('steam'), dict) else {}
    steam_app_id = payload.get('steamAppId') or steam_payload.get('appid')
    steam = (
        {
            'appid': steam_app_id,
            'steamdb': f'https://steamdb.info/app/{steam_app_id}/',
            'store': f'https://store.steampowered.com/app/{steam_app_id}/',
        }
        if steam_app_id
        else (payload.get('steam') or None)
    )

    steam_details = fetch_steam_app_details(steam_app_id) if steam_app_id else None

    steam_header_image = steam_details.get('header_image') if isinstance(steam_details, dict) else None
    steam_short_description = (
        steam_details.get('short_description') if isinstance(steam_details, dict) else None
    )
    steam_capsule_image = steam_details.get('capsule_image') if isinstance(steam_details, dict) else None
    steam_website = steam_details.get('website') if isinstance(steam_details, dict) else None
    steam_categories = (
        [item.get('description') for item in steam_details.get('categories', []) if item.get('description')]
        if isinstance(steam_details, dict)
        else []
    )
    steam_genres = (
        [item.get('description') for item in steam_details.get('genres', []) if item.get('description')]
        if isinstance(steam_details, dict)
        else []
    )
    steam_screenshots = (
        [item.get('path_full') for item in steam_details.get('screenshots', []) if item.get('path_full')]
        if isinstance(steam_details, dict)
        else []
    )
    steam_video = extract_steam_movie_url(steam_details.get('movies')) if isinstance(steam_details, dict) else ''

    payload_media = payload.get('media') if isinstance(payload.get('media'), dict) else {}
    payload_movies_video = extract_movie_url(payload_media.get('movies') or payload.get('movies'))

    media = {
        'cover': payload_media.get('cover') or steam_header_image or 'assets/img/placeholder-cover.svg',
        'hero': payload_media.get('hero') or 'assets/img/placeholder-hero.svg',
        'icon': payload_media.get('icon') or steam_capsule_image or 'assets/img/placeholder-icon.svg',
        'screenshots': payload_media.get('screenshots') or steam_screenshots or ['assets/img/placeholder-cover.svg'],
        'video': payload_media.get('video') or payload_movies_video or steam_video or '',
    }

    game = {
        'id': payload['id'],
        'name': payload.get('name') or discussion.get('title', ''),
        'description': steam_short_description or payload.get('description') or '',
        'genres': steam_genres or payload.get('genres') or [],
        'categories': steam_categories or payload.get('categories') or payload.get('tags') or [],
        'players': payload.get('players') or {'min': 1, 'max': 1},
        'addedAt': payload.get('addedAt') or (discussion.get('createdAt', '')[:10]),
        'updatedAt': (discussion.get('updatedAt', '')[:10]),
        'homepage': steam_website or payload.get('homepage') or '',
        'startLink': payload.get('startLink') or '',
        'downloads': payload.get('downloads') or {},
        'steam': steam,
        'media': media,
    }

    return normalize_media_with_steam(normalize_categories(game))


def main() -> None:
    game_dir.mkdir(parents=True, exist_ok=True)

    existing_games = load_existing_games()
    discussions = load_discussions()
    discussion_games = [game for game in (build_game(d) for d in discussions) if game]

    game_map = {game['id']: game for game in existing_games}
    for game in discussion_games:
        game_map[game['id']] = game

    normalized_games = [normalize_media_with_steam(normalize_categories(game)) for game in game_map.values()]
    games = sorted(normalized_games, key=get_updated_timestamp, reverse=True)

    if not games:
        print('No games found. Keeping existing JSON.', file=sys.stderr)
        return

    summary = []
    for game in games:
        summary_item = {
            'id': game.get('id'),
            'name': game.get('name'),
            'description': game.get('description'),
            'genres': game.get('genres'),
            'categories': game.get('categories'),
            'players': game.get('players'),
            'addedAt': game.get('addedAt'),
            'updatedAt': game.get('updatedAt'),
            'media': {
                'cover': (game.get('media') or {}).get('cover'),
                'hero': (game.get('media') or {}).get('hero'),
                'icon': (game.get('media') or {}).get('icon'),
            },
        }

        if 'homepage' in game:
            summary_item['homepage'] = game.get('homepage')
        if 'steam' in game:
            summary_item['steam'] = game.get('steam')

        summary.append(summary_item)

    (api_dir / 'games.json').write_text(
        json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8'
    )

    newest = sorted(summary, key=get_newest_timestamp, reverse=True)[:newest_limit]
    (api_dir / 'new.json').write_text(
        json.dumps(newest, indent=2, ensure_ascii=False), encoding='utf-8'
    )

    for game in games:
        (game_dir / f"{game['id']}.json").write_text(
            json.dumps(game, indent=2, ensure_ascii=False), encoding='utf-8'
        )

    print(f'Updated {len(games)} games (discussions + existing files).')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(error, file=sys.stderr)
        sys.exit(1)
