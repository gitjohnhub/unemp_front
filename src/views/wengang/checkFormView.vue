<template>
  <a-textarea
    v-model:value="comanyInfo"
    placeholder="粘贴数据"
    :auto-size="{ minRows: 2, maxRows: 5 }"
  />
  <a-button type="primary" @click="anaylysisData">分析</a-button>
  <a-button
    type="primary"
    @click="checkData"
    :disabled="companyToCheck.length == 0"
    >一键初核</a-button
  >
  <a-collapse>
    <a-collapse-panel key="1">
      <template #header> 共计{{ companyToCheck.length }}家企业 </template>
      <p v-for="company in companyToCheck">{{ company }}</p>
    </a-collapse-panel>
  </a-collapse>
  <a-card title="初核结果">
    <a-collapse>
      <a-collapse-panel key="2">
        <template #header>
          更新了{{ updatedCompanies.length }}家企业状态
        </template>
        <p v-for="company in updatedCompanies">{{ company }}</p>
      </a-collapse-panel>
      <a-collapse-panel key="3">
        <template #header> 添加了{{ newCompanies.length }}家企业 </template>
        <p v-for="company in newCompanies">{{ company }}</p>
      </a-collapse-panel>
    </a-collapse>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import api from "@/api";
import { cssinjs } from "ant-design-vue";
const comanyInfo = ref("");
const companyToCheck = ref([]);
const analysisResult = ref();
const updatedCompanies = ref([]);
const newCompanies = ref([]);
const anaylysisData = () => {
  companyToCheck.value = parseJsonString(comanyInfo.value);
};
const checkData = () => {
  api
    .updatewengangData({ companyToCheck: companyToCheck.value })
    .then((res) => {
      analysisResult.value = res;
      console.log("return Data===>", analysisResult.value);
      updatedCompanies.value = analysisResult.value.updatedCompanies;
      newCompanies.value = analysisResult.value.newCompanies;
    });
};

function parseJsonString(jsonString) {
  const statusList = [
    "未确认",
    "待审核",
    "审核不通过",
    "审核通过,待公示",
    "公示中",
    "公示不通过",
    "公示通过,待支付",
    "支付成功",
    "支付不成功",
    "放弃申领",
  ];
  try {
    const companyInfo_Json = JSON.parse(jsonString);
    const cbhmcArray = companyInfo_Json.map((item) => ({
      companyName: item.cbhmc,
      canbaoCode: item.shbxdjm,
      companyCategory: item.dwhx,
      bankNumber: item.yhzh,
      companyBankName: item.yhhm,
      contactPerson: item.lxr,
      contactNumber: item.lxdh,
      btmoney: item.btje,
      caiyuanlv: item.cyl,
      jfrenci: item.ljjfrs,
      jfmoney: item.ljjfje,
      status: statusList.indexOf(item.sqztName),
      checkDate: item.sprq,
      reviewDate: item.fhrq,
      confirmDate: item.sqrq,
    }));
    return cbhmcArray;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw error;
  }
}
</script>
