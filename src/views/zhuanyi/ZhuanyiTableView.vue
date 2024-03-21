<template>
  <div>
    <div class="table-operations">
      <FilterView
        @handle-change-search="hanleChangeSearch"
        @handle-change-show-with-status="handleChangeShowWithStatus"
        @handle-change-status="handleChangeStatus"
        @handle-change-month-select="handleChangeMonthSelect"
        @handle-change-month-range="handleChangeMonthRange"
        @handle-change-custom-order="handleChangeCustomOrder"
        :getMonths="getMonths"
        :status-list="statusList"
        :status-cal="statusCal"
        :custom-order-list="customOrderList"
        :headers-with-width="headersWithWidth"
        file-name="非上海户籍失业保险转移支付汇总表"
        :get-data="getData"
        :count="count"
        :show-jiezhen-chosen-view="false"
      >
        <template #otherFilter>
          <a-space direction="horizontal">
            <div>支付时请先选择日期:</div>
            <a-date-picker v-model:value="payDate" />
          </a-space>
          <a-cascader
            v-model:value="payMonthSelect"
            :options="cascaderPayMonthsList"
            expand-trigger="hover"
            placeholder="选择支付月份筛选数据"
          />
          <a-select
            v-model:value="chosenOnlyRelation"
            mode="multiple"
            placeholder="选择关系/金额筛选"
            style="width: 300px"
            :options="onlyRelations"
          ></a-select>
        </template>
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
              <ZhuanyiEditFormView ref="editableFormRef" />
            </a-modal>
            <a-button @click="payAll">一键支付成功</a-button>
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
          <template v-if="column.key === 'isOnlyTransferRelation'">
            <a-space direction="vertical">
              <a-row>
                <a-tag
                  :color="
                    record.isOnlyTransferRelation == '只转关系'
                      ? colorList[5]
                      : colorList[0]
                  "
                  >{{ record.isOnlyTransferRelation }}</a-tag
                >
                <a-tag v-if="record.isOnlyTransferRelation == '转金额'">{{
                  record.payMonth ? record.payMonth : "无数据"
                }}</a-tag>
                <a-tag v-if="record.isOnlyTransferRelation == '转金额'">{{
                  record.pay ? record.pay : "无数据"
                }}</a-tag>
              </a-row>

              <a-tag>{{ record.fromArea }}</a-tag>
            </a-space>
          </template>
          <template v-if="column.key === 'checkoperator'">
            <a-space direction="vertical">
              <a-row>
                <a-tag>
                  {{ record.checkoperator }}
                </a-tag>
                <a-tag
                  :color="getColors(record.reviewoperator)"
                  v-if="record.reviewoperator != null"
                >
                  {{ record.reviewoperator }}
                </a-tag>
              </a-row>
              <a-tooltip :title="record.note" color="#f50">
                <a-input-search
                  v-model:value="record.note"
                  placeholder="初核备注"
                  size="medium"
                  @search="onSubmitNote(record.id, record.note)"
                >
                  <template #enterButton>
                    <a-button type="dashed">修改备注</a-button>
                  </template>
                </a-input-search>
              </a-tooltip>
            </a-space>

            <!-- <span v-html="`<br>${record.checknote}`"></span> -->
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="colorList[Number(record.status)]">
              {{ getStatus(record.status) }}
            </a-tag>
            <a-progress :percent="getProgress(record.status)" size="small" />

            <a-tag v-if="record.status !== '0' && record.status !== '1'"
              >支付日期：{{ record.payDate }}</a-tag
            >
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
            <ActionView
              :record="record"
              :button-list="buttonList"
              :action="updateAction"
              @get-data="getData"
            >
              <template #otherAction>
                <a-button
                  @click="payData(record.id)"
                  v-if="
                    record.status == statusList.indexOf('已复核') &&
                    record.isOnlyTransferRelation == '转金额'
                  "
                >
                  <AlipayOutlined />
                </a-button>
                <a-button
                  @click="directPaySuccess(record.id)"
                  type="primary"
                  v-if="
                    record.status == statusList.indexOf('已复核') &&
                    record.isOnlyTransferRelation == '只转关系'
                  "
                >
                  <AlipayOutlined />
                </a-button>
                <a-button
                  @click="payData(record.id)"
                  v-if="
                    record.status == statusList.indexOf('支付失败') ||
                    record.status == statusList.indexOf('未确认冻结')
                  "
                >
                  <RedoOutlined />
                </a-button>
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
              <ZhuanyiEditFormView
                :edit-form="editForm"
                ref="editableFormRef"
              />
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
import ActionView from "@/components/ActionView.vue";
import {
  AlipayOutlined,
  EditOutlined,
  RedoOutlined,
} from "@ant-design/icons-vue";
import api from "@/api";
import { pinyin } from "pinyin-pro";
import ZhuanyiEditFormView from "./ZhuanyiEditFormView.vue";
import FilterView from "@/components/FilterView.vue";
import { Dayjs } from "dayjs";
import { useUserStore } from "@/stores";
import { colorList } from "@/types";
import "dayjs/locale/zh-cn";
import { chown } from "fs";
const statusList = [
  "已初核",
  "已复核",
  "支付中",
  "已支付",
  "已取消",
  "未确认冻结",
  "支付失败",
];
const updateAction = (params: any) => {
  return api.updateZhuanyiData(params);
};

