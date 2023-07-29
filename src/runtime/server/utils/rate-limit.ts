import { H3Event, getRequestHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { RateLimit, RateLimitRoutes } from '../../../types'

// store rate limits for each IP address and URL
const rateLimit: RateLimit = {}

// the routes we will rate limit
const routes: RateLimitRoutes = useRuntimeConfig().public.nuxtRateLimit.routes

/**
 * This function checks whether a request from a given IP address and URL should be rate limited
 *
 * If rate limited it will return the seconds until they can try again.
 *
 * @param event
 */
export function isRateLimited(event: H3Event) {
  try {
    const urlWithParams = event.node.req?.url as string
    const ip = getIP(event)

    // Strip any query parameters from the URL
    const splitURL = urlWithParams.split('?')[0]
    // const url = urlWithParams.split('?')[0]

    // configure the route settings
    const url = routes[splitURL] ? splitURL : '/api/*'
    const maxRequests = routes[url].maxRequests
    const interval = routes[url].intervalSeconds * 1000

    // remove any IPs & URLs that haven't been used since interval to keep object small
    const currentTime = Date.now()
    Object.keys(rateLimit).forEach((key: keyof RateLimit) => {
      Object.keys(rateLimit[key]).forEach((urlKey: string) => {
        const item = rateLimit[key][urlKey]
        const timeSinceLastRequest = currentTime - item.firstRequestTime
        const routeInterval = routes[urlKey].intervalSeconds * 1000

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
    rateLimit[ip][url] = rateLimit[ip][url] || {
      firstRequestTime: Number(new Date()),
      requests: 0,
    }

    // check if the IP & URL is rate limited, return seconds until reset if it is
    const requests = rateLimit[ip][url].requests
    if (requests >= maxRequests) {
      const timeSinceFirstRequest = currentTime - rateLimit[ip][url].firstRequestTime
      const secondsUntilReset = Math.ceil((interval - timeSinceFirstRequest) / 1000)
      return secondsUntilReset
    }

    // increment the requests counter
    rateLimit[ip][url].requests++
  } catch (error) {
    console.log('Error checking rate limits:', error)
  }

  return 0
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
