import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { VitePWA } from 'vite-plugin-pwa'

// `vite build --mode single` produit un seul fichier HTML (aperçu partageable).
// Le build normal produit une PWA installable avec cache hors-ligne.
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
            theme_color: '#0C0809',
            background_color: '#0C0809',
            display: 'standalone',
            orientation: 'portrait',
            icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
          },
        }),
  ],
  build: { target: 'es2022', cssCodeSplit: mode !== 'single', outDir: mode === 'single' ? 'dist-single' : 'dist' },
}))
