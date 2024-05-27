<template>
  <div>
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
          <template v-if="column.key === 'username'">
            <a-typography-paragraph
              :style="{ fontSize: '18px' }"
              copyable
              keyboard
              :class="{ deleted: record.status == '3' }"
              >{{ record.username }}</a-typography-paragraph
            >
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
                    <UserEditView :edit-form="editForm" ref="editableFormRef" />
                  </a-modal>
                </a-space>
              </a-row>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import UserEditView from "./UserEditView.vue";
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
const statusList = ["已初核", "已复核", "待初核", "已删除"];
const customOrderList = ["按时间排序", "按街镇排序"];
const getStatus = (status: number) => {
  return statusList[Number(status)];
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

// 搜索相关
const searchValue = ref();
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
//数据导出功能
const UserHeader = [
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
    selectedOp.value = [...userInfo.checkObject.split(","), userInfo.username];
  }
  getData();
});
const statusCal = ref([]);
const jiezhenCal = ref([]);
// 获取失业金数据
const getData = async (params?: any) => {
  spinning.value = true;
  params = {
    ...params,
    ...pager.value,
  };

  return await api.getUsers(params).then((res: any) => {
    pager.value = res.page;
    dataSource.value = res.rows;
    console.log("data====>", dataSource.value);
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
    title: "姓名",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "账户",
    dataIndex: "account",
    key: "account",
  },
  {
    title: "复核对象",
    dataIndex: "checkObject",
    key: "checkObject",
  },
  {
    title: "初核街镇",
    dataIndex: "checkJiezhen",
    key: "checkJiezhen",
  },
  {
    title: "操作",
    // dataIndex: 'action',
    key: "action",
  },
];
const updateAction = (params: any) => {
  return api.updateUser(params);
};
const buttonList = [
  {
    text: "删除",
    icon: "DeleteOutlined",
    params: {
      status: statusList.indexOf("已删除"),
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
