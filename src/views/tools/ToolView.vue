<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="推送失业金数据">
      <UnempPushView />
    </a-tab-pane>
    <a-tab-pane key="3" tab="识别图片计算工龄">
      <TesseractCalView />
    </a-tab-pane>
    <a-tab-pane key="2" tab="手动输入计算工龄">
      <GonglingView />
    </a-tab-pane>
    <!-- <a-tab-pane key="3" tab="工龄计算" force-render>
      <YearGonglingView></YearGonglingView>
    </a-tab-pane> -->
    <a-tab-pane key="4" tab="身份证返回年龄性别">
      <PersonInfoView />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import UnempPushView from "./UnempPushView.vue";
import GonglingView from "./GonglingView.vue";
import TesseractCalView from "./TesseractCalView.vue";
import PersonInfoView from "./PersonInfoView.vue";
const activeKey = ref("1");
</script>
