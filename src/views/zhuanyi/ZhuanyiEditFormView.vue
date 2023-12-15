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
    <a-form-item label="转入地" name="fromArea" has-feedback>
      <a-input v-model:value="localEditForm.fromArea" />
    </a-form-item>
    <a-form-item label="转关系" name="isOnlyTransferRelation" has-feedback>
      <a-select
        ref="select"
        v-model:value="localEditForm.isOnlyTransferRelation"
        style="width: 120px"
        :options="isOnlyTransferRelationOp"
      ></a-select>
    </a-form-item>
    <a-form-item label="第一年标准" v-if="showPay">
      <a-input v-model:value="currentPayRule" />
    </a-form-item>
    <a-space v-if="showPay">
      <a-form-item label="享受期限" name="payMonth">
        <a-input
          v-model:value="localEditForm.payMonth"
          :disabled="isSplitPayMonth"
        />
      </a-form-item>
      <a-checkbox v-model:checked="isSplitPayMonth">拆分</a-checkbox>
    </a-space>
    <a-space direction="horizontal" v-if="isSplitPayMonth">
      <a-form-item label="拆分">
        <a-input v-model:value="firstPayMonth"></a-input>
      </a-form-item>
      <a-form-item>
        <a-input v-model:value="secondPayMonth"></a-input>
      </a-form-item>
    </a-space>
    <a-form-item label="算式" v-if="showPay">
      <a-input v-model:value="calFormular" :disabled="true"></a-input>
    </a-form-item>
    <a-form-item label="金额" name="pay" v-if="showPay">
      <a-input v-model:value="localEditForm.pay" />
    </a-form-item>

    <a-form-item label="备注">
      <a-textarea v-model:value="localEditForm.note" />
    </a-form-item>
    <!-- <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click="onSubmit">Create</a-button>
      <a-button style="margin-left: 10px">Cancel</a-button>
    </a-form-item> -->
  </a-form>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { useUserStore } from "@/stores";
import { rules, labelCol, wrapperCol } from "@/types";
import api from "@/api";

const props = defineProps({
  editForm: {
    type: Object,
    default() {
      return {
        personID: "",
        personName: "",
        fromArea: "",
        isOnlyTransferRelation: "转金额",
        status: "0",
        payDate: "",
        reviewnote: "",
        note: "",
        payMonth: 0,
        pay: "",
      };
    },
  },
});

const initialEditForm = { ...props.editForm };
const localEditForm = ref(props.editForm);
const showPay = ref(true);

watch(
  () => localEditForm.value.isOnlyTransferRelation,
  (newValue) => {
    if (newValue == "只转关系") {
      showPay.value = false;
    } else {
      showPay.value = true;
    }
  }
);

const isOnlyTransferRelationOp = [
  {
    value: "只转关系",
  },
  {
    value: "转金额",
  },
];
const editableFormRef = ref(null);
const currentPayRule = ref<number>(2175);
const checkoperator = useUserStore().userInfo.username;
const isSplitPayMonth = ref(false);
const firstPayMonth = ref(0);
const secondPayMonth = ref(0);
watch(
  () => isSplitPayMonth.value,
  () => {
    firstPayMonth.value =
      Number(localEditForm.value.payMonth) > 12
        ? 12
        : Number(localEditForm.value.payMonth);
    secondPayMonth.value =
      Number(localEditForm.value.payMonth) > 12
        ? Number(localEditForm.value.payMonth) - 12
        : 0;
  }
);

watch(
  () => firstPayMonth.value,
  () => {
    if (isSplitPayMonth.value) {
      localEditForm.value.payMonth =
        Number(firstPayMonth.value) + Number(secondPayMonth.value);
      localEditForm.value.pay = CalPayMonth();
    }
  }
);
watch(
  () => secondPayMonth.value,
  () => {
    if (isSplitPayMonth.value) {
      localEditForm.value.payMonth =
        Number(firstPayMonth.value) + Number(secondPayMonth.value);
      localEditForm.value.pay = CalPayMonth();
    }
  }
);

watch(
  () => localEditForm.value.payMonth,
  () => {
    if (!isSplitPayMonth.value) {
      firstPayMonth.value =
        Number(localEditForm.value.payMonth) > 12
          ? 12
          : Number(localEditForm.value.payMonth);
      secondPayMonth.value =
        Number(localEditForm.value.payMonth) > 12
          ? Number(localEditForm.value.payMonth) - 12
          : 0;
      localEditForm.value.pay = CalPayMonth();
    }
  }
);
watch(
  () => currentPayRule.value,
  () => {
    localEditForm.value.pay = CalPayMonth();
  }
);

const onSubmit = () => {
  console.log("initialEditForm.id==>", initialEditForm.id);
  if (localEditForm.value.isOnlyTransferRelation == "只转关系") {
    localEditForm.value.pay = null;
    localEditForm.value.payMonth = null;
  }
  if (initialEditForm.id == undefined) {
    return editableFormRef.value.validate().then(() => {
      return api.addZhuanyiData({
        ...localEditForm.value,
        checkoperator,
      });
    });
  } else {
    return editableFormRef.value.validate().then(() => {
      const editFormToPush = {
        ...localEditForm.value,
      };
      delete editFormToPush.createtime;
      delete editFormToPush.editVisible;
      return api.updateZhuanyiData(editFormToPush);
    });
  }
};
// 计算核发标准
const calFormular = ref("");
const CalPayMonth = () => {
  calFormular.value = `(${firstPayMonth.value}*${currentPayRule.value}+${secondPayMonth.value}*${currentPayRule.value}*0.8)*1.5`;
  return (
    firstPayMonth.value * currentPayRule.value * 1.5 +
    secondPayMonth.value * currentPayRule.value * 0.8 * 1.5
  );
};
defineExpose({
  onSubmit,
});
</script>
