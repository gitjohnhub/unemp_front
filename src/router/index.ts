import { createRouter, createWebHistory } from 'vue-router';
import storage from '@/utils/storage';
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: ()=>import('@/views/LoginView.vue'),
      meta: { title: '登陆' },
    },
    {
      path: '/',
      name: 'home',
      component: ()=>import('@/views/HomeView.vue'),
      meta:{
        title:'首页',
        requiresAuth:true
      },
      children: [
        {
          path: '/applyTable',
          name: 'applyTable',
          component: ()=>import('@/views/apply/ApplyTableView.vue'),
          meta: {
            title: '失业金',
            requiresAuth: true,
          },
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  // const user = JSON.parse(localStorage.getItem('user'))
  const { token } = storage.getItem('userInfo') ?? '';
  if (to.meta.requiresAuth == true) {
    if (token) {
      return true;
    } else {
      return { name: 'login' };
    }
  } else {
    return true;
  }
});

export default router;
