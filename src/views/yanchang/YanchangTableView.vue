<template>
  <div>
    <div class="table-operations">
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
        :headers-with-width="headersWithWidth"
        file-name="延长失业金"
        :get-data="getData"
        :count="count"
      >
        <template #otherAction>
          <a-space>
            <a-button @click="showEditModal(null)" type="primary"
              >添加</a-button
            >
            <a-modal
              v-model:open="addOpen"
              title="增加"
              :confirm-loading="confirmLoading"
              :destroyOnClose="true"
              @ok="handleEditOk(null)"
              @cancel="handleEditCancel(null)"
            >
              <YanchangEditFormView ref="editableFormRef" />
            </a-modal>
          </a-space>
        </template>
      </FilterView>
    </div>
    <a-spin :spinning="spinning">
      <a-table
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
                  >{{ record.personName }}</a-typography-paragraph
                >
              </a-tooltip>
            </a-space>
          </template>
          <template v-if="column.key === 'startDate'">
            <a-row>
              <a-tag> {{ record.startDate }}</a-tag>
            </a-row>
            <a-row>
              <a-tag> {{ record.endDate }}</a-tag>
              <a-tag>{{ record.payMonth }}</a-tag>
            </a-row>
            <a-row>
              <a-tooltip :title="record.note" color="#f50">
                <a-tag v-if="record.note"> {{ record.note }}</a-tag>
              </a-tooltip>
            </a-row>
          </template>
          <template v-if="column.key === 'jiezhen'">
            <a-space direction="vertical">
              <a-row>
                <a-tag>
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

            <!-- <span v-html="`<br>${record.checknote}`"></span> -->
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="colorList[Number(record.status)]">
              {{ getStatus(record.status) }}
            </a-tag>
            <a-tag color="red" v-if="record.originalFile == '1'">
              <FilePdfOutlined></FilePdfOutlined>
            </a-tag>
            <a-tag color="red" v-if="record.wrongTag == '1'">
              <WarningOutlined></WarningOutlined>
            </a-tag>
            <a-progress :percent="getProgress(record.status)" size="small" />
          </template>
          <!-- createtime column -->
          <template v-if="column.key === 'createtime'">
            <a-tag>
              <span
                v-html="
                  `${getCorrectTime(record.createtime)[0]}<br>${
                    getCorrectTime(record.createtime)[1]
                  }<br>id:${record.id}`
                "
              ></span>
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space direction="vertical">
              <a-row>
                <a-space>
                  <ActionView
                    :record="record"
                    :button-list="buttonList"
                    :action="updateAction"
                    @get-data="getData"
                  />
                  <a-button @click="showEditModal(record)">
                    <EditOutlined />
                  </a-button>
                </a-space>
              </a-row>
              <!-- 编辑模态框 -->
              <a-modal
                :open="record.editVisible"
                title="编辑"
                :destroyOnClose="true"
                @ok="handleEditOk(record)"
                @cancel="handleEditCancel(record)"
              >
                <YanchangEditFormView
                  :edit-form="editForm"
                  ref="editableFormRef"
                />
              </a-modal>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onBeforeMount, watch } from "vue";
import { message } from "ant-design-vue";
import api from "@/api";
import FilterView from "@/components/FilterView.vue";
import { pinyin } from "pinyin-pro";
import YanchangEditFormView from "./YanchangEditFormView.vue";
import { Dayjs } from "dayjs";
import { useUserStore } from "@/stores";
import { colorList } from "@/types";
import "dayjs/locale/zh-cn";
import {
  EditOutlined,
  FilePdfOutlined,
  WarningOutlined,
} from "@ant-design/icons-vue";
import ActionView from "@/components/ActionView.vue";
const statusList = ["已登记", "已审批", "待登记", "已取消"];
const customOrderList = ["按时间排序", "按街镇排序", "按原件未收到排序"];

