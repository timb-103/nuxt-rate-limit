# Nuxt Rate Limit

Add rate limits to your Nuxt 3 API routes.

- [🏀 Online playground](https://stackblitz.com/github/timb-103/nuxt-rate-limit?file=playground%2Fapp.vue)

## Features

- 🛑 Set rate limits per API route
- 🕒 Returns seconds until reset
- ⚡ Takes seconds to setup

## Quick Setup

1. Add `nuxt-rate-limit` dependency to your project

```bash
pnpm add -D nuxt-rate-limit
yarn add --dev nuxt-rate-limit
npm install --save-dev nuxt-rate-limit
```

2. Add `nuxt-rate-limit` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['nuxt-rate-limit'],
})
```

That's it! You can now use Nuxt Rate Limit in your Nuxt app ✨

## Options

| name | type | default | description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enabled/disable the rate limit module |
| `routes` | `object` | [`{}`](https://github.com/timb-103/nuxt-rate-limit/edit/master/README.md#default-rate-limit) | [Add rate limits per route](https://github.com/timb-103/nuxt-rate-limit/edit/master/README.md#different-limits-per-route) |

## Default Rate Limit

By default, we add a rate limit to all of your /api routes. You can override this setting by adding `/api/*` to the `nuxtRateLimit` routes in your `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  nuxtRateLimit: {
    routes: {
      '/api/*': {
        maxRequests: 100,
        intervalSeconds: 60,
      },
    },
  },
})
```
## Different limits per route

You can also add limits per route:

```js
export default defineNuxtConfig({
  nuxtRateLimit: {
    routes: {
      '/api/hello': {
        maxRequests: 5,
        intervalSeconds: 10,
      },
      '/api/goodbye': {
        maxRequests: 15,
        intervalSeconds: 60,
      },
    },
  },
})
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-rate-limit/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-rate-limit
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-rate-limit.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-rate-limit
[license-src]: https://img.shields.io/npm/l/nuxt-rate-limit.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-rate-limit
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
