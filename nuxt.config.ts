// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-08',
  devtools: { enabled: true },
  telemetry: false,

  devServer: {
    port: 3003
  },

  app: {
    head: {
      title: 'Nerd in the Forest — Nordic Cartography & Field Notes',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'description', content: 'Tactile Scandinavian topographical surveys, backcountry dispatches, and trail field notes.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  components: [
    {
      path: '~/components/atoms',
      pathPrefix: false
    },
    {
      path: '~/components/molecules',
      pathPrefix: false
    },
    {
      path: '~/components/organisms',
      pathPrefix: false
    },
    {
      path: '~/components/templates',
      pathPrefix: false
    }
  ],

  runtimeConfig: {
    cmsApiInternal: process.env.CMS_API_INTERNAL || 'http://localhost:3000/api',
    public: {
      cmsApiBase: process.env.NUXT_PUBLIC_CMS_API_BASE || '/api/cms'
    }
  }
})
