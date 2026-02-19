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
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Third-party vendors
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('i18next')) return 'vendor-i18n';
            if (id.includes('@dnd-kit')) return 'vendor-dnd';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            return 'vendor-misc';
          }

          // App-level split points to avoid a single oversized app chunk
          if (id.includes('/src/games/math/genius/')) return 'games-math-genius';
          if (id.includes('/src/games/math/adventure/')) return 'games-math-adventure';
          if (id.includes('/src/games/')) return 'games-other';
          if (id.includes('/src/contexts/')) return 'app-contexts';
          if (id.includes('/src/pages/')) return 'app-pages';

          return undefined;
        },
      }
    },
    chunkSizeWarningLimit: 700,
  }
})
