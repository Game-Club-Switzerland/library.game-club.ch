export type PlayerType =
  | 'Single'
  | 'LocalCoop'
  | 'OnlineCoop'
  | 'Coop'
  | 'PvP'
  | 'Other'

export interface GamePlayers {
  min: number
  max: number
  type: PlayerType
}

export interface GameLinks {
  start_link?: string
  download_windows?: string
  download_linux?: string
}

export interface GamePerson {
  steamid: string
  display_name: string
  timestamp: string
}

export interface GameReview {
  steamid: string
  display_name: string
  rating: number
  text: string
  timestamp: string
}

export interface GameStats {
  starts: number
  searches: number
  downloads: number
}

export interface Game {
  appid: string
  name: string
  description: string
  preview_image: string
  hero_image: string
  gallery: string[]
  icon: string
  thumbnail: string
  video?: string
  genres: string[]
  tags: string[]
  players: GamePlayers
  links: GameLinks
  added_by: GamePerson
  modified_by?: GamePerson
  reviews: GameReview[]
  stats: GameStats
}

export interface GameSummary {
  appid: string
  name: string
  thumbnail: string
  genres: string[]
  players: GamePlayers
  short_description: string
  stats?: GameStats
}

export interface SessionUser {
  steamid: string
  display_name: string
}

export interface ClientConfig {
  steamRealm: string
  steamReturnUrl: string
  writeMode: 'local' | 'github'
  githubApiUrl?: string
  githubRepo?: string
  githubToken?: string
  steamApiKey?: string
}
