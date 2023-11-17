<template>
  <a-date-picker v-model:value="monthSelect" picker="month"></a-date-picker>
  <a-table :dataSource="dataSource" :columns="columns" />
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '@/api';
import 'dayjs/locale/zh-cn';

const dataSource = ref();
const monthSelect = ref<Dayjs>();

watch(
  () => monthSelect.value,
  () => {
    getData();
  }
);
onBeforeMount(() => {
  getData();
});
const getData = (params?: any) => {
  params = {
    ...params,
  };
  if (monthSelect.value) {
    params.monthSelect = [
      dayjs(monthSelect.value).startOf('month').toISOString().slice(0,10),
      dayjs(monthSelect.value).endOf('month').toISOString().slice(0,10),
    ];
  }
  console.log('params',params)

  api.getYanchangByJiezhen(params).then((res) => {
    dataSource.value = res;
  });
};
const columns = [
  {
            title: '街镇',
            dataIndex: 'jiezhen',
            key: 'jiezhen',
          },
          {
            title: '计数',
            dataIndex: 'count',
            key: 'count',
          },
        ]
</script>
