import { createRouter, createWebHashHistory } from 'vue-router'
import HomeCom from '@/views/Home/HomeCom.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeCom
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
