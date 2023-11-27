<template>
  <div>
    <div class="table-operations">
      <a-space direction="vertical">
        <a-row>
          <a-space>
            <a-button @click="showAddDataModal" type="primary"><PlusCircleOutlined />添加</a-button>
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
            <a-input-search
              v-model:value="searchValue"
              placeholder="输入身份证号查询"
              style="width: 200px"
              @search="onSearch"
            />
          </a-space>
        </a-row>
        <a-row>
          <a-space>
            <a-range-picker v-model:value="monthSelect" />
            <a-button @click="exportExcel" type="primary"> <FileExcelOutlined />导出</a-button>
            <a-switch v-model:checked="isIncludeCheckData"></a-switch>是否包含初核
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
                  @search="onSubmitNote(record.id, record.checknote)"
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
          <template v-if="column.key === 'action'">
            <a-space direction="vertical">
              <a-row>
                <a-space>
                  <a-button
                    @click="reviewData(record.id)"
                    v-if="record.verification == '0' && record.checkoperator !== userInfo.username"
                    type="primary"
                    ><CheckOutlined
                  /></a-button>
                  <a-button @click="showEditModal(record)"><EditOutlined /></a-button>

                  <a-button
                    @click="chuheData(record.id)"
                    v-if="record.verification == '2'"
                    type="primary"
                    ><RedoOutlined /></a-button
                  >
                  <a-tooltip title="删除">
                  <a-button
                    danger
                    @click="deleteData(record.id)"
                    type="primary"
                    :disabled="record.verification == '3' ? true : false"
                    ><DeleteOutlined
                  /></a-button></a-tooltip>
                  <!-- 编辑模态框 -->
                  <a-modal
                    v-model:visible="record.editVisible"
                    @ok="handleEditOk"
                    @cancel="handleEditCancel"
                  >
                    <a-form :model="editForm">
                      <a-form-item label="身份证号" name="personID" has-feedback>
                        <a-input v-model:value="editForm.personID">

                        </a-input>
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
                    @search="onSubmitRNote(record.id, record.reviewnote)"
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
import ApplyAddFormView from './ApplyAddFormView.vue';
import { computed, ref, onBeforeMount, watch } from 'vue';
import { message } from 'ant-design-vue';
import { FileExcelOutlined, CheckOutlined, DeleteOutlined, EditOutlined,PlusCircleOutlined,RedoOutlined } from '@ant-design/icons-vue';
import api from '@/api';
import { pinyin } from 'pinyin-pro';
import { genWorkbook, downloadLink } from '@/utils/util';
import { Dayjs } from 'dayjs';
import { useUserStore } from '@/stores';
import 'dayjs/locale/zh-cn';
import { colorList } from '@/utils/util';
import { editDataItem, jiezhens } from '@/types';

