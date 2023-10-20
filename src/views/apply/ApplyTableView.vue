<template>
  <div>
    <div class="table-operations">
      <a-button @click="setAgeSort">Sort age</a-button>
      <a-button @click="clearFilters">Clear filters</a-button>
      <a-button @click="clearAll">Clear filters and sorters</a-button>
    </div>
    <a-table :columns="columns" :data-source="dataSource" @change="handleChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'personID'">
            <a-typography-paragraph copyable keyboard>{{ record.personID }}</a-typography-paragraph>
        </template>
        <template v-if="column.key === 'checkoperator'">
          <a-tag>
            {{ record.checkoperator }}
          </a-tag>
        </template>
        <template v-if="column.key === 'createtime'">
          <a-tooltip :title="record.createtime.slice(11, 19)" color="#f50">
            <a-tag> {{ record.createtime.slice(0, 10) }}</a-tag>
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
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onBeforeMount } from 'vue';
import type { TableColumnType, TableProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import api from '@/api';
interface DataItem {
  id: number;
  personName: string;
  personID: string;
  address: string;
  checkoperator: string;
  checknote: string;
  createtime: string;
  reviewoperator: string;
  reviewnote: string;
  // verification:string;
  alreadydelete: number;
}

const dataSource = ref();
const pager = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

onBeforeMount(() => {
  getData();
});
const onCopy = () => {
  message.info('复制成功');
};
const getData = async () => {
  await api.getUnempVeriData(pager.value).then((res: any) => {
    pager.value.pageNum = res.page.pageNum;
    pager.value.pageSize = res.page.pageSize;
    pager.value.total = res.page.total;
    console.log('data=>', res.rows);
    dataSource.value = res.rows;
  });
};

const deleteData = async (id:number) => {
  await api.deleteUnempVeriData({id:id}).then((res: any) => {
    getData()
  });
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

const handleChange: TableProps['onChange'] = (pagination, filters, sorter) => {
  console.log('Various parameters', pagination, filters, sorter);
  filteredInfo.value = filters;
  sortedInfo.value = sorter;
};
const clearFilters = () => {
  filteredInfo.value = null;
};
const clearAll = () => {
  filteredInfo.value = null;
  sortedInfo.value = null;
};
const setAgeSort = () => {
  sortedInfo.value = {
    order: 'descend',
    columnKey: 'age',
  };
};
</script>
<style scoped>
.table-operations {
  margin-bottom: 16px;
}

.table-operations > button {
  margin-right: 8px;
}
</style>
