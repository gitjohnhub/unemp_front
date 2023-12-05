<template>
  <a-space direction="vertical">
    <a-row>
      <a-space>
        <a-button type="primary" @click="getMonths">刷新月份</a-button>
        <a-button @click="localExportExcel()"> 导出 </a-button>
        <a-radio-group v-model:value="isCustomOrder" button-style="solid">
          <a-radio-button value="0">按街镇排序</a-radio-button>
          <a-radio-button value="1">按时间排序</a-radio-button>
          <a-radio-button value="2">未收到原件</a-radio-button>
        </a-radio-group>
        <a-checkbox v-model:checked="cancelUnempSwitch" />只显示取消失业登记
        <a-tag>查询计数:{{ count }}</a-tag>
      </a-space>
    </a-row>

    <FilterView
      v-bind:chosen-jiezhen="chosenJiezhen"
      @jiezhenSelectChange="jiezhenSelectChange"
      @hanle-change-search="hanleChangeSearch"
    />
    <a-row>
      <a-segmented v-model:value="monthSelect" :options="months.slice(0, 6)" />
      <a-segmented v-model:value="monthSelect" :options="months.slice(6)" />
    </a-row>
  </a-space>

  <a-spin :spinning="spinning">
    <a-table :columns="columns" :data-source="dataSource" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'personName'">
          <a-space direction="vertical">
            <a-tooltip :title="pinyin(record.personName)" color="#f50">
              <a-typography-paragraph
                :style="{ fontSize: '18px' }"
                copyable
                :class="{ deleted: record.isDeleted == 2 }"
              >
                {{ record.personName }}
              </a-typography-paragraph>
            </a-tooltip>
          </a-space>
        </template>
        <template v-if="column.key === 'personID'">
          <a-tooltip :title="pinyin(record.personID)" color="#f50">
            <a-typography-paragraph
              :style="{ fontSize: '18px' }"
              copyable
              :class="{ deleted: record.isDeleted == 2 }"
            >
              {{ record.personID }}
            </a-typography-paragraph>
          </a-tooltip>
        </template>
        <template v-if="column.key === 'chengPayMonth'">
          <a-tag>{{ record.chengPayMonth }}</a-tag>
          <a-tag>{{ record.zhenPayMonth }}</a-tag>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag>{{ statusList[Number(record.status)] }}</a-tag>
        </template>
        <template v-if="column.key === 'note'">
          <a-tooltip color="#87d068">
            <template #title>
              <a-timeline mode="alternate">
                <a-timeline-item>
                  <p>初审人：{{ record.checkoperator }}</p>
                  <p>{{ record.createtime.slice(0, 10) }}</p>
                  <p>{{ record.note }}</p>
                </a-timeline-item>
                <a-timeline-item
                  >复审人:{{ record.reviewoperator }}</a-timeline-item
                >
              </a-timeline>
            </template>
            <a-row>
              <a-tag color="red" v-if="record.wrongTag == 1">
                <WarningFilled />
              </a-tag>
              <a-tag color="red" v-if="record.originalFile !== '0'"
                ><FilePdfOutlined
              /></a-tag>
              <a-tag v-if="record.repeatTimes !== '0'">{{
                record.repeatTimes
              }}</a-tag>
              <a-tag color="red" v-if="record.cancelUnemp !== '0'"
                ><StopOutlined
              /></a-tag>
            </a-row>
            <a-row>
              {{ record.note }}
            </a-row>
          </a-tooltip>
        </template>
        <template v-if="column.key === 'createtime'">
          {{ record.createtime.slice(0, 10) }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button
              @click="tagWrong(record.id, getData, 'nongbu')"
              type="primary"
              danger
            >
              <WarningFilled />
            </a-button>
            <a-button
              @click="tagOriginalFile(record.id, getData, 'nongbu')"
              type="primary"
              danger
            >
              <FilePdfOutlined />
            </a-button>
            <a-button
              @click="tagCancelUnemp(record.id, getData)"
              type="primary"
              danger
            >
              <StopOutlined />
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-spin>
</template>
<script setup lang="ts">
import api from "@/api";
import { ref, onBeforeMount, watch } from "vue";
import { tagCancelUnemp } from "./utils";
import { tagOriginalFile, tagWrong } from "@/utils/tag";
import { exportExcel, nongbuHeader } from "@/utils/util";
import { pinyin } from "pinyin-pro";
import FilterView from "@/components/FilterView.vue";
import { message } from "ant-design-vue";
import {
  WarningFilled,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  StopOutlined,
  FilePdfOutlined,
} from "@ant-design/icons-vue";
const dataSource = ref();
const months = ref([""]);
const monthSelect = ref("");
const spinning = ref<boolean>(false);
const count = ref(0);
// 按街镇选择子组件
const searchValue = ref();
const jiezhenSelectChange = (selectJiezhens: any) => {
  chosenJiezhen.value = selectJiezhens;
};
const chosenJiezhen = ref([]);
const hanleChangeSearch = (childSearchValue: any) => {
  searchValue.value = childSearchValue;
};
watch(
  () => chosenJiezhen.value,
  () => {
    getData();
  }
);
//失业选择
const cancelUnemp = ref();
const cancelUnempSwitch = ref(false);
watch(
  () => cancelUnempSwitch.value,
  () => {
    if (cancelUnempSwitch.value) {
      cancelUnemp.value = "1";
    } else {
      cancelUnemp.value = "";
    }
    getData();
  }
);
// 排序选择
const order = ref({
  sortColumn: "jiezhen",
  sortRule: "DESC",
});
const isCustomOrder = ref("0");
watch(
  () => isCustomOrder.value,
  () => {
    switch (isCustomOrder.value) {
      case "0":
        order.value = {
          sortColumn: "jiezhen",
          sortRule: "DESC",
        };
        break;
      case "1":
        order.value = {
          sortColumn: "createtime",
          sortRule: "DESC",
        };
        break;
      case "2":
        order.value = {
          sortColumn: "originalFile",
          sortRule: "ASC",
        };
      default:
        break;
    }
    getData();
  }
);
const statusList = ["已登记", "已审批", "已取消", "全部"];
watch(
  () => monthSelect.value,
  () => {
    getData();
  }
);
onBeforeMount(() => {
  console.log("NongbuExcel");
  getMonths();
});
const getMonths = (params?: any) => {
  api
    .getNongbuAllDate()
    .then((res: any) => {
      console.log("res", res);
      months.value = res;
      monthSelect.value = months.value[months.value.length - 1];
      console.log("months===>", months.value);
    })
    .catch((err) => {
      console.log(err);
    });
};
const getData = (params?: any) => {
  params = {
    ...params,
    cancelUnemp: cancelUnemp.value,
    noindex: 1,
    customOrder: order.value,
  };
  if (chosenJiezhen.value.length > 0) {
    params.jiezhen = chosenJiezhen.value;
  }
  if (searchValue.value !== undefined && searchValue.value !== "") {
    params = {
      searchValue: searchValue.value,
      current: 1,
    };
  } else {
    params.searchValue = null;
  }
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
  }
  return api.getNongbuData(params).then((res: any) => {
    dataSource.value = res.rows;
    count.value = res.page.total;
    return res.rows;
  });
};
const columnsOriginal = [
  {
    key: "personName",
    title: "姓名",
  },
  {
    key: "personID",
    title: "身份证号",
  },
  {
    key: "jiezhen",
    title: "街镇",
  },
  {
    key: "chengPayMonth",
    title: "城保/镇保",
  },
  {
    key: "applyDate",
    title: "申请日期",
  },
  {
    key: "note",
    title: "备注",
    ellipsis: true,
  },
  {
    key: "status",
    title: "状态",
  },
  {
    key: "createtime",
    title: "提交时间",
  },
  {
    key: "action",
    title: "操作",
  },
];
const columns = columnsOriginal.map((item) => {
  return {
    ...item,
    dataIndex: item.key,
    align: "center",
  };
});

const localExportExcel = () => {
  exportExcel(nongbuHeader, "农民补助金", getData, monthSelect.value)
    .then((res) => {
      message.info("导出成功");
    })
    .catch((err) => {
      message.error("导出失败,请查看日期是否选择");
    });
};
</script>
