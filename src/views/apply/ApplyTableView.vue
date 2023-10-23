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


    <a-tag color="#108ee9">{{ count }}</a-tag>
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
          <a-typography-paragraph copyable keyboard>{{ record.personID }}</a-typography-paragraph>
        </template>
        <template v-if="column.key === 'personName'">
          <a-tooltip :title="pinyin(record.personName)" color="#f50">
            <a-typography-paragraph copyable>{{ record.personName }}</a-typography-paragraph>
          </a-tooltip>
        </template>
        <template v-if="column.key === 'checkoperator'">
          <a-tag>
            {{ record.checkoperator }}
          </a-tag>
        </template>
        <template v-if="column.key === 'createtime'">
          <a-tooltip :title="getCorrectTime(record.createtime)[1]" color="#f50">
            <a-tag> {{getCorrectTime(record.createtime)[0]}}</a-tag>
          </a-tooltip>
        </template>
        <template v-if="column.key === 'alreadydelete'">
          <a-tag :color="record.alreadydelete == 1 ? 'success' : 'error'">
            {{ record.alreadydelete == 1 ? '存在' : '已删除' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button danger @click="deleteData(record.id)">删除</a-button>
            <a-button type="primary">编辑</a-button>
            <a-button >复核</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onBeforeMount,watch } from 'vue';
import { message } from 'ant-design-vue';
import api from '@/api';
import { pinyin } from 'pinyin-pro';
import ApplyFormView from './ApplyFormView.vue';
import { DataItem } from '@/types';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
const dataSource = ref();
const monthSelect = ref<Dayjs>()
const checkoperators = ref<{ value: string }>();
const selectedOp = ref<string[]>([]);
const count = ref<number>()
watch(() => selectedOp.value, (newValue) => {
  getData()
})
watch(() => monthSelect.value, (newValue) => {
  // console.log(newValue.format('YYYY-MM-DD HH:mm:ss'))
  getData()
})
// 通过月份获得月尾和月头的日期
function getMonthRange(monthSelect) {
  const firstDay = monthSelect.startOf('month').format('YYYY-MM-DD')
  const lastDay = monthSelect.endOf('month').format('YYYY-MM-DD')
  return [firstDay, lastDay]
}

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
});

// 获取用户数据，构造用户选择列表
const getUsers = async (params?: any) => {
  await api.getUsers(params).then((res: any) => {
    checkoperators.value = res.rows.map(userInfo => ({value:userInfo.userName}));
    console.log('checkop=>', checkoperators.value);
  });
};

// 获取失业金数据
const getData = async (params?: any) => {
  params = {
    ...params,
    ...pager.value,
    checkoperators:selectedOp.value,
  }
  if (monthSelect.value){
    params = {
      ...params,
      monthSelect:getMonthRange(monthSelect.value),
    }
  }
  console.log("params=>",params)
  await api.getUnempVeriData(params).then((res: any) => {
    pager.value = res.page;
    count.value = pager.value.total;
    console.log('res.pager.value=>', res);
    dataSource.value = res.rows;

  });
};
const getCorrectTime = (date:string)=>{
    const originalDate = new Date(date);
    const updatedDate = new Date(originalDate.getTime() + 8 * 60 * 60 * 1000).toISOString();
    return [updatedDate.slice(0,10),updatedDate.slice(11,19)]
}

const deleteData = async (id: number) => {
  await api.deleteUnempVeriData({ id: id }).then((res: any) => {
    getData();
  });
};

// 增加数据弹窗
const formRef = ref(null);
const open = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const showAddDataModal = async () => {
  open.value = true;
};
const handleOk = () => {
  formRef.value
    .onSubmit()
    .then(() => {
      confirmLoading.value = true;
      getData()
      open.value = false;
      confirmLoading.value = false;
    })
    .catch(error => {
      console.log('error=>',error)
      message.info('数据格式错误，无法提交=>',error);
    });

  getData();
};
const handleCancel = () => {
  formRef.value.resetForm();
};
const filteredInfo = ref();
const sortedInfo = ref();
type DataItemKey = keyof DataItem;
const dummyData: DataItem = {} as DataItem;
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
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
    title: '初核',
    dataIndex: 'checkoperator',
    key: 'checkoperator',
  },
  {
    title: '初核备注',
    dataIndex: 'checknote',
    key: 'checknote',
  },
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
  {
    title: '复核备注',
    dataIndex: 'reviewnote',
    key: 'reviewnote',
  },
  {
    title: '已删除',
    dataIndex: 'alreadydelete',
    key: 'alreadydelete',
  },
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
.table-operations {
  margin-bottom: 16px;
}

.table-operations > button {
  margin-right: 8px;
}
</style>
