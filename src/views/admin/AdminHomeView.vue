<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="读取值班excel">
      <ReadDutyExcelView />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import ReadDutyExcelView from '@/views/admin/ReadDutyExcelView.vue';

const activeKey = ref('1');



</script>