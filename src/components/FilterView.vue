<template>
  <a-card>
    <a-space direction="vertical">
      <slot name="otherFilter"></slot>
      <a-select
        v-model:value="localChosenJiezhen"
        mode="multiple"
        placeholder="选择街镇筛选"
        style="width: 300px"
        :options="jiezhens"
        @change="handleChangeJiezhen"
      ></a-select>
      <a-input-search
        v-model:value="localSearchValue"
        placeholder="输入姓名/身份证"
        @search="handleChangeSearch"
      />
      <slot name="footer"></slot>
      <a-row>
        <a-space>
          <a-button @click="resetSearch">重置搜索条件</a-button>
          <a-button
            @click="
              exportExcel(headersWithWidth, fileName, getData, monthRangeSelect)
            "
          >
            导出Excel
          </a-button>
          <slot name="otherAction"></slot>
        </a-space>
      </a-row>
    </a-space>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { jiezhens } from "@/types";
import { exportExcel } from "@/utils/util";
const props = defineProps({
  chosenJiezhen: {
    type: Array,
    default: () => [],
  },
  localSearchValue: {
    type: String,
    default: "",
  },
  // 导出excel
  headersWithWidth: Array,
  fileName: {
    type: String,
    default: "",
  },
  getData: {
    type: Function,
    default: () => {},
  },
  monthRangeSelect: {
    type: [Array, String],
    default: "",
  },
});
const localChosenJiezhen = ref(props.chosenJiezhen.slice());
const localSearchValue = ref(props.localSearchValue);
const resetSearch = () => {
  localChosenJiezhen.value = [];
  localSearchValue.value = "";
  emit("resetSearch");

  handleChangeSearch();
  handleChangeJiezhen();
};
const emit = defineEmits([
  "jiezhenSelectChange",
  "hanleChangeSearch",
  "handleExportExcel",
  "resetSearch",
]);
const handleChangeJiezhen = () => {
  console.log("localChosenJiezhen==>", localChosenJiezhen.value);
  emit("jiezhenSelectChange", localChosenJiezhen.value);
};
const handleChangeSearch = () => {
  console.log("localSearchValue==>", localSearchValue.value);
  emit("hanleChangeSearch", localSearchValue.value);
};
</script>
