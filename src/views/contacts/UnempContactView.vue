<template>
  <a-form :model="formState" name="horizontal_login" layout="inline" autocomplete="off" @finish="onFinish"
    @finishFailed="onFinishFailed">
    <a-form-item label="联系人" name="contactPerson"
      :rules="[{ required: true, message: 'Please input your contactPerson!' }]">
      <a-input v-model:value="formState.contactPerson"> </a-input>
    </a-form-item>

    <a-form-item label="联系电话" name="phoneNum" :rules="[{ required: true, message: 'Please input your phoneNum!' }]">
      <a-input v-model:value="formState.phoneNum"> </a-input>
    </a-form-item>
    <a-form-item label="地址">
      <a-input v-model:value="formState.address"> </a-input>
    </a-form-item>
    <a-form-item label="手机号">
      <a-input v-model:value="formState.mobileNum"> </a-input>
    </a-form-item>
    <a-form-item label="所属">
      <a-radio-group v-model:value="formState.belong">
        <a-radio value="街镇">街镇</a-radio>
        <a-radio value="中心">中心</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="所属名称">
      <a-select v-model:value="formState.title" placeholder="please select your zone" :options="titles">
      </a-select>
    </a-form-item>
    <a-form-item label="是否对外">
      <a-radio-group v-model:value="formState.isPublic">
        <a-radio value="1">对外</a-radio>
        <a-radio value="0">不对外</a-radio>
      </a-radio-group>
    </a-form-item>

    <a-form-item>
      <a-button @click="onSubmit" type="primary">提交</a-button>
    </a-form-item>
  </a-form>
  <a-input-search v-model:value="searchValue" placeholder="查询" style="width: 200px" @search="onSearch" />
  <a-segmented v-model:value="selectBelong" :options="belongs" />
  <a-table :columns="columns" :data-source="dataSource" bordered @change="handleChange" @showSizeChange="onShowSizeChange"
    :pagination="pagination">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'isPublic'">
        <a-tag>{{ record.isPublic == '1' ? '对外' :''}}</a-tag>
      </template>
    </template>
    <template #title>通讯录</template>
  </a-table>
</template>
<script lang="ts" setup>
import { ref, onBeforeMount, computed } from 'vue';
import { message } from 'ant-design-vue'
import api from '@/api';
import { jiezhens } from '@/types'
onBeforeMount(() => {
  getData();
});
// 分页
const pager = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});
//
const selectBelong = ref()
const belongs = ['jiezhen','']
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

// 表单
const formState = ref({
  title: '江桥镇',
  contactPerson: '',
  phoneNum: '',
  address: '',
  belong: '',
  mobileNum: '',
  isPublic: '1',
});
const searchValue = ref()
const onSearch = () => {
  pager.value.current = 1;
  getData()
    .then((res) => {
      console.log(res);
    })
    .catch((e) => {
      console.log(e);
      message.info('查询错误，联系管理员');
    });
};
const titles = jiezhens.map(item => {
  return {
    value: item.value,
    index: item.value
  }
})
const onFinish = (values: any) => {
  console.log('Success:', values);
};
const onSubmit = () => {
  api
    .addContactData(formState.value)
    .then(() => {
      console.log('success');
      getData();
    })
    .catch((e) => {
      console.log(e);
    });
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};
const disabled = computed(() => {
  return !(formState.value.contactPerson && formState.value.phoneNum);
});

const dataSource = ref();

const form = ref();
const count = ref();
// 获取失业金数据
const getData = async (params?: any) => {
  params = {
    ...params,
    ...pager.value,
  };
  if (selectBelong){
    params.belong = selectBelong.value
  }
  if (searchValue.value !== undefined && searchValue.value !== '') {
    params.belong = null
    params.searchValue = searchValue.value
  }
  return await api.getContactData(params).then((res: any) => {
    pager.value = res.page;
    count.value = pager.value.total;
    dataSource.value = res.rows;
  });
};

const columns = [
  {
    title: 'id',
    id: 'id',
    dataIndex: 'id',
  },
  {
    title: '部门',
    dataIndex: 'title',
  },
  {
    title: '联系人',
    dataIndex: 'contactPerson',
  },
  {
    title: '所属',
    dataIndex: 'belong',
  },
  {
    title: '座机',
    dataIndex: 'phoneNum',
  },
  {
    title: '地址',
    dataIndex: 'address',
  },
  {
    title: '手机',
    dataIndex: 'mobileNum',
  },
  {
    title: '是否公开',
    dataIndex: 'isPublic',
  },
];
</script>
<style scoped>
th.column-money,
td.column-money {
  text-align: right !important;
}
</style>
