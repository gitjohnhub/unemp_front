<template>
  <a-card>
    <a-space direction="vertical">
      <slot name="otherFilter"></slot>
      <a-space direction="vertical">
        <a-select
          v-model:value="status"
          mode="multiple"
          placeholder="选择审批状态筛选"
          style="width: 300px"
          :options="mapStatusList"
          @change="handleChangeStatus"
        ></a-select>
        <a-segmented
          v-model:value="isCustomOrder"
          :options="customOrderList"
          @change="handleChangeCustomOrder"
        />
        <a-space direction="horizontal">
          <a-segmented
            v-model:value="showWithStatus"
            :options="withStatusOrMonthsList"
            @change="handleChangeShowWithStatus"
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
      </a-space>
      <a-select
        v-if="showJiezhenChosenView"
        v-model:value="chosenJiezhen"
        mode="multiple"
        placeholder="选择街镇筛选"
        style="width: 300px"
        :options="jiezhens"
        @change="handleChangeJiezhen"
      ></a-select>
      <a-input-search
        v-model:value="searchValue"
        placeholder="输入搜索条件"
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
  showJiezhenChosenView: {
    type: Boolean,
    default: true,
  },
  chosenJiezhen: {
    type: Array,
    default: () => [],
  },
  showWithStatus: {
    type: Number,
    default: 1,
  },
  mapStatusList: {
    type: Array,
    default: () => [],
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
const searchValue = ref();
const showWithStatus = ref(props.showWithStatus);
const status = ref([]);
const months = ref();
const monthRangeSelect = ref(props.monthRangeSelect);
const cascaderMonthsList = ref([]);
const monthSelect = ref([]);
const isCustomOrder = ref(0);
// 排序选择
const order = ref();
// watch(
//   () => isCustomOrder.value,
//   () => {
//     console.log("isCustomOrder==>", isCustomOrder.value);
//   }
// );
watch(
  () => showWithStatus.value,
  () => {
    if (showWithStatus.value == 1) {
      monthRangeSelect.value = [];
      handleChangeMonthRange();
    }
    if (showWithStatus.value == 0) {
      monthSelect.value = [];
      handleChangeMonthSelect();
    }
  }
);
onBeforeMount(() => {
  props
    .getMonths()
    .then((res: any) => {
      months.value = res;
      getCascadeYear();
    })
    .catch((err) => {
      message.info("错误,联系管理员");
    });
});
watch(
  () => monthSelect.value,
  () => {
    props.getData();
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
  // {
  //   label: "按原件未收到排序",
  //   value: 2,
  // },
];
const withStatusOrMonthsList = [
  {
    label: "日期",
    value: 0,
  },
  {
    label: "月份",
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
  emit("handleChangeStatus", status.value);
};
const handleChangeMonthRange = () => {
  emit("handleChangeMonthRange", monthRangeSelect.value);
};
const handleChangeCustomOrder = () => {
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
  cascaderMonthsList.value = result;
};
</script>
