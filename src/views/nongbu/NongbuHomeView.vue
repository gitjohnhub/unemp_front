<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="表视图">
      <NongbuTableView />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import NongbuTableView from '@/views/nongbu/NongbuTableView.vue';

const activeKey = ref('1');



</script>