import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ApplyTableView from '../views/apply/ApplyTableView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/applyTable',
      name: 'applyTable',
      component: ApplyTableView
    }
  ]
})

export default router
