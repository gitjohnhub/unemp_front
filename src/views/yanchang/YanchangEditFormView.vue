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
          <a-tag>{{ personIDCount }}</a-tag>
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
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from "vue";
import { jiezhens } from "@/types";
import api from "@/api/index";
import { useUserStore } from "@/stores";
import dayjs, { Dayjs } from "dayjs";
import { calculateEndDate } from "@/utils/util";
import locale from "ant-design-vue/es/locale-provider";

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
const localEditForm = ref({ ...props.editForm });
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
      console.log("localEditForm.value===>", localEditForm.value);
      return api.updateYanchangData(localEditForm.value);
    });
  }
};

const personIDCount = computed(() => {
  return localEditForm.value.personID.length;
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
