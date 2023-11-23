<template>
  <a-segmented v-model:value="selectedMonth" :options="months.slice(0, 6)" />
  <a-segmented v-model:value="selectedMonth" :options="months.slice(6)" />
  <a-button type="primary" @click="getMonths()">刷新月份</a-button>
  <a-spin :spinning="spinning">
    <a-table :columns="columns" :data-source="dataSource" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag>{{ statusList[Number(record.status)] }}</a-tag>
        </template>
        <template v-if="column.key === 'note'">
          <a-tooltip color="#87d068">
            <template #title>
              <a-timeline mode="alternate">
                <a-timeline-item>
                    <p>初审人：{{ record.checkoperator }}</p>
                    <p>{{ record.createtime.slice(0,10) }}</p>
                    <p>{{ record.note }}</p>
                </a-timeline-item>
                <a-timeline-item>复审人:{{ record.reviewoperator }}</a-timeline-item>
              </a-timeline>

            </template>
            {{ record.note }}
          </a-tooltip>
        </template>
      </template>
    </a-table>
  </a-spin>
</template>
<script setup lang="ts">
import api from '@/api';
import { ref, onBeforeMount, watch } from 'vue';
const dataSource = ref();
const months = ref(['']);
const selectedMonth = ref('');
const spinning = ref<boolean>(false);

const statusList = [
  '已初核待复审',
  '待对方确认',
  '本次支付中',
  '已支付',
  '已驳回',
  '已取消',
  '长时间对方未确认',
  '本次支付失败，下次支付',
];
watch(
  () => selectedMonth.value,
  () => {
    getData();
  }
);
onBeforeMount(() => {
  console.log('zhuanyiExcel');
  getMonths();
});
const getMonths = (params?: any) => {
  api
    .getZhuanyiAllDate()
    .then((res: any) => {
      console.log('res', res);
      months.value = res;
      console.log('months===>', months.value);
    })
    .catch((err) => {
      console.log(err);
    });
};
const getData = (params?: any) => {
  params = {
    ...params,
    noindex: 1,
    searchDate: selectedMonth.value,
  };
  console.log(selectedMonth.value);
  api.getZhuanyiData(params).then((res: any) => {
    console.log(res);
    dataSource.value = res.rows;
  });
};
const columnsOriginal = [
  {
    key: 'personName',
    title: '姓名',
  },
  {
    key: 'personID',
    title: '身份证号',
  },
  {
    key: 'isOnlyTransferRelation',
    title: '是否转移金额',
  },
  {
    key: 'payDate',
    title: '支付日期',
  },
  {
    key: 'jiezhen',
    title: '街镇',
  },
  {
    key: 'note',
    title: '备注',
    ellipsis: true,
  },
  {
    key: 'status',
    title: '进度',
  },
  {
    key: 'createtime',
    title: '提交时间',
  },
];
const columns = columnsOriginal.map((item) => {
  return {
    ...item,
    dataIndex: item.key,
    align: 'center',
  };
});
</script>
