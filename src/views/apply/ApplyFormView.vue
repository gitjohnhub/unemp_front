<template>
  <a-form :model="formState" ref='formRef' :rules='rules' :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="身份证号" name="personID" has-feedback>
      <a-input v-model:value="formState.personID">
        <template #suffix>
          <a-tag>{{ personIDCount }}</a-tag>
        </template>
        </a-input>
    </a-form-item>
    <a-form-item label="姓名"  name="personName" has-feedback>
      <a-input v-model:value="formState.personName" />
    </a-form-item>
    <a-form-item label="街镇" name="jiezhen" has-feedback >
      <a-select
      ref="select"
      v-model:value="formState.jiezhen"
      style="width: 120px"
      :options="jiezhens"
    ></a-select>
    </a-form-item>
    <a-form-item label="初核备注">
      <a-textarea v-model:value="formState.checknote" />
    </a-form-item>
    <a-form-item label="复核备注">
      <a-textarea v-model:value="formState.reviewnote" />
    </a-form-item>
    <!-- <a-form-item label="是否删除">
      <a-radio-group v-model:value="formState.alreadydelete">
        <a-radio :value=1>保留</a-radio>
        <a-radio :value=0>删除</a-radio>
      </a-radio-group>
    </a-form-item> -->
  </a-form>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import {editDataItem,jiezhens} from '@/types'
import { useUserStore } from '@/stores';
import api from '@/api/index'
const formRef = ref(null)
const checkoperator = useUserStore().userInfo.username
const formState = ref<editDataItem>({
  personID: '',
  personName: '',
  verification:'0',
  jiezhen:'',
  checknote: '',
  reviewnote: '',
  alreadydelete:1,
});
const onSubmit = () => {
  return formRef.value
    .validate()
    .then(() => {
      return api.addUnempVeriData({
        ...formState.value,
        checkoperator,
      }).then(()=>{
        resetForm()
      })
    })
    // .catch(error => {
    //   console.log('error', error);
    //   // message.info('提交失败，格式不正确')
    // });
};

const personIDCount = computed(()=>{
  return formState.value.personID.length
})
const rules = {
  personID:[
    { required: true, message: '请输入身份证号', trigger: 'change' },
    { min: 18, max: 18, message: '请填写18位身份证', trigger: 'blur' },
    // {type:'number', message:'请检查格式', trigger: 'change' }
  ],
  personName:[
  { required: true, message: '请输入姓名', trigger: 'change' },
  ],
  jiezhen:[
  { required: true, message: '选择街镇', trigger: 'change' },
  ]
}
const resetForm = () => {
  formRef.value.resetFields();
};
const labelCol = { style: { width: '150px' } };
const wrapperCol = { span: 14 };
defineExpose({
  onSubmit,
  resetForm
})
</script>

