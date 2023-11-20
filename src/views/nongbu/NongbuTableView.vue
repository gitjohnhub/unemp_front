<template>
  <div>
    <div class="table-operations">
      <a-space direction="vertical">
        <a-row>
          <a-space>
            <a-button @click="showAddDataModal" type="primary">添加</a-button>
            <a-modal v-model:open="open" title="Title" :confirm-loading="confirmLoading" @ok="handleOk"
              @cancel="handleCancel">
              <NongbuAddFormView ref="formRef" />
            </a-modal>
            <a-tag color="#108ee9">{{ count }}</a-tag>
            <a-button @click="getData"> 刷新数据 </a-button>
            <a-divider type="vertical" />
            <a-input-search v-model:value="searchValue" placeholder="输入姓名/身份证" style="width: 200px" @search="onSearch" />
            <!-- <a-button type="primary" @click="()=>searchValue=''">重置搜索</a-button> -->
          </a-space>
        </a-row>
        <a-row>
          <!-- 数据导出操作 -->
          <a-space>
            <h5>导出操作：</h5>
            <a-range-picker v-model:value="monthSelect" />
            <a-button @click="exportExcel" type="primary" style="background-color: #1e1e1e">
              导出Excel
            </a-button>
          </a-space>
        </a-row>
        <a-row>
          <a-radio-group v-model:value="status" button-style="solid">
            <a-radio-button v-for="(status, index) in statusCal" :value="String(index)" :key="index">{{ status.label }}
              <a-tag :color="colorList[index]">{{ status.count }}</a-tag>
            </a-radio-button>
          </a-radio-group>
        </a-row>
      </a-space>
    </div>
    <a-spin :spinning="spinning">
      <a-table row-class-name="custom-row" :columns="columns" :data-source="dataSource" @change="handleChange"
        @showSizeChange="onShowSizeChange" :pagination="pagination">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'personID'">
            <a-typography-paragraph :style="{ fontSize: '18px' }" copyable keyboard
              :class="{ deleted: record.status == 4 }">{{ record.personID }}</a-typography-paragraph>
          </template>
          <template v-if="column.key === 'personName'">
            <a-space direction="vertical">
              <a-tooltip :title="pinyin(record.personName)" color="#f50">

                <a-typography-paragraph :style="{ fontSize: '18px' }" copyable
                  :class="{ deleted: record.isDeleted == 2 }">{{ record.personName }}</a-typography-paragraph>
              </a-tooltip>
            </a-space>
          </template>
          <template v-if="column.key === 'jiezhen'">
            <a-space direction="vertical">
              <a-row>
                <a-tag color="red"  v-if="record.wrongTag == 1" >
                  <WarningFilled/>
                </a-tag>
                <a-tag>
                  {{ record.jiezhen }}
                </a-tag>
                <a-tag>
                  {{ record.checkoperator }}
                </a-tag>
                <a-tag v-if="record.reviewoperator">
                  {{ record.reviewoperator }}
                </a-tag>
                <a-tag v-if="record.reviewoperator != null">
                  {{ record.reviewoperator }}
                </a-tag>
              </a-row>
              <a-tooltip :title="record.note" color="#f50">
                <a-input-search v-model:value="record.note" placeholder="备注" size="medium"
                  @search="onSubmitNote(record.id, record.note)">
                  <template #enterButton>
                    <a-button type="dashed">修改备注</a-button>
                  </template>
                </a-input-search>
              </a-tooltip>
            </a-space>

            <!-- <span v-html="`<br>${record.checknote}`"></span> -->
          </template>
          <template v-if="column.key === 'chengPayMonth'">
            <a-tag>{{ record.chengPayMonth }}</a-tag>
            <a-tag>{{ record.zhenPayMonth }}</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="colorList[Number(record.status)]">
              {{ getStatus(record.status) }}
            </a-tag>
            <a-progress :percent="getProgress(record.status)" size="small" />
          </template>
          <!-- createtime column -->
          <template v-if="column.key === 'createtime'">
            <a-tag>
              <span v-html="
                `${getCorrectTime(record.createtime)[0]}<br>${getCorrectTime(record.createtime)[1]
                }<br>id:${record.id}`
              "></span>
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space direction="vertical">
              <a-row>
                <a-space>
                  <a-button @click="reviewData(record.id)" type="primary" v-if="record.status == '0'"><CheckOutlined /></a-button>
                  <a-button @click="tagWrong(record.id)" type="primary" danger>
                    <WarningFilled />
                  </a-button>

                  <a-button danger @click="deleteData(record.id)" v-if="record.status !== 4 ? true : false"><DeleteOutlined /></a-button>
                </a-space>
              </a-row>

              <a-row>
                <a-space>
                  <a-button @click="refuseData(record.id)" v-if="record.status == '0' || record.status == '1'"
                    type="primary" danger>驳回</a-button>
                  <a-button @click="cancelData(record.id)" type="primary" danger>取消</a-button>
                </a-space>
              </a-row>

              <a-button @click="showEditModal(record)"><EditOutlined /></a-button>
              <!-- 编辑模态框 -->
              <a-modal v-model:visible="record.editVisible" @ok="handleEditOk" @cancel="handleEditCancel">
                <a-form :model="editForm">
                  <a-form-item label="身份证号" name="personID" has-feedback>
                    <a-input v-model:value="editForm.personID">
                    </a-input>
                  </a-form-item>
                  <a-form-item label="姓名" name="personName" has-feedback>
                    <a-input v-model:value="editForm.personName" />
                  </a-form-item>
                  <a-form-item label="街镇" name="jiezhen">
                    <a-select ref="select" v-model:value="editForm.jiezhen" style="width: 120px"
                      :options="jiezhens"></a-select>
                  </a-form-item>
                  <a-form-item label="城保" name="chengPayMonth">
                    <a-input v-model:value="editForm.chengPayMonth" />
                  </a-form-item>
                  <a-form-item label="镇保" name="zhenPayMonth">
                    <a-input v-model:value="editForm.zhenPayMonth" />
                  </a-form-item>
                  <a-form-item label="备注">
                    <a-textarea v-model:value="editForm.note" />
                  </a-form-item>
                  <a-form-item label="是否错核">
                    <a-radio-group v-model:value="editForm.wrongTag">
                      <a-radio value='1'>标记错核</a-radio>
                      <a-radio value='0'>未错核</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-form>
              </a-modal>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onBeforeMount, watch, provide } from 'vue';
