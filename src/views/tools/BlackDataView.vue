<template>
  <a-input-search
    v-model:value="searchValue"
    placeholder="输入身份证/姓名"
    style="width: 300px"
    @search="onSearch"
  />
  <a-spin :spinning="spinning">
    <a-table :columns="columns" :data-source="dataSource" bordered size="small">
    </a-table>
  </a-spin>
</template>
<script setup lang="ts">
import { ref } from "vue";
import api from "@/api";
const searchValue = ref("");
const spinning = ref(false);
const dataSource = ref();
const onSearch = async () => {
  await getData({
    searchValue: searchValue.value,
  });
};
const getData = async (params?: any) => {
  spinning.value = true;
  params = {
    ...params,
  };
  if (searchValue.value !== undefined && searchValue.value !== "") {
    params = {
      searchValue: searchValue.value,
      current: 1,
    };
  }
  return await api.getBlackData(params).then((res: any) => {
    dataSource.value = res.rows;
    spinning.value = false;
    return res.rows;
  });
};
const columns = [
  {
    title: "姓名",
    dataIndex: "personName",
    key: "personName",
  },
  {
    title: "身份证号",
    dataIndex: "personID",
    key: "personID",
  },
  {
    title: "劳动经历时间段",
    dataIndex: "workRangeDate",
    key: "workRangeDate",
  },
  {
    title: "地点",
    dataIndex: "fromArea",
    key: "fromArea",
  },
  {
    title: "创建时间",
    dataIndex: "createtime",
    key: "createtime",
  },
];
</script>
