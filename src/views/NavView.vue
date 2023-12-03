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
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-sub-menu
            v-for="item in routeTitleItems"
            :key="item.path"
            :icon="
              item.meta.hasOwnProperty('icon')
                ? item.meta.icon
                : () => h(UserOutlined)
            "
            :label="item.name"
            :title="item.name"
          >
            <RouterLink v-for="link in routerItems" :to="link.path"
              ><a-menu-item
                :key="link.path"
                v-if="link.path.startsWith(`${item.path}/`)"
                :icon="
                  link.meta.hasOwnProperty('icon')
                    ? link.meta.icon
                    : () => h(UserOutlined)
                "
                >{{ link.name }}</a-menu-item
              ></RouterLink
            >
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 12px 12px">
        <BreadCrumbView />
        <a-layout-content
          :style="{ padding: '12px', margin: 0, minHeight: '140px' }"
        >
          <RouterView />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import { h, ref, onBeforeMount } from "vue";

import { Icon } from "@/components/Icon";
import {
  UserOutlined,
  ToolOutlined,
  NotificationOutlined,
  PhoneOutlined,
  AreaChartOutlined,
} from "@ant-design/icons-vue";
import BreadCrumbView from "@/components/BreadCrumbView.vue";
import UserInfoBarView from "@/components/UserInfoBarView.vue";
import router from "@/router";
const selectedKeys2 = ref<string[]>(["1"]);
const openKeys = ref<string[]>(["sub1"]);
const routerItems = ref();
const routeTitleItems = ref([]);
onBeforeMount(() => {
  routerItems.value = router.getRoutes();
  routeTitleItems.value = routerItems.value.filter(
    (item) => item.redirect !== undefined
  );
  console.log(routerItems.value);
});
</script>
<style scoped>
.header {
  background-color: #fff;
}

.site-layout-background {
  background: #fff;
}
</style>
