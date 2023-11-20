<template>
  <a-form :model="inject_editForm" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="身份证号" name="personID" has-feedback>
      <a-input v-model:value="inject_editForm.personID">
        </a-input>
    </a-form-item>
    <a-form-item label="姓名"  name="personName" has-feedback>
      <a-input v-model:value="inject_editForm.personName" />
    </a-form-item>
    <a-form-item label="备注">
      <a-textarea v-model:value="inject_editForm.note" />
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { computed, ref,onBeforeMount ,inject} from 'vue';
import {DataItem,jiezhens} from '@/types'
import api from '@/api/index'
onBeforeMount(()=>{
  console.log('inject_editForm==>',inject_editForm)
}

)

const inject_editForm = inject('editForm')
console.log('inject_editForm==>',inject_editForm)

const onSubmit = () => {
      return api.updateNongbuData(inject_editForm)
    }

const labelCol = { style: { width: '150px' } };
const wrapperCol = { span: 14 };

</script>

