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
    <a-form-item label="城保" name="chengPayMonth" has-feedback>
      <a-input v-model:value="localEditForm.chengPayMonth" />
    </a-form-item>
    <a-form-item label="镇保" name="zhenPayMonth" has-feedback>
      <a-input v-model:value="localEditForm.zhenPayMonth" />
    </a-form-item>
    <a-form-item label="街镇" name="jiezhen" has-feedback>
      <a-select
        ref="select"
        v-model:value="localEditForm.jiezhen"
        style="width: 120px"
        :options="jiezhens"
      ></a-select>
    </a-form-item>
    <a-form-item label="申请日期" name="applyDate" has-feedback>
      <a-date-picker v-model:value="applyDate" />
    </a-form-item>

    <a-form-item label="备注">
      <a-textarea v-model:value="localEditForm.note" />
    </a-form-item>
    <a-form-item label="是否错核">
      <a-radio-group v-model:value="localEditForm.wrongTag">
        <a-radio value="1">标记错核</a-radio>
        <a-radio value="0">未错核</a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { onBeforeMount,watch, ref } from "vue";
import { useUserStore } from "@/stores";
import api from "@/api";
import { jiezhens, rules, wrapperCol, labelCol } from "@/types";
import dayjs, { Dayjs } from "dayjs";
onBeforeMount(() => {
  if (initialEditForm.id !== undefined) {
    applyDate.value = dayjs(localEditForm.value.startDate);
  }
});

const editableFormRef = ref(null);
const checkoperator = useUserStore().userInfo.username;
const props = defineProps({
  editForm: {
    type: Object,
    default() {
      return {
        personID: "",
        personName: "",
        chengPayMonth: "",
        zhenPayMonth: "",
        status: "0",
        note: "",
        jiezhen: "",
        wrongTag: "0",
        repeatTimes: "0",
        originalFile: "0",
        cancelUnemp: "0",
      };
    },
  },
});
const initialEditForm = { ...props.editForm };
const localEditForm = ref(props.editForm);
const applyDate = ref<Dayjs>();
const onSubmit = () => {
  if (initialEditForm.id == undefined) {
    return editableFormRef.value.validate().then(async () => {
      localEditForm.value.checkoperator = checkoperator;
      localEditForm.value.applyDate = applyDate.value.format("YYYY-MM-DD");
      return await api.addNongbuData(localEditForm.value);
    });
  } else {
    localEditForm.value.applyDate = applyDate.value.format("YYYY-MM-DD");
    return editableFormRef.value.validate().then(() => {
      const editFormToPush = {
        ...localEditForm.value,
      };
      delete editFormToPush.createtime;
      delete editFormToPush.editVisible;
      return api.updateNongbuData(editFormToPush);
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
