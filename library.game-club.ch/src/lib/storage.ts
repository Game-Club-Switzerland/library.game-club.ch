const storagePrefix = 'game-library'

function storageKey(key: string) {
  return `${storagePrefix}:${key}`
}

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }
  const raw = window.localStorage.getItem(storageKey(key))
  if (!raw) {
    return fallback
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(storageKey(key), JSON.stringify(value, null, 2))
}

export function removeJson(key: string) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(storageKey(key))
}
