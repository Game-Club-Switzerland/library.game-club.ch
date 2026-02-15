import type { SessionUser } from './types'

export function buildSteamLoginUrl(realm: string, returnUrl: string) {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnUrl,
    'openid.realm': realm,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
  })

  return `https://steamcommunity.com/openid/login?${params.toString()}`
}

export function parseSteamCallback(search: string): SessionUser | null {
  const params = new URLSearchParams(search)
  const claimedId = params.get('openid.claimed_id')
  if (!claimedId) {
    return null
  }
  const steamId = claimedId.split('/').pop()
  if (!steamId) {
    return null
  }
  const nickname = params.get('openid.identity')?.includes(steamId)
    ? `SteamUser_${steamId.slice(-4)}`
    : `SteamUser_${steamId.slice(-4)}`
  return { steamid: steamId, display_name: nickname }
}
