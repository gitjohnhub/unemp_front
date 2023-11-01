<template>
  <div style="background: #ececec; padding: 30px">
    <a-space direction="vertical">
    <a-date-picker v-model:value="monthSelect" picker="month" />

    <a-row :gutter="[16,16]">
      <a-col :span="6"  v-for="unempData in unempDatas">
        <a-card>
          <a-statistic
            :title="unempData.value"
            :value="unempData.count"
            :precision="0"
            suffix="人次"
            class="demo-class"
            :value-style="{ color: '#2C824A' }"
          >
          <template #prefix>
              <div style="font-size: 10px;">初核: </div>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>
  </a-space>

  </div>
</template>

<script setup lang="ts">
import api from '@/api';
import { useUserStore } from '@/stores';
import { onBeforeMount, ref,watch } from 'vue';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import {getMonthRange} from '@/utils/util'

const userStore = useUserStore();
const checkoperators = ref();
const unempDatas = ref([]);
const monthSelect = ref<Dayjs>();
  watch(
  () => monthSelect.value,
  (newValue) => {
    // console.log(newValue.format('YYYY-MM-DD HH:mm:ss'))
    getData();
  }
);
const getData = async (params?:any)=>{
  if (monthSelect.value) {
    params = {
      ...params,
      monthSelect: getMonthRange(monthSelect.value),
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
          const res:any = await api.getUnempVeriData({
            ...params,
            checkoperators: [userInfo.value]
          });
          console.log(res)
          return {
            value: userInfo.value,
            count: res.page.total,
          };
        })
      );
    });
}
onBeforeMount(() => {
  monthSelect.value = dayjs(new Date())
  getData()

});
</script>
<style>
.ant-statistic-content-suffix {
  font-size: 10px;
}
</style>
