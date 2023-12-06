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
    <a-form-item label="月数" name="payMonth" has-feedback>
      <a-input v-model:value="localEditForm.payMonth" />
    </a-form-item>
    <a-form-item label="开始日期" name="startDate" has-feedback>
      <a-date-picker v-model:value="startDate" />
    </a-form-item>
    <a-form-item
      label="终止日期"
      name="endDate"
      v-if="initialEditForm.personID !== ''"
    >
      <a-input v-model:value="localEditForm.endDate" />
    </a-form-item>
    <a-form-item label="备注">
      <a-textarea v-model:value="localEditForm.note" />
    </a-form-item>
  </a-form>
  <a-form-item label="选择未登记">
    <a-radio-group v-model:value="localEditForm.status">
      <a-radio value="0">已登记</a-radio>
      <a-radio value="2">待登记</a-radio>
    </a-radio-group>
  </a-form-item>
  <a-form-item label="原件">
    <a-radio-group v-model:value="localEditForm.originalFile">
      <a-radio value="0">未收到</a-radio>
      <a-radio value="1">已收到</a-radio>
    </a-radio-group>
  </a-form-item>
  <a-form-item label="是否错核">
    <a-radio-group v-model:value="localEditForm.wrongTag">
      <a-radio value="1">标记错核</a-radio>
      <a-radio value="0">未错核</a-radio>
    </a-radio-group>
  </a-form-item>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from "vue";
import api from "@/api/index";
import { useUserStore } from "@/stores";
import dayjs, { Dayjs } from "dayjs";
import { calculateEndDate } from "@/utils/util";
import { jiezhens, rules, labelCol, wrapperCol } from "@/types";

const checkoperator = useUserStore().userInfo.username;
const props = defineProps({
  editForm: {
    type: Object,
    default() {
      return {
        personID: "",
        personName: "",
        checkoperator: "",
        payMonth: "",
        status: "0",
        startDate: "",
        endDate: "",
        note: "",
        jiezhen: "",
        originalFile: "0",
        wrongTag: "0",
      };
    },
  },
});
const editableFormRef = ref(null);
const initialEditForm = { ...props.editForm };
const startDate = ref<Dayjs>();
watch(
  () => startDate.value,
  () => {
    if (startDate.value) {
      localEditForm.value.endDate = calculateEndDate(
        startDate.value.format("YYYY-MM-DD"),
        localEditForm.value.payMonth
      );
    }
  }
);

const localEditForm = ref(props.editForm);
watch(
  () => localEditForm.value.payMonth,
  () => {
    if (startDate.value) {
      localEditForm.value.endDate = calculateEndDate(
        startDate.value.format("YYYY-MM-DD"),
        localEditForm.value.payMonth
      );
    }
  }
);
onBeforeMount(() => {
  if (initialEditForm.personID !== "") {
    startDate.value = dayjs(localEditForm.value.startDate);
  }
});

const onSubmit = () => {
  if (initialEditForm.personID == "") {
    return editableFormRef.value.validate().then(async () => {
      localEditForm.value.checkoperator = checkoperator;
      localEditForm.value.startDate = startDate.value.format("YYYY-MM-DD");
      localEditForm.value.endDate = calculateEndDate(
        startDate.value.format("YYYY-MM-DD"),
        localEditForm.value.payMonth
      );
      console.log("localAddForm.value===>", localEditForm.value);
      return await api.addYanchangData(localEditForm.value);
    });
  } else {
    localEditForm.value.startDate = startDate.value.format("YYYY-MM-DD");
    return editableFormRef.value.validate().then(() => {
      const editFormToPush = {
        ...localEditForm.value,
      };
      delete editFormToPush.createtime;
      delete editFormToPush.editVisible;
      return api.updateYanchangData(editFormToPush);
    });
  }
};

defineExpose({
  onSubmit,
});
</script>
