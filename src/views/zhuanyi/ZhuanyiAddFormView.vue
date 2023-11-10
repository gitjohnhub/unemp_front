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
    <a-form-item label="转入地" name="fromArea" has-feedback>
      <a-input v-model:value="formState.fromArea" />
    </a-form-item>
    <a-form-item label="享受期限" name="payMonth" has-feedback>
      <a-input v-model:value="formState.payMonth" />
    </a-form-item>
    <a-form-item label="转关系" name="isOnlyTransferRelation" has-feedback>
      <a-select
        ref="select"
        v-model:value="formState.isOnlyTransferRelation"
        style="width: 120px"
        :options="isOnlyTransferRelationOp"
      ></a-select>
    </a-form-item>
    <a-form-item label="备注">
      <a-textarea v-model:value="formState.note" />
    </a-form-item>
    <!-- <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click="onSubmit">Create</a-button>
      <a-button style="margin-left: 10px">Cancel</a-button>
    </a-form-item> -->
  </a-form>
</template>
<script lang="ts" setup>
import { computed, ref,watch } from 'vue';
import { useUserStore } from '@/stores';
import api from '@/api/index';
const formRef = ref(null);
const checkoperator = useUserStore().userInfo.username;
const formState = ref({
  personID: '',
  personName: '',
  fromArea: '',
  isOnlyTransferRelation: '转金额',
  status: '0',
  payDate: '',
  reviewnote: '',
  note: '',
  isDeleted: 1,
  payMonth: '',
});
const isOnlyTransferRelationOp = [
  {
    value: '只转关系',
  },
  {
    value: '转金额',
  },
];
watch(
  () => formState.value.personID,
  (newValue) => {
    console.log('formState.value==>', newValue);
  }
);
const onSubmit = () => {
  return formRef.value.validate().then(() => {
    return api
      .addZhuanyiData({
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
defineExpose({
  onSubmit,
  resetForm,
});
</script>
