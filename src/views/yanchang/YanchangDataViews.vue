<template>
  <a-date-picker v-model:value="year" picker="year"></a-date-picker>
  <a-button type="primary" @click="refreshData()">刷新数据</a-button>
  <a-divider></a-divider>
  <a-table :columns="columns" :dataSource="fixDataSource" :pagination="false"> </a-table>
</template>

<script setup lang="ts">
import {  onBeforeMount, ref, watch } from 'vue';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '@/api';
import 'dayjs/locale/zh-cn';
import {months,CalByMonthAndJiezhen} from '@/utils/util'
const dataSource = ref();
const dataSourceWithWrongTag = ref();
const fixDataSource = ref();
const year = ref<Dayjs>(dayjs(new Date()));

watch(
  () => year.value,
  () => {
    refreshData();
  }
);
const refreshData = () => {
  getData()
    .then((res) => {
      dataSource.value = CalByMonthAndJiezhen(res);
    })
    .then(() => {
      getData({ wrongTag: '1' }).then((res) => {
        dataSourceWithWrongTag.value = CalByMonthAndJiezhen(res);
      }).then(() => {
      fixDataSource.value = dataSource.value.map((item1) => {
        const matchingItem2 = dataSourceWithWrongTag.value.find((item2) => item2.jiezhen === item1.jiezhen);

        if (matchingItem2) {
          // 对相同的 jiezhen 进行合并
          const mergedItem = {
            jiezhen: item1.jiezhen,
            ...Object.fromEntries(
              Object.entries(item1)
                .filter(([key]) => key !== 'jiezhen' && key !== 'total')
                .map(([key, value]) => [key, `${value}(${matchingItem2[key]})`])
            ),
            total: `${item1.total}(${ matchingItem2.total})(${parseFloat((matchingItem2.total/item1.total).toFixed(2) )*100}%)`,
          };

          return mergedItem;
        } else {
          return item1;
        }
      });
    });
  })
};
onBeforeMount(() => {
  refreshData();
});
const getData = (params?: any) => {
  convertedData.value = [];
  params = {
    ...params,
    status: '1',
  };
  if (year.value) {
    params.year = year.value.format('YYYY');
  }
  return api.getYanchangCalByMonthAndJiezhen(params);
};

const columns = [
  {
    title: '街镇',
    dataIndex: 'jiezhen',
    key: 'jiezhen',
  },
  ...months.map((month, index) => {
    return {
      title: `${index + 1}月`,
      dataIndex: month,
      key: month,
    };
  }),
  {
    title: '计数',
    dataIndex: 'total',
    key: 'total',
  },
];

const convertedData = ref([]);


</script>
