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
        manualChunks: {
          // Core React libs
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase services
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // i18n
          'vendor-i18n': ['i18next', 'react-i18next'],
        }
      }
    }
  }
})
