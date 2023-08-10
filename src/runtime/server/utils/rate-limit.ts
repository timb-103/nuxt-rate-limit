import {H3Event, getRequestHeader, getRequestURL} from 'h3'
import { getRouteRules } from '#imports'
import type { RateLimit } from '../../../types'
import {RouteRateLimitOptions} from "../../../types";

// store rate limits for each IP address and URL
const rateLimit: RateLimit = {}

/**
 * This function checks whether a request from a given IP address and URL should be rate limited
 *
 * If rate limited it will return the seconds until they can try again.
 *
 * @param event
 */
export function getRateLimitPayload(event: H3Event) : false | { limited: boolean; limit: number; current: number; secondsUntilReset: number } {
  const routeRules = getRouteRules(event)
  if (!routeRules['nuxt-rate-limit']) {
    return false
  }
  const { maxRequests, intervalSeconds, route } = routeRules['nuxt-rate-limit'] as RouteRateLimitOptions
  const intervalMs = intervalSeconds * 1000
  const ip = getIP(event)

  // remove any IPs & URLs that haven't been used since interval to keep object small
  const currentTime = Date.now()
  Object.keys(rateLimit).forEach((key: keyof RateLimit) => {
    Object.keys(rateLimit[key]).forEach((urlKey: string) => {
      const item = rateLimit[key][urlKey]
      const timeSinceLastRequest = currentTime - item.firstRequestTime
      const routeInterval = intervalSeconds * 1000

      // remove the url
      if (timeSinceLastRequest >= routeInterval) {
        delete rateLimit[key][urlKey]
      }
    })

    // remove the ip
    if (!Object.keys(rateLimit[key]).length) {
      delete rateLimit[key]
    }
  })

  // add a rate limit object, or set to existing
  rateLimit[ip] = rateLimit[ip] || {}
  // we index the rate limiting based on the route rule route, this allows us to rate limit a wild card entry using the same
  // rate limit object, eg: /api/* will use the same rate limit object for /api/foo and /api/bar
  rateLimit[ip][route] = rateLimit[ip][route] || {
    firstRequestTime: Number(new Date()),
    requests: 0,
  }

  const timeSinceFirstRequest = currentTime - rateLimit[ip][route].firstRequestTime
  const secondsUntilReset = Math.ceil((intervalMs - timeSinceFirstRequest) / 1000)
  const limited = rateLimit[ip][route].requests >= maxRequests
  // increment the requests counter
  if (!limited) {
    rateLimit[ip][route].requests++
  }

  return { limited, limit: maxRequests, current: rateLimit[ip][route].requests, secondsUntilReset }
}

/**
 * Get the IP of the visitor to use as rate limit key
 *
 * @param event
 */
function getIP(event: H3Event) {
  const req = event?.node?.req
  const xForwardedFor = getRequestHeader(event, 'x-forwarded-for')?.split(',')?.pop()?.trim() || ''
  const remoteAddress = req?.socket?.remoteAddress || ''
  let ip = xForwardedFor || remoteAddress

  if (ip) {
    ip = ip.split(':')[0]
  }

  return ip
}
