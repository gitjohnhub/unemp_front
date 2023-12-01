<template>
  <a-form
    :model="formState"
    ref="formRef"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <a-form-item label="身份证号" name="personID" has-feedback>
      <a-input v-model:value="formState.personID">
        <template #suffix>
          <a-tag>{{ personIDCount }}</a-tag>
        </template>
      </a-input>
    </a-form-item>
    <a-form-item label="姓名" name="personName" has-feedback>
      <a-input v-model:value="formState.personName" />
    </a-form-item>
    <a-form-item label="月数" name="payMonth" has-feedback>
      <a-input v-model:value="formState.payMonth" />
    </a-form-item>
    <a-form-item label="起始日期" name="startDate" has-feedback>
      <a-date-picker v-model:value="startDate" />
    </a-form-item>
    <a-form-item label="街镇" name="jiezhen" has-feedback>
      <a-select
        ref="select"
        v-model:value="formState.jiezhen"
        style="width: 120px"
        :options="jiezhens"
      ></a-select>
    </a-form-item>
    <a-form-item label="备注">
      <a-textarea v-model:value="formState.note" />
    </a-form-item>
    <a-form-item label="选择未登记">
      <a-radio-group v-model:value="formState.status">
        <a-radio value='0'>已登记</a-radio>
        <a-radio value='2' >待登记</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="原件">
      <a-radio-group v-model:value="formState.originalFile">
        <a-radio value='0'>未收到</a-radio>
        <a-radio value='1' >已收到</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="是否错核">
      <a-radio-group v-model:value="formState.wrongTag">
        <a-radio value='1'>标记错核</a-radio>
        <a-radio value='0'>未错核</a-radio>
      </a-radio-group>
    </a-form-item>

  </a-form>
</template>
<script lang="ts" setup>
import { computed, ref,watch } from 'vue';
import { useUserStore } from '@/stores';
import { jiezhens } from '@/types';
import api from '@/api/index';
import {calculateEndDate} from '@/utils/util';
import { Dayjs } from 'dayjs';
const formRef = ref(null);
const checkoperator = useUserStore().userInfo.username;
const startDate = ref<Dayjs>();
const formState = ref({
  personID: '',
  personName: '',
  checkoperator,
  payMonth: '',
  status: '0',
  startDate:'',
  endDate: '',
  note: '',
  jiezhen:'',
  originalFile:'0',
  wrongTag:'0'
});

watch(
  () => startDate.value,
  (newValue) => {
    console.log(startDate.value.format('YYYY-MM-DD'));
  }
);
const onSubmit = () => {
  formState.value.startDate = startDate.value.format('YYYY-MM-DD')
  formState.value.endDate = calculateEndDate(startDate.value.format('YYYY-MM-DD'), formState.value.payMonth);
  return formRef.value.validate().then(() => {
    return api
      .addYanchangData({
        ...formState.value,
        checkoperator,
      })
      .then(() => {
        resetForm();
      });
  });
  // .catch(error => {
  //   console.log('error', error);
  //   // message.info('提交失败，格式不正确')
  // });
};

const personIDCount = computed(() => {
  return formState.value.personID.length;
});
const rules = {
  personID: [
    { required: true, message: '请输入身份证号', trigger: 'change' },
    { min: 18, max: 18, message: '请填写18位身份证', trigger: 'blur' },
    // {type:'number', message:'请检查格式', trigger: 'change' }
  ],
  personName: [{ required: true, message: '请输入姓名', trigger: 'change' }],
};
const resetForm = () => {
  formRef.value.resetFields();
};
const labelCol = { style: { width: '150px' } };
const wrapperCol = { span: 14 };
// 计算核发标准
const CalPayMonth = (payMonth) => {
  if (payMonth) {
    const numPayMonth = Number(payMonth);
    if (numPayMonth <= 12) {
      return String(numPayMonth * 2175 * 1.5);
    } else {
      return String(12 * 2175 * 1.5 + (numPayMonth - 12) * 1740 * 1.5);
    }
  } else {
    return '0';
  }
};
defineExpose({
  onSubmit,
  resetForm,
});
</script>
