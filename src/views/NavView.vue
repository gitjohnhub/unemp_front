<template>
  <a-layout>
    <a-layout-header class="header">
      <UserInfoBarView />
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200">
        <a-menu
          v-model:selectedKeys="selectedKeys2"
          v-model:openKeys="openKeys"
          mode="inline"
          :style="{ height: '100%', borderRight: 0}"
        >
          <a-sub-menu key="sub1">
            <template #title>
              <span>
                <user-outlined />
                失业保险
              </span>
            </template>
            <RouterLink v-for="link in routerItems" :to="link.path"><a-menu-item :key="link.path" v-if="getPathPattern(link.path)">{{ link.title }}</a-menu-item></RouterLink>
          </a-sub-menu>
          <a-sub-menu key="sub2">
            <template #title>
              <span>
                <laptop-outlined />
                通讯录
              </span>
            </template>
            <RouterLink v-for="link in routerItems" :to="link.path"><a-menu-item :key="link.path" v-if="link.path.startsWith('/contact')">{{ link.title }}</a-menu-item></RouterLink>

          </a-sub-menu>
          <a-sub-menu key="sub3">
            <template #title>
              <span>
                <notification-outlined />
                工具箱
              </span>
            </template>
            <RouterLink v-for="link in routerItems" :to="link.path"><a-menu-item :key="link.path" v-if="link.path.startsWith('/tools')">{{ link.title }}</a-menu-item></RouterLink>
          </a-sub-menu>

          <a-sub-menu key="sub4">
            <template #title>
              <span>
                <notification-outlined />
                管理
              </span>
            </template>
            <RouterLink v-for="link in routerItems" :to="link.path"><a-menu-item :key="link.path" v-if="link.path.startsWith('/management')">{{ link.title }}</a-menu-item></RouterLink>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px;">
        <BreadCrumbView />
        <a-layout-content
          :style="{ padding: '24px', margin: 0, minHeight: '280px' }"
        >
          <RouterView />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import { ref , onBeforeMount} from 'vue';
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons-vue';
import  BreadCrumbView  from '@/components/BreadCrumbView.vue';
import UserInfoBarView from '@/components/UserInfoBarView.vue';
import router  from '@/router';
const selectedKeys2 = ref<string[]>(['1']);
const openKeys = ref<string[]>(['sub1']);
const routerItems = ref()
onBeforeMount(()=>{
  const excludePaths = ['/', '/login', '/contact', '/tools', '/management'];
  routerItems.value =
    router.getRoutes().filter(item=>{
      return !excludePaths.includes(item.path);
    }
    )
    .map(item=>{
        return {path:item.path,title:item.meta.title}
    })
})
const getPathPattern = (path)=>{
  const pattern = /^\/[a-zA-Z]+$/;
  return pattern.test(path);

}
</script>
<style scoped>

.header{
  background-color: #fff;
}


.site-layout-background {
  background: #fff;
}
</style>
