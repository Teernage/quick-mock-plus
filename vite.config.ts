import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config.js'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    crx({ manifest })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    cors: {
      origin: [/chrome-extension:\/\//]
    }
  },
  build: {
    sourcemap: false,
    minify: 'esbuild'
  },
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.info', 'console.trace', 'console.warn'],
    legalComments: 'none'
  }
})
