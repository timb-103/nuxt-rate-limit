export interface RateLimitRoutes {
  [route: string]: {
    maxRequests: number
    intervalSeconds: number
  }
}

export interface RateLimit {
  [ip: string]: {
    [route: string]: {
      firstRequestTime: number
      requests: number
    }
  }
}
