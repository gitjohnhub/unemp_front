import { createRouter, createWebHistory } from "vue-router";
import storage from "@/utils/storage";
import { h } from "vue";
import {
  AreaChartOutlined,
  PhoneOutlined,
  ToolOutlined,
  MoneyCollectOutlined,
  CheckCircleOutlined,
  UserSwitchOutlined,
  TransactionOutlined,
  SisternodeOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons-vue";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "登录",
      component: () => import("@/views/LoginView.vue"),
      meta: { title: "登陆" },
    },
    {
      path: "/",
      name: "首页",
      redirect: "/unemp/applyTable",
      component: () => import("@/views/HomeView.vue"),
      meta: {
        title: "首页",
        requiresAuth: true,
      },
      children: [
        {
          path: "/unemp",
          redirect: "/unemp/applyTable",
          meta: {
            icon: () => h(MoneyCollectOutlined),
            requiresAuth: true,
          },
          name: "失业金",
          children: [
            {
              path: "/unemp/applyTable",
              name: "失业金核定",
              component: () => import("@/views/apply/UnempTableView.vue"),
              meta: {
                requiresAuth: true,
                icon: () => h(CheckCircleOutlined),
              },
            },
            {
              path: "/unemp/xiechaTable",
              name: "外省市协查",
              component: () => import("@/views/xiecha/XiechaTableView.vue"),
              meta: {
                requiresAuth: true,
                icon: () => h(UserSwitchOutlined),
              },
            },
            {
              path: "/unemp/zhuanyiTable",
              name: "跨省市转移",
              component: () => import("@/views/zhuanyi/ZhuanyiHomeView.vue"),
              meta: {
                requiresAuth: true,
                icon: () => h(TransactionOutlined),
              },
            },
            {
              path: "/unemp/yanchangTable",
              name: "延长失业金",
              component: () => import("@/views/yanchang/YanchangHomeView.vue"),
              meta: {
                requiresAuth: true,
                icon: () => h(SisternodeOutlined),
              },
            },
            {
              path: "/unemp/nongbuTable",
              name: "农民补助金",
              component: () => import("@/views/nongbu/NongbuHomeView.vue"),
              meta: {
                requiresAuth: true,
                icon: () => h(UserDeleteOutlined),
              },
            },
          ],
        },
        {
          path: "/contact",
          redirect: "/contact/unempContact",
          meta: {
            requiresAuth: true,
            icon: () => h(PhoneOutlined),
          },
          name: "通讯录",
          children: [
            {
              path: "unempContact",
              name: "失业保险科通讯录",
              component: () => import("@/views/contacts/ContactView.vue"),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
          path: "/tools",
          redirect: "/tools/gongling",
          name: "工具箱",
          meta: {
            requiresAuth: true,
            icon: () => h(ToolOutlined),
          },
          children: [
            {
              path: "gongling",
              name: "工具箱",
              component: () => import("@/views/tools/ToolView.vue"),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: "blackData",
              name: "黑名单查询",
              component: () => import("@/views/tools/BlackDataView.vue"),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
          path: "/management",
          redirect: "/management/userManagement",
          name: "管理",
          meta: {
            requiresAuth: true,
          },
          children: [
            {
              path: "userManagement",
              name: "用户管理",
              component: () => import("@/views/admin/UserManagementView.vue"),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: "dataManagement",
              name: "数据管理",
              component: () => import("@/views/admin/DataView.vue"),
              meta: {
                requiresAuth: true,
                icon: () => h(AreaChartOutlined),
              },
            },
            {
              path: "dutyCalendar",
              name: "值班安排",
              component: () => import("@/views/admin/DutyCalendarView.vue"),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: "AdminHome",
              name: "管理主页",
              component: () => import("@/views/admin/AdminHomeView.vue"),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  // const user = JSON.parse(localStorage.getItem('user'))
  const { token } = storage.getItem("userInfo") ?? "";
  if (to.meta.requiresAuth == true) {
    if (token) {
      return true;
    } else {
      return { name: "login" };
    }
  } else {
    return true;
  }
});

export default router;
