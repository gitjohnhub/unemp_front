<template>
  <a-card>
    <a-space direction="vertical">
      <slot name="otherFilter"></slot>
      <a-space direction="vertical">
        <a-segmented
          v-model:value="localisCustomOrder"
          :options="customOrderList"
          @change="handleChangeCustomOrder"
        />
        <a-segmented
          v-model:value="showWithStatus"
          :options="withStatusOrMonthsList"
          @change="handleChangeShowWithStatus"
        />
        <a-segmented
          v-if="showWithStatus == 0"
          v-model:value="status"
          :options="mapStatusList"
          @change="handleChangeStatus"
        />
        <a-range-picker
          v-model:value="monthRangeSelect"
          v-if="showWithStatus == 0"
          @change="handleChangeMonthRange"
        />

        <a-segmented
          v-if="showWithStatus == 1"
          v-model:value="monthSelect"
          :options="months"
          @change="handleChangeMonthSelect"
        />
        <a-cascader
          v-model:value="monthSelect"
          :options="months"
          expand-trigger="hover"
          placeholder="Please select"
        />
      </a-space>
      <a-select
        v-model:value="chosenJiezhen"
        mode="multiple"
        placeholder="选择街镇筛选"
        style="width: 300px"
        :options="jiezhens"
        @change="handleChangeJiezhen"
      ></a-select>
      <a-input-search
        v-model:value="searchValue"
        placeholder="输入姓名/身份证"
        style="width: 300px"
        @search="handleChangeSearch"
      />
      <slot name="footer"></slot>
      <a-row>
        <a-space>
          <a-tag color="#108ee9">{{ count }}</a-tag>
          <a-button @click="resetSearch">重置搜索条件</a-button>
          <a-button
            @click="
              exportExcel(
                headersWithWidth,
                fileName,
                getData,
                monthRangeSelect.length > 0 ? monthRangeSelect : monthSelect
              )
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
import { onBeforeMount, ref } from "vue";
import { jiezhens } from "@/types";
import { exportExcel } from "@/utils/util";
onBeforeMount(() => {
  getCascadeYear();
});
const props = defineProps({
  chosenJiezhen: {
    type: Array,
    default: () => [],
  },
  isCustomOrder: {
    type: Number,
    default: 0,
  },
  showWithStatus: {
    type: Number,
    default: 1,
  },
  status: {
    type: Number,
    default: 0,
  },
  mapStatusList: {
    type: Array,
    default: () => [],
  },
  searchValue: {
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
    default: () => [],
  },
  monthSelect: {
    type: String,
    default: "",
  },
  months: {
    type: Array,
    default: () => [],
  },
  count: {
    type: Number,
    default: 0,
  },
});
const chosenJiezhen = ref(props.chosenJiezhen.slice());
const searchValue = ref(props.searchValue);
const localisCustomOrder = ref(props.isCustomOrder);
const showWithStatus = ref(props.showWithStatus);
const status = ref(props.status);
const monthSelect = ref(props.monthSelect);
const monthRangeSelect = ref(props.monthRangeSelect);
const months = ref(props.months);
const cascaderMonths = ref([]);
const customOrderList = [
  {
    label: "按时间排序",
    value: 0,
  },
  {
    label: "按街镇排序",
    value: 1,
  },
  {
    label: "按原件未收到排序",
    value: 2,
  },
];
const withStatusOrMonthsList = [
  {
    label: "按审批状态显示",
    value: 0,
  },
  {
    label: "按月显示",
    value: 1,
  },
];
const resetSearch = () => {
  chosenJiezhen.value = [];
  searchValue.value = "";
  emit("resetSearch");
  handleChangeSearch();
  handleChangeJiezhen();
};
const emit = defineEmits([
  "jiezhenSelectChange",
  "handleChangeSearch",
  "resetSearch",
  "handleChangeCustomOrder",
  "handleChangeShowWithStatus",
  "handleChangeStatus",
  "handleChangeMonthSelect",
  "handleChangeMonthRange",
]);
const handleChangeJiezhen = () => {
  emit("jiezhenSelectChange", chosenJiezhen.value);
};
const handleChangeSearch = () => {
  emit("handleChangeSearch", searchValue.value);
};
const handleChangeCustomOrder = () => {
  emit("handleChangeCustomOrder", localisCustomOrder.value);
};
const handleChangeShowWithStatus = () => {
  emit("handleChangeShowWithStatus", showWithStatus.value);
};
const handleChangeStatus = () => {
  console.log("child==>", status.value);
  emit("handleChangeStatus", status.value);
};
const handleChangeMonthSelect = () => {
  emit("handleChangeMonthSelect", monthSelect.value);
};
const handleChangeMonthRange = () => {
  emit("handleChangeMonthRange", monthRangeSelect.value);
};
const getCascadeYear = () => {
  const result = [];

  const yearMap = {};

  months.value.forEach((month: string) => {
    const [year, monthValue] = month.split("-");

    if (yearMap.hasOwnProperty(year)) {
      // Year already exists, add child
      const parentIndex = yearMap[year];
      result[parentIndex].children.push({
        value: month,
        label: monthValue,
      });
    } else {
      // Year doesn't exist, create new parent
      const parent = {
        value: year,
        label: year,
        children: [
          {
            value: month,
            label: monthValue,
          },
        ],
      };
      yearMap[year] = result.length;
      result.push(parent);
    }
  });

  console.log("Casresult==>", result);
  cascaderMonths.value = result;
};
</script>
