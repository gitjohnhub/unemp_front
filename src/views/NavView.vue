<template>
  <a-layout>
    <a-layout-header class="header">
      <div class="logo" />
      <a-menu
        v-model:selectedKeys="selectedKeys1"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item key="1">nav 1</a-menu-item>
        <a-menu-item key="2">nav 2</a-menu-item>
        <a-menu-item key="3">nav 3</a-menu-item>
      </a-menu>
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
            <RouterLink to="/applyTable"><a-menu-item key="1">失业金</a-menu-item></RouterLink>
            <RouterLink to="/applyTable"><a-menu-item key="2">延长失业金</a-menu-item></RouterLink>
            <RouterLink to="/applyTable"><a-menu-item key="3">农民补助金</a-menu-item></RouterLink>
            <RouterLink to="/applyTable"><a-menu-item key="4">跨省市转移</a-menu-item></RouterLink>
          </a-sub-menu>
          <a-sub-menu key="sub2">
            <template #title>
              <span>
                <laptop-outlined />
                通讯录
              </span>
            </template>
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
import { ref } from 'vue';
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons-vue';
import  BreadCrumbView  from './utils/BreadCrumbView.vue';
const selectedKeys1 = ref<string[]>(['2']);
const selectedKeys2 = ref<string[]>(['1']);
const openKeys = ref<string[]>(['sub1']);
</script>
<style scoped>
#components-layout-demo-top-side-2 .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}
</style>
