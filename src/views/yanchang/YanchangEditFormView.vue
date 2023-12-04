<template>
  <a-form
    :model="editForm"
    ref="editableFormRef"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <a-form-item label="身份证号" name="personID" has-feedback>
      <a-input v-model:value="editForm.personID">
        <template #suffix>
          <a-tag>{{ personIDCount }}</a-tag>
        </template>
      </a-input>
    </a-form-item>
    <a-form-item label="姓名" name="personName" has-feedback>
      <a-input v-model:value="editForm.personName" />
    </a-form-item>
    <a-form-item label="转入地" name="fromArea" has-feedback>
      <a-select
        ref="select"
        v-model:value="editForm.fromArea"
        style="width: 120px"
        :options="jiezhens"
      ></a-select>
    </a-form-item>
    <a-form-item label="初核备注">
      <a-textarea v-model:value="editForm.checknote" />
    </a-form-item>
    <a-form-item label="复核备注">
      <a-textarea v-model:value="editForm.reviewnote" />
    </a-form-item>
    <a-form-item label="是否删除">
      <a-radio-group v-model:value="editForm.alreadydelete">
        <a-radio :value="1">保留</a-radio>
        <a-radio :value="2">删除</a-radio>
      </a-radio-group>
    </a-form-item>
    <!-- <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click="onSubmit">Create</a-button>
      <a-button style="margin-left: 10px">Cancel</a-button>
    </a-form-item> -->
  </a-form>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import { jiezhens } from "@/types";
import api from "@/api/index";
const props = defineProps(["editForm"]);
console.log(props);
const editableFormRef = ref(null);

const editForm = ref(props.editForm);
const onSubmit = () => {
  return editableFormRef.value.validate().then(() => {
    console.log(editForm.value);
    return api.updateUnempVeriData(editForm.value);
  });
};

const personIDCount = computed(() => {
  return editForm.value.personID.length;
});
const rules = {
  personID: [
    { required: true, message: "请输入身份证号", trigger: "change" },
    { min: 18, max: 18, message: "请填写18位身份证", trigger: "blur" },
    // {type:'number', message:'请检查格式', trigger: 'change' }
  ],
  personName: [{ required: true, message: "请输入姓名", trigger: "change" }],
};
// const resetForm = () => {
//   formRef.value.resetFields();
// };
const labelCol = { style: { width: "150px" } };
const wrapperCol = { span: 14 };
defineExpose({
  onSubmit,
});
</script>
