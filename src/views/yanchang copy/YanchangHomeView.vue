<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="表视图">
      <YanchangTableView />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import YanchangTableView from '@/views/yanchang/YanchangTableView.vue';

const activeKey = ref('1');



</script>