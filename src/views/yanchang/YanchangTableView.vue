<template>
  <div>
    <div class="table-operations">
      <a-space direction="vertical">
        <a-row>
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
              <!-- <YanchangAddFormView ref="formRef" /> -->
              <YanchangEditFormView ref="editableFormRef" />
            </a-modal>
            <a-tag color="#108ee9">{{ count }}</a-tag>
            <a-button @click="getData"> 刷新数据 </a-button>
            <a-divider type="vertical" />
            <!-- <a-button type="primary" @click="()=>searchValue=''">重置搜索</a-button> -->
          </a-space>
        </a-row>
        <a-row>
          <!-- 数据导出操作 -->
          <a-space>
            <h5>导出操作：</h5>
            <a-range-picker v-model:value="monthRangeSelect" />
            <a-button
              @click="
                exportExcel(
                  headersWithWidth,
                  dataSource,
                  '延长失业金',
                  getData,
                  monthRangeSelect
                )
              "
              type="primary"
              style="background-color: #1e1e1e"
            >
              导出Excel
            </a-button>
          </a-space>
        </a-row>
        <a-row>
          <a-radio-group v-model:value="status" button-style="solid">
            <a-radio-button
              v-for="(status, index) in statusCal"
              :value="String(index)"
              :key="index"
              >{{ status.label }}
              <a-tag :color="colorList[index]">{{ status.count }}</a-tag>
            </a-radio-button>
          </a-radio-group>
        </a-row>
        <FilterView
          v-bind:chosen-jiezhen="chosenJiezhen"
          @jiezhenSelectChange="jiezhenSelectChange"
          @hanle-change-search="hanleChangeSearch"
        />
      </a-space>
    </div>
    <a-spin :spinning="spinning">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        @change="handleChange"
        @showSizeChange="onShowSizeChange"
        :pagination="pagination"
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
            <a-tag>{{ record.payMonth }}</a-tag>
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
                  <!-- <a-button
                    @click="reviewData(record.id)"
                    type="primary"
                    v-if="record.status == '0'"
                  >
                    <CheckOutlined />
                  </a-button> -->
                  <ActionView
                    :params="{ id: record.id, status: '1' }"
                    :get-data="getData"
                    table="yanchang"
                  />

                  <a-button @click="showEditModal(record)">
                    <EditOutlined />
                  </a-button>
                  <a-button
                    @click="tagWrong(record.id, getData, 'yanchang')"
                    type="primary"
                    danger
                  >
                    <WarningFilled />
                  </a-button>

                  <a-button
                    @click="checkData(record.id, getData)"
                    type="primary"
                    v-if="record.status == '2'"
                    >登记</a-button
                  >
                  <a-button
                    @click="tagOriginalFile(record.id, getData, 'yanchang')"
                    type="primary"
                    danger
                  >
                    <FilePdfOutlined />
                  </a-button>
                </a-space>
              </a-row>

              <a-row>
                <a-space>
                  <a-button
                    @click="cancelData(record.id, getData)"
                    type="primary"
                    danger
                  >
                    <DeleteOutlined />
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
                  v-bind:edit-form="editForm"
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
import { cancelData, getStatus, statusList, checkData } from "./utils";
import { tagWrong, tagOriginalFile } from "@/utils/tag";
import { pinyin } from "pinyin-pro";
import YanchangEditFormView from "./YanchangEditFormView.vue";
import ActionView from "@/components/ActionView.vue";
import { Dayjs } from "dayjs";
import { useUserStore } from "@/stores";
import { exportExcel, colorList } from "@/utils/util";
import "dayjs/locale/zh-cn";
import {
  WarningFilled,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  FilePdfOutlined,
  WarningOutlined,
} from "@ant-design/icons-vue";
// 按街镇选择子组件,搜索
const jiezhenSelectChange = (selectJiezhens: any) => {
  chosenJiezhen.value = selectJiezhens;
};
const chosenJiezhen = ref([]);
const hanleChangeSearch = (childSearchValue: any) => {
  searchValue.value = childSearchValue;
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
const status = ref("0");
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
  getData();
});
// 获取数据
const getData = async (params?: any) => {
  spinning.value = true;
  api.getYanchangDataCal().then((res: any) => {
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
  };
  if (monthRangeSelect.value) {
    params.monthRangeSelect = monthRangeSelect.value;
  }
  if (chosenJiezhen.value.length > 0) {
    params.jiezhen = chosenJiezhen.value;
  }

  if (Number(status.value) !== statusList.length - 1) {
    params.status = status.value;
  } else {
    params.status = null;
  }
  if (searchValue.value !== undefined && searchValue.value !== "") {
    params = {
      searchValue: searchValue.value,
      current: 1,
    };
  }
  return await api
    .getYanchangData(params)
    .then((res: any) => {
      pager.value = res.page;
      count.value = pager.value.total;
      dataSource.value = res.rows.map((item: any) => {
        return {
          editVisible: false,
          ...item,
        };
      });
    })
    .then(() => {
      spinning.value = false;
    });
};
const getCorrectTime = (date: string) => {
  const originalDate = new Date(date);
  const updatedDate = new Date(
    originalDate.getTime() + 8 * 60 * 60 * 1000
  ).toISOString();
  return [updatedDate.slice(0, 10), updatedDate.slice(11, 19)];
};

const reviewData = async (id: number) => {
  await api
    .updateYanchangData({
      id: id,
      reviewoperator: userInfo.username,
      status: "1",
    })
    .then((res: any) => {
      getData();
    });
};

// 增加数据弹窗
const formRef = ref(null);
const open = ref<boolean>(false);
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
