<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="数据">
      <NongbuTableView />
    </a-tab-pane>
    <a-tab-pane key="2" tab="统计">
      <NongbuDataView />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import NongbuTableView from "@/views/nongbu/NongbuTableView.vue";
import NongbuDataView from "@/views/nongbu/NongbuDataView.vue";

const activeKey = ref("1");
</script>
