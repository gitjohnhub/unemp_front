<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="登记视图">
      <YanchangTableView />
    </a-tab-pane>
    <a-tab-pane key="2" tab="统计视图">
      <YanchangDataView />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import YanchangTableView from "@/views/yanchang/YanchangTableView.vue";
import YanchangDataView from "@/views/yanchang/YanchangDataView.vue";
const activeKey = ref("1");
</script>
