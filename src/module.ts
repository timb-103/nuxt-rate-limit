import { defineNuxtModule, createResolver, addServerHandler } from '@nuxt/kit'
import { defu } from 'defu'
import type { RateLimitRoutes } from './types'

// Module options TypeScript interface definition
export interface ModuleOptions {
  enabled: boolean
  routes: RateLimitRoutes
  headers: boolean
  statusMessage?: string
}

export interface RateLimitOptions {
  routes: RateLimitRoutes
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-rate-limit',
    configKey: 'nuxtRateLimit',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    enabled: true,
    headers: true,
    statusMessage: 'Too many requests. Please try again in :value: seconds.',
    routes: {
      '/api/*': {
        intervalSeconds: 60,
        maxRequests: 100,
      },
    },
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    // opt-out early
    if (!options.enabled) {
      return
    }

    // add options to runtime config
    nuxt.options.runtimeConfig.nuxtRateLimit = defu(
      nuxt.options.runtimeConfig.nuxtRateLimit,
      { headers: options.headers, statusMessage: options.statusMessage }
    )

    // merge with route rules, so we get free route matching with baseURL support
    for (const [route, rules] of Object.entries(options.routes)) {
      nuxt.options.nitro.routeRules = defu(nuxt.options.nitro.routeRules, {
        [route]: { ['nuxt-rate-limit']: { ...rules, route } },
      })
    }

    // add the rate-limit middleware
    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/rate-limit'),
    })
  },
})
