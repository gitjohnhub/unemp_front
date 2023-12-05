<template>
  <div>
    <div class="table-operations">
      <a-space direction="vertical">
        <a-row>
          <a-space>
            <a-button @click="showAddDataModal" type="primary"
              ><PlusCircleOutlined />添加</a-button
            >
            <a-modal
              v-model:open="open"
              title="Title"
              :confirm-loading="confirmLoading"
              @ok="handleOk"
              @cancel="handleCancel"
            >
              <ApplyAddFormView ref="formRef" />
            </a-modal>

            <a-select
              v-model:value="selectedOp"
              mode="multiple"
              placeholder="选择初核对象"
              style="width: 300px"
              :options="userStore.checkoperators"
            ></a-select>
            <a-button @click="getData"> 刷新数据 </a-button>
            <FilterView
              v-bind:chosen-jiezhen="chosenJiezhen"
              @jiezhenSelectChange="jiezhenSelectChange"
              @hanle-change-search="hanleChangeSearch"
            />
          </a-space>
        </a-row>
        <a-row>
          <a-space>
            <a-range-picker v-model:value="monthRangeSelect" />
            <a-button @click="localExportExcel()">
              <FileExcelOutlined />导出
            </a-button>
            <a-checkbox v-model:checked="isIncludeCheckData"></a-checkbox
            >是否包含初核
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
                  <a-button @click="showEditModal(record)"
                    ><EditOutlined
                  /></a-button>
                  <!-- 编辑模态框 -->
                  <a-modal
                    v-model:visible="record.editVisible"
                    @ok="handleEditOk"
                    @cancel="handleEditCancel"
                  >
                    <a-form :model="editForm">
                      <a-form-item
                        label="身份证号"
                        name="personID"
                        has-feedback
                      >
                        <a-input v-model:value="editForm.personID"> </a-input>
                      </a-form-item>
                      <a-form-item label="姓名" name="personName" has-feedback>
                        <a-input v-model:value="editForm.personName" />
                      </a-form-item>
                      <a-form-item label="街镇" name="jiezhen" has-feedback>
                        <a-select
                          ref="select"
                          v-model:value="editForm.jiezhen"
                          style="width: 120px"
                          :options="jiezhens"
                        ></a-select>
                      </a-form-item>
                      <a-form-item label="初核备注">
                        <a-textarea v-model:value="editForm.checknote" />
                      </a-form-item>
                      <a-form-item label="复核备注">
                        <a-textarea v-model:value="editForm.reviewnote" />
                      </a-form-item>
                      <a-form-item label="选择未初核">
                        <a-radio-group v-model:value="editForm.verification">
                          <a-radio value="0">已初核</a-radio>
                          <!-- <a-radio value="1">已复核</a-radio> -->
                          <a-radio value="2">待初核</a-radio>
                        </a-radio-group>
                      </a-form-item>
                    </a-form>
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
import ApplyAddFormView from "./ApplyAddFormView.vue";
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

const deleteData = async (id: number) => {
  await api
    .updateUnempVeriData({ id: id, verification: "3" })
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
//编辑数据弹窗
const editForm = ref();

const showEditModal = (record) => {
  editForm.value = record;
  record.editVisible = true;
};

const handleOk = () => {
  formRef.value
    .onSubmit()
    .then(() => {
      getData();
      open.value = false;
    })
    .catch((error) => {
      message.info("数据格式错误，无法提交=>", error);
    });

  getData();
};
const handleEditOk = () => {
  api
    .updateUnempVeriData(editForm.value)
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
