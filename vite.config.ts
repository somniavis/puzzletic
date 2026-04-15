import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const getVendorChunkName = (id: string) => {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('/firebase/')) return 'vendor-firebase'

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
