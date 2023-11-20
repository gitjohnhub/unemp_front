<template>
  <a-date-picker v-model:value="year" picker="year"></a-date-picker>
  <a-row :gutter="[12, 12]" >
    <a-col :span="2">镇/月<a-divider type="vertical" /></a-col>
    <a-col :span="1"  v-for="num in numbers()" :key="num">{{ num }}月</a-col>
  </a-row>
  <a-row :gutter="[12, 12]" v-for="data in dataSource">
    <a-col :span="2">{{data.jiezhen}}<a-divider type="vertical" /></a-col>
    <a-col :span="1" v-for="monthData in data.value"><a-tag>{{ monthData }}</a-tag>
</a-col>
  </a-row>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '@/api';
import 'dayjs/locale/zh-cn';

const dataSource = ref();
const year = ref<Dayjs>(dayjs(new Date()));
const numbers = ()=>{
  return Array.from({ length: 12 }, (_, index) => index + 1);
}

watch(
  () => year.value,
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
  if (year.value) {
    params.year = year.value.format('YYYY')
  }
  console.log('params==>', params);

  api.getNongbuCalByMonthAndJiezhen(params).then((res) => {
    console.log(res);
    dataSource.value = CalNongbuCalByMonthAndJiezhen(res);
    console.log('dataSource===>', dataSource.value);
  });
};
const columns = [
  {
    title: '街镇',
    dataIndex: 'jiezhen',
    key: 'jiezhen',
  },
  {
    title: '月份',
    dataIndex: 'month',
    key: 'month',
  },
  {
    title: '计数',
    dataIndex: 'count',
    key: 'count',
  },
];
interface DataItem {
  month: number;
  count: number;
  jiezhen: string;
}

interface ConvertedData {
  jiezhen: string;
  value: (number | string)[];
}

function CalNongbuCalByMonthAndJiezhen(data: any) {
  const convertedData: ConvertedData[] = [];

  // 遍历原始数据，根据街镇进行分组
  const groupedData = data.reduce((acc: Record<string, DataItem[]>, item: DataItem) => {
    if (!acc[item.jiezhen]) {
      acc[item.jiezhen] = [];
    }
    acc[item.jiezhen].push(item);
    return acc;
  }, {});

  // 将分组后的数据转换为目标格式
  for (const jiezhen in groupedData) {
    const groupedItems = groupedData[jiezhen];
    const value: (number | string)[] = [];

    // 初始化 value 数组
    for (let i = 0; i <= 11; i++) {
      value.push(0);
    }

    // 填充对应月份的值
    for (const item of groupedItems) {
      value[item.month - 1] = item.count;
    }

    convertedData.push({
      jiezhen,
      value,
    });
  }
  return convertedData;
}
</script>
