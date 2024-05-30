<template>
  <div>
    <div class="table-operations">
      <FilterView
        @handle-change-search="hanleChangeSearch"
        @handle-change-status="handleChangeStatus"
        @handle-change-month-select="handleChangeMonthSelect"
        @handle-change-month-range="handleChangeMonthRange"
        @handle-change-custom-order="handleChangeCustomOrder"
        @handle-change-show-with-status="handleChangeShowWithStatus"
        :status-list="statusList"
        :status-cal="statusCal"
        :getMonths="getMonths"
        :custom-order-list="customOrderList"
        file-name="稳岗"
        :get-data="getData"
        :count="count"
        :show-jiezhen-chosen-view="false"
      >
        <template #otherFilter>
          <a-select
            v-model:value="selectedOp"
            mode="multiple"
            placeholder="选择通知人"
            style="width: 300px"
            :options="userStore.checkoperators"
          ></a-select>
        </template>
        <template #otherAction>
          <a-button @click="showEditModal(null)" type="primary">添加</a-button>
          <a-modal
            v-model:open="addOpen"
            title="增加"
            :destroyOnClose="true"
            @ok="handleEditOk(null)"
            @cancel="handleEditCancel(null)"
          >
            <wengangEditFormView ref="editableFormRef" />
          </a-modal>
        </template>
        <template #otherDescriptions>
          <a-descriptions title="进度" layout="vertical">
            <a-descriptions-item label="电话通知进度"
              ><a-progress :percent="callPercent"
            /></a-descriptions-item>
            <a-descriptions-item label="初核进度"
              ><a-progress :percent="checkPercent" size="small"
            /></a-descriptions-item>
            <a-descriptions-item label="复核进度"
              ><a-progress :percent="reviewPercent" size="small"
            /></a-descriptions-item>
          </a-descriptions>
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
          <template v-if="column.key === 'companyName'">
            <a-tooltip :title="pinyin(record.companyName)" color="#f50">
              <a-typography-paragraph :style="{ fontSize: '18px' }" copyable>{{
                record.companyName
              }}</a-typography-paragraph>
            </a-tooltip>
            <a-tag>{{ record.companyCategory }}</a-tag>
            <a-tag>{{ record.companyOnlyCode }}</a-tag>
          </template>
          <template v-if="column.key === 'bankName'">
            <a-space direction="vertical">
              <a-tag>{{ record.bankName }}</a-tag>
              <a-tag>{{ record.bankNumber }}</a-tag>
              <a-tag>{{ record.money }}</a-tag>
            </a-space>
          </template>
          <template v-if="column.key === 'contactPerson'">
            <a-space direction="vertical">
              <a-tag>{{ record.contactPerson }}</a-tag>
              <a-tag>{{ record.contactNumber }}</a-tag>
            </a-space>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="colorList[Number(record.status)]">
              {{ getStatus(record.status) }}
            </a-tag>
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
            <a-space direction="vertical">
              <a-row>
                <a-space>
                  <ActionView
                    :record="record"
                    :button-list="buttonList"
                    :action="updateAction"
                    @get-data="getData"
                  >
                    <template #otherAction>
                      <a-button @click="showEditModal(record)">
                        <EditOutlined />
                      </a-button>
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
                    <wengangEditFormView
                      :edit-form="editForm"
                      ref="editableFormRef"
                    />
                  </a-modal>
                </a-space>
              </a-row>
              <a-row>
                <a-tooltip :title="record.note" color="#f50">
                  <a-input-search
                    v-model:value="record.note"
                    placeholder="备注"
                    size="medium"
                    @search="
                      updateParams({
                        id: record.id,
                        note: record.note,
                      })
                    "
                  >
                    <template #enterButton>
                      <a-button type="dashed">提交备注</a-button>
                    </template>
                  </a-input-search>
                </a-tooltip>
              </a-row></a-space
            >
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import wengangEditFormView from "./wengangEditFormView.vue";
import checkFormView from "./checkFormView.vue";
import ActionView from "@/components/ActionView.vue";
import FilterView from "@/components/FilterView.vue";

import { computed, ref, onBeforeMount, watch } from "vue";
import { message } from "ant-design-vue";
import { Dayjs } from "dayjs";
import { pinyin } from "pinyin-pro";

