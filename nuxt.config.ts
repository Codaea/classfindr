// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  ssr: true,
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
