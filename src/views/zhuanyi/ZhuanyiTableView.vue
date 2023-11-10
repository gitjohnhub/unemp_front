<template>
  <div>
    <div class="table-operations">
      <a-space direction="vertical">
        <a-row>
          <a-space>
            <a-button @click="showAddDataModal" type="primary">添加</a-button>
            <a-modal
              v-model:open="open"
              title="Title"
              :confirm-loading="confirmLoading"
              @ok="handleOk"
              @cancel="handleCancel"
            >
              <ZhuanyiAddFormView ref="formRef" />
            </a-modal>
            <a-tag color="#108ee9">{{ count }}</a-tag>
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
            <h5>复核支付操作：</h5>
            <a-date-picker v-model:value="payDate">
              <template #suffixIcon>
                <div>支付日期</div>
              </template>
            </a-date-picker>
            <a-checkbox v-model:checked="checked">显示删除</a-checkbox>
          </a-space>
        </a-row>
        <a-row>
          <!-- 数据导出操作 -->

          <a-space>
            <h5>导出操作：</h5>
            <a-date-picker v-model:value="monthSelect" />
            <a-radio-group v-model:value="status">
              <a-radio-button v-for="(status, index) in statusList" :value="index">{{
                status
              }}</a-radio-button>
            </a-radio-group>
            <a-button @click="exportExcel" type="primary" style="background-color: #1e1e1e">
              导出Excel
            </a-button>
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
              :class="{ deleted: record.isDeleted == 0 }"
              >{{ record.personID }}</a-typography-paragraph
            >
          </template>
          <template v-if="column.key === 'personName'">
            <a-space direction="vertical">
              <a-tooltip :title="pinyin(record.personName)" color="#f50">
                <a-typography-paragraph
                  :style="{ fontSize: '18px' }"
                  copyable
                  :class="{ deleted: record.isDeleted == 2 }"
                  >{{ record.personName }}</a-typography-paragraph
                >
              </a-tooltip>
            </a-space>
          </template>
          <template v-if="column.key === 'isOnlyTransferRelation'">
            <a-space direction="vertical">
              <a-row>
                <a-tag
                :color="record.isOnlyTransferRelation == '只转关系' ? colorList[5] : colorList[0]"
                >{{ record.isOnlyTransferRelation }}</a-tag
              >
              <a-tag>{{ record.payMonth }}</a-tag>
              </a-row>


              <a-tag>{{ record.fromArea }}</a-tag>
            </a-space>
          </template>
          <template v-if="column.key === 'checkoperator'">
            <a-space direction="vertical">
              <a-row>
                <a-tag>
                  {{ record.checkoperator }}
                </a-tag>
                <a-tag
                  :color="getColors(record.reviewoperator)"
                  v-if="record.reviewoperator != null"
                >
                  {{ record.reviewoperator }}
                </a-tag>
              </a-row>
              <a-tooltip :title="record.note" color="#f50">
                <a-input-search
                  v-model:value="record.note"
                  placeholder="初核备注"
                  size="medium"
                  @search="onSubmitNote(record.id, record.note)"
                >
                  <template #enterButton>
                    <a-button type="dashed">修改备注</a-button>
                  </template>
                </a-input-search>
              </a-tooltip>
            </a-space>

            <!-- <span v-html="`<br>${record.checknote}`"></span> -->
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="colorList[Number(record.status)]">
              {{ getStatus(record.status) }}
            </a-tag>
            <a-progress :percent="getProgress(record.status)" size="small" />

            <a-tag v-if="record.status !== '0' && record.status !== '1'"
              >支付日期：{{ record.payDate }}</a-tag
            >
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
                    type="primary"
                    v-if="record.status == '0'"
                    >复核</a-button
                  >
                  <a-button @click="payData(record.id)" type="primary" v-if="record.status == '1'"
                    >支付</a-button
                  >
                  <a-button
                    @click="paySuccess(record.id)"
                    type="primary"
                    v-if="record.status == '2'"
                    >支付成功</a-button
                  >

                  <a-button
                    danger
                    @click="deleteData(record.id)"
                    v-if="record.isDeleted == 1 ? true : false"
                    >删除</a-button
                  >
                </a-space>
              </a-row>

              <a-row>
                <a-space>
                  <a-button
                    @click="refuseData(record.id)"
                    v-if="record.status == '0' || record.status == '1'"
                    type="primary"
                    danger
                    >驳回</a-button
                  >
                  <a-button @click="cancelData(record.id)" type="primary" danger>取消</a-button>
                </a-space>
              </a-row>

              <!-- <a-button @click="showEditModal(record)">编辑</a-button> -->
              <!-- 编辑模态框 -->
              <a-modal
                v-model:visible="record.editVisible"
                @ok="handleEditOk"
                @cancel="handleEditCancel"
              >
                <ZhuanyiEditFormView :editForm="record" ref="editFormRef" />
              </a-modal>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onBeforeMount, watch } from 'vue';
