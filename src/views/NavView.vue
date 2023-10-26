<template>
  <a-layout>
    <a-layout-header class="header">
      <UserInfoBarView />
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <a-menu
          v-model:selectedKeys="selectedKeys2"
          v-model:openKeys="openKeys"
          mode="inline"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-sub-menu key="sub1">
            <template #title>
              <span>
                <user-outlined />
                失业保险
              </span>
            </template>
            <RouterLink v-for="link in routerItems" :to="link.path"><a-menu-item :key="link.path" v-if="!link.path.startsWith('/contact')">{{ link.title }}</a-menu-item></RouterLink>
          </a-sub-menu>
          <a-sub-menu key="sub2">
            <template #title>
              <span>
                <laptop-outlined />
                通讯录
              </span>
            </template>
            <RouterLink v-for="link in routerItems" :to="link.path"><a-menu-item :key="link.path" v-if="link.path.startsWith('/contact')">{{ link.title }}</a-menu-item></RouterLink>
            <a-menu-item key="5">街镇</a-menu-item>
            <a-menu-item key="6">办公室</a-menu-item>
            <a-menu-item key="7">失业保险科</a-menu-item>
            <a-menu-item key="8">其他科室</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub3">
            <template #title>
              <span>
                <notification-outlined />
                工具箱
              </span>
            </template>
            <RouterLink v-for="link in routerItems" :to="link.path"><a-menu-item :key="link.path" v-if="link.path.startsWith('/tools')">{{ link.title }}</a-menu-item></RouterLink>
            <a-menu-item key="9">工龄计算器</a-menu-item>
            <a-menu-item key="10">身份证校验</a-menu-item>
            <a-menu-item key="11">查询</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <BreadCrumbView />
        <a-layout-content
          :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
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
  routerItems.value =
    router.getRoutes().filter(item=>{
      return item.path !== '/' && item.path !== '/login' && item.path !== '/contact' && item.path !== '/tools'
    }
    )
    .map(item=>{
        return {path:item.path,title:item.meta.title}
    })
  console.log(routerItems.value)
})
</script>
<style scoped>

.header{
  background-color: #fff;
}


.site-layout-background {
  background: #fff;
}
</style>