const customOrderList = ["按时间排序", "按转移关系/金额"];
const hanleChangeSearch = (childSearchValue: string) => {
  searchValue.value = childSearchValue;
};
// 月视图
type RangeValue = [Dayjs, Dayjs];
const monthRangeSelect = ref<RangeValue>();
watch(
  () => monthRangeSelect.value,
  () => {
    getData();
  }
);
const showWithStatus = ref(1);
const handleChangeShowWithStatus = (childShowWithStatus: number) => {
  showWithStatus.value = childShowWithStatus;
  pager.value.current = 1;
  getData();
};
watch(
  () => showWithStatus.value,
  () => {
    getData();
  }
);
// 排序选择
const isCustomOrder = ref(null);
const chosenOnlyRelation = ref([]);
const onlyRelations = [
  {
    label: "只转关系",
    value: "只转关系",
  },
  {
    label: "转金额",
    value: "转金额",
  },
];
watch(
  () => chosenOnlyRelation.value,
  () => {
    console.log("chosenOnlyRelation==>", chosenOnlyRelation.value);
    getData();
  }
);
watch(
  () => isCustomOrder.value,
  () => {
    console.log("isCustomOrder==>", isCustomOrder.value);
    getData();
  }
);
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
const handleChangeCustomOrder = (childCustomOrder: number) => {
  isCustomOrder.value = childCustomOrder;
};
const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const monthSelect = ref([]);
const payDate = ref<Dayjs>();
const count = ref<number>();
const checked = ref(false);
const reviewChecked = ref("0");
const status = ref([0]);
// 获得月份序列
const getMonths = (params?: any) => {
  return api.getZhuanyiAllDate();
};
const getPayMonths = (params?: any) => {
  return api.getZhuanyiAllPayDate();
};
//编辑相关
const editForm = ref();
const editableFormRef = ref(null);
const addOpen = ref<boolean>(false);
// 一键支付成功
const payAll = async () => {
  await api
    .payAllDataInPayProgress()
    .then((res) => {
      console.log(res);
      message.info(`一键支付成功${res}条数据`);
      getData();
    })
    .catch((error) => {
      console.log("error==>", error);
      message.info("数据格式错误，无法提交=>", error);
    });
};

