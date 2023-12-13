<template>
  <a-card>
    <a-space direction="vertical">
      <slot name="otherFilter"></slot>
      <a-space direction="vertical">
        <a-segmented
          v-model:value="isCustomOrder"
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
        <a-cascader
          v-if="showWithStatus == 1"
          v-model:value="monthSelect"
          :options="cascaderMonthsList"
          expand-trigger="hover"
          placeholder="选择月份"
          @change="handleChangeMonthSelect"
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
                monthRangeSelect.length > 0
                  ? monthRangeSelect
                  : monthSelect[monthSelect.length - 1]
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
import { onBeforeMount, ref, watch } from "vue";
import { jiezhens } from "@/types";
import { exportExcel } from "@/utils/util";
import { message } from "ant-design-vue";
const props = defineProps({
  chosenJiezhen: {
    type: Array,
    default: () => [],
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
  count: {
    type: Number,
    default: 0,
  },
  getMonths: {
    type: Function,
    default: () => {},
  },
});
const chosenJiezhen = ref(props.chosenJiezhen.slice());
const searchValue = ref(props.searchValue);
const showWithStatus = ref(props.showWithStatus);
const status = ref(props.status);
const months = ref();
const monthRangeSelect = ref(props.monthRangeSelect);
const cascaderMonthsList = ref([]);
const monthSelect = ref([]);
const isCustomOrder = ref(0);
// 排序选择
const order = ref();
watch(
  () => isCustomOrder.value,
  () => {
    console.log("isCustomOrder==>", isCustomOrder.value);
  }
);
watch(
  () => showWithStatus.value,
  () => {
    if (showWithStatus.value == 1) {
      monthRangeSelect.value = [];
    }
  }
);
onBeforeMount(() => {
  props
    .getMonths()
    .then((res: any) => {
      months.value = res;
      console.log("months==>", months.value);
      getCascadeYear();
    })
    .catch((err) => {
      console.log(err);
      message.info("错误,联系管理员");
    });
});
watch(
  () => monthSelect.value,
  () => {
    props.getData().then((res: any) => {
      console.log("res==>", res);
    });
    console.log("monthSelect==>", monthSelect.value);
  }
);
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
  "handleChangeShowWithStatus",
  "handleChangeStatus",
  "handleChangeMonthRange",
  "handleChangeMonthSelect",
  "handleChangeCustomOrder",
]);
const handleChangeJiezhen = () => {
  emit("jiezhenSelectChange", chosenJiezhen.value);
};
const handleChangeSearch = () => {
  emit("handleChangeSearch", searchValue.value);
};
const handleChangeShowWithStatus = () => {
  emit("handleChangeShowWithStatus", showWithStatus.value);
};
const handleChangeStatus = () => {
  console.log("child==>", status.value);
  emit("handleChangeStatus", status.value);
};
const handleChangeMonthRange = () => {
  emit("handleChangeMonthRange", monthRangeSelect.value);
};
const handleChangeCustomOrder = () => {
  console.log("isCums==>", isCustomOrder.value);
  console.log("order==>", order.value);
  switch (isCustomOrder.value) {
    case 0:
      order.value = {
        sortColumn: "createtime",
        sortRule: "DESC",
      };
      break;
    case 1:
      order.value = {
        sortColumn: "jiezhen",
        sortRule: "DESC",
      };
      break;
    case 2:
      order.value = {
        sortColumn: "originalFile",
        sortRule: "ASC",
      };
    default:
      break;
  }
  emit("handleChangeCustomOrder", order.value);
};
const handleChangeMonthSelect = () => {
  emit(
    "handleChangeMonthSelect",
    monthSelect.value !== undefined
      ? monthSelect.value[monthSelect.value.length - 1]
      : ""
  );
};
const getCascadeYear = () => {
  const result = [];
  const yearMap = {};
  console.log("months===>", months.value);
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
  cascaderMonthsList.value = result;
};
</script>
