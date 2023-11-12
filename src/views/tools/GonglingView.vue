<template>
  <a-row>
    <a-col :span="10">
      <a-form ref="paymentFormRef" name="dynamic_payment" :model="dynamicPaymentInfo">
        <a-form-item>
          <a-button type="primary" block @click="addPayment">
            <PlusOutlined />
            增加缴费
          </a-button>
        </a-form-item>
        <a-space
          v-for="(paymentYear, index) in dynamicPaymentInfo.years"
          :key="paymentYear.id"
          style="display: flex; margin-bottom: 8px"
          align="baseline"
        >
          <a-form-item
            :name="['years', index, 'first']"
            :rules="{
              required: true,
              message: '缺少缴费信息',
            }"
          >
            <a-input v-model:value="paymentYear.first" placeholder="初始缴费" />
          </a-form-item>
          <a-form-item
            :name="['years', index, 'last']"
            :rules="{
              required: true,
              message: '缺少缴费信息',
            }"
          >
            <a-input v-model:value="paymentYear.last" placeholder="终止缴费" />
          </a-form-item>
          <a-form-item>
            <a-input v-model:value="paymentYear.label" disabled></a-input>
          </a-form-item>
          <MinusCircleOutlined @click="removePayment(paymentYear)" />
        </a-space>

        <a-form-item>
          <a-space>
            <a-tag v-if="totalPaymentYear.value != 0">结果： {{ totalPaymentYear.label }}</a-tag>
          </a-space>
        </a-form-item>
      </a-form>
    </a-col>
    <a-col :span="2">
      <a-divider type="vertical" />
    </a-col>
    <a-col :span="10">
      <a-form ref="formRef" name="dynamic_form_nest_item" :model="dynamicServiceInfo">
        <a-form-item>
          <a-button type="primary" block @click="addyear">
            <PlusOutlined />
            增加工龄
          </a-button>
        </a-form-item>
        <a-space
          v-for="(year, index) in dynamicServiceInfo.years"
          :key="year.id"
          style="display: flex; margin-bottom: 8px"
          align="baseline"
        >
          <a-form-item
            :name="['years', index, 'first']"
            :rules="{
              required: true,
              message: 'Missing first name',
            }"
          >
            <a-input v-model:value="year.first" placeholder="First year" />
          </a-form-item>
          <a-form-item
            :name="['years', index, 'last']"
            :rules="{
              required: true,
              message: 'Missing last name',
            }"
          >
            <a-input v-model:value="year.last" placeholder="Last year" />
          </a-form-item>
          <a-form-item>
            <a-input v-model:value="year.label" disabled></a-input>
          </a-form-item>
          <MinusCircleOutlined @click="removeyear(year)" />
        </a-space>
        <a-form-item>
          <a-tag v-if="totalServiceYear.value != 0">结果： {{ totalServiceYear.label }}</a-tag>
        </a-form-item>
      </a-form>
    </a-col>
  </a-row>
  <a-row>
    <a-col :span="22">
      <a-button type="primary" @click="onFinish" block>计算</a-button>

    </a-col>
  </a-row>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';

interface year {
  first: string;
  last: string;
  label: string;
  id: number;
}
const formRef = ref<FormInstance>();
const dynamicServiceInfo = reactive<{ years: year[] }>({
  years: [],
});
watch(
  () => dynamicServiceInfo.years,
  (newValue, oldValue) => {
    console.log('newValue===>', newValue);
  }
);
const removeyear = (item: year) => {
  const index = dynamicServiceInfo.years.indexOf(item);
  if (index !== -1) {
    dynamicServiceInfo.years.splice(index, 1);
  }
};
const addyear = () => {
  dynamicServiceInfo.years = [
    ...dynamicServiceInfo.years,
    {
      first: '',
      last: '',
      label: '',
      id: Date.now(),
    },
  ];
};
const totalServiceYear = reactive<{ value: number; label: string }>({ value: 0, label: '' });

const getDifferent = (arr) => {
  totalServiceYear.value = 0;
  const result: string[] = [];
  arr.forEach((item) => {
    const first = item.first;
    const last = item.last;

    if (/^\d{6}$/.test(first) && /^\d{6}$/.test(last)) {
      const firstDate = new Date(first.slice(0, 4) + '/' + first.slice(4));
      const lastDate = new Date(last.slice(0, 4) + '/' + last.slice(4));

      const diff =
        (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
        (lastDate.getMonth() - firstDate.getMonth()) +
        1;
      item.label = `${diff}:${Math.floor(diff / 12)}年${diff % 12}月`;
      totalServiceYear.value += diff;
    }
  });
  totalServiceYear.label = `${Math.floor(totalServiceYear.value / 12)}年${
    totalServiceYear.value % 12
  }个月`;
};

const onFinish = (values) => {
  getDifferent(dynamicServiceInfo.years);
  getPaymentDiff(dynamicPaymentInfo.years);
};

// 缴费月数计算

interface paymentYear {
  first: string;
  last: string;
  label: string;
  id: number;
}
const paymentFormRef = ref<FormInstance>();
const dynamicPaymentInfo = reactive<{ years: paymentYear[] }>({
  years: [],
});
// watch(
//   () => dynamicPaymentInfo.years,
//   (newValue, oldValue) => {
//     console.log('newValue===>', newValue);
//   }
// );
const removePayment = (item: paymentYear) => {
  const index = dynamicPaymentInfo.years.indexOf(item);
  if (index !== -1) {
    dynamicPaymentInfo.years.splice(index, 1);
  }
};
const addPayment = () => {
  dynamicPaymentInfo.years = [
    ...dynamicPaymentInfo.years,
    {
      first: '',
      last: '',
      label: '',
      id: Date.now(),
    },
  ];
};
const totalPaymentYear = reactive<{ value: number; label: string }>({ value: 0, label: '' });
const getPaymentDiff = (arr) => {
  totalPaymentYear.value = 0;
  arr.forEach((item) => {
    const months = Number(item.last) - Number(item.first);
    const years = Math.floor(months / 12);
    const leftMonths = months % 12;
    totalPaymentYear.value += months;
    item.label = `${months}:${years}年${leftMonths}个月`;
  });
  totalPaymentYear.label = `${Math.floor(totalPaymentYear.value / 12)}年${
    totalPaymentYear.value % 12
  }个月`;
};
</script>
