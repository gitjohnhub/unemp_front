<template>
  <a-date-picker v-model:value="year" picker="year"></a-date-picker>
  <a-button type="primary" @click="refreshData()">刷新数据</a-button>
  <a-divider></a-divider>

  <a-row :gutter="[6, 12]">
    <a-col :span="2">镇/月<a-divider type="vertical" /></a-col>
    <a-col :span="1" v-for="num in numbers()" :key="num">{{ num }}月</a-col>
    <a-col :span="2">合计</a-col>
    <a-col :span="1">错误率</a-col>
  </a-row>
  <a-row :gutter="[6, 12]" v-for="data in dataSource">
    <a-col :span="2">{{ data.jiezhen }}<a-divider type="vertical" /></a-col>
    <a-col :span="1" v-for="monthData in data.value"
      ><a-tag>{{ monthData }}</a-tag>
    </a-col>
    <a-col :span="1"
      ><a-tag>{{ data.total }}</a-tag></a-col
    >
    <a-col :span="1"
      ><a-tag v-if="wrongPA.length > 0">{{ wrongPA.filter(item=>item.jiezhen == data.jiezhen)[0].errorRate }}</a-tag></a-col
    >
  </a-row>
  <a-divider></a-divider>

  <!-- 错误 -->
  <h1>差错统计</h1>
  <a-row :gutter="[6, 24]">
    <a-col :span="2">镇/月<a-divider type="vertical" /></a-col>
    <a-col :span="1" v-for="num in numbers()" :key="num">{{ num }}月</a-col>
    <a-col :span="2">合计</a-col>
  </a-row>
  <a-row :gutter="[6, 24]" v-for="data in dataSourceWithWrongTag">
    <a-col :span="2">{{ data.jiezhen }}<a-divider type="vertical" /></a-col>
    <a-col :span="1" v-for="monthData in data.value"
      ><a-tag>{{ monthData }}</a-tag>
    </a-col>
    <a-col :span="1"
      ><a-tag>{{ data.total }}</a-tag></a-col
    >
  </a-row>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '@/api';
import 'dayjs/locale/zh-cn';

const dataSource = ref();
const dataSourceWithWrongTag = ref();
const year = ref<Dayjs>(dayjs(new Date()));
const numbers = () => {
  return Array.from({ length: 12 }, (_, index) => index + 1);
};
const wrongPA = computed(() => {
  const errorRateArray = [];
  if (dataSource.value && dataSourceWithWrongTag.value) {
    console.log(dataSource.value)
    for (let i = 0; i < dataSource.value.length; i++) {
      const wronyIndexData = dataSourceWithWrongTag.value.filter((item) => {
        return item.jiezhen == dataSource.value[i].jiezhen;
      });
      let errorRate = 0;
      if (wronyIndexData.length != 0) {
        errorRate = wronyIndexData[0].total / dataSource.value[i].total;
      } else {
        errorRate = 0 / dataSource.value[i].total;
      }
      errorRateArray.push({
        errorRate:`${errorRate*100}%`,
        jiezhen:dataSource.value[i].jiezhen
      }
        );
      console.log(errorRateArray);
    }
    return errorRateArray;

  }else{
    return []
  }
});
watch(
  () => year.value,
  () => {
   refreshData()
  }
);
const refreshData=()=>{
  getData().then((res) => {
    dataSource.value = CalNongbuCalByMonthAndJiezhen(res);
  });
  getData({ wrongTag: '1' }).then((res) => {
    dataSourceWithWrongTag.value = CalNongbuCalByMonthAndJiezhen(res);
  });

}
onBeforeMount(() => {
  refreshData()
});
const getData = (params?: any) => {
  params = {
    ...params,
  };
  if (year.value) {
    params.year = year.value.format('YYYY');
  }
  return api.getNongbuCalByMonthAndJiezhen(params);
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
  total: number;
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
    let total = 0;

    const groupedItems = groupedData[jiezhen];
    const value: (number | string)[] = [];

    // 初始化 value 数组
    for (let i = 0; i <= 11; i++) {
      value.push(0);
    }

    // 填充对应月份的值
    for (const item of groupedItems) {
      value[item.month - 1] = item.count;
      total += item.count;
    }

    convertedData.push({
      jiezhen,
      value,
      total,
    });
  }
  calculateStatistics(convertedData);
  convertedData.push({
    jiezhen: '合计',
    value: calculateStatistics(convertedData).monthlyTotals,
    total: calculateStatistics(convertedData).monthlyTotals.reduce((pre, cur) => {
      return pre + cur;
    }, 0),
  });
  return convertedData;
}
//计算累计
function calculateStatistics(data) {
  const monthlyTotals = Array(12).fill(0);
  const townTotals = {};

  for (const item of data) {
    const { jiezhen, value } = item;

    // 统计每个街镇每个月的数据
    if (!townTotals[jiezhen]) {
      townTotals[jiezhen] = Array(12).fill(0);
    }

    for (let i = 0; i < value.length; i++) {
      const monthlyValue = value[i];
      townTotals[jiezhen][i] += monthlyValue;
      monthlyTotals[i] += monthlyValue;
    }
  }

  return {
    monthlyTotals,
    townTotals,
  };
}
</script>
