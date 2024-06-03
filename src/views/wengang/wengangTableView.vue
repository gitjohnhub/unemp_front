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
        :headers-with-width="wengangHeader"
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
      </FilterView>
    </div>
    <a-card>
      <a-row>
        <a-col :span="12"
          ><a-descriptions title="进度" layout="vertical">
            <a-descriptions-item label="未确认占比"
              ><a-progress :percent="callPercent" size="small" type="circle"
            /></a-descriptions-item> </a-descriptions
        ></a-col>
        <a-col :span="12"
          ><a-descriptions title="进度" layout="vertical">
            <a-descriptions-item label="公示占比"
              ><a-progress :percent="reviewPercent" size="small" type="circle"
            /></a-descriptions-item> </a-descriptions
        ></a-col>
      </a-row>

      <a-row>
        <a-col :span="12">
          <p v-for="company in wengangStatisticWithCompanyCategory">
            <a-tag>{{ company.companyCategory }}</a-tag
            >企业有 <a-tag color="#f50">{{ company.count }}</a-tag
            >家,涉及金额:<a-tag color="#f50">{{
              company.btmoney.toFixed(2)
            }}</a-tag>
          </p></a-col
        >
        <a-col :span="12">
          <p v-for="statusData in wengangStatisticWithStatus">
            <a-tag color="#f50">{{
              getStatus(Number(statusData.status))
            }}</a-tag
            >企业 <a-tag color="#f50">{{ statusData.count }}</a-tag
            >家,占比<a-tag color="#f50"
              >{{ statusData.countPercent.toFixed(2) }}%</a-tag
            >
            ,金额:<a-tag color="#108ee9">{{
              statusData.btmoney.toFixed(2)
            }}</a-tag
            >,占比<a-tag color="#108ee9"
              >{{ statusData.btPercent.toFixed(4) }}%</a-tag
            >
          </p></a-col
        >
      </a-row>
    </a-card>
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
              <a-tag>{{ record.jfmoney }}</a-tag>
              <a-tag>{{ record.btmoney }}</a-tag>
              <a-tag>{{ record.caiyuanlv }}</a-tag>
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
          <template v-if="column.key === 'confirmDate'">
            <a-tag>
              <a-row> {{ record.confirmDate }} </a-row>
              <a-row> {{ record.checkDate }} </a-row>
              <a-row>{{ record.reviewDate }}</a-row>
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
import { stat } from "fs";
const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
type RangeValue = [Dayjs, Dayjs];
const monthRangeSelect = ref<RangeValue>();
const selectedOp = ref<string[]>([]);
const count = ref<number>();
const statusList = [
  "未确认",
  "待审核",
  "审核不通过",
  "审核通过,待公示",
  "公示中",
  "公示不通过",
  "公示通过,待支付",
  "支付成功",
  "支付不成功",
  "放弃申领",
];
const customOrderList = ["按id排序", "按补贴金额排序"];
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
  { header: "公司名字", key: "companyName", width: 12 },
  { header: "状态", key: "status", width: 12 },
  { header: "裁员率", key: "caiyuanlv", width: 10 },
  { header: "企业划型", key: "companyCategory", width: 10 },
  { header: "参保号码", key: "canbaoCode", width: 12 },
  { header: "银行帐号", key: "bankNumber", width: 25 },
  { header: "联系人", key: "contactPerson", width: 10 },
  { header: "联系电话", key: "contactNumber", width: 10 },
  { header: "补贴金额", key: "btmoney", width: 10 },
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
const wengangStatisticWithCompanyCategory = ref();
const wengangStatisticWithStatus = ref();
onBeforeMount(() => {
  // userStore.getUsers();
  // if (userInfo.checkObject) {
  //   // selectedOp.value = [...userInfo.checkObject.split(","), userInfo.username];
  //   selectedOp.value = [userInfo.username];
  // }

  getData();
});
const statusCal = ref([]);
const jiezhenCal = ref([]);
const checkPercent = ref(0);
const reviewPercent = ref(0);
const getCount = async (params?: any) => {
  await api.getwengangDateCal(params).then((res: any) => {
    statusCal.value = statusList.map((item, index) => {
      return {
        label: item,
        count: res.find((item) => Number(item.status) === index)?.count || 0,
      };
    });
    const totalData = statusCal.value.reduce(
      (acc, curr) => acc + curr.count,
      0
    );

    const checkData = statusCal.value.find((obj) => obj.label == "未确认");
    const reviewData = statusCal.value.find((obj) => obj.label == "公示中");
    callPercent.value = Number((checkData.count / totalData).toFixed(4)) * 100;
    reviewPercent.value = reviewData
      ? Number((reviewData.count / totalData).toFixed(4)) * 100
      : 0;
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
    status: status.value.map(String),
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
  console.log("getData===>");
  await api.getwengangDataCal(params).then((res: any) => {
    console.log("getwengangDataCal res====>", res);
    wengangStatisticWithCompanyCategory.value = res[0].companyCategoryStats;
    wengangStatisticWithStatus.value = res[0].statusCounts;
    let totalCount = 0;
    let totalBtmoney = 0;

    wengangStatisticWithStatus.value.forEach((item) => {
      totalCount += item.count;
      totalBtmoney += item.btmoney;
    });

    wengangStatisticWithStatus.value.forEach((item) => {
      item.countPercent = (item.count / totalCount) * 100;
      item.btPercent = (item.btmoney / totalBtmoney) * 100;
    });
    console.log(wengangStatisticWithStatus.value);
  });
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
    dataIndex: "confirmDate",
    key: "confirmDate",
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
      status: "已通知",
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
    text: "待审核",
    icon: "CheckOutlined",
    params: {
      status: "待审核",
    },
    errMsg: "错误,联系管理员",
    successMsg: "待审核",
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
      status: "审核通过,待公示",
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
