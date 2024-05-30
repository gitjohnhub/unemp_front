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
        :options="jiezhenList"
      ></a-select>
    </a-form-item>
    <a-form-item label="只显示">
      <a-checkbox v-model:checked="jiezhenOb">对口核定街镇</a-checkbox>
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
    <a-form-item label="农补">
      <a-button @click="handleNotCheck">农补未登记(待初核)</a-button>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { ref, onBeforeMount, watch } from "vue";
import { jiezhens, rules, wrapperCol, labelCol } from "@/types";
import api from "@/api/index";
import { useUserStore } from "@/stores";
const checkoperator = useUserStore().userInfo.username;
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const jiezhenList = ref(jiezhens);
onBeforeMount(() => {
  userStore.getUsers();
  jiezhenList.value = userInfo.checkJiezhen.split(",").map((item) => {
    return {
      label: item,
      value: item,
    };
  });
});

const jiezhenOb = ref(true);

watch(
  () => jiezhenOb.value,
  () => {
    if (jiezhenOb.value) {
      jiezhenList.value = userInfo.checkJiezhen.split(",").map((item) => {
        return {
          label: item,
          value: item,
        };
      });
    } else {
      jiezhenList.value = jiezhens;
    }
  }
);
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
const handleNotCheck = () => {
  localEditForm.value.status = "2";
  localEditForm.value.checknote = "农补未登记";
};
const onSubmit = () => {
  if (initialEditForm.id == undefined) {
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

watch(
  () => localEditForm.value.personID,
  async () => {
    if (localEditForm.value.personID.length == 18) {
      await api
        .getUnempCheckData({
          personID: localEditForm.value.personID,
        })
        .then((res: any) => {
          if (res != null) {
            console.log("edit unemp res===>", res);
            localEditForm.value.personName = res.personName;
            localEditForm.value.jiezhen = res.jiezhen;
          }
        });
      console.log("personID==>", localEditForm.value.personID);
    }
  }
);
defineExpose({
  onSubmit,
});
</script>
