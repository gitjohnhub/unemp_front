<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="登记视图">
      <ZhuanyiTableView />
    </a-tab-pane>
    <a-tab-pane key="2" tab="表格视图">
      <ZhuanyiExcelView />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import ZhuanyiTableView from '@/views/zhuanyi/ZhuanyiTableView.vue';
import ZhuanyiExcelView from '@/views/zhuanyi/ZhuanyiExcelView.vue';

const activeKey = ref('1');



</script>