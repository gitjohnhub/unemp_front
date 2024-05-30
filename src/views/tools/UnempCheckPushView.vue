<template>
  <h1>失业金数据推送</h1>
  <a-textarea
    v-model:value="UnempInfo"
    placeholder="粘贴数据"
    :auto-size="{ minRows: 2, maxRows: 5 }"
  />
  <a-space direction="horizontal">
    <a-button type="primary" @click="anaylysisData">分析</a-button>
    <a-button
      type="primary"
      @click="pushData"
      :disabled="unempToPush.length == 0"
      >推送至待受理</a-button
    >
  </a-space>

  <a-collapse>
    <a-collapse-panel key="1">
      <template #header> 共计{{ unempToPush.length }}个人 </template>
      <p v-for="unempData in unempToPush">{{ unempData }}</p>
    </a-collapse-panel>
  </a-collapse>
  <a-card title="初核结果">
    <a-collapse>
      <a-collapse-panel key="2">
        <template #header> 添加了{{ updatedData.length }}个人 </template>
        <p v-for="unempData in updatedData">{{ unempData }}</p>
      </a-collapse-panel>
      <a-collapse-panel key="3">
        <template #header> {{ untouchedData.length }}个人已存在 </template>
        <p v-for="unempData in untouchedData">{{ unempData }}</p>
      </a-collapse-panel>
      <a-collapse-panel key="3">
        <template #header> {{ notFoundData.length }}个人添加失败 </template>
        <p v-for="unempData in notFoundData">{{ unempData }}</p>
      </a-collapse-panel>
    </a-collapse>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import api from "@/api";
import { useUserStore } from "@/stores";
const checkoperator = useUserStore().userInfo.username;
const UnempInfo = ref("");
const unempToPush = ref([]);
const analysisResult = ref();
const updatedData = ref([]);
const untouchedData = ref([]);
const notFoundData = ref([]);
const anaylysisData = () => {
  console.log(UnempInfo.value);
  unempToPush.value = parseJsonString(UnempInfo.value);
};
const pushData = () => {
  api.addUnempCheckArrayData({ unempToPush: unempToPush.value }).then((res) => {
    analysisResult.value = res;
    console.log(analysisResult.value);
    updatedData.value = analysisResult.value.newUsers;
    notFoundData.value = analysisResult.value.unsuccessfulUsers;
    untouchedData.value = analysisResult.value.existingUsers;
    console.log("updatedData===>", updatedData.value);
  });
};

function parseJsonString(jsonString) {
  try {
    const unempDataInfo_Json = JSON.parse(jsonString);
    const unempArray = unempDataInfo_Json.map((item) => ({
      personName: item.xm,
      personID: item.zjhm,
      jiezhen: item.jdname,
      createtime:item.sqsj,
    }));
    console.log(unempArray);
    return unempArray;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw error;
  }
}
</script>
