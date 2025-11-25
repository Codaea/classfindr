// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  nitro: {
    experimental: {
      database: true
    },
    database: {
      default: {
        connector: 'postgresql',
        options: {
          url: "postgresql://postgres:postgres@localhost:5400/postgres"
        }
      }
    }
  },
})
