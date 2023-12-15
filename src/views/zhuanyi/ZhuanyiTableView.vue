<template>
  <div>
    <div class="table-operations">
      <FilterView
        @handle-change-search="hanleChangeSearch"
        @handle-change-show-with-status="handleChangeShowWithStatus"
        @handle-change-status="handleChangeStatus"
        @handle-change-month-select="handleChangeMonthSelect"
        @handle-change-month-range="handleChangeMonthRange"
        :getMonths="getMonths"
        :map-status-list="mapStatusList"
        :headers-with-width="headersWithWidth"
        :monthSelect="monthSelect"
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
        </template>
        <template #otherAction>
          <a-space>
            <a-button @click="showAddDataModal" type="primary">添加</a-button>
            <a-modal
              v-model:open="open"
              title="Title"
              :confirm-loading="confirmLoading"
              @ok="handleOk"
              @cancel="handleCancel"
            >
              <ZhuanyiAddFormView ref="formRef" />
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
            <a-space direction="vertical">
              <a-row>
                <a-space>
                  <a-button
                    @click="reviewData(record.id)"
                    type="primary"
                    v-if="record.status == '0'"
                  >
                    <CheckOutlined />
                  </a-button>
                  <a-button @click="showEditModal(record)">
                    <EditOutlined />
                  </a-button>

                  <a-button
                    @click="payData(record.id)"
                    type="primary"
                    v-if="record.status == '1'"
                    ><PayCircleOutlined
                  /></a-button>
                  <a-button
                    @click="paySuccess(record.id)"
                    type="primary"
                    v-if="record.status == '2'"
                    >支付成功</a-button
                  >
                  <a-button
                    @click="recoveryFromFreezeData(record.id)"
                    type="primary"
                    v-if="record.status == '6'"
                    >恢复冻结</a-button
                  >

                  <a-button
                    danger
                    @click="deleteData(record.id)"
                    v-if="record.status !== statusList.indexOf('已取消')"
                  >
                    <DeleteOutlined />
                  </a-button>
                </a-space>
              </a-row>

              <a-row>
                <a-space>
                  <a-button
                    @click="refuseData(record.id)"
                    v-if="record.status == '0' || record.status == '1'"
                    type="primary"
                    danger
                    ><ExclamationCircleOutlined
                  /></a-button>
                  <a-button
                    @click="freezeData(record.id)"
                    v-if="record.status == '1'"
                    type="primary"
                    danger
                    >冻结</a-button
                  >

                  <a-button @click="cancelData(record.id)" type="primary" danger
                    >取消</a-button
                  >
                  <a-button
                    @click="payFailData(record.id)"
                    v-if="record.status == '2'"
                    type="primary"
                    danger
                    >支付失败</a-button
                  >
                </a-space>
              </a-row>

              <!-- 编辑模态框 -->
              <a-modal
                v-model:visible="record.editVisible"
                @ok="handleEditOk"
                @cancel="handleEditCancel"
              >
                <a-form :model="editForm">
                  <a-form-item label="身份证号" name="personID" has-feedback>
                    <a-input v-model:value="editForm.personID"> </a-input>
                  </a-form-item>
                  <a-form-item label="姓名" name="personName" has-feedback>
                    <a-input v-model:value="editForm.personName" />
                  </a-form-item>
                  <a-form-item label="转入地" name="fromArea" has-feedback>
                    <a-input v-model:value="editForm.fromArea" />
                  </a-form-item>

                  <a-form-item label="手动计算" name="paySplitMonth">
                    <a-row>
                      <a-space>
                        标准一：<a-input
                          v-model:value="firstPayMonth"
                          style="width: 40px"
                        />
                        二:<a-input
                          v-model:value="secondPayMonth"
                          style="width: 40px"
                        />
                        享受期限:<a-input
                          v-model:value="editForm.payMonth"
                          disabled
                          style="width: 40px"
                        />
                      </a-space>
                    </a-row>
                  </a-form-item>
                  <a-form-item label="转出金额" name="pay" has-feedback>
                    <a-input v-model:value="editForm.pay" />
                  </a-form-item>

                  <a-form-item
                    label="转关系"
                    name="isOnlyTransferRelation"
                    has-feedback
                  >
                    <a-select
                      ref="select"
                      v-model:value="editForm.isOnlyTransferRelation"
                      style="width: 120px"
                      :options="isOnlyTransferRelationOp"
                    ></a-select>
                  </a-form-item>
                  <a-form-item label="备注">
                    <a-textarea v-model:value="editForm.note" />
                  </a-form-item>
                </a-form>
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
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PayCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import api from "@/api";
import { pinyin } from "pinyin-pro";
import ZhuanyiAddFormView from "./ZhuanyiAddFormView.vue";
import FilterView from "@/components/FilterView.vue";
import { Dayjs } from "dayjs";
import { useUserStore } from "@/stores";

