<template>
  <div>
    <FilterView
      @jiezhenSelectChange="jiezhenSelectChange"
      @handle-change-search="hanleChangeSearch"
      @handle-change-show-with-status="handleChangeShowWithStatus"
      @handle-change-status="handleChangeStatus"
      @handle-change-month-select="handleChangeMonthSelect"
      @handle-change-month-range="handleChangeMonthRange"
      @handle-change-custom-order="handleChangeCustomOrder"
      :getMonths="getMonths"
      :status-list="statusList"
      :status-cal="statusCal"
      :jiezhen-cal="jiezhenCal"
      :custom-order-list="customOrderList"
      :headers-with-width="nongbuHeader"
      file-name="农民补助金"
      :get-data="getData"
      :count="count"
    >
      <template #footer>
        <a-checkbox v-model:checked="showCancelUnemp"
          >只显示取消失业登记</a-checkbox
        >
        <a-checkbox v-model:checked="showRepeat">只显示重复</a-checkbox>
      </template>
      <template #otherAction>
        <a-button @click="showEditModal(null)" type="primary">添加</a-button>
        <a-modal
          v-model:open="addOpen"
          title="增加"
          :confirm-loading="confirmLoading"
          :destroyOnClose="true"
          @ok="handleEditOk(null)"
          @cancel="handleEditCancel(null)"
        >
          <NongbuEditFormView ref="editableFormRef" />
        </a-modal>
      </template>
    </FilterView>

    <a-spin :spinning="spinning">
      <a-table
        row-class-name="custom-row"
        :columns="columns"
        :data-source="dataSource"
        @change="handleChange"
        @showSizeChange="onShowSizeChange"
        :pagination="pagination"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'personID'">
            <a-typography-paragraph
              :style="{ fontSize: '18px' }"
              copyable
              keyboard
              :class="{
                deleted: record.status == statusList.indexOf('已取消'),
              }"
              >{{ record.personID }}</a-typography-paragraph
            >
          </template>
          <template v-if="column.key === 'personName'">
            <a-space direction="vertical">
              <a-tooltip :title="pinyin(record.personName)" color="#f50">
                <a-typography-paragraph
                  :style="{ fontSize: '18px' }"
                  copyable
                  :class="{
                    deleted: record.status == statusList.indexOf('已取消'),
                  }"
                >
                  {{ record.personName }}
                </a-typography-paragraph>
              </a-tooltip>
            </a-space>
          </template>
          <template v-if="column.key === 'jiezhen'">
            <a-space direction="vertical">
              <a-row>
                <a-tag color="#f50" v-if="record.wrongTag == '1'">
                  <WarningFilled />
                </a-tag>
                <a-tag color="#f50" v-if="record.originalFile !== '0'"
                  ><FilePdfFilled
                /></a-tag>
                <a-tag v-if="record.repeatTimes !== '0'" color="#f50"
                  >R:{{ record.repeatTimes }}</a-tag
                >
                <a-tag color="red" v-if="record.cancelUnemp !== '0'"
                  ><StopFilled
                /></a-tag>
              </a-row>
              <a-row>
                <a-tag :color="colorList[jiezhenList.indexOf(record.jiezhen)]">
                  {{ record.jiezhen }}
                </a-tag>
                <a-tag>
                  {{ record.checkoperator }}
                </a-tag>
                <a-tag v-if="record.reviewoperator != null">
                  {{ record.reviewoperator }}
                </a-tag>
              </a-row>
            </a-space>
          </template>
          <template v-if="column.key === 'chengPayMonth'">
            <a-row>
              <a-statistic title="城保" :value="record.chengPayMonth" />
              <a-statistic title="镇保" :value="record.zhenPayMonth" />
            </a-row>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="colorList[Number(record.status)]">
              {{ getStatus(record.status) }}
            </a-tag>
            <a-tag> {{ record.applyDate }}</a-tag>
            <a-progress :percent="getProgress(record.status)" size="small" />
          </template>
          <template v-if="column.key === 'note'">
            <a-row>
              {{ record.note }}
            </a-row>
          </template>
          <!-- createtime column -->
          <template v-if="column.key === 'createtime'">
            <a-tag>
              <a-row> {{ formattedTime(record.createtime)[0] }} </a-row>
              <a-row> {{ formattedTime(record.createtime)[1] }} </a-row>
              <a-row> id:{{ record.id }} </a-row>
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <ActionView
              :record="record"
              :button-list="buttonList"
              :action="updateAction"
              @get-data="getData"
            >
              <template #otherAction>
                <a-button
                  @click="addRepeat(record.id, record.repeatTimes)"
                  type="primary"
                  danger
                  ><PlusCircleFilled />
                </a-button>
                <a-button @click="showEditModal(record)"
                  ><EditFilled
                /></a-button>
              </template>
            </ActionView>

            <!-- 编辑模态框 -->
            <a-modal
              :open="record.editVisible"
              title="编辑"
              :destroyOnClose="true"
              @ok="handleEditOk(record)"
              @cancel="handleEditCancel(record)"
            >
              <NongbuEditFormView :edit-form="editForm" ref="editableFormRef" />
            </a-modal>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onBeforeMount, watch } from "vue";
