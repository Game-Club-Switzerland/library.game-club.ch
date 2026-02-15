import { useEffect, useState } from 'react'
import type { ClientConfig } from './types'

const defaultConfig: ClientConfig = {
  steamRealm: 'http://localhost:5173',
  steamReturnUrl: 'http://localhost:5173/#/auth/steam/callback',
  writeMode: 'local'
}

let cachedConfig: ClientConfig | null = null

export async function loadConfig(): Promise<ClientConfig> {
  if (cachedConfig) {
    return cachedConfig
  }
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}config.json`)
    if (!response.ok) {
      cachedConfig = defaultConfig
      return cachedConfig
    }
    const config = (await response.json()) as ClientConfig
    cachedConfig = { ...defaultConfig, ...config }
    return cachedConfig
  } catch {
    cachedConfig = defaultConfig
    return cachedConfig
  }
}

export function useConfig() {
  const [config, setConfig] = useState<ClientConfig>(defaultConfig)

  useEffect(() => {
    loadConfig().then(setConfig).catch(() => setConfig(defaultConfig))
  }, [])

  return config
}
