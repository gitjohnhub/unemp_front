<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="缴费月数计算">
      <GonglingView />
    </a-tab-pane>
    <a-tab-pane key="2" tab="工龄计算" force-render>
      <YearGonglingView></YearGonglingView>
    </a-tab-pane>
    <a-tab-pane key="3" tab="Tab 3">Content of Tab Pane 3</a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import GonglingView from '@/components/GonglingView.vue';
import YearGonglingView from '@/components/YearGonglingView.vue'
const activeKey = ref('1');



</script>