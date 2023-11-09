<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="转移表格">
      <ZhuanyiTableView />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import ZhuanyiTableView from '@/views/zhuanyi/ZhuanyiTableView.vue';

const activeKey = ref('1');



</script>