import { message } from 'ant-design-vue';
import { WarningFilled,CheckOutlined,DeleteOutlined,EditOutlined} from '@ant-design/icons-vue';
import api from '@/api';
import { pinyin } from 'pinyin-pro';
import NongbuAddFormView from './NongbuAddFormView.vue';
import { Dayjs } from 'dayjs';
import { useUserStore } from '@/stores';
import { downloadLink } from '@/utils/util';
import { genWorkbook, colorList } from '@/utils/util';
import { jiezhens } from '@/types';
import 'dayjs/locale/zh-cn';
const editForm = ref()


const dataSource = ref();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const monthSelect = ref<Dayjs>();
const payDate = ref<Dayjs>();

const count = ref<number>();
const checked = ref(false);
const reviewChecked = ref('0');
const exportData = ref();
const status = ref('0');
const statusCal = ref([]);

//加载数据动画
const spinning = ref<boolean>(false);

// 搜索相关
const searchValue = ref();
const statusList = ['已登记', '已审批', '已驳回', '已取消', '已删除', '全部'];

const getStatus = (status: String) => {
  return statusList[Number(status)];
};
const getProgress = (status: String) => {
  const currentIndex = Number(status) + 1;
  // 状态总数
  const total = 2; // 不算 '全部'
  // 百分比进度
  const percent = (currentIndex / total) * 100;

  return percent; // 33.33
};
const onSearch = () => {
  getData().catch((e) => {
    console.log(e);
    message.info('查询错误，联系管理员');
  });
};

