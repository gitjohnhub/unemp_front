<template>
  <!-- form -->
  <a-form :model="xiechaForm" ref="xiechaFormRef" name="xiechaForm">
    <a-row :gutter="48">
      <a-col :span="12">
        <a-form-item label="姓名">
          <a-input v-model:value="xiechaForm.personName" placeholder="姓名"> </a-input>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="身份证号">
          <a-input v-model:value="xiechaForm.personID" placeholder="身份证号"> </a-input>
        </a-form-item>
      </a-col>
    </a-row>
    <!-- Form文本 -->

    <!-- 参保信息 -->
    <a-row :gutter="48">
      <a-col :span="12">
        <a-space
          v-for="(canbaoItem, index) in dynamicValidateForm.canbaoInfo"
          :key="canbaoItem.id"
          style="display: flex; margin-bottom: 8px"
          align="baseline"
        >
          <a-form-item>
            <a-input v-model:value="canbaoItem.company" placeholder="参保单位" />
          </a-form-item>
          <a-form-item>
            <a-input v-model:value="canbaoItem.canbaoTime" placeholder="参保时间" />
          </a-form-item>
          <MinusCircleOutlined @click="removeCanbao(canbaoItem)" />
        </a-space>
        <a-form-item>
          <a-button type="dashed" block @click="addCanbao">
            <PlusOutlined />
            增加参保信息
          </a-button>
        </a-form-item>
      </a-col>

      <a-col :span="12">
        <a-space
          v-for="(shiyeItem, index) in dynamicShiyeValidateForm.shiyeInfo"
          :key="shiyeItem.id"
          style="display: flex; margin-bottom: 8px"
          align="baseline"
        >
          <a-form-item>
            <a-input v-model:value="shiyeItem.shiyeCategory" placeholder="失业保险类别" />
          </a-form-item>
          <a-form-item>
            <a-input v-model:value="shiyeItem.shiyeTime" placeholder="失业保险时间" />
          </a-form-item>
          <MinusCircleOutlined @click="removeShiye(shiyeItem)" />
        </a-space>
        <a-form-item>
          <a-button type="dashed" block @click="addShiye">
            <PlusOutlined />
            增加失业信息
          </a-button>
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Form Button -->
    <a-form-item>
      <a-button
        type="primary"
        block
        @click="handleAdd"
        :disabled="xiechaForm.personID.length === 0"
      >
        增加
      </a-button>
    </a-form-item>
  </a-form>
  <!-- table -->
  <a-table :columns="columns" :data-source="dataSource">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'personID'">
        <a-typography-paragraph copyable keyboard>{{ record.personID }}</a-typography-paragraph>
      </template>
      <template v-if="column.key === 'action'">
        <span>
          <a-button type="primary" style="inline" @click="editColumn(record)">编辑</a-button>
        </span>
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { ref, onBeforeMount } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import api from '../../api/index';
import { Xiecha } from '../../types/index';
onBeforeMount(() => {
  // getData();
});
const xiechaFormRef = ref<FormInstance>();
const dataSource = ref();
// 失业信息动态表单
const dynamicShiyeValidateForm = ref({
  shiyeInfo: [],
});
const removeShiye = (item: any) => {
  const index = dynamicShiyeValidateForm.value.shiyeInfo.indexOf(item);
  if (index !== -1) {
    dynamicShiyeValidateForm.value.shiyeInfo.splice(index, 1);
  }
  console.log(dynamicShiyeValidateForm.value);
};
const addShiye = () => {
  dynamicShiyeValidateForm.value.shiyeInfo.push({
    shiyeCategory: '',
    shiyeTime: '',
    id: Date.now(),
  });
  console.log(dynamicShiyeValidateForm.value);
};

// 参保信息动态表单
const dynamicValidateForm = ref({
  canbaoInfo: [],
});

const removeCanbao = (item: any) => {
  const index = dynamicValidateForm.value.canbaoInfo.indexOf(item);
  if (index !== -1) {
    dynamicValidateForm.value.canbaoInfo.splice(index, 1);
  }
  console.log(dynamicValidateForm.value);
};
const addCanbao = () => {
  dynamicValidateForm.value.canbaoInfo.push({
    company: '',
    canbaoTime: '',
    id: Date.now(),
  });
  console.log(dynamicValidateForm.value);
};

const xiechaForm = ref<Xiecha>({
  personID: '',
  personName: '',
  canbaoInfo: {},
  shiyeInfo: {},
});
const getData = async () => {
  await api.getXiechaData().then((res: any) => {
    console.log('generalWindowContact=>', res);
    dataSource.value = res;
  });
};
const handleAdd = async () => {
  xiechaForm.value.canbaoInfo = dynamicValidateForm.value;
  xiechaForm.value.shiyeInfo = dynamicShiyeValidateForm.value;
  console.log('xiechaForm====>', xiechaForm.value);
  // await api.addXiechaData(xiechaForm.value).then((res) => {
  //   message.info(`${res}`);
  // });
  // getData();
};
//弹出框编辑用户权限模块
const editForm = ref();
const modalText = ref<string>('Content of the modal');
const visible = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);

const showModal = (record: Xiecha) => {
  editForm.value = record;
  visible.value = true;
};

const handleOk = async () => {
  modalText.value = 'The modal will be closed after two seconds';
  confirmLoading.value = true;
  console.log(editForm.value);
  await api.updateXiechaData(editForm.value).then(() => {
    visible.value = false;
    message.info('提交成功');
    confirmLoading.value = false;
    getData();
  });
};
const editColumn = (record: Xiecha) => {
  showModal(record);
};
const columns_original = [
  { key: 'personID', title: '身份证号' },
  { key: 'personName', title: '姓名' },
  { key: 'canbaoInfo', title: '参保信息' },
  { key: 'unempInfo', title: '失业金信息' },
];
const columns = columns_original.map((item) => {
  if (item.key === 'canbaoInfo') {
    return {
      key: item.key,
      dataIndex: item.key,
      title: item.title,
    };
  } else {
    return {
      key: item.key,
      dataIndex: item.key,
      title: item.title,
    };
  }
});
</script>
<style></style>
