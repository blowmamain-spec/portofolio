const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/**
 * Minimal fetch wrapper for the Laravel API. Returns `fallback` instead of
 * throwing when the request fails — most call sites are public content
 * sections that should degrade to an empty state, not crash the page.
 */
export async function apiGet(path, fallback = null) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return fallback
    return await res.json()
  } catch {
    return fallback
  }
}
