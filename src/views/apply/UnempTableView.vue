<template>
  <div>
    <div class="table-operations">
      <a-space direction="vertical">
        <a-row>
          <a-space>
            <a-card>
              <a-button @click="showEditModal(null)" type="primary"
                >添加</a-button
              >
              <a-modal
                v-model:open="addOpen"
                title="增加"
                :destroyOnClose="true"
                @ok="handleEditOk(null)"
                @cancel="handleEditCancel(null)"
              >
                <UnempEditFormView ref="editableFormRef" />
              </a-modal>
              <a-button @click="getData"> 刷新 </a-button>
              <a-button @click="localExportExcel()">
                <FileExcelOutlined />导出
              </a-button>
            </a-card>
            <FilterView
              v-bind:chosen-jiezhen="chosenJiezhen"
              @jiezhenSelectChange="jiezhenSelectChange"
              @hanle-change-search="hanleChangeSearch"
            >
              <template #otherFilter>
                <a-select
                  v-model:value="selectedOp"
                  mode="multiple"
                  placeholder="选择初核对象"
                  style="width: 300px"
                  :options="userStore.checkoperators"
                ></a-select>
                <a-range-picker v-model:value="monthRangeSelect" />
              </template>
              <template #footer>
                <a-checkbox v-model:checked="isIncludeCheckData"
                  >是否包含初核</a-checkbox
                >
              </template>
            </FilterView>
          </a-space>
        </a-row>
        <a-row>
          <a-space>
            <a-radio-group v-model:value="reviewChecked" button-style="solid">
              <a-radio-button
                v-for="(status, index) in verifications"
                :value="String(index)"
                :key="index"
                >{{ status }}
              </a-radio-button>
            </a-radio-group>
            <a-tag color="#108ee9">{{ count }}</a-tag>
          </a-space>
        </a-row>
      </a-space>
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
              :class="{ deleted: record.verification == '3' }"
              >{{ record.personID }}</a-typography-paragraph
            >
          </template>
          <template v-if="column.key === 'personName'">
            <a-tooltip :title="pinyin(record.personName)" color="#f50">
              <a-typography-paragraph
                :style="{ fontSize: '18px' }"
                copyable
                :class="{ deleted: record.verification == '3' }"
                >{{ record.personName }}</a-typography-paragraph
              >
            </a-tooltip>
          </template>
          <template v-if="column.key === 'checkoperator'">
            <a-space direction="vertical">
              <a-row>
                <a-tag :color="getColors(record.checkoperator)">
                  {{ record.checkoperator }}
                </a-tag>
                <a-tag>{{ record.jiezhen }}</a-tag>
              </a-row>
              <a-tooltip :title="record.checknote" color="#f50">
                <a-input-search
                  v-model:value="record.checknote"
                  placeholder="初核备注"
                  size="medium"
                  @search="
                    updateParams({ id: record.id, checknote: record.checknote })
                  "
                >
                  <template #enterButton>
                    <a-button type="dashed">修改初核备注</a-button>
                  </template>
                </a-input-search>
              </a-tooltip>
            </a-space>

            <!-- <span v-html="`<br>${record.checknote}`"></span> -->
          </template>
          <!--  reviewoperator column -->
          <template v-if="column.key === 'reviewoperator'">
            <a-tag
              :color="getColors(record.reviewoperator)"
              v-if="record.reviewoperator != null"
            >
              {{ record.reviewoperator }}
            </a-tag>
            <span
              v-if="record.reviewnote != null"
              v-html="`<br>${record.reviewnote}`"
            ></span>
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
                  <ApplyActionView :record="record" @get-data="getData" />
                  <a-button @click="showEditModal(record)">
                    <EditOutlined />
                  </a-button>
                  <!-- 编辑模态框 -->
                  <a-modal
                    :open="record.editVisible"
                    title="编辑"
                    :destroyOnClose="true"
                    @ok="handleEditOk(record)"
                    @cancel="handleEditCancel(record)"
                  >
                    <UnempEditFormView
                      :edit-form="editForm"
                      ref="editableFormRef"
                    />
                  </a-modal>
                </a-space>
              </a-row>
              <a-row>
                <a-tooltip :title="record.reviewnote" color="#f50">
                  <a-input-search
                    v-model:value="record.reviewnote"
                    placeholder="复核备注"
                    size="medium"
                    @search="
                      updateParams({
                        id: record.id,
                        reviewNote: record.reviewnote,
                      })
                    "
                  >
                    <template #enterButton>
                      <a-button type="dashed">提交复核备注</a-button>
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
import UnempEditFormView from "./UnempEditFormView.vue";
import ApplyActionView from "./ApplyActionView.vue";
import FilterView from "@/components/FilterView.vue";

