import { createRouter, createWebHistory } from 'vue-router'
import ImageCut from '../components/ImageCut.vue'
import ImageCompress from '../components/ImageCompress.vue'

const routes = [
  {
    path: '/cut',
    name: 'ImageCut',
    component: ImageCut
  },
  {
    path: '/compress',
    name: 'ImageCompress',
    component: ImageCompress
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router