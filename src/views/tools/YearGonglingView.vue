<template>
  <a-form ref="paymentFormRef" name="dynamic_payment" :model="dynamicPaymentInfo">
    <a-form-item>
      <a-button type="dashed" block @click="addPayment">
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
        <a-button type="primary" @click="onPaymentCal">计算</a-button>
        <a-tag>结果： {{ totalYear.label }}</a-tag>
      </a-space>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';

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
const totalYear = reactive<{value:number,label:string}>({value:0,label:''});
const getPaymentDiff = (arr) => {
  totalYear.value = 0;
  arr.forEach((item) => {
    const months = Number(item.last) - Number(item.first);
    const years = Math.floor(months / 12);
    const leftMonths = months % 12;
    totalYear.value += months
    item.label = `${months}:${years}年${leftMonths}个月`;
  });
  totalYear.label = `${Math.floor(totalYear.value / 12)}年${totalYear.value % 12}个月`
};

const onPaymentCal = (values) => {
  console.log('Received values of form:', values);
  getPaymentDiff(dynamicPaymentInfo.years);
};
</script>
