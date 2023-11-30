<template>
  <!-- 数字识别 -->
  <a-card>
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="false"
      :max-count="1"
      :customRequest="customRequest"
      @remove="handleRemove"
      list-type="picture-card"
      @preview="handlePreview"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text">插入图片自动识别单位和工作经历时间</p>
      <p class="ant-upload-hint">支持图片格式的文件</p>
    </a-upload-dragger>
    <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </a-card>
  <!-- form -->
  <a-form :model="xiechaForm" ref="xiechaFormRef" name="xiechaForm">
    <a-row :gutter="48">
      <a-col :span="12">
        <a-form-item label="身份证号">
          <a-input v-model:value="xiechaForm.personID" placeholder="身份证号"> </a-input>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="姓名">
          <a-input v-model:value="xiechaForm.personName" placeholder="姓名"> </a-input>
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
          v-for="(shiyeItem, index) in dynamicShiyeValidateForm.unempInfo"
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
  <a-row>
    <a-space>
      <a-tag color="#32D0BD">{{ state.selectedRowKeys.length }}/{{ count }}</a-tag>
      <a-input v-model:value="filename" placeholder="输出的文件名" />

      <XiechaExcelView :excelData="selectedRows" :filename="filename"></XiechaExcelView>
    </a-space>
  </a-row>

  <a-table
    :style="{ fontSize: '16px' }"
    :columns="columns"
    :data-source="dataSource"
    rowKey="id"
    @change="handleChange"
    @showSizeChange="onShowSizeChange"
    :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
    :pagination="pagination"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'personID'">
        <a-typography-paragraph copyable keyboard>{{ record.personID }}</a-typography-paragraph>
      </template>
      <template v-if="column.key === 'canbaoInfo'">
        <a-typography-paragraph copyable>{{ handleInfo(record)[0] }}</a-typography-paragraph>
      </template>
      <template v-if="column.key === 'unempInfo'">
        <a-typography-paragraph copyable>{{ handleInfo(record)[1] }}</a-typography-paragraph>
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
import { MinusCircleOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons-vue';
import { ref, reactive, onBeforeMount, computed } from 'vue';
import { handleTesseract } from '@/utils/util';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import api from '../../api/index';
import { Xiecha } from '../../types/index';
import XiechaExcelView from '@/components/XiechaExcelView.vue';
import type { UploadProps } from 'ant-design-vue';

onBeforeMount(() => {
  getData();
});
const count = ref<number>();
const xiechaFormRef = ref<FormInstance>();
const dataSource = ref();
const selectedRows = ref();
// table select 功能
type Key = string | number;
const state = reactive({
  selectedRowKeys: [], // Check here to configure the default column
});
const filename = ref();
const hasSelected = computed(() => state.selectedRowKeys.length > 0);
const onSelectChange = (selectedRowKeys: Key[]) => {
  selectedRows.value = dataSource.value.filter((item) => selectedRowKeys.includes(item.id));
  console.log('selectedRows=====>: ', selectedRows.value);
  state.selectedRowKeys = selectedRowKeys;
};

// 失业信息动态表单
const dynamicShiyeValidateForm = ref({
  unempInfo: [],
});
const removeShiye = (item: any) => {
  const index = dynamicShiyeValidateForm.value.unempInfo.indexOf(item);
  if (index !== -1) {
    dynamicShiyeValidateForm.value.unempInfo.splice(index, 1);
  }
};
const addShiye = () => {
  dynamicShiyeValidateForm.value.unempInfo.push({
    shiyeCategory: '',
    shiyeTime: '',
    id: Date.now(),
  });
};

// 分页
const pager = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const handleChange = async (page: any) => {
  console.log('change');
  pager.value = page;
  console.log('change==>', pager.value);
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

const handleInfo = (record: any) => {
  // const canbaoInfo = JSON.parse(record.canbaoInfo)
  // const unempInfo = JSON.parse(record.unempInfo)
  return [
    record.canbaoInfo.map((item) => `${item.company} ${item.canbaoTime}`).join(', '),
    record.unempInfo.map((item) => `${item.shiyeCategory} ${item.shiyeTime}`).join(', '),
  ];
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
};
const addCanbao = () => {
  dynamicValidateForm.value.canbaoInfo.push({
    company: '',
    canbaoTime: '',
    id: Date.now(),
  });
};

const xiechaForm = ref<Xiecha>({
  personID: '',
  personName: '',
  canbaoInfo: {},
  unempInfo: {},
});
const getData = async (params?: any) => {
  params = {
    ...params,
    ...pager.value,
  };
  await api.getXiechaData(params).then((res: any) => {
    dataSource.value = res.rows.map((item) => {
      if (typeof item.canbaoInfo === 'string') {
        item.canbaoInfo = JSON.parse(item.canbaoInfo);
        item.unempInfo = JSON.parse(item.unempInfo);
        return item;
      } else {
        return item;
      }
    });
    pager.value = res.page;
    count.value = pager.value.total;
  });
};
const handleAdd = async () => {
  xiechaForm.value.canbaoInfo = dynamicValidateForm.value.canbaoInfo;
  xiechaForm.value.unempInfo = dynamicShiyeValidateForm.value.unempInfo;
  await api.addXiechaData(xiechaForm.value).then((res) => {
    message.info(`${res}`);
  });
  getData();
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
  { key: 'id', title: 'ID' },
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
//文字识别相关
const fileList = ref([]);
const customRequest = (options: any) => {
  const { onProgress, onError, onSuccess, file } = options;
  handleTesseract(file, handleResult)
    .then((result: any) => {
      console.log('result==>', result);
      onProgress({ percent: 100 });
      onSuccess(result);
    })
    .catch((e) => {
      onError(e);
    });
};
const handleRemove = (file: File) => {
  const index = fileList.value!.indexOf(file);
  const newFileList = fileList.value.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
};
const handleResult = (result: string) => {
  console.log(result);
  return processInputString(result);
};
function processInputString(inputString) {
  // 去掉中文中的空格
  let cleanedString = inputString
    .replace(/[\u4e00-\u9fa5]/g, (char) => char + ' ')
    .replace(/[。 ]+/g, ' ');
  console.log('cleanedString===>', cleanedString);
  let then_cleanedString = cleanedString.replace(/[\u4e00-\u9fa5]/g, (match) =>
    match.replace(/\s/g, '')
  );

  // 使用正则表达式提取公司名称和日期
  let regex = /([^\d]+) (\d{4}-\d{2}-\d{2}) (\d{4}-\d{2}-\d{2})/g;
  let match;
  let result = [];

  while ((match = regex.exec(then_cleanedString)) !== null) {
    let title = match[1];
    let dateC = [match[2], match[3]];
    let then_title = title
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[\s\u3000]+/g, '');
    console.log(then_title, dateC);
    dynamicValidateForm.value.canbaoInfo.push({
      company: then_title,
      canbaoTime: `${match[2].replace(/-/g, '')}-${match[3].replace(/-/g, '')}`,
      id: Date.now(),
    });
    result.push({ then_title, dateC });
  }

  return result;
}

// 文件预览
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
</script>
<style></style>
