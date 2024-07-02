<template>
  <h1>转移数据推送</h1>
  <a-textarea
    v-model:value="ZhuanyiInfo"
    placeholder="粘贴数据"
    :auto-size="{ minRows: 2, maxRows: 5 }"
  />
  <a-space direction="horizontal">
    <a-button type="primary" @click="anaylysisData">分析</a-button>
    <a-button
      type="primary"
      @click="pushData"
      :disabled="ZhuanyiToPush.length == 0"
      >推送</a-button
    >
  </a-space>

  <a-collapse>
    <a-collapse-panel key="1">
      <template #header> 共计{{ ZhuanyiToPush.length }}个人 </template>
      <a-table :dataSource="ZhuanyiToPush" :columns="zhuanyiToPushColumns" />
    </a-collapse-panel>
  </a-collapse>
  <a-card title="推送结果">
    <a-collapse>
      <a-collapse-panel key="2">
        <template #header>
          还有{{ notFoundData.length }}个人未获取到数据
        </template>
        <a-table
          :dataSource="notFoundData"
          :columns="notFoundDataColumns"
          size="small"
        />
      </a-collapse-panel>
      <a-collapse-panel key="3">
        <template #header> 更新了{{ updatedData.length }}个人的数据 </template>
        <a-table
          :dataSource="updatedData"
          :columns="updatedDataColumns"
          size="small"
        />
      </a-collapse-panel>
      <a-collapse-panel key="4">
        <template #header> {{ existingData.length }}个人已有数据 </template>
        <a-table
          :dataSource="existingData"
          :columns="existingDataColumns"
          size="small"
        />
      </a-collapse-panel>
    </a-collapse>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import api from "@/api";
import { useUserStore } from "@/stores";
const checkoperator = useUserStore().userInfo.username;
const ZhuanyiInfo = ref("");
const ZhuanyiToPush = ref([]);
const analysisResult = ref();
const updatedData = ref([]);
const existingData = ref([]);
const notFoundData = ref([]);
const zhuanyiToPushColumns = ref([]);
const updatedDataColumns = ref([]);
const notFoundDataColumns = ref([]);
const existingDataColumns = ref([]);

const anaylysisData = () => {
  ZhuanyiToPush.value = parseJsonString(ZhuanyiInfo.value);
  zhuanyiToPushColumns.value = Object.keys(ZhuanyiToPush.value[0]).map(
    (key) => ({
      title: key,
      dataIndex: key,
      key: key,
    })
  );
};
const pushData = () => {
  api
    .updateZhuanyiArrayData({ ZhuanyiToPush: ZhuanyiToPush.value })
    .then((res) => {
      analysisResult.value = res;
      updatedData.value = analysisResult.value.updatedUsers;
      if (updatedData.value.length != 0) {
        updatedDataColumns.value = Object.keys(updatedData.value[0]).map(
          (key) => ({
            title: key,
            dataIndex: key,
            key: key,
          })
        );
      }
      notFoundData.value = analysisResult.value.unsuccessfulUsers;
      if (notFoundData.value.length != 0) {
        notFoundDataColumns.value = Object.keys(notFoundData.value[0]).map(
          (key) => ({
            title: key,
            dataIndex: key,
            key: key,
          })
        );
      }

      existingData.value = analysisResult.value.existingUsers;
      if (existingData.value.length != 0) {
        existingDataColumns.value = Object.keys(existingData.value[0]).map(
          (key) => ({
            title: key,
            dataIndex: key,
            key: key,
          })
        );
      }
    });
};
function getStatus(ffzt) {
  // 根据 ffzt 的值返回相应的状态
  // 例如:
  if (ffzt === "未支付") {
    return "1";
  } else if (ffzt === "支付中") {
    return "2";
  } else if (ffzt === "支付成功") {
    return "3";
  } else {
    return "0";
  }
}
function formatDate(dateString) {
  // 将日期字符串拆分为年份、月份和日期
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);

  // 拼接成所需的日期格式
  return `${year}-${month}-${day}`;
}

function parseJsonString(jsonString) {
  try {
    const ZhuanyiDataInfo_Json = JSON.parse(jsonString);
    const ZhuanyiArray = ZhuanyiDataInfo_Json.map((item) => ({
      personName: item.xm,
      personID: item.zjhm,
      payMonth: item.wjfdyys,
      pay: item.zje,
      fromArea: item.zrdname,
      isOnlyTransferRelation: item.zje == 0 ? "只转关系" : "转金额",
      status: getStatus(item.ffzt),
      payDate: formatDate(item.ffrq),
    }));
    return ZhuanyiArray;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw error;
  }
}
</script>
