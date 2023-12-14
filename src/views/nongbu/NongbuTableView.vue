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
      :map-status-list="mapStatusList"
      :headers-with-width="nongbuHeader"
      :monthSelect="monthSelect"
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
        <a-button @click="showAddDataModal" type="primary">添加</a-button>
        <a-modal
          v-model:open="open"
          title="Title"
          :confirm-loading="confirmLoading"
          @ok="handleOk"
          @cancel="handleCancel"
        >
          <NongbuAddFormView ref="formRef" />
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
              :class="{ deleted: record.status == 4 }"
              >{{ record.personID }}</a-typography-paragraph
            >
          </template>
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
            <a-space direction="vertical">
              <a-row>
                <a-space>
                  <a-button
                    @click="tagWrong(record.id, getData, 'nongbu')"
                    type="primary"
                    danger
                  >
                    <WarningFilled />
                  </a-button>
                  <a-button @click="showEditModal(record)"
                    ><EditFilled
                  /></a-button>
                  <a-button
                    @click="tagOriginalFile(record.id, getData, 'nongbu')"
                    type="primary"
                    danger
                  >
                    <FilePdfFilled />
                  </a-button>
                </a-space>
              </a-row>
              <a-row>
                <a-space>
                  <a-button
                    @click="reviewData(record.id)"
                    type="primary"
                    v-if="record.status == '0'"
                    ><CheckOutlined
                  /></a-button>
                  <a-button
                    @click="addRepeat(record.id, record.repeatTimes)"
                    type="primary"
                    danger
                    ><PlusCircleFilled />
                  </a-button>
                  <a-button @click="cancelData(record.id)" type="primary" danger
                    ><DeleteFilled
                  /></a-button>
                  <a-button
                    @click="tagCancelUnemp(record.id, getData)"
                    type="primary"
                    danger
                    v-if="record.status == '1'"
                  >
                    <StopFilled />
                  </a-button>
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
                  <a-form-item label="街镇" name="jiezhen">
                    <a-select
                      ref="select"
                      v-model:value="editForm.jiezhen"
                      style="width: 120px"
                      :options="jiezhens"
                    ></a-select>
                  </a-form-item>
                  <a-form-item label="城保" name="chengPayMonth">
                    <a-input v-model:value="editForm.chengPayMonth" />
                  </a-form-item>
                  <a-form-item label="镇保" name="zhenPayMonth">
                    <a-input v-model:value="editForm.zhenPayMonth" />
                  </a-form-item>
                  <a-form-item label="备注">
                    <a-textarea v-model:value="editForm.note" />
                  </a-form-item>
                  <a-form-item label="重复次数">
                    <a-input
                      type="number"
                      v-model:value="editForm.repeatTimes"
                    />
                  </a-form-item>
                  <a-form-item label="是否错核">
                    <a-radio-group v-model:value="editForm.wrongTag">
                      <a-radio value="1">标记错核</a-radio>
                      <a-radio value="0">未错核</a-radio>
                    </a-radio-group>
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
import NongbuAddFormView from "./NongbuAddFormView.vue";
import { Dayjs } from "dayjs";
import { useUserStore } from "@/stores";
import { nongbuHeader, exportExcel, formattedTime } from "@/utils/util";
import { jiezhens, colorList, jiezhenList } from "@/types";
import "dayjs/locale/zh-cn";
import { tagCancelUnemp } from "@/views/nongbu/utils";
import { tagOriginalFile, tagWrong } from "@/utils/tag";

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
const status = ref(null);
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
const handleChangeStatus = (childStatus: number) => {
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
const statusList = ["已登记", "已审批", "已取消", "全部"];
const mapStatusList = statusList.map((item, index) => {
  return {
    label: item,
    value: index,
  };
});
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
// 获取数据
const getData = async (params?: any) => {
  spinning.value = true;
  await api.getNongbuDataCal().then((res: any) => {
    statusCal.value = statusList.map((item, index) => {
      return {
        label: item,
        count: res.find((item) => Number(item.status) === index)?.count || 0,
      };
    });
  });

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
    params = {
      searchValue: searchValue.value,
      current: 1,
    };
  } else {
    params.searchValue = null;
  }
  return await api.getNongbuData(params).then((res: any) => {
    pager.value = res.page;
    count.value = pager.value.total;
    dataSource.value = res.rows;
    spinning.value = false;
    return res.rows;
  });
};

// const deleteData = async (id: number) => {
//   await api.updateNongbuData({ id: id, status: statusList.indexOf('已删除') }).then((res: any) => {
//     getData();
//   });
// };
const reviewData = async (id: number) => {
  await api
    .updateNongbuData({
      id: id,
      reviewoperator: userInfo.username,
      status: "1",
    })
    .then((res: any) => {
      getData();
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

const cancelData = async (id: number) => {
  await api
    .updateNongbuData({
      id: id,
      reviewoperator: userInfo.username,
      status: statusList.indexOf("已取消"),
    })
    .then((res: any) => {
      getData();
    });
};

// 增加数据弹窗
const formRef = ref(null);
const open = ref<boolean>(false);
const editOpen = ref<boolean>(false);

const confirmLoading = ref<boolean>(false);
const showAddDataModal = async () => {
  open.value = true;
};

const showEditModal = (record) => {
  editForm.value = record;
  record.editVisible = true;
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

const handleEditOk = () => {
  api
    .updateNongbuData(editForm.value)
    .then((res: any) => {
      message.info("修改成功");
      editOpen.value = false;
      getData();
    })
    .catch((error) => {
      message.info("数据格式错误，无法提交=>", error);
    });
};
const handleEditCancel = () => {
  editOpen.value = false;
};
const handleCancel = () => {
  formRef.value.resetForm();
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
