/**
 * @module
 * Rate Limit Middleware for Hono.
 */

import type { Context } from '../../context'
import type { MiddlewareHandler } from '../../types'

type KeyGenerator = (c: Context) => string | Promise<string>
type OnLimitExceeded = (c: Context) => Response | Promise<Response>

export type RateLimitOptions = {
  windowMs: number
  limit: number
  keyGenerator?: KeyGenerator
  onLimitExceeded?: OnLimitExceeded
}

const DEFAULT_KEY = '*'

/** Sliding-window rate limit middleware: at most `limit` requests per `windowMs` per key. */
export const rateLimit = (options: RateLimitOptions): MiddlewareHandler => {
  const { windowMs, limit } = options
  const keyGenerator: KeyGenerator = options.keyGenerator || (() => DEFAULT_KEY)
  const onLimitExceeded: OnLimitExceeded =
    options.onLimitExceeded || ((c) => c.text('Too Many Requests', 429))

  const buckets = new Map<string, number[]>()

  return async function rateLimit(c, next) {
    const key = await keyGenerator(c)
    const now = Date.now()
    const windowStart = now - windowMs

    const stamps = (buckets.get(key) || []).filter((t) => t > windowStart)

    if (stamps.length >= limit) {
      buckets.set(key, stamps)
      return onLimitExceeded(c)
    }

    stamps.push(now)
    buckets.set(key, stamps)

    await next()
  }
}
