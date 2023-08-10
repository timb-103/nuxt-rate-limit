import { defineEventHandler, createError, setHeader, getRequestURL } from 'h3'
import { getRateLimitPayload} from '../utils/rate-limit'
import { useRuntimeConfig } from '#imports'

/**
 * Function that checks a user rate limit.
 *
 * Only works on API routes, eg: /api/hello
 */
export default defineEventHandler(async (event) => {
  const { headers } = useRuntimeConfig().nuxtRateLimit

  const payload = getRateLimitPayload(event)
  // route does not have rate limiting configured
  if (!payload) {
    return
  }
  const { limited, current, limit, secondsUntilReset } = payload

  if (headers) {
    setHeader(event, 'x-ratelimit-current', current)
    setHeader(event, 'x-ratelimit-limit', limit)
    setHeader(event, 'x-ratelimit-reset', secondsUntilReset)
  }

  if (limited) {
    throw createError({
      statusCode: 429,
      statusMessage: `Too many requests. Please try again in ${secondsUntilReset} seconds.`,
    })
  }
})
