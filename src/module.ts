import { defineNuxtModule, createResolver, addServerHandler } from '@nuxt/kit'
import { defu } from 'defu'
import type { RateLimitRoutes } from './types'

// Module options TypeScript interface definition
export interface ModuleOptions {
  enabled: boolean
  routes: RateLimitRoutes
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
    routes: {
      '/api/*': {
        intervalSeconds: 60,
        maxRequests: 5,
      },
    },
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // add options to runtime config
    nuxt.options.runtimeConfig.public.nuxtRateLimit = defu(
      nuxt.options.runtimeConfig.public.nuxtRateLimit,
      options
    )

    // add the rate-limit middleware
    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/rate-limit'),
    })
  },
})
