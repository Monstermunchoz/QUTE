import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { VitePWA } from 'vite-plugin-pwa'

// Deux pages : la page d'accueil (/) et l'appli (/app/).
// `vite build --mode single` produit l'appli seule en un fichier HTML (aperçu partageable).
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'single'
      ? viteSingleFile()
      : VitePWA({
          registerType: 'autoUpdate',
          manifest: {
            name: 'QUTE',
            short_name: 'QUTE',
            description: 'Le réseau libertin, en toute confiance.',
            lang: 'fr',
            id: '/app/',
            start_url: '/app/',
            scope: '/',
            theme_color: '#0b0709',
            background_color: '#0b0709',
            display: 'standalone',
            orientation: 'portrait',
            icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
          },
          workbox: {
            navigateFallback: '/app/index.html',
            navigateFallbackAllowlist: [/^\/app/],
          },
        }),
  ],
  build: {
    target: 'es2022',
    cssCodeSplit: mode !== 'single',
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    rollupOptions: {
      input: mode === 'single' ? resolve(__dirname, 'app/index.html') : { accueil: resolve(__dirname, 'index.html'), app: resolve(__dirname, 'app/index.html') },
    },
  },
}))