import "dayjs/locale/zh-cn";
import { EditOutlined } from "@ant-design/icons-vue";
import api from "@/api";
import { useUserStore } from "@/stores";
import { exportExcel, formattedTime } from "@/utils/util";
import { colorList } from "@/types";
const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
type RangeValue = [Dayjs, Dayjs];
const monthRangeSelect = ref<RangeValue>();
const selectedOp = ref<string[]>([]);
const count = ref<number>();
const statusList = ["未通知", "已通知", "已初审", "已复审"];
const customOrderList = ["按id排序", "按金额排序"];
const callPercent = ref(0);
const getStatus = (status: number) => {
  return statusList[Number(status)];
};
const getMonths = (params?: any) => {
  return api.getUnempVeriAllDate();
};
const order = ref();
const handleChangeCustomOrder = (value: number) => {
  order.value = value;
};
watch(
  () => order.value,
  () => {
    getData();
  }
);
// const getMonths = (params?: any) => {
//   return api.getwengangAllDate();
// };
// 搜索相关
const searchValue = ref();
// 按街镇选择子组件
const jiezhenSelectChange = (selectJiezhens: any) => {
  chosenJiezhen.value = selectJiezhens;
};
const chosenJiezhen = ref([]);
const showWithStatus = ref(1);
const monthSelect = ref("");
const status = ref([0]);
watch(
  () => chosenJiezhen.value,
  () => {
    getData();
  }
);
const hanleChangeSearch = (childSearchValue: any) => {
  searchValue.value = childSearchValue;
  getData();
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
const handleChangeMonthSelect = (childMonthSelect: string) => {
  monthSelect.value = childMonthSelect;
};
const handleChangeMonthRange = (childMonthRange: [Dayjs, Dayjs]) => {
  monthRangeSelect.value = childMonthRange;
};
const spinning = ref<boolean>(false);
const getColors = (user) => {
  return colorList[
    userStore.checkoperators.map((item) => item.value).indexOf(user)
  ];
};
watch(
  () => selectedOp.value,
  (newValue) => {
    getData();
  }
);

watch(
  () => monthRangeSelect.value,
  (newValue) => {
    pager.value.current = 1;
    // console.log(newValue.format('YYYY-MM-DD HH:mm:ss'))
    getData();
  }
);
// watch(
//   () => status.value,
//   (newValue) => {
//     pager.value.current = 1;
//     getData();
//   }
// );
// 提交初核备注
const updateParams = (params: any) => {
  api
    .updatewengangData(params)
    .then((res) => {
      getData();
      message.info("修改备注成功");
    })
    .catch((e) => {
      console.log(e);
      message.info("修改备注失败，请联系管理员");
    });
};

//数据导出功能
const wengangHeader = [
  { header: "序号", key: "index", width: 10 },
  { header: "姓名", key: "personName", width: 12 },
  { header: "身份证", key: "personID", width: 25 },
  { header: "街镇", key: "jiezhen", width: 25 },
  { header: "提交时间", key: "createtime", width: 35 },
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
  if (userInfo.checkObject) {
    // selectedOp.value = [...userInfo.checkObject.split(","), userInfo.username];
    selectedOp.value = [userInfo.username];
  }
  getData();
});
const statusCal = ref([]);
const jiezhenCal = ref([]);
const checkPercent = ref(0);
const reviewPercent = ref(0);
const getCount = (params?: any) => {
  api.getwengangDataCal(params).then((res: any) => {
    statusCal.value = statusList.map((item, index) => {
      return {
        label: item,
        count: res.find((item) => Number(item.status) === index)?.count || 0,
      };
    });

    const checkData = statusCal.value.find((obj) => obj.status === "2");
    const reviewData = statusCal.value.find((obj) => obj.status === "3");
    const totalData = statusCal.value.find((obj) => obj.status === "total");
    callPercent.value = Number(
      (
        statusCal.value[0].count /
        (statusCal.value[0].count + statusCal.value[1].count)
      ).toFixed(2)
    );
    checkPercent.value = checkData ? checkData.count / totalData.count : 0;
    reviewPercent.value = reviewData ? reviewData.count / totalData.count : 0;
  });
  // api.getwengangByJiezhen(params).then((res: any) => {
  //   console.log("calbyjiezhen===>", res);
  //   jiezhenCal.value = res;
  // });
};
// 获取失业金数据
const getData = async (params?: any) => {
  spinning.value = true;
  params = {
    ...params,
    ...pager.value,
    sendPerson: selectedOp.value,
    status: status.value,
    customOrder: order.value,

  };
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
  }
  if (monthRangeSelect.value) {
    params.monthRangeSelect = monthRangeSelect.value;
  }

  if (searchValue.value !== undefined && searchValue.value !== "") {
    params = {
      searchValue: searchValue.value,
      ...pager.value,
    };
  }
  getCount(params);
  return await api.getwengangData(params).then((res: any) => {
    pager.value = res.page;
    count.value = pager.value.total;
    dataSource.value = res.rows;
    spinning.value = false;
    return res.rows;
  });
};

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

const columns = [
  {
    title: "单位名称",
    dataIndex: "companyName",
    key: "companyName",
  },
  {
    title: "开户银行/累计缴费金额",
    dataIndex: "bankName",
    key: "bankName",
  },
  {
    title: "进度",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "联系方式",
    dataIndex: "contactPerson",
    key: "contactPerson",
  },
  {
    title: "通知人",
    dataIndex: "sendPerson",
    key: "sendPerson",
  },

  {
    title: "操作",
    // dataIndex: 'action',
    key: "action",
  },
  {
    title: "创建时间",
    dataIndex: "createtime",
    key: "createtime",
  },
];
const updateAction = (params: any) => {
  return api.updatewengangData(params);
};
const buttonList = [
  {
    text: "已通知",
    icon: "PhoneOutlined",
    params: {
      status: statusList.indexOf("已通知"),
      reviewoperator: userInfo.username,
    },
    errMsg: "点击通知失败,请联系管理员",
    successMsg: "通知成功",
    type: "primary",
    show: (record: any) => {
      return true;
    },
    disabled: () => false,
  },
  {
    text: "初核",
    icon: "CheckOutlined",
    params: {
      status: statusList.indexOf("已初审"),
    },
    errMsg: "初核失败,请联系管理员",
    successMsg: "初核成功",
    type: "primary",
    show: (record: any) => {
      return true;
    },
    disabled: () => false,
  },
  {
    text: "复核",
    icon: "ReconciliationOutlined",
    params: {
      status: statusList.indexOf("已复审"),
    },
    errMsg: "复核失败,请联系管理员",
    successMsg: "复核成功",
    type: "dashed",
    show: (record: any) => {
      return true;
    },
    disabled: () => false,
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
