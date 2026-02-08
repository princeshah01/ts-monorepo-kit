// ---------------------------------------------------------------------------
// Deterministic cache-key generator.
//
// Produces a stable, human-readable key from an HTTP request so that
// identical requests always map to the same cache entry — even if query
// params arrive in a different order.
//
// Usage:
//   import { buildCacheKey } from "@repo/redis"
//   const key = buildCacheKey(req)          // e.g. "GET:/users?page=1&sort=name"
//   const full = redis.key("users", key)    // e.g. "web:users:GET:/users?page=1&sort=name"
// ---------------------------------------------------------------------------

interface KeySource {
  method: string
  path: string
  query?: Record<string, unknown>
}

/** Build a deterministic cache key from an HTTP request. */
export function buildCacheKey(req: KeySource): string {
  const method = req.method.toUpperCase()
  const path = req.path

  // Sort query params alphabetically so ?b=2&a=1 === ?a=1&b=2
  const query = req.query ?? {}
  const sortedKeys = Object.keys(query).sort()

  if (sortedKeys.length === 0) return `${method}:${path}`

  const qs = sortedKeys.map(k => `${k}=${String(query[k])}`).join("&")

  return `${method}:${path}?${qs}`
}
