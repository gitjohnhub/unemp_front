<template>
  <a-textarea
    v-model:value="comanyInfo"
    placeholder="粘贴数据"
    :auto-size="{ minRows: 2, maxRows: 5 }"
  />
  <a-button type="primary" @click="anaylysisData">分析</a-button>
  <a-button type="primary" @click="checkData">一键初核</a-button>
  <a-collapse>
    <a-collapse-panel key="1">
      <template #header> 共计{{ companyToCheck.length }}家企业 </template>
      <p v-for="company in companyToCheck">{{ company }}</p>
    </a-collapse-panel>
  </a-collapse>
  <a-card title="初核结果">
    <a-collapse>
      <a-collapse-panel key="2">
        <template #header> 更新了{{ updatedData.length }}家企业状态 </template>
        <p v-for="company in updatedData">{{ company.name }}</p>
      </a-collapse-panel>
      <a-collapse-panel key="3">
        <template #header>
          {{ untouchedData.length }}家企业状态未发生变换
        </template>
        <p v-for="company in untouchedData">{{ company.name }}</p>
      </a-collapse-panel>
      <a-collapse-panel key="3">
        <template #header> {{ notFoundData.length }}家企业未查询到 </template>
        <p v-for="company in notFoundData">{{ company.name }}</p>
      </a-collapse-panel>
    </a-collapse>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import api from "@/api";
const comanyInfo = ref("");
const companyToCheck = ref([]);
const analysisResult = ref();
const updatedData = ref([]);
const untouchedData = ref([]);
const notFoundData = ref([]);
const anaylysisData = () => {
  console.log(comanyInfo.value);
  companyToCheck.value = parseJsonString(comanyInfo.value);
};
const checkData = () => {
  console.log(comanyInfo.value);
  companyToCheck.value = parseJsonString(comanyInfo.value);
  api
    .updatewengangData({ companyToCheck: companyToCheck.value })
    .then((res) => {
      analysisResult.value = res;
      console.log(analysisResult.value);
      updatedData.value = analysisResult.value.updated;
      notFoundData.value = analysisResult.value.notFound;
      untouchedData.value = analysisResult.value.untouched;
      console.log("updatedData===>", updatedData.value);
    });
};

function parseJsonString(jsonString) {
  try {
    const companyInfo_Json = JSON.parse(jsonString);
    const cbhmcArray = companyInfo_Json.map((item) => item.cbhmc);
    console.log(cbhmcArray);
    return cbhmcArray;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw error;
  }
}
</script>
