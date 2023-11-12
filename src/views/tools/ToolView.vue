<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="2" tab="缴费月数计算">
      <GonglingView />
    </a-tab-pane>
    <a-tab-pane key="1" tab="识别计算工龄">
      <TesseractCalView />
    </a-tab-pane>
    <a-tab-pane key="3" tab="工龄计算" force-render>
      <YearGonglingView></YearGonglingView>
    </a-tab-pane>
    <a-tab-pane key="4" tab="身份证返回年龄性别">
      <PersonInfoView />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import GonglingView from './GonglingView.vue';
import YearGonglingView from './YearGonglingView.vue'
import TesseractCalView from './TesseractCalView.vue';
import PersonInfoView from '@/components/PersonInfoView.vue';
const activeKey = ref('1');



</script>