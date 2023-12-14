<template>
  <a-form
    :model="localEditForm"
    ref="editableFormRef"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <a-form-item label="身份证号" name="personID" has-feedback>
      <a-input v-model:value="localEditForm.personID">
        <template #suffix>
          <a-tag>{{ localEditForm.personID.length }}</a-tag>
        </template>
      </a-input>
    </a-form-item>
    <a-form-item label="姓名" name="personName" has-feedback>
      <a-input v-model:value="localEditForm.personName" />
    </a-form-item>
    <a-form-item label="街镇" name="jiezhen" has-feedback>
      <a-select
        ref="select"
        v-model:value="localEditForm.jiezhen"
        style="width: 120px"
        :options="jiezhens"
      ></a-select>
    </a-form-item>
    <a-form-item label="初核备注">
      <a-textarea v-model:value="localEditForm.checknote" />
    </a-form-item>
    <a-form-item label="复核备注">
      <a-textarea v-model:value="localEditForm.reviewnote" />
    </a-form-item>
    <a-form-item label="选择未初核">
      <a-radio-group v-model:value="localEditForm.status">
        <a-radio value="0">已初核</a-radio>
        <a-radio value="2">待初核</a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { jiezhens, rules, wrapperCol, labelCol } from "@/types";
import api from "@/api/index";
import { useUserStore } from "@/stores";
const checkoperator = useUserStore().userInfo.username;
const props = defineProps({
  editForm: {
    type: Object,
    default() {
      return {
        personID: "",
        personName: "",
        status: "0",
        jiezhen: "",
        checknote: "",
        reviewnote: "",
      };
    },
  },
});
const editableFormRef = ref(null);
const initialEditForm = { ...props.editForm };

const localEditForm = ref(props.editForm);
const onSubmit = () => {
  if (initialEditForm.personID == "") {
    return editableFormRef.value.validate().then(async () => {
      localEditForm.value.checkoperator = checkoperator;
      console.log("localAddForm.value===>", localEditForm.value);
      return await api.addUnempVeriData(localEditForm.value);
    });
  } else {
    return editableFormRef.value.validate().then(() => {
      console.log("localEditForm.value===>", localEditForm.value);
      const editFormToPush = {
        ...localEditForm.value,
      };
      delete editFormToPush.createtime;
      delete editFormToPush.editVisible;
      return api.updateUnempVeriData(editFormToPush);
    });
  }
};
defineExpose({
  onSubmit,
});
</script>
