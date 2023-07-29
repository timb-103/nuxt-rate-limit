export default defineNuxtConfig({
  modules: ['../src/module'],
  nuxtRateLimit: {
    enabled: true,
    routes: {
      '/api/hello': {
        maxRequests: 2,
        intervalSeconds: 10,
      },
      '/api/goodbye': {
        maxRequests: 10,
        intervalSeconds: 60,
      },
    },
  },
  devtools: { enabled: false },
})
