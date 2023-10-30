<template>
  <div>
    <div class="table-operations">
      <a-space>
        <a-button @click="showAddDataModal" type="primary">添加</a-button>
        <a-modal
          v-model:open="open"
          title="Title"
          :confirm-loading="confirmLoading"
          @ok="handleOk"
          @cancel="handleCancel"
        >
          <ApplyFormView ref="formRef" />
        </a-modal>

        <a-select
          v-model:value="selectedOp"
          mode="multiple"
          placeholder="选择复核对象"
          style="width: 300px"
          :options="checkoperators"
        ></a-select>
        <a-date-picker v-model:value="monthSelect" picker="month" />

        <a-checkbox v-model:checked="checked">显示删除</a-checkbox>
        <a-checkbox v-model:checked="reviewChecked">只显示待复核</a-checkbox>

        <a-tag color="#108ee9">{{ count }}</a-tag>
        <a-button @click="exportExcel"> 导出Excel </a-button>
      </a-space>
    </div>
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
            :class="{ deleted: record.alreadydelete == 2 }"
            >{{ record.personID }}</a-typography-paragraph
          >
        </template>
        <template v-if="column.key === 'personName'">
          <a-tooltip :title="pinyin(record.personName)" color="#f50">
            <a-typography-paragraph
              :style="{ fontSize: '18px' }"
              copyable
              :class="{ deleted: record.alreadydelete == 2 }"
              >{{ record.personName }}</a-typography-paragraph
            >
          </a-tooltip>
        </template>
        <template v-if="column.key === 'checkoperator'">
          <a-tag :color="getColors(record.checkoperator)">
            {{ record.checkoperator }}
          </a-tag>
          <span v-html="`<br>${record.checknote}`"></span>
        </template>
        <!--  reviewoperator column -->
        <template v-if="column.key === 'reviewoperator'">
          <a-tag :color="getColors(record.reviewoperator)" v-if="record.reviewoperator != null">
            {{ record.reviewoperator }}
          </a-tag>
          <span v-if="record.reviewnote != null" v-html="`<br>${record.reviewnote}`"></span>
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
        <!-- <template v-if="column.key === 'alreadydelete'">
          <a-tag :color="record.alreadydelete == 1 ? 'success' : 'error'">
            {{ record.alreadydelete == 1 ? '存在' : '已删除' }}
          </a-tag>
        </template> -->
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button
              danger
              @click="deleteData(record.id)"
              :disabled="record.alreadydelete == 2 ? true : false"
              >删除</a-button
            >
            <a-button type="primary" @click="showEditModal(record)">编辑</a-button>
            <!-- 编辑模态框 -->
            <a-modal
              v-model:visible="record.editVisible"
              @ok="handleEditOk"
              @cancel="handleEditCancel"
            >
              <ApplyEditFormView :editForm="record" ref="editFormRef" />
            </a-modal>
            <a-button @click="reviewData(record.id)" :disabled="record.verification == 1"
              >复核</a-button
            >
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onBeforeMount, watch } from 'vue';
import { message } from 'ant-design-vue';
import api from '@/api';
import { pinyin } from 'pinyin-pro';
import * as XLSX from 'xlsx';
import ApplyFormView from './ApplyFormView.vue';
import ApplyEditFormView from './ApplyEditFormView.vue';
import { Dayjs } from 'dayjs';
import { useUserStore } from '@/stores';
import 'dayjs/locale/zh-cn';
const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const monthSelect = ref<Dayjs>();
const checkoperators = ref<{ value: string }>();
const selectedOp = ref<string[]>([]);

const count = ref<number>();
const colors = ['#f50', '#2db7f5', '#87d068', '#108ee9', '#dd6236', '#4a9d9c'];
const userColors = ref();
const checked = ref(false);
const reviewChecked = ref(true);
const exportData = ref();
const getColors = (user) => {
  const findColor = userColors.value.filter((u) => u.username === user);
  if (findColor.length !== 0) {
    return findColor[0].color;
  } else {
    return '#344D70';
  }
};
watch(
  () => selectedOp.value,
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
  () => checked.value,
  (newValue) => {
    getData();
  }
);
watch(
  () => reviewChecked.value,
  (newValue) => {
    getData();
  }
);
// 通过月份获得月尾和月头的日期
function getMonthRange(monthSelect) {
  const firstDay = monthSelect.startOf('month').format('YYYY-MM-DD');
  const lastDay = monthSelect.endOf('month').format('YYYY-MM-DD');
  return [firstDay, lastDay];
}

