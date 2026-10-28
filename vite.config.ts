import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Puts the app's HTML into index.html, so content is visible without JS.
// main.tsx then replaces it with createRoot.
// `npm run build` first builds src/prerender.tsx into dist-ssr/.
function prerender(): Plugin {
  const root = '<div id="root"></div>'

  return {
    name: 'prerender',
    apply: (_, { command, isSsrBuild }) => command === 'build' && !isSsrBuild,
    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        if (!html.includes(root)) throw new Error(`${root} not in index.html`)
        const entry = pathToFileURL(resolve('dist-ssr/prerender.js')).href
        const { render } = await import(entry)
        return html.replace(root, `<div id="root">${render()}</div>`)
      },
    },
  }
}

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  plugins: [
    react(),
    prerender(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        id: '/',
        name: 'ClayTint',
        short_name: 'ClayTint',
        description: 'Polymer clay colour mixing recipes',
        theme_color: '#efefec',
        background_color: '#efefec',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
  },
})
