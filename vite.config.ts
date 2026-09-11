import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        // Mesmo escopo de cache do app shell que o generateSW já usava.
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gerenciador de Metas',
        short_name: 'Metas',
        description: 'Metas financeiras individuais e compartilhadas.',
        lang: 'pt-BR',
        theme_color: '#416352',
        background_color: '#fbf9f8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