import { downloadLink, genWorkbook } from "@/utils/util";
import {} from "@/utils/util";
import { colorList } from "@/types";
import "dayjs/locale/zh-cn";
const statusList = [
  "已初核",
  "已复核",
  "支付中",
  "已支付",
  "已驳回",
  "已取消",
  "未确认冻结",
  "支付失败",
  "全部",
];
const mapStatusList = statusList.map((item, index) => {
  return {
    label: item,
    value: index,
  };
});
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
const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const monthSelect = ref([]);
const payDate = ref<Dayjs>();
const selectedOp = ref<string[]>([]);
const count = ref<number>();
const checked = ref(false);
const reviewChecked = ref("0");
const exportData = ref();
const status = ref(null);
const statusCal = ref([]);
// 获得月份序列
const getMonths = (params?: any) => {
  return api.getZhuanyiAllDate();
};
//编辑相关
const editForm = ref();
const firstPayMonth = ref(0);
const secondPayMonth = ref(0);
watch(
  () => firstPayMonth.value,
  () => {
    editForm.value.payMonth =
      Number(firstPayMonth.value) + Number(secondPayMonth.value);
    editForm.value.pay =
      (Number(firstPayMonth.value) * 2175 +
        Number(secondPayMonth.value) * 1740) *
      1.5;
  }
);
watch(
  () => secondPayMonth.value,
  () => {
    editForm.value.payMonth =
      Number(firstPayMonth.value) + Number(secondPayMonth.value);
    editForm.value.pay =
      (Number(firstPayMonth.value) * 2175 +
        Number(secondPayMonth.value) * 1740) *
      1.5;
  }
);
const isOnlyTransferRelationOp = [
  {
    value: "只转关系",
  },
  {
    value: "转金额",
  },
];
const showEditModal = (record) => {
  editForm.value = record;
  firstPayMonth.value =
    Number(editForm.value.payMonth) < 12 ? editForm.value.payMonth : 12;
  secondPayMonth.value =
    Number(editForm.value.payMonth) <= 12
      ? 0
      : Number(editForm.value.payMonth) - 12;
  record.editVisible = true;
};
const resetEditForm = () => {
  firstPayMonth.value = 0;
  secondPayMonth.value = 0;
};
const handleEditOk = () => {
  api
    .updateZhuanyiData(editForm.value)
    .then((res: any) => {
      message.info("修改成功");
      editOpen.value = false;
      resetEditForm();
      getData();
    })
    .catch((error) => {
      message.info("数据格式错误，无法提交=>", error);
      resetEditForm();
    });
};
const handleEditCancel = () => {
  editOpen.value = false;
  resetEditForm();
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
const onSearch = () => {
  getData().catch((e) => {
    console.log(e);
    message.info("查询错误，联系管理员");
  });
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
  () => selectedOp.value,
  (newValue) => {
    getData();
  }
);
watch(
  () => searchValue.value,
  (newValue) => {
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
  if (userInfo.checkObject) {
    selectedOp.value = [...userInfo.checkObject.split(","), userInfo.username];
  }
  getData();
});
// 获取数据
const getData = async (params?: any) => {
  spinning.value = true;
  // api.getZhuanyiDataCal().then((res: any) => {
  //   statusCal.value = statusList.map((item, index) => {
  //     return {
  //       label: item,
  //       count: res.find((item) => Number(item.status) === index)?.count || 0,
  //     };
  //   });
  // });

  params = {
    ...params,
    ...pager.value,
    status: status.value,
    checkoperators: selectedOp.value,
  };
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
  }
  if (monthRangeSelect.value) {
    params.monthRangeSelect = monthRangeSelect.value;
  }
  if (searchValue.value !== undefined && searchValue.value !== "") {
    params.searchValue = searchValue.value;
  }
  return await api.getZhuanyiData(params).then((res: any) => {
    exportData.value = res.rows;
    console.log(exportData.value);
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

const deleteData = async (id: number) => {
  await api
    .updateZhuanyiData({ id: id, status: statusList.indexOf("已取消") })
    .then((res: any) => {
      getData();
    });
};
const reviewData = async (id: number) => {
  await api
    .updateZhuanyiData({
      id: id,
      reviewoperator: userInfo.username,
      status: "1",
    })
    .then((res: any) => {
      getData();
    });
};
const freezeData = async (id: number) => {
  await api
    .updateZhuanyiData({
      id: id,
      reviewoperator: userInfo.username,
      status: "6",
    })
    .then((res: any) => {
      getData();
    });
};
const payFailData = async (id: number) => {
  await api
    .updateZhuanyiData({
      id: id,
      reviewoperator: userInfo.username,
      status: "7",
    })
    .then((res: any) => {
      getData();
    });
};
const refuseData = async (id: number) => {
  await api
    .updateZhuanyiData({
      id: id,
      reviewoperator: userInfo.username,
      status: "4",
    })
    .then((res: any) => {
      getData();
    });
};
const recoveryFromFreezeData = async (id: number) => {
  await api
    .updateZhuanyiData({
      id: id,
      reviewoperator: userInfo.username,
      status: "1",
    })
    .then((res: any) => {
      getData();
    });
};
const cancelData = async (id: number) => {
  await api
    .updateZhuanyiData({
      id: id,
      reviewoperator: userInfo.username,
      status: "5",
    })
    .then((res: any) => {
      getData();
    });
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
const paySuccess = async (id: number) => {
  await api
    .updateZhuanyiData({
      id: id,
      reviewoperator: userInfo.username,
      status: "3",
    })
    .then((res: any) => {
      getData();
    });
};

// 增加数据弹窗
const formRef = ref(null);
const editFormRef = ref(null);
const open = ref<boolean>(false);
const editOpen = ref<boolean>(false);

const confirmLoading = ref<boolean>(false);
const showAddDataModal = async () => {
  open.value = true;
};

const handleOk = () => {
  formRef.value
    .onSubmit()
    .then(() => {
      confirmLoading.value = true;
      getData();
      open.value = false;
      confirmLoading.value = false;
    })
    .catch((error) => {
      message.info("数据格式错误，无法提交=>", error);
    });

  getData();
};

const handleCancel = () => {
  formRef.value.resetForm();
};
const columns = [
  // {
  //   title: 'ID',
  //   dataIndex: 'id',
  //   key: 'id',
  // },
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
  // {
  //   title: '备注',
  //   dataIndex: 'note',
  //   key: 'note',
  // },
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
  // {
  //   title: '初核备注',
  //   dataIndex: 'checknote',
  //   key: 'checknote',
  // },
  // {
  //   title: '复核备注',
  //   dataIndex: 'reviewnote',
  //   key: 'reviewnote',
  // },
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

// const handleChange: TableProps['onChange'] = (pagination, filters, sorter) => {
//   // console.log('Various parameters', pagination, filters, sorter);
//   filteredInfo.value = filters;
//   sortedInfo.value = sorter;
// };
// const clearFilters = () => {
//   filteredInfo.value = null;
// };
// const clearAll = () => {
//   filteredInfo.value = null;
//   sortedInfo.value = null;
// };
// const setAgeSort = () => {
//   sortedInfo.value = {
//     order: 'descend',
//     columnKey: 'age',
//   };
// };
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
