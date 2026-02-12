interface RateLimitConfig {
  windowMs: number   // Time window in milliseconds
  maxRequests: number // Max requests per window
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// S3: Maximum store size to prevent memory exhaustion attacks
const MAX_STORE_SIZE = 10_000
const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        store.delete(key)
      }
    })
  }, 60_000)
}

export function rateLimit(key: string, config: RateLimitConfig): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    // S3: Evict oldest entries if store is full
    if (store.size >= MAX_STORE_SIZE) {
      let oldestKey: string | null = null
      let oldestTime = Infinity
      store.forEach((e, k) => {
        if (e.resetAt < oldestTime) {
          oldestTime = e.resetAt
          oldestKey = k
        }
      })
      if (oldestKey) store.delete(oldestKey)
    }

    // New window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    }
    store.set(key, newEntry)
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: newEntry.resetAt }
  }

  entry.count++

  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt }
}

// Pre-configured rate limit configs
export const RATE_LIMITS = {
  webhook: { windowMs: 60_000, maxRequests: 100 },       // 100/min
  ai: { windowMs: 60_000, maxRequests: 30 },              // 30/min per org
  properties: { windowMs: 60_000, maxRequests: 60 },      // 60/min per user
  register: { windowMs: 60_000, maxRequests: 5 },         // 5/min per IP
  sendMessage: { windowMs: 60_000, maxRequests: 30 },     // 30/min per user
} as const

// Helper to create rate limit key
export function rateLimitKey(route: string, identifier: string): string {
  return `${route}:${identifier}`
}

// Helper for NextResponse with rate limit headers
export function rateLimitHeaders(result: { remaining: number; resetAt: number }): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
}
