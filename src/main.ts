import { createApp } from 'vue'
import './style/reset.css'
import './style/index.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import persistedState from 'pinia-plugin-persistedstate'
import router from './router'
import 'element-plus/dist/index.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(persistedState)

app.use(pinia).use(router).mount('#app')
