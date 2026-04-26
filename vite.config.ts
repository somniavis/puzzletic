import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const getVendorChunkName = (id: string) => {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('/firebase/')) return 'vendor-firebase'

  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: false,
      devOptions: {
        enabled: false,
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{html,js,css,svg,png,webp,woff2,ico,webmanifest}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/pub-1411335941ed4406b5f667f40e04a814\.r2\.dev\/sound\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'grogrojello-sound-cache',
              expiration: {
                maxEntries: 24,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/api\.grogrojello\.com\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*(?:xsolla|googleapis|gstatic|firebaseapp|firebaseio)\.com\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          return getVendorChunkName(id)
        },
      },
    },
  }
})