//数据导出功能
const exportExcel = () => {
  getData({ noindex: 1 }).then(() => {
    const processedData = exportData.value.map((item) => {
      const result = {
        personName: item.personName,
        personID: item.personID,
        verification: item.verification,
        alreadydelete: item.alreadydelete,
        createtime: item.createtime,
      };

      return result;
    });

    // 导出
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    XLSX.utils.book_append_sheet(workbook, worksheet);
    if (monthSelect.value) {
      XLSX.writeFile(workbook, `${monthSelect.value.toISOString().slice(0, 10)}.xlsx`);
    } else {
      XLSX.writeFile(workbook, `${new Date().toISOString().slice(0, 10)}_all.xlsx`);
    }
    // 写入文件
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

const onShowSizeChange = async (page: any) => {
  console.log('showsizechangepage=>', page);
};

onBeforeMount(() => {
  getUsers();
  getData();
  if (userInfo.checkObject) {
    selectedOp.value = [...userInfo.checkObject.split(',')];
  }
});

// 获取用户数据，构造用户选择列表
const getUsers = async (params?: any) => {
  await api.getUsers(params).then((res: any) => {
    console.log('users=====>', res);
    checkoperators.value = res.rows.map((userInfo) => {
      return { value: userInfo.userName };
    });
    userColors.value = res.rows.map((userInfo, index) => {
      return {
        username: userInfo.userName,
        color: colors[index],
      };
    });
  });
};

// 获取失业金数据
const getData = async (params?: any) => {
  params = {
    ...params,
    ...pager.value,
    checkoperators: selectedOp.value,
  };
  if (checked.value == false) {
    params.alreadydelete = 1;
  } else {
    params.alreadydelete = null;
  }
  if (reviewChecked.value == true) {
    params.verification = '0';
  } else {
    params.verification = null;
  }
  if (monthSelect.value) {
    params = {
      ...params,
      monthSelect: getMonthRange(monthSelect.value),
    };
  }
  return await api.getUnempVeriData(params).then((res: any) => {
    exportData.value = res.rows;
    pager.value = res.page;
    count.value = pager.value.total;
    dataSource.value = res.rows;
  });
};
const getCorrectTime = (date: string) => {
  const originalDate = new Date(date);
  const updatedDate = new Date(originalDate.getTime() + 8 * 60 * 60 * 1000).toISOString();
  return [updatedDate.slice(0, 10), updatedDate.slice(11, 19)];
};

const deleteData = async (id: number) => {
  await api.updateUnempVeriData({ id: id, alreadydelete: 2 }).then((res: any) => {
    getData();
  });
};
const reviewData = async (id: number) => {
  await api
    .updateUnempVeriData({ id: id, reviewoperator: userInfo.username, verification: '1' })
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

const showEditModal = (record) => {
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
      message.info('数据格式错误，无法提交=>', error);
    });

  getData();
};
const handleEditOk = () => {
  editFormRef.value
    .onSubmit()
    .then((res: any) => {
      // message.info(res)
      getData();
      editOpen.value = false;
    })
    .catch((error) => {
      message.info('数据格式错误，无法提交=>', error);
    });

  getData();
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
    title: '姓名',
    dataIndex: 'personName',
    key: 'personName',
  },
  {
    title: '身份证号',
    dataIndex: 'personID',
    key: 'personID',
  },
  {
    title: '街镇',
    dataIndex: 'jiezhen',
    key: 'jiezhen',
  },
  {
    title: '初核',
    dataIndex: 'checkoperator',
    key: 'checkoperator',
  },
  // {
  //   title: '初核备注',
  //   dataIndex: 'checknote',
  //   key: 'checknote',
  // },
  {
    title: '创建时间',
    dataIndex: 'createtime',
    key: 'createtime',
  },
  {
    title: '复核人',
    dataIndex: 'reviewoperator',
    key: 'reviewoperator',
  },

  // {
  //   title: '复核备注',
  //   dataIndex: 'reviewnote',
  //   key: 'reviewnote',
  // },
  {
    title: '操作',
    // dataIndex: 'action',
    key: 'action',
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
