import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'AI Mock',
  version: '1.0.0',
  description: '欢迎使用 AI Mock 插件',
  icons: {
    16: 'img/favicon_16.png',
    32: 'img/favicon_32.png',
    48: 'img/favicon_48.png',
    128: 'img/favicon_128.png'
  },
  background: {
    service_worker: 'src/BackgroundScript/background.ts'
  },
  permissions: ['sidePanel', 'storage'],
  action: {},
  side_panel: {
    default_path: 'index.html'
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/contentScript/index.js'],
      run_at: 'document_idle'
    }
  ],
  web_accessible_resources: [
    {
      resources: ['src/injected/index.js'],
      matches: ['<all_urls>']
    }
  ]
})
