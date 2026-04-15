import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const getVendorChunkName = (id: string) => {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('/firebase/')) return 'vendor-firebase'
  if (id.includes('/react-router') || id.includes('/@remix-run/')) return 'vendor-router'
  if (id.includes('/i18next/') || id.includes('/react-i18next/')) return 'vendor-i18n'
  if (
    id.includes('/react/')
    || id.includes('/react-dom/')
    || id.includes('/scheduler/')
  ) {
    return 'vendor-react'
  }

  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
