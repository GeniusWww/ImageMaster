import { createRouter, createWebHistory } from 'vue-router'
import ImageCut from '../components/ImageCut.vue'
import ImageCompress from '../components/ImageCompress.vue'
import WaterMark from '@/components/WaterMark.vue'
import SigninOrup from '@/components/SigninOrup.vue'
import Index from '@/components/Index.vue'
import SubtitleGenerator from '@/components/SubtitleGenerator.vue'

const routes = [
  
  {
    path: '/',
    name: 'Index',
    component: Index,
    children: [
      {
        path: '',
        redirect: '/subtitle' 
      },
      {
        path: '/cut',
        name: 'ImageCut',
        component: ImageCut
      },
      {
        path: '/compress',
        name: 'ImageCompress',
        component: ImageCompress
      },
      {
        path: '/watermark',
        name: 'WaterMark',
        component: WaterMark
      },
      {
        path: '/subtitle',
        name: 'SubtitleGenerator',
        component: SubtitleGenerator
      }
    ]
  },
  {
    path: '/signinup',
    name: 'SigninOrup',
    component: SigninOrup
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router