import { message } from "ant-design-vue";
import FilterView from "@/components/FilterView.vue";
import {
  WarningFilled,
  CheckOutlined,
  DeleteFilled,
  EditFilled,
  StopFilled,
  PlusCircleFilled,
  FilePdfFilled,
} from "@ant-design/icons-vue";
import api from "@/api";
import { pinyin } from "pinyin-pro";
import NongbuEditFormView from "./NongbuEditFormView.vue";
import ActionView from "@/components/ActionView.vue";
import { Dayjs } from "dayjs";
import { useUserStore } from "@/stores";
import { nongbuHeader, formattedTime } from "@/utils/util";
import { colorList, jiezhenList } from "@/types";
import "dayjs/locale/zh-cn";
const addOpen = ref<boolean>(false);

const editForm = ref();
const showCancelUnemp = ref(false);
const showRepeat = ref(false);
const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
type RangeValue = [Dayjs, Dayjs];
const monthRangeSelect = ref<RangeValue>();
const payDate = ref<Dayjs>();

const count = ref<number>();
const checked = ref(false);
const reviewChecked = ref("0");
const status = ref([0]);
const statusCal = ref([]);
// 按街镇选择子组件
const jiezhenSelectChange = (selectJiezhens: any) => {
  chosenJiezhen.value = selectJiezhens;
};
const hanleChangeSearch = (childSearchValue: any) => {
  searchValue.value = childSearchValue;
};

const handleChangeShowWithStatus = (childShowWithStatus: number) => {
  showWithStatus.value = childShowWithStatus;
};
const handleChangeStatus = (childStatus: Array<number>) => {
  status.value = childStatus;
};
const handleChangeMonthSelect = (childMonthSelect: string) => {
  monthSelect.value = childMonthSelect;
};
const handleChangeMonthRange = (childMonthRange: [Dayjs, Dayjs]) => {
  monthRangeSelect.value = childMonthRange;
};
const handleChangeCustomOrder = (value: number) => {
  order.value = value;
};

const chosenJiezhen = ref([]);
watch(
  () => chosenJiezhen.value,
  () => {
    getData();
  }
);

//加载数据动画
const spinning = ref<boolean>(false);

// 搜索相关
const searchValue = ref();
watch(
  () => searchValue.value,
  () => {
    getData();
  }
);
const statusList = ["已登记", "已审批", "已取消"];
const customOrderList = ["按时间排序", "按街镇排序", "按原件未收到排序"];

const getStatus = (status: String) => {
  return statusList[Number(status)];
};
const getProgress = (status: String) => {
  const currentIndex = Number(status) + 1;
  // 状态总数
  const total = 2; // 不算 '全部'
  // 百分比进度
  const percent = (currentIndex / total) * 100;

  return percent; // 33.33
};

// 排序选择
const order = ref();
watch(
  () => order.value,
  () => {
    getData();
  }
);
watch(
  () => showCancelUnemp.value,
  (newValue) => {
    getData();
  }
);
watch(
  () => showRepeat.value,
  (newValue) => {
    getData();
  }
);
watch(
  () => monthRangeSelect.value,
  (newValue) => {
    getData();
  }
);
watch(
  () => payDate.value,
  (newValue) => {
    getData();
  }
);
watch(
  () => checked.value,
  (newValue) => {
    getData();
  }
);
watch(
  () => status.value,
  () => {
    pager.value.current = 1;
    getData();
  }
);
watch(
  () => reviewChecked.value,
  () => {
    getData();
  }
);
const pager = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const handleChange = async (page: any) => {
  pager.value = page;
  getData();
};
const pagination = computed(() => {
  return {
    ...pager.value,
    change: handleChange,
  };
});

const onShowSizeChange = async (page: any) => {};

onBeforeMount(() => {
  userStore.getUsers();
  getData();
});
// 月视图
const showWithStatus = ref(1);
watch(
  () => showWithStatus.value,
  () => {
    getData();
  }
);
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
const months = ref([""]);
const monthSelect = ref("");
watch(
  () => monthSelect.value,
  () => {
    getData();
  }
);
const getMonths = (params?: any) => {
  return api.getNongbuAllDate();
};
const jiezhenCal = ref([]);
const getCount = (params?: any) => {
  api.getNongbuDataCal(params).then((res: any) => {
    statusCal.value = statusList.map((item, index) => {
      return {
        label: item,
        count: res.find((item) => Number(item.status) === index)?.count || 0,
      };
    });
  });
  api.getNongbuByJiezhen(params).then((res: any) => {
    console.log("calbyjiezhen===>", res);
    jiezhenCal.value = res;
  });
};
// 获取数据
const getData = async (params?: any) => {
  spinning.value = true;

  params = {
    ...params,
    ...pager.value,
    showRepeat: showRepeat.value ? 1 : null,
    cancelUnemp: showCancelUnemp.value ? 1 : null,
    monthRangeSelect: monthRangeSelect.value ? monthRangeSelect.value : [],
    monthSelect: monthSelect.value ? monthSelect.value : null,
    status: status.value,
    jiezhen: chosenJiezhen.value.length > 0 ? chosenJiezhen.value : [],
    customOrder: order.value,
  };

  if (searchValue.value !== undefined && searchValue.value !== "") {
    params.searchValue = searchValue.value;
  }
  getCount(params);
  return await api.getNongbuData(params).then((res: any) => {
    pager.value = res.page;
    count.value = pager.value.total;
    dataSource.value = res.rows;
    spinning.value = false;
    return res.rows;
  });
};

