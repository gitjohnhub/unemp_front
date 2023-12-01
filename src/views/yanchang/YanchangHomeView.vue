<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="登记视图">
      <YanchangTableView />
    </a-tab-pane>
    <a-tab-pane key="2" tab="表视图">
      <YanchangExcelView />
    </a-tab-pane>
    <a-tab-pane key="3" tab="统计视图">
      <YanchangDataViews/>
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import YanchangTableView from '@/views/yanchang/YanchangTableView.vue';
import YanchangDataViews from '@/views/yanchang/YanchangDataViews.vue';
import YanchangExcelView from './YanchangExcelView.vue';
const activeKey = ref('1');



</script>