const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const monthSelect = ref<Dayjs[]>();
const selectedOp = ref<string[]>([]);
const count = ref<number>();
const reviewChecked = ref('0');
const exportData = ref();
const isIncludeCheckData = ref(false)
const verifications = ['已初核', '已复核', '待初核', '已删除', '全部'];
// 搜索相关
const searchValue = ref();
const spinning = ref<boolean>(false);
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
const getColors = (user) => {
  return colorList[userStore.checkoperators.map((item) => item.value).indexOf(user)];
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
  () => monthSelect.value,
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
const onSubmitNote = (id, note) => {
  api
    .updateUnempVeriData({ id: id, checknote: note })
    .then((res) => {
      getData();
      message.info('修改备注成功');
    })
    .catch((e) => {
      console.log(e);
      message.info('修改备注失败，请联系管理员');
    });
};

// 提交复核备注
const onSubmitRNote = (id, note) => {
  api
    .updateUnempVeriData({ id: id, reviewnote: note })
    .then((res) => {
      console.log(res);
      getData();
      message.info('添加复核备注成功');
    })
    .catch((e) => {
      console.log(e);
      message.info('添加复核备注失败，请联系管理员');
    });
};
//数据导出功能
const exportExcel = () => {
  getData({ noindex: 1,isIncludeCheckData:isIncludeCheckData.value ? 1 : 0 }).then(() => {
    const headersWithWidth = [
      { header: '序号', width: 10 },
      { header: '姓名', width: 12 },
      { header: '身份证', width: 25 },
      { header: '街镇', width: 25 },
      { header: '是否初核', width: 25 },
      { header: '提交时间', width: 35 },
    ];
    const { workbook, headers, worksheet } = genWorkbook(headersWithWidth);
    // worksheet.addRow(headers);
    exportData.value.map((item, index) => {
      worksheet.addRow([
        index + 1,
        item.personName,
        item.personID,
        item.jiezhen,
        item.verification == '0' ? '已初核':'已复核',
        item.createtime.slice(0, 10),
      ]);
    });
    worksheet.eachRow((row, rowNumber) => {
      row.font = { size: 15 };
      row.height = 20;
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
    });
    worksheet.getRow(1).font = { size: 18, bold: true };

    // 导出 Excel 文件
    if (monthSelect.value) {
      downloadLink(workbook, `失业金申领_${monthSelect.value[1].format('YYYY-MM-DD')}`);
    } else {
      downloadLink(workbook, `失业金申领_${new Date().toISOString().slice(0, 10)}`);
    }
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
  userStore.getUsers();
  if (userInfo.checkObject) {
    selectedOp.value = [...userInfo.checkObject.split(','), userInfo.username];
  }
  getData();
});

// 获取用户数据，构造用户选择列表
// const getUsers = async (params?: any) => {
//   await api.getUsers(params).then((res: any) => {
//     console.log('users=====>', res);
//     checkoperators.value = res.rows.map((userInfo) => {
//       return { value: userInfo.userName };
//     });
//     userColors.value = res.rows.map((userInfo, index) => {
//       return {
//         username: userInfo.userName,
//         color: colors[index],
//       };
//     });
//   });
// };

// 获取失业金数据
const getData = async (params?: any) => {
  spinning.value = true;
  params = {
    ...params,
    ...pager.value,
    checkoperators: selectedOp.value,
  };

  if (reviewChecked.value !== '4') {
    params.verification = reviewChecked.value;
  } else {
    params.verification = null;
  }
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
    console.log(params);
  }

  if (searchValue.value !== undefined && searchValue.value !== '') {
    console.log('searchValue===>', searchValue.value);
    params = {
      searchValue: searchValue.value,
      ...pager.value,
    };
    console.log('params===>', params);
  }
  return await api
    .getUnempVeriData(params)
    .then((res: any) => {
      console.log(res);
      exportData.value = res.rows;
      pager.value = res.page;
      count.value = pager.value.total;
      dataSource.value = res.rows;
    })
    .then(() => {
      spinning.value = false;
    });
};
const getCorrectTime = (date: string) => {
  const originalDate = new Date(date);
  const updatedDate = new Date(originalDate.getTime() + 8 * 60 * 60 * 1000).toISOString();
  return [updatedDate.slice(0, 10), updatedDate.slice(11, 19)];
};

const deleteData = async (id: number) => {
  await api.updateUnempVeriData({ id: id, verification: '3' }).then((res: any) => {
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
const chuheData = async (id: number) => {
  await api.updateUnempVeriData({ id: id, verification: '0' }).then((res: any) => {
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
      message.info('数据格式错误，无法提交=>', error);
    });

  getData();
};
const handleEditOk = () => {
  api
    .updateUnempVeriData(editForm.value)
    .then((res: any) => {
      message.info('修改成功');
      editOpen.value = false;
      getData();
    })
    .catch((error) => {
      message.info('数据格式错误，无法提交=>', error);
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
    title: '姓名',
    dataIndex: 'personName',
    key: 'personName',
  },
  {
    title: '身份证号',
    dataIndex: 'personID',
    key: 'personID',
  },
  // {
  //   title: '街镇',
  //   dataIndex: 'jiezhen',
  //   key: 'jiezhen',
  // },
  {
    title: '初核',
    dataIndex: 'checkoperator',
    key: 'checkoperator',
  },
  {
    title: '复核',
    dataIndex: 'reviewoperator',
    key: 'reviewoperator',
  },
  // {
  //   title: '初核备注',
  //   dataIndex: 'checknote',
  //   key: 'checknote',
  // },
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
  {
    title: '创建时间',
    dataIndex: 'createtime',
    key: 'createtime',
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