import { computed, ref, onBeforeMount, watch } from "vue";
import { message } from "ant-design-vue";
import { Dayjs } from "dayjs";
import { pinyin } from "pinyin-pro";

import "dayjs/locale/zh-cn";
import {
  FileExcelOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons-vue";
import api from "@/api";
import { useUserStore } from "@/stores";
import { exportExcel, formattedTime } from "@/utils/util";
import { jiezhens, colorList } from "@/types";
const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
type RangeValue = [Dayjs, Dayjs];
const monthRangeSelect = ref<RangeValue>();
const selectedOp = ref<string[]>([]);
const count = ref<number>();
const reviewChecked = ref("0");
const isIncludeCheckData = ref(false);
const verifications = ["已初核", "已复核", "待初核", "已删除", "全部"];
// 搜索相关
const searchValue = ref();
// 按街镇选择子组件
const jiezhenSelectChange = (selectJiezhens: any) => {
  chosenJiezhen.value = selectJiezhens;
};
const chosenJiezhen = ref([]);
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
  () => isIncludeCheckData.value,
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
watch(
  () => reviewChecked.value,
  (newValue) => {
    pager.value.current = 1;
    getData();
  }
);
// 提交初核备注
const updateParams = (params: any) => {
  api
    .updateUnempVeriData(params)
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
const unempHeader = [
  { header: "序号", key: "index", width: 10 },
  { header: "姓名", key: "personName", width: 12 },
  { header: "身份证", key: "personID", width: 25 },
  { header: "街镇", key: "jiezhen", width: 25 },
  { header: "提交时间", key: "createtime", width: 35 },
];
const localExportExcel = () => {
  exportExcel(unempHeader, "失业金", getData, monthRangeSelect.value)
    .then(() => {
      message.info("导出成功");
    })
    .catch((error) => {
      console.log(error);
      message.error("导出失败,请查看日期是否选择");
    });
};

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
    selectedOp.value = [...userInfo.checkObject.split(","), userInfo.username];
  }
  getData();
});

// 获取失业金数据
const getData = async (params?: any) => {
  spinning.value = true;
  params = {
    ...params,
    ...pager.value,
    checkoperators: selectedOp.value,
    jiezhen: chosenJiezhen.value,
  };
  if (isIncludeCheckData.value) {
    params.isIncludeCheckData = 1;
  } else {
    params.isIncludeCheckData = null;
  }

  if (reviewChecked.value !== "4") {
    params.verification = reviewChecked.value;
  } else {
    params.verification = null;
  }
  if (monthRangeSelect.value) {
    params.monthRangeSelect = monthRangeSelect.value;
    console.log(params);
  }

  if (searchValue.value !== undefined && searchValue.value !== "") {
    params = {
      searchValue: searchValue.value,
      ...pager.value,
    };
  }
  return await api.getUnempVeriData(params).then((res: any) => {
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
  //   title: '街镇',
  //   dataIndex: 'jiezhen',
  //   key: 'jiezhen',
  // },
  {
    title: "初核",
    dataIndex: "checkoperator",
    key: "checkoperator",
  },
  {
    title: "复核",
    dataIndex: "reviewoperator",
    key: "reviewoperator",
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