const showEditModal = (record: any) => {
  if (record) {
    editForm.value = record;
    record.editVisible = true;
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

//加载数据动画
const spinning = ref<boolean>(false);

// 搜索相关
const searchValue = ref();

const getStatus = (status: String) => {
  return statusList[Number(status)];
};
const getProgress = (status: String) => {
  const currentIndex = Number(status) + 1;
  // 状态总数
  const total = 4; // 不算 '全部'
  // 百分比进度
  const percent = (currentIndex / total) * 100;

  return percent; // 33.33
};
const getColors = (user) => {
  const findColor = userStore.userColors.filter((u) => u.username === user);
  if (findColor.length !== 0) {
    return findColor[0].color;
  } else {
    return "#344D70";
  }
};

watch(
  () => searchValue.value,
  () => {
    getData();
  }
);
watch(
  () => monthSelect.value,
  (newValue) => {
    // console.log(newValue.format('YYYY-MM-DD HH:mm:ss'))
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
  (newValue) => {
    console.log(status.value);
    pager.value.current = 1;
    getData();
  }
);
watch(
  () => reviewChecked.value,
  (newValue) => {
    getData();
  }
);
// 提交备注
const onSubmitNote = (id, note) => {
  api
    .updateZhuanyiData({ id: id, note: note })
    .then((res) => {
      getData();
      message.info("修改备注成功");
    })
    .catch((e) => {
      console.log(e);
      message.info("修改备注失败，请联系管理员");
    });
};
const headersWithWidth = [
  { header: "序号", key: "index", width: 6 },
  { header: "姓名", key: "personName", width: 10 },
  { header: "身份证", key: "personID", width: 26 },
  { header: "转入省市", key: "fromArea", width: 40 },
  { header: "转出日期", key: "payDate", width: 14 },
  { header: "享受期限（月）", key: "payMonth", width: 18 },
  { header: "核发标准", key: "rule", width: 42 },
  { header: "转出金额", key: "pay", width: 12 },
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

const onShowSizeChange = async (page: any) => {
  console.log("showsizechangepage=>", page);
};

onBeforeMount(() => {
  userStore.getUsers();

  getData();
});
// 获取数据
const statusCal = ref();
const getCount = (params?: any) => {
  api.getZhuanyiDataCal(params).then((res: any) => {
    statusCal.value = statusList.map((item, index) => {
      return {
        label: item,
        count: res.find((item) => Number(item.status) === index)?.count || 0,
      };
    });
    console.log("statusCal===>", statusCal.value);
  });
};
const cascaderPayMonthsList = ref([]);

const getCascadePayYear = () => {
  const result = [];
  const yearMap = {};
  getPayMonths().then((res: any) => {
    res
      .filter((element) => element !== null)
      .sort(compareDates)
      .forEach((month: string) => {
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
    cascaderPayMonthsList.value = result;
  });
};
function compareDates(date1, date2) {
  const [year1, month1] = date1.split("-");
  const [year2, month2] = date2.split("-");

  // 比较年份
  if (year1 !== year2) {
    return parseInt(year1) - parseInt(year2);
  }

  // 如果年份相同，则比较月份
  return parseInt(month1) - parseInt(month2);
}
const payMonthSelect = ref([]);
watch(
  () => payMonthSelect.value,
  () => {
    getData();
  }
);
const getData = async (params?: any) => {
  spinning.value = true;
  getCascadePayYear();
  params = {
    ...params,
    ...pager.value,
    status: status.value,
    customOrder: isCustomOrder.value,
  };
  if (payMonthSelect.value) {
    params.payDate = payMonthSelect.value[1];
  }
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
  }
  if (chosenOnlyRelation.value.length > 0) {
    params.chosenOnlyRelation = chosenOnlyRelation.value;
  }
  if (monthRangeSelect.value) {
    params.monthRangeSelect = monthRangeSelect.value;
  }
  if (searchValue.value !== undefined && searchValue.value !== "") {
    params.searchValue = searchValue.value.trim();
  }
  // if (payDate.value) {
  //   console.log("payDate", payDate.value);
  //   params.payDate = payDate.value.format("YYYY-MM-DD");
  // }
  getCount(params);
  return await api.getZhuanyiData(params).then((res: any) => {
    pager.value = res.page;
    count.value = pager.value.total;
    dataSource.value = res.rows;
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
const payData = async (id: number) => {
  if (payDate.value) {
    await api
      .updateZhuanyiData({
        id: id,
        reviewoperator: userInfo.username,
        status: "2",
        payDate: payDate.value!.format("YYYY-MM-DD"),
      })
      .then((res: any) => {
        getData();
      });
  } else {
    message.info("请选择支付日期");
  }
};
const directPaySuccess = async (id: number) => {
  if (payDate.value) {
    await api
      .updateZhuanyiData({
        id: id,
        reviewoperator: userInfo.username,
        status: "3",
        payDate: payDate.value!.format("YYYY-MM-DD"),
      })
      .then((res: any) => {
        getData();
      });
  } else {
    message.info("请选择支付日期");
  }
};
// 增加数据弹窗
const confirmLoading = ref<boolean>(false);
const columns = [
  {
    title: "姓名",
    dataIndex: "personName",
    key: "personName",
  },
  {
    title: "身份证号",
    dataIndex: "personID",
    key: "personID",
  },

  {
    title: "转出地\关系/金额",
    dataIndex: "isOnlyTransferRelation",
    key: "isOnlyTransferRelation",
  },
  {
    title: "操作员",
    dataIndex: "checkoperator",
    key: "checkoperator",
  },
  {
    title: "进度",
    dataIndex: "status",
    key: "status",
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
const buttonList = [
  {
    text: "复核",
    icon: "CheckOutlined",
    params: {
      status: statusList.indexOf("已复核"),
      reviewoperator: userInfo.username,
    },
    errMsg: "复核失败,请联系管理员",
    successMsg: "复核成功",
    type: "primary",
    show: (record: any) => {
      // return true;
      return record.status == "0" && record.checkoperator !== userInfo.username;
    },
    color: "#ffd299",
  },
  // {
  //   text: "重新支付中",
  //   icon: "RedoOutlined",
  //   params: {
  //     status: statusList.indexOf("支付中"),
  //     reviewoperator: userInfo.username,
  //   },
  //   errMsg: "恢复失败,请联系管理员",
  //   successMsg: "恢复成功",
  //   type: "primary",
  //   show: (record: any) => {
  //     return record.status == statusList.indexOf("未确认冻结") || record.status == statusList.indexOf("支付失败") ;
  //   },
  // },

  // {
  //   text: "标记支付",
  //   icon: "AlipayOutlined",
  //   params: {
  //     payDate:
  //       payDate.value !== undefined ? payDate.value.format("YYYY-MM-DD") : "",
  //     status: statusList.indexOf("支付中"),
  //   },
  //   errMsg: "标记支付失败,请联系管理员",
  //   successMsg: "标识支付中成功",
  //   type: "primary",
  //   show: (record: any) => {
  //     return record.status == statusList.indexOf("已复核");
  //   },
  //   color: "#2E8B57",
  // },
  {
    text: "支付成功",
    icon: "MoneyCollectOutlined",
    params: {
      status: statusList.indexOf("已支付"),
    },
    errMsg: "标识失败,请联系管理员",
    successMsg: "标识已支付成功",
    type: "primary",
    show: (record: any) => {
      return record.status == statusList.indexOf("支付中");
    },
  },
  {
    text: "取消申请",
    icon: "DeleteOutlined",
    params: {
      status: statusList.indexOf("已取消"),
    },
    errMsg: "取消申请失败,请联系管理员",
    successMsg: "取消申请成功",
    type: "primary",
    show: (record: any) => {
      return record.status != statusList.indexOf("已支付");
    },
    disabled: (record: any) => {
      return record.status == statusList.indexOf("已取消");
    },
    color: "brown",
  },
  {
    text: "支付失败",
    icon: "MoneyCollectOutlined",
    params: {
      status: statusList.indexOf("支付失败"),
    },
    errMsg: "标识失败,请联系管理员",
    successMsg: "标识已支付成功",
    type: "primary",
    show: (record: any) => {
      return record.status == statusList.indexOf("支付中");
    },
    color: "#de283b",
  },
  {
    text: "冻结",
    icon: "FileZipOutlined",
    params: {
      status: statusList.indexOf("未确认冻结"),
    },
    errMsg: "标识失败,请联系管理员",
    successMsg: "冻结成功",
    type: "primary",
    show: (record: any) => {
      return record.status == statusList.indexOf("已复核");
    },
    color: "#71c4ef",
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
