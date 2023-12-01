<template>
  <div style="background: #f7eedd; padding: 30px">
    <a-space direction="vertical">
      <a-date-picker v-model:value="monthSelect" picker="month" />

      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="unempData in unempDatas">
          <a-card style="background-color: #ede4d3; border-style: none">
            <a-statistic
              :title="unempData.value"
              :value="unempData.count"
              :precision="0"
              suffix="人次"
              class="demo-class"
              :value-style="{ color: '#2C824A' }"
            >
              <template #prefix>
                <div style="font-size: 10px">初核:</div>
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="6">
          <a-statistic title="农民补助金(已审批)" :value="NongbuTotalCurrentMonth" style="margin-right: 20px" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="延长失业金(已审批)" :value="YanchangTotalCurrentMonth" style="margin-right: 50px"  />
          </a-col>
          <a-col :span="6">
          <a-statistic title="跨省市转移(转金额)" :value="ZhuanyiTotalCurrentMonth" style="margin-right: 50px"  />
        </a-col>
      </a-row>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import api from '@/api';
import { useUserStore } from '@/stores';
import { onBeforeMount, ref, watch } from 'vue';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { getMonthRange } from '@/utils/util';

const userStore = useUserStore();
const checkoperators = ref();
const unempDatas = ref([]);
const monthSelect = ref<Dayjs>();
watch(
  () => monthSelect.value,
  (newValue) => {
    // console.log(newValue.format('YYYY-MM-DD HH:mm:ss'))
    getAllData();
  }
);
const getUnempData = async (params?: any) => {
  if (monthSelect.value) {
    params = {
      ...params,
      alreadydelete: 1,
      monthSelect: monthSelect.value,
    };
  }
  userStore
    .getUsers()
    .then(() => {
      checkoperators.value = userStore.checkoperators;
    })
    .then(async () => {
      unempDatas.value = await Promise.all(
        checkoperators.value.map(async (userInfo) => {
          const unempData: any = await api.getUnempVeriData({
            ...params,
            checkoperators: [userInfo.value],
          });
          return {
            value: userInfo.value,
            count: unempData.page.total,
          };
        })
      );
    });
};
onBeforeMount(() => {
  const currentDate = new Date();
  // 获取上一个月的年份和月份
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth() - 1;

  // 调整年份和月份
  if (month < 0) {
    month = 11; // 调整为12月
    year--; // 年份减一
  }

  // 设置日期
  currentDate.setFullYear(year, month);
  monthSelect.value = dayjs(currentDate);
  getAllData();
});
function getAllData() {
  getUnempData();
  getNongbuData();
  getYanchangData();
  getZhuanyiData();
}
// 农补当月数据
const NongbuTotalCurrentMonth = ref();
const getNongbuData = async () => {
  const params: any = {};
  params.status = 1;
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
  }
  await api.getNongbuData(params).then((res: any) => {
    NongbuTotalCurrentMonth.value = res.page.total;
  });
};
// 延长当月数据
const YanchangTotalCurrentMonth = ref();
const getYanchangData = async () => {
  const params: any = {};
  params.status = 1;
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
  }
  await api.getYanchangData(params).then((res: any) => {
    YanchangTotalCurrentMonth.value = res.page.total;
  });
};
// 跨省市转移当月数据
const ZhuanyiTotalCurrentMonth = ref();
const getZhuanyiData = async () => {
  const params: any = {};
  params.status = 3;
  params.isOnlyTransferRelation = '转金额'
  if (monthSelect.value) {
    params.payDate = monthSelect.value.format('YYYY-MM');
  }
  console.log('paramsPayMonth===>',params)
  await api.getZhuanyiData(params).then((res: any) => {
    ZhuanyiTotalCurrentMonth.value = res.page.total;
  });
};
</script>
<style>
.ant-statistic-content-suffix {
  font-size: 10px;
}
</style>