import { message } from 'ant-design-vue';
import api from '@/api';
import { pinyin } from 'pinyin-pro';
import * as XLSX from 'xlsx';
import ZhuanyiAddFormView from './ZhuanyiAddFormView.vue';
import ZhuanyiEditFormView from './ZhuanyiEditFormView.vue';
import { Dayjs } from 'dayjs';
import { useUserStore } from '@/stores';
import { getMonthRange } from '@/utils/util';
import Excel from 'exceljs';
import 'dayjs/locale/zh-cn';
import { stat } from 'fs';
const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const monthSelect = ref<Dayjs>();
const payDate = ref<Dayjs>();
const selectedOp = ref<string[]>([]);
const count = ref<number>();
const checked = ref(false);
const reviewChecked = ref('0');
const exportData = ref();
const status = ref('0');
//加载数据动画
const spinning = ref<boolean>(false);

// 搜索相关
const searchValue = ref();
const statusList = ['已初核', '已复核', '支付中', '已支付', '已驳回', '已取消', '全部'];
const colorList = ['#25b1bf', '#acc2ef', '#3D5A80', '#2E8B57', '#c21d03', '#fd5732'];
const getStatus = (status: String) => {
  return statusList[Number(status)];
};
const getProgress = (status: String) => {
  const currentIndex = Number(status) + 1;
  // 状态总数
  const total = 4; // 不算 '全部'
  // 百分比进度
  const percent = (currentIndex / total) * 100;

  return percent; // 33.33
};
const onSearch = () => {
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
  const findColor = userStore.userColors.filter((u) => u.username === user);
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
  () => payDate.value,
  (newValue) => {
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
  () => status.value,
  (newValue) => {
    pager.value.current = 1;
    getData();
  }
);
watch(
  () => reviewChecked.value,
  (newValue) => {
    getData();
  }
);
// 提交备注
const onSubmitNote = (id, note) => {
  api
    .updateZhuanyiData({ id: id, note: note })
    .then((res) => {
      getData();
      message.info('修改备注成功');
    })
    .catch((e) => {
      console.log(e);
      message.info('修改备注失败，请联系管理员');
    });
};
//数据导出功能
const exportExcel = () => {
  checked.value = false;
  // 写入文件
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1 },
  });
  worksheet.columns = [
      { header: '序号', key: 'index', width: 5 },
      { header: '姓名', key: 'name', width: 10 },
      { header: '身份证', key: 'personID', width: 22 },
      { header: '转入省市', key: 'fromArea', width: 18 },
      { header: '转出日期', key: 'payDate', width: 12 },
      { header: '享受期限', key: 'month', width: 12 },
      { header: '核发标准', key: 'biaozhun', width: 34 },
      { header: '转出金额', key: 'pay', width: 15 },
    ];

  const headers = [
    '序号',
    '姓名',
    '身份证',
    '转入省市',
    '转出日期',
    '享受期限（月）',
    '核发标准',
    '转出金额',
  ];
  worksheet.addRow(headers);
  worksheet.mergeCells('A1:H1');
  worksheet.getCell('A1').value = '非上海户籍失业保险转移支付汇总表';
  worksheet.getRow(2).font = { size: 15, bold: true };
  worksheet.getRow(1).font = { size: 18, bold: true };


  getData({ noindex: 1, isOnlyTransferRelation: '转金额' }).then(() => {
    exportData.value.map((item, index) => {
      worksheet.addRow([
        index + 1,
        item.personName,
        item.personID,
        item.fromArea,
        item.payDate,
        item.payMonth,
        Number(item.payMonth) < 12 ? '2175.00/1-12月' : '2175.00/1-12月，1740.00/13-24月',
        CalPayMonth(item.payMonth),
      ]);
      // table.addRow([
      //   index + 1,
      //   item.personName,
      //   item.personID,
      //   item.fromArea,
      //   item.payDate,
      //   item.createtime,
      //   '2175.00/1-12月，1740.00/13-24月',
      //   100,
      // ])
      // table.commit()
    });
    worksheet.pageSetup.printArea = `A1:H${exportData.value.length + 3}`;
    console.log(`A1:H${exportData.value.length + 2}`);
    worksheet.addRow(['合计', '', '', '', '', '', '', '']);
    worksheet.addRow([
      '',
      '',
      `打印人:${userInfo.username}`,
      '',
      `${monthSelect.value!.format('YYYY-MM-DD')}`,
      '',
      '',
      '',
    ]);

    // 导出 Excel 文件
    workbook.xlsx.writeBuffer().then((buffer) => {
      // 将 buffer 下载为 Excel 文件
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'example.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  });
};
// 计算核发标准
const CalPayMonth = (payMonth)=>{
  if(payMonth){
    const numPayMonth = Number(payMonth)
    if(numPayMonth <= 12 ){
      return numPayMonth * 2175 * 1.5
    }else{
      return 12 * 2175 * 1.5 + (numPayMonth - 12 ) * 1740 * 1.5
    }
  }
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
  userStore.getUsers();
  if (userInfo.checkObject) {
    selectedOp.value = [...userInfo.checkObject.split(','), userInfo.username];
  }
  getData();
});
// 获取数据
const getData = async (params?: any) => {
  spinning.value = true;

  params = {
    ...params,
    ...pager.value,
    checkoperators: selectedOp.value,
  };

  if (checked.value == false) {
    params.isDeleted = 1;
  } else {
    params.isDeleted = 0;
  }
  if (status.value == '0') {
    params.status = '0';
  } else if (status.value == '1') {
    params.status = '1';
  } else if (status.value == '2') {
    params.status = '2';
  } else if (status.value == '3') {
    params.status = '3';
  } else if (status.value == '4') {
    params.status = '4';
  } else if (status.value == '5') {
    params.status = '5';
  } else {
    params.status = null;
  }
  if (reviewChecked.value == '0') {
    params.verification = '0';
  } else if (reviewChecked.value == '1') {
    params.verification = '1';
  } else {
    params.verification = null;
  }
  if (monthSelect.value) {
    params = {
      ...params,
      payDate: monthSelect.value.format('YYYY-MM-DD'),
    };
  }
  if (searchValue.value !== undefined && searchValue.value !== '') {
    params = {
      searchValue: searchValue.value,
      current: 1,
    };
  }
  return await api
    .getZhuanyiData(params)
    .then((res: any) => {
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
  await api.updateZhuanyiData({ id: id, isDeleted: 0 }).then((res: any) => {
    getData();
  });
};
const reviewData = async (id: number) => {
  await api
    .updateZhuanyiData({ id: id, reviewoperator: userInfo.username, status: '1' })
    .then((res: any) => {
      getData();
    });
};
const refuseData = async (id: number) => {
  await api
    .updateZhuanyiData({ id: id, reviewoperator: userInfo.username, status: '4' })
    .then((res: any) => {
      getData();
    });
};
const cancelData = async (id: number) => {
  await api
    .updateZhuanyiData({ id: id, reviewoperator: userInfo.username, status: '5' })
    .then((res: any) => {
      getData();
    });
};
const payData = async (id: number) => {
  if (payDate.value) {
    await api
      .updateZhuanyiData({
        id: id,
        reviewoperator: userInfo.username,
        status: '2',
        payDate: payDate.value!.format('YYYY-MM-DD'),
      })
      .then((res: any) => {
        getData();
      });
  } else {
    message.info('请选择支付日期');
  }
};
const paySuccess = async (id: number) => {
  await api
    .updateZhuanyiData({ id: id, reviewoperator: userInfo.username, status: '3' })
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
  // {
  //   title: '备注',
  //   dataIndex: 'note',
  //   key: 'note',
  // },
  {
    title: '转出地\关系/金额',
    dataIndex: 'isOnlyTransferRelation',
    key: 'isOnlyTransferRelation',
  },
  {
    title: '操作员',
    dataIndex: 'checkoperator',
    key: 'checkoperator',
  },
  {
    title: '进度',
    dataIndex: 'status',
    key: 'status',
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
