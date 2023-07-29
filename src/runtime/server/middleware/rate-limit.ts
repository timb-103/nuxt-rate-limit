import { defineEventHandler, createError } from 'h3'
import { isRateLimited } from '../utils/rate-limit'
import { useRuntimeConfig } from '#imports'

/**
 * Function that checks a user rate limit.
 *
 * Only works on API routes, eg: /api/hello
 */
export default defineEventHandler(async (event) => {
  const isAPI = event.node.req.url?.includes('/api/')
  const isEnabled = useRuntimeConfig().public.nuxtRateLimit.enabled

  if (isAPI && isEnabled) {
    const limited = isRateLimited(event)

    if (limited) {
      throw createError({
        statusCode: 429,
        statusMessage: `Too many requests. Please try again in ${limited} seconds.`,
      })
    }
  }
})