watch(
  () => searchValue.value,
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
    console.log(status.value);
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
    .updateNongbuData({ id: id, note: note })
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
  // 写入文件
  const headersWithWidth = [
    { header: '序号', key: 'index', width: 6 },
    { header: '姓名', key: 'name', width: 10 },
    { header: '身份证', key: 'personID', width: 26 },
    { header: '镇保', key: 'startDate', width: 24 },
    { header: '城保', key: 'endDate', width: 18 },
    { header: '街镇', key: 'jiezhen', width: 24 },
    { header: '是否审批', key: 'status', width: 22 },
  ];
  const { workbook, headers, worksheet } = genWorkbook(headersWithWidth);
  worksheet.addRow(headers);
  worksheet.mergeCells('A1:H1');
  worksheet.getCell('A1').value = `${monthSelect.value[0].format('YYYY-mm')}_延长失业金`;
  worksheet.getCell('H1').alignment = { vertical: 'middle', horizontal: 'center' };

  getData({ noindex: 1 }).then((res) => {
    exportData.value.map((item, index) => {
      worksheet.addRow([
        index + 1,
        item.personName,
        item.personID,
        item.chengPayMonth,
        item.zhenPayMonth,
        item.jiezhen,
        item.status == '1' ? '已审批' : '',
        item.note,
      ]);
    });
    worksheet.pageSetup.printArea = `A1:H${exportData.value.length + 4}`;
    // worksheet.addRow([
    //   '',
    //   '',
    //   `打印人:${userInfo.username}`,
    //   '',
    //   `${monthSelect.value[0].format('YYYY-MM-DD')}`,
    //   '',
    //   '',
    //   '',
    // ]);
    worksheet.eachRow((row, rowNumber) => {
      row.font = { size: 15 };
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });
    worksheet.getRow(2).font = { size: 15, bold: true };
    worksheet.getRow(1).font = { size: 18, bold: true };

    // 导出 Excel 文件
    downloadLink(workbook, `农民补助金_${monthSelect.value[0].format('YYYY-MM')}`);
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
  getData();
});
// 获取数据
const getData = async (params?: any) => {
  spinning.value = true;
  api.getNongbuDataCal().then((res: any) => {
    console.log(res);
    statusCal.value = statusList.map((item, index) => {
      return {
        label: item,
        count: res.find((item) => Number(item.status) === index)?.count || 0,
      };
    });
  });

  params = {
    ...params,
    ...pager.value,
  };
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
  }

  if (Number(status.value) !== statusList.length - 1) {
    params.status = status.value;
  } else {
    params.status = null;
  }
  if (searchValue.value !== undefined && searchValue.value !== '') {
    params = {
      searchValue: searchValue.value,
      current: 1,
    };
  }
  return await api
    .getNongbuData(params)
    .then((res: any) => {
      exportData.value = res.rows;
      console.log(exportData.value);
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
  await api.updateNongbuData({ id: id, status: statusList.indexOf('已删除') }).then((res: any) => {
    getData();
  });
};
const reviewData = async (id: number) => {
  await api
    .updateNongbuData({ id: id, reviewoperator: userInfo.username, status: '1' })
    .then((res: any) => {
      getData();
    });
};
const tagWrong = async (id: number) => {
  await api
    .updateNongbuData({ id: id, wrongTag: '1' })
    .then((res: any) => {
      getData();
    });
};


const refuseData = async (id: number) => {
  await api
    .updateNongbuData({
      id: id,
      reviewoperator: userInfo.username,
      status: statusList.indexOf('已驳回'),
    })
    .then((res: any) => {
      getData();
    });
};

const cancelData = async (id: number) => {
  await api
    .updateNongbuData({
      id: id,
      reviewoperator: userInfo.username,
      status: statusList.indexOf('已取消'),
    })
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

const showEditModal = (record) => {
  editForm.value = record
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
  api.updateNongbuData(editForm.value)
    .then((res: any) => {
      message.info(res)
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
const columnsOriginal = [
  {
    key: 'personName',
    title: '姓名',
  },
  {
    key: 'personID',
    title: '身份证号',
  },
  {
    key: 'chengPayMonth',
    title: '城保/镇保',
  },
  {
    key: 'jiezhen',
    title: '街镇',
  },
  {
    key: 'note',
    title: '备注',
  },
  {
    key: 'status',
    title: '进度',
  },
  {
    key: 'createtime',
    title: '提交时间',
  },
  {
    key: 'action',
    title: '操作',
  },
];
const columns = columnsOriginal.map((item) => {
  return {
    ...item,
    dataIndex: item.key,
    align: 'center',
  };
});
</script>
<style scoped>
.deleted {
  text-decoration: line-through;
}

.custom-row {
  height: 20px;
  /* 设置行高度为 50px */
}

.table-operations {
  margin-bottom: 16px;
}

.table-operations>button {
  margin-right: 8px;
}
</style>
