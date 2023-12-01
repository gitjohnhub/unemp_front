<template>
  <a-date-picker v-model:value="year" picker="year"></a-date-picker>
  <a-button type="primary" @click="refreshData()">刷新数据</a-button>
  <a-divider></a-divider>
  <a-table :columns="columns" :dataSource="fixDataSource" :pagination="false"> </a-table>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '@/api';
import 'dayjs/locale/zh-cn';

const dataSource = ref();
const dataSourceWithWrongTag = ref();
const fixDataSource = ref();
const year = ref<Dayjs>(dayjs(new Date()));
const numbers = () => {
  return Array.from({ length: 12 }, (_, index) => index + 1);
};
const wrongPA = computed(() => {
  const errorRateArray = [];
  if (dataSource.value && dataSourceWithWrongTag.value) {
    for (let i = 0; i < dataSource.value.length; i++) {
      const wronyIndexData = dataSourceWithWrongTag.value.filter((item) => {
        return item.jiezhen == dataSource.value[i].jiezhen;
      });
      let errorRate = '';
      if (wronyIndexData.length != 0) {
        errorRate = (wronyIndexData[0].total / dataSource.value[i].total).toFixed(1);
      } else {
        errorRate = '0';
      }
      errorRateArray.push({
        errorRate: `${Number(errorRate) * 100}%`,
        jiezhen: dataSource.value[i].jiezhen,
      });
    }
    return errorRateArray;
  } else {
    return [];
  }
});
watch(
  () => year.value,
  () => {
    refreshData();
  }
);
const refreshData = () => {
  getData()
    .then((res) => {
      dataSource.value = CalNongbuCalByMonthAndJiezhen(res);
    })
    .then(() => {
      getData({ wrongTag: '1' }).then((res) => {
        dataSourceWithWrongTag.value = CalNongbuCalByMonthAndJiezhen(res);
      }).then(() => {
      console.log('dataSource.value==>', dataSource.value);
      console.log('dataSourceWithWrongTag.value===>',dataSourceWithWrongTag.value);

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
  return api.getNongbuCalByMonthAndJiezhen(params);
};
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
interface DataItem {
  month: number;
  count: number;
  jiezhen: string;
}
const convertedData = ref([]);

function CalNongbuCalByMonthAndJiezhen(data: any) {
  const result: any = [];
  // 遍历原始数据，根据街镇进行分组
  const groupedData = data.reduce((acc: Record<string, DataItem[]>, item: DataItem) => {
    if (!acc[item.jiezhen]) {
      acc[item.jiezhen] = [];
    }
    acc[item.jiezhen].push(item);
    return acc;
  }, {});
  const nextHandleData = [];

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
    nextHandleData.push({
      jiezhen,
      value,
      total,
    });

    result.push({
      jiezhen,
      ...Object.fromEntries(months.map((month, index) => [month, value[index]])),
      total,
    });
  }
  const totalCal = calculateStatistics(nextHandleData);
  result.push({
    jiezhen: '合计',
    ...Object.fromEntries(months.map((month, index) => [month, totalCal.monthlyTotals[index]])),
    total: totalCal.monthlyTotals.reduce((pre, cur) => {
      return pre + cur;
    }, 0),
  });
  return result;
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
