import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
    // Use Vite/Rollup default chunking for stability.
    // The previous custom manualChunks introduced fragile vendor split behavior
    // that can cause runtime init-order issues in production.
    chunkSizeWarningLimit: 700,
  }
})