// 排序选择
const isCustomOrder = ref(null);
watch(
  () => isCustomOrder.value,
  () => {
    console.log("isCustomOrder==>", isCustomOrder.value);
    getData();
  }
);
// 月视图
const showWithStatus = ref(1);
watch(
  () => showWithStatus.value,
  () => {
    getData();
  }
);
const monthSelect = ref([]);
watch(
  () => monthSelect.value,
  () => {
    resetPage();
    getData();
  }
);
const resetPage = () => {
  pager.value.current = 1;
};
const getMonths = (params?: any) => {
  return api.getYanchangAllDate();
};
// 按街镇选择子组件,搜索
const jiezhenSelectChange = (selectJiezhens: any) => {
  chosenJiezhen.value = selectJiezhens;
};
const chosenJiezhen = ref([]);
const hanleChangeSearch = (childSearchValue: any) => {
  searchValue.value = childSearchValue;
};
const handleChangeCustomOrder = (childCustomOrder: number) => {
  isCustomOrder.value = childCustomOrder;
};
const handleChangeShowWithStatus = (childShowWithStatus: number) => {
  showWithStatus.value = childShowWithStatus;
  pager.value.current = 1;
  getData();
};
const handleChangeStatus = (childStatus: Array<number>) => {
  status.value = childStatus;
  pager.value.current = 1;
  getData();
};
const handleChangeMonthSelect = (childMonthSelect: Array<string>) => {
  monthSelect.value = childMonthSelect;
};
const handleChangeMonthRange = (childMonthRange: [Dayjs, Dayjs]) => {
  monthRangeSelect.value = childMonthRange;
};
const searchValue = ref();
watch(
  () => searchValue.value,
  () => {
    getData();
  }
);
watch(
  () => chosenJiezhen.value,
  () => {
    getData();
  }
);
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
;
const statusCal = ref([]);
//编辑数据弹窗
const editForm = ref();
const editableFormRef = ref(null);
const addOpen = ref<boolean>(false);
const showEditModal = (record: any) => {
  if (record) {
    record.editVisible = true;
    editForm.value = record;
  } else {
    addOpen.value = true;
  }
};
const getStatus = (status: number) => {
  return statusList[Number(status)];
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

//加载数据动画
const spinning = ref<boolean>(false);

const getProgress = (status: String) => {
  const currentIndex = Number(status) + 1;
  // 状态总数
  const total = 2; // 不算 '全部'
  // 百分比进度
  const percent = (currentIndex / total) * 100;

  return percent; // 33.33
};

watch(
  () => monthRangeSelect.value,
  () => {
    getData();
  }
);
watch(
  () => payDate.value,
  () => {
    getData();
  }
);
watch(
  () => checked.value,
  () => {
    getData();
  }
);
watch(
  () => status.value,
  (newValue) => {
    resetPage();
    getData();
  }
);
watch(
  () => reviewChecked.value,
  (newValue) => {
    getData();
  }
);
//数据导出功能
const headersWithWidth = [
  { header: "序号", key: "index", width: 6 },
  { header: "姓名", key: "personName", width: 10 },
  { header: "身份证", key: "personID", width: 26 },
  { header: "月数", key: "payMonth", width: 12 },
  { header: "起始日期", key: "startDate", width: 24 },
  { header: "终止日期", key: "endDate", width: 18 },
  { header: "街镇", key: "jiezhen", width: 24 },
  { header: "是否审批", key: "status", width: 22 },
];

// 分页
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
  // getMonths();
  getData();
});
const jiezhenCal = ref([]);

const getCount = (params?: any) => {
  api.getYanchangDataCal(params).then((res: any) => {
    statusCal.value = statusList.map((item, index) => {
      return {
        label: item,
        count: res.find((item) => Number(item.status) === index)?.count || 0,
      };
    });
  });
  api.getYanchangByJiezhen(params).then((res: any) => {
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
    customOrder: isCustomOrder.value,
    status: status.value,
  };
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
  }
  if (monthRangeSelect.value) {
    params.monthRangeSelect = monthRangeSelect.value;
  }

  if (chosenJiezhen.value.length > 0) {
    params.jiezhen = chosenJiezhen.value;
  }
  if (searchValue.value !== undefined && searchValue.value !== "") {
    params = {
      searchValue: searchValue.value,
      current: 1,
    };
  }
  getCount(params);
  return await api.getYanchangData(params).then((res: any) => {
    pager.value = res.page;
    count.value = pager.value.total;
    dataSource.value = res.rows.map((item: any) => {
      return {
        editVisible: false,
        ...item,
      };
    });
    spinning.value = false;
    return res.rows;
  });
};
const getCorrectTime = (date: string) => {
  const originalDate = new Date(date);
  const updatedDate = new Date(
    originalDate.getTime() + 8 * 60 * 60 * 1000
  ).toISOString();
  return [updatedDate.slice(0, 10), updatedDate.slice(11, 19)];
};

// 增加数据弹窗
const confirmLoading = ref<boolean>(false);

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
    key: "startDate",
    title: "开始/结束/备注",
  },
  {
    key: "jiezhen",
    title: "街镇",
  },
  {
    key: "status",
    title: "进度",
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
  return api.updateYanchangData(params);
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
      // return true;
      return record.status == "0" && record.checkoperator !== userInfo.username;
    },
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
  },
  {
    text: "删除",
    icon: "DeleteOutlined",
    params: {
      status: statusList.indexOf("已取消"),
    },
    errMsg: "删除失败,请联系管理员",
    successMsg: "删除成功",
    type: "primary",
    show: () => {
      return true;
    },
    disabled: (record: any) => {
      return record.status == statusList.indexOf("已取消");
    },
    color: "brown",
  },
  {
    text: "标记错登记",
    icon: "WarningFilled",
    params: {
      wrongTag: 1,
    },
    errMsg: "标识失败,请联系管理员",
    successMsg: "标识成功",
    type: "primary",
    show: () => true,
    color: "#c21d03",
  },
  {
    text: "收到原件",
    icon: "FilePdfFilled",
    params: {
      originalFile: 1,
    },
    errMsg: "标识失败,请联系管理员",
    successMsg: "标识成功",
    type: "primary",
    show: () => true,
    color: "#fd5732",
  },
];
</script>
<style scoped>
.deleted {
  text-decoration: line-through;
}

.table-operations {
  margin-bottom: 16px;
}

.table-operations > button {
  margin-right: 8px;
}
</style>
