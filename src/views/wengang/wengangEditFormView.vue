<template>
  <a-form
    :model="localEditForm"
    ref="editableFormRef"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <a-form-item label="联系人" name="contactPerson" has-feedback>
      <a-input v-model:value="localEditForm.contactPerson"> </a-input>
    </a-form-item>
    <a-form-item label="联系电话" name="contactNumber" has-feedback>
      <a-input v-model:value="localEditForm.contactNumber" />
    </a-form-item>
    <a-form-item label="备注">
      <a-textarea v-model:value="localEditForm.note" />
    </a-form-item>
    <a-form-item label="状态">
      <a-radio-group v-model:value="localEditForm.status">
        <a-radio value="0">未通知</a-radio>
        <a-radio value="1">已通知</a-radio>
        <a-radio value="2">已初审</a-radio>
        <a-radio value="3">已复核</a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { rules, wrapperCol, labelCol } from "@/types";
import api from "@/api/index";
import { useUserStore } from "@/stores";
const checkoperator = useUserStore().userInfo.username;

const props = defineProps({
  editForm: {
    type: Object,
    default() {
      return {
        contactPerson: "",
        contactNumber: "",
        status: "0",
        note: "",
      };
    },
  },
});
const editableFormRef = ref(null);
const initialEditForm = { ...props.editForm };

const localEditForm = ref(props.editForm);
const onSubmit = () => {
  if (initialEditForm.id == undefined) {
    return editableFormRef.value.validate().then(async () => {
      localEditForm.value.checkoperator = checkoperator;
      console.log("localAddForm.value===>", localEditForm.value);
      return await api.addwengangData(localEditForm.value);
    });
  } else {
    return editableFormRef.value.validate().then(() => {
      console.log("localEditForm.value===>", localEditForm.value);
      const editFormToPush = {
        ...localEditForm.value,
      };
      // delete editFormToPush.createtime;
      delete editFormToPush.editVisible;
      return api.updatewengangData(editFormToPush);
    });
  }
};
defineExpose({
  onSubmit,
});
</script>