const addRepeat = async (id: number, repeatTimes: string) => {
  if (repeatTimes === "0") {
    repeatTimes = "1";
  } else {
    repeatTimes = (Number(repeatTimes) + 1).toString();
  }
  await api
    .updateNongbuData({
      id,
      repeatTimes,
    })
    .then((res: any) => {
      message.info("增加重复成功");
      getData();
    });
};

// 增加数据弹窗
const editableFormRef = ref(null);
const confirmLoading = ref<boolean>(false);
const showEditModal = (record) => {
  if (record) {
    record.editVisible = true;
    editForm.value = record;
  } else {
    addOpen.value = true;
  }
};
const handleEditOk = async (record: any) => {
  await editableFormRef.value
    .onSubmit()
    .then(() => {
      message.info("成功");
      addOpen.value = false;
      if (record) {
        record.editVisible = false;
      } else {
        addOpen.value = false;
      }
      getData();
    })
    .catch((error) => {
      console.log("error==>", error);
      message.info("数据格式错误，无法提交=>", error);
    });
};
const handleEditCancel = (record) => {
  if (record) {
    record.editVisible = false;
  }
  addOpen.value = false;
};
const columnsOriginal = [
  {
    key: "personName",
    title: "姓名",
  },
  {
    key: "personID",
    title: "身份证号",
    width: "250",
  },
  {
    key: "chengPayMonth",
    title: "城保/镇保",
  },
  {
    key: "jiezhen",
    title: "街镇/原件/初核/复核",
    width: "50",
  },
  {
    key: "note",
    title: "备注",
  },
  {
    key: "status",
    title: "进度/申请日期",
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
const updateAction = (params: any) => {
  return api.updateNongbuData(params);
};
const buttonList = [
  {
    text: "复核",
    icon: "CheckOutlined",
    params: {
      status: statusList.indexOf("已审批"),
      reviewoperator: userInfo.username,
    },
    errMsg: "复核失败,请联系管理员",
    successMsg: "复核成功",
    type: "primary",
    show: (record: any) => {
      return record.status == 0 && record.checkoperator !== userInfo.username;
    },
    disabled: () => false,
  },
  {
    text: "初核",
    icon: "RedoOutlined",
    params: {
      status: statusList.indexOf("已登记"),
    },
    errMsg: "初核失败,请联系管理员",
    successMsg: "初核成功",
    type: "primary",
    show: (record: any) => {
      return record.status == "2";
    },
    disabled: () => false,
  },
  {
    text: "取消",
    icon: "DeleteOutlined",
    params: {
      status: statusList.indexOf("已取消"),
    },
    errMsg: "删除失败,请联系管理员",
    successMsg: "删除成功",
    type: "dashed",
    show: () => {
      return true;
    },
    disabled: (record: any) => {
      return record.status == "3";
    },
  },
  {
    text: "取消失业登记",
    icon: "StopFilled",
    params: {
      cancelUnemp: "1",
    },
    errMsg: "取消失业登记失败,请联系管理员",
    successMsg: "取消失业登记成功",
    type: "primary",
    show: () => {
      return true;
    },
    disabled: (record: any) => {
      return record.status == "3";
    },
    color: "red",
  },
  {
    text: "收到原件",
    icon: "FilePdfFilled",
    params: {
      originalFile: "1",
    },
    errMsg: "标记失败,请联系管理员",
    successMsg: "标记原件成功",
    type: "primary",
    show: () => {
      return true;
    },
    disabled: (record: any) => {
      return record.status == "3";
    },
    color: "red",
  },
  {
    text: "街镇错误登记",
    icon: "WarningFilled",
    params: {
      wrongTag: "1",
    },
    errMsg: "标记失败,请联系管理员",
    successMsg: "标记错核成功",
    type: "primary",
    show: () => {
      return true;
    },
    disabled: (record: any) => {
      return record.status == "3";
    },
    color: "red",
  },
  // {
  //   text: "重复计数",
  //   icon: "PlusCircleFilled",
  //   params: {
  //     repeatTimes: 0,
  //   },
  //   errMsg: "计数失败,请联系管理员",
  //   successMsg: "计数成功",
  //   type: "primary",
  //   show: () => {
  //     return true;
  //   },
  //   disabled: (record: any) => {
  //     return record.status == "3";
  //   },
  //   color: "red",
  // },
];
</script>
<style scoped>
.ant-tag {
  font-size: 14px;
}
.deleted {
  text-decoration: line-through;
}

.custom-row {
  height: 20px;
  /* 设置行高度为 50px */
}

.table-operations {
  margin-bottom: 16px;
}

.table-operations > button {
  margin-right: 8px;
}
</style>
