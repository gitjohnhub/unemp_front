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
    // {
    //   path: '/test',
    //   name: 'test',
    //   component: ()=>import('@/views/TestView.vue'),
    //   meta: { title: '登陆' },
    // },
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
            title: '失业金核定',
            requiresAuth: true,
          },
        },
          {
            path: '/xiechaTable',
            name: 'xiechaTable',
            component: ()=>import('@/views/xiecha/XiechaTableView.vue'),
            meta: {
              title: '外省市协查',
              requiresAuth: true,
            },
          },
          {
            path: '/zhuanyiTable',
            name: 'zhuanyiTable',
            component: ()=>import('@/views/zhuanyi/ZhuanyiHomeView.vue'),
            meta: {
              title: '跨省市转移',
              requiresAuth: true,
            },
          },
          {
            path: '/yanchangTable',
            name: 'yanchangTable',
            component: ()=>import('@/views/yanchang/YanchangHomeView.vue'),
            meta: {
              title: '延长失业金',
              requiresAuth: true,
            },
          },
           {
            path: '/nongbuTable',
            name: 'nongbuTable',
            component: ()=>import('@/views/nongbu/NongbuHomeView.vue'),
            meta: {
              title: '农民补助金',
              requiresAuth: true,
            },
          },
          {
            path:'/contact',
            redirect:'/contact/unempContact',
            children:[
              {
                path:'unempContact',
                component:()=>import('@/views/contacts/UnempContactView.vue'),
                meta: {
                  title: '失业保险科通讯录',
                  requiresAuth: true,
                },
              }
            ]
          },
          {
            path:'/tools',
            redirect:'/tools/gongling',
            children:[
              {
                path:'gongling',
                component:()=>import('@/views/tools/ToolView.vue'),
                meta: {
                  title: '工具箱',
                  requiresAuth: true,
                },
              }
            ]
          },
          {
            path:'/management',
            redirect:'/management/userManagement',
            children:[
              {
                path:'userManagement',
                component:()=>import('@/views/admin/UserManagementView.vue'),
                meta: {
                  title: '用户管理',
                  requiresAuth: true,
                },
              },
              {
                path:'dataManagement',
                component:()=>import('@/views/admin/DataView.vue'),
                meta: {
                  title: '数据管理',
                  requiresAuth: true,
                },
              },
              {
                path:'dutyCalendar',
                component:()=>import('@/views/admin/DutyCalendarView.vue'),
                meta: {
                  title: '值班安排',
                  requiresAuth: true,
                },
              },
              {
                path:'AdminHome',
                component:()=>import('@/views/admin/AdminHomeView.vue'),
                meta: {
                  title: '管理主页',
                  requiresAuth: true,
                },
              }
            ]
          }
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
