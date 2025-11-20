import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'quick-mock',
  version: '1.0.0',
  description: '欢迎使用 onion-sidebar 插件',
  icons: {
    16: 'img/favicon_16.png',
    32: 'img/favicon_32.png',
    48: 'img/favicon_48.png',
    128: 'img/favicon_128.png'
  },
  background: {
    service_worker: 'src/BackgroundScript/background.ts'
  },
  permissions: ['sidePanel', 'scripting'],
  action: {
    default_title: '切换侧边栏'
  },
  side_panel: {
    default_path: 'index.html'
  }
})
