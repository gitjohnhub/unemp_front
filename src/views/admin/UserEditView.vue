<template>
  <a-form
    :model="localEditForm"
    ref="editableFormRef"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <a-form-item label="姓名" name="username" has-feedback>
      <a-input v-model:value="localEditForm.username"> </a-input>
    </a-form-item>
    <a-form-item label="账号" name="account" has-feedback>
      <a-input v-model:value="localEditForm.account" />
    </a-form-item>
    <a-form-item label="核定对象" name="checkObject" has-feedback>
      <a-input v-model:value="localEditForm.checkObject" />
    </a-form-item>

    <a-form-item label="核定街镇" name="jiezhen" has-feedback>
      <a-input v-model:value="localEditForm.checkJiezhen" />
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { ref, onBeforeMount } from "vue";
import { rules, wrapperCol, labelCol } from "@/types";
import api from "@/api/index";
import { useUserStore } from "@/stores";
const userStore = useUserStore();
const checkoperators = ref([
  {
    value: "",
    label: "",
  },
]);
onBeforeMount(() => {
  userStore.getUsers();
  checkoperators.value = userStore.usersList.map((item) => {
    return {
      label: item.username,
      value: item.username,
    };
  });
});

const checkoperator = useUserStore().userInfo.username;
const props = defineProps({
  editForm: {
    type: Object,
    default() {
      return {
        username: "",
        account: "",
        checkObject: "",
        checkJiezhen: "",
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
      return await api.addUser(localEditForm.value);
    });
  } else {
    return editableFormRef.value.validate().then(() => {
      console.log("localEditForm.value===>", localEditForm.value);
      const editFormToPush = {
        ...localEditForm.value,
      };
      delete editFormToPush.createtime;
      delete editFormToPush.editVisible;
      return api.updateUser(editFormToPush);
    });
  }
};
defineExpose({
  onSubmit,
});
</script>
