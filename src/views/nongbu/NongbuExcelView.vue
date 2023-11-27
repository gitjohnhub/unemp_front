<template>
  <a-space direction="vertical">
    <a-row>
      <a-space>
        <a-button type="primary" @click="getMonths">刷新月份</a-button>
        <a-button type="primary" @click="exportExcel">导出Excel</a-button>
        <a-radio-group v-model:value="isCustomOrder">
          <a-radio-button value="0">按街镇排序</a-radio-button>
          <a-radio-button value="1">按时间排序</a-radio-button>
        </a-radio-group>
        <a-switch v-model:checked="cancelUnempSwitch" />只显示取消失业登记
        <a-tag>查询计数:{{ count }}</a-tag>
      </a-space>
    </a-row>
    <a-row>
      <a-segmented v-model:value="monthSelect" :options="months.slice(0, 6)" />
      <a-segmented v-model:value="monthSelect" :options="months.slice(6)" />
    </a-row>
  </a-space>

  <a-spin :spinning="spinning">
    <a-table :columns="columns" :data-source="dataSource" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'personName'">
          <a-typography-paragraph :style="{ fontSize: '18px' }" copyable keyboard>{{
            record.personName
          }}</a-typography-paragraph>
        </template>
        <template v-if="column.key === 'personID'">
          <a-tooltip :title="pinyin(record.personName)" color="#f50">
                <a-typography-paragraph
                  :style="{ fontSize: '18px' }"
                  copyable
                  :class="{ deleted: record.isDeleted == 2 }"
                >
                  {{ record.personName }}
                </a-typography-paragraph>
              </a-tooltip>
        </template>
        <template v-if="column.key === 'chengPayMonth'">
          <a-tag>{{ record.chengPayMonth }}</a-tag>
          <a-tag>{{ record.zhenPayMonth }}</a-tag>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag>{{ statusList[Number(record.status)] }}</a-tag>
        </template>
        <template v-if="column.key === 'note'">
          <a-tooltip color="#87d068">
            <template #title>
              <a-timeline mode="alternate">
                <a-timeline-item>
                  <p>初审人：{{ record.checkoperator }}</p>
                  <p>{{ record.createtime.slice(0, 10) }}</p>
                  <p>{{ record.note }}</p>
                </a-timeline-item>
                <a-timeline-item>复审人:{{ record.reviewoperator }}</a-timeline-item>
              </a-timeline>
            </template>
            <a-row>
              <a-tag color="red" v-if="record.wrongTag == 1">
                <WarningFilled />
              </a-tag>
              <a-tag color="red" v-if="record.originalFile !== '0'"><FilePdfOutlined /></a-tag>
              <a-tag v-if="record.repeatTimes !== '0'">{{ record.repeatTimes }}</a-tag>
              <a-tag color="red" v-if="record.cancelUnemp !== '0'"><StopOutlined /></a-tag>
            </a-row>
            <a-row>
              {{ record.note }}
            </a-row>
          </a-tooltip>
        </template>
        <template v-if="column.key === 'createtime'">
          {{ record.createtime.slice(0, 10) }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button @click="tagWrong(record.id, getData)" type="primary" danger>
              <WarningFilled />
            </a-button>
            <a-button @click="tagOriginalFile(record.id, getData)" type="primary" danger>
              <FilePdfOutlined />
            </a-button>
            <a-button @click="tagCancelUnemp(record.id, getData)" type="primary" danger>
              <StopOutlined />
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-spin>
</template>
<script setup lang="ts">
import api from '@/api';
import { ref, onBeforeMount, watch } from 'vue';
import { tagOriginalFile, tagWrong, tagCancelUnemp } from './utils';
import { genWorkbook, downloadLink } from '@/utils/util';
import { pinyin } from 'pinyin-pro';

import {
  WarningFilled,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  StopOutlined,
  FilePdfOutlined,
} from '@ant-design/icons-vue';
const dataSource = ref();
const months = ref(['']);
const monthSelect = ref('');
const spinning = ref<boolean>(false);
const count = ref(0)
//失业选择
const cancelUnemp = ref();
const cancelUnempSwitch = ref(false);
watch(
  () => cancelUnempSwitch.value,
  () => {
    if (cancelUnempSwitch.value) {
      cancelUnemp.value = '1';
    } else {
      cancelUnemp.value = '';
    }
    getData();
  }
);
// 排序选择
const order = ref({
  sortColumn: 'jiezhen',
  sortRule: 'DESC',
});
const isCustomOrder = ref('0');
watch(
  () => isCustomOrder.value,
  () => {
    if (isCustomOrder.value == '0') {
      order.value = {
        sortColumn: 'jiezhen',
        sortRule: 'DESC',
      };
    } else {
      order.value = {
        sortColumn: 'createtime',
        sortRule: 'DESC',
      };
    }
    getData();
  }
);
const statusList = ['已登记', '已审批', '已取消', '全部'];
watch(
  () => monthSelect.value,
  () => {
    getData();
  }
);
onBeforeMount(() => {
  console.log('NongbuExcel');
  getMonths();
});
const getMonths = (params?: any) => {
  api
    .getNongbuAllDate()
    .then((res: any) => {
      console.log('res', res);
      months.value = res;
      console.log('months===>', months.value);
    })
    .catch((err) => {
      console.log(err);
    });
};
const getData = (params?: any) => {
  params = {
    ...params,
    cancelUnemp:cancelUnemp.value,
    noindex: 1,
    customOrder: order.value,
  };
  if (monthSelect.value) {
    params.monthSelect = monthSelect.value;
  }
  return api.getNongbuData(params).then((res: any) => {
    dataSource.value = res.rows;
    count.value = res.page.total
    return res.rows;
  });
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
    key: 'jiezhen',
    title: '街镇',
  },
  {
    key: 'chengPayMonth',
    title: '城保/镇保',
  },
  {
    key: 'note',
    title: '备注',
    ellipsis: true,
  },
  {
    key: 'status',
    title: '状态',
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
const exportExcel = () => {
  // 写入文件
  const headersWithWidth = [
    { header: '序号', key: 'index', width: 6 },
    { header: '姓名', key: 'name', width: 10 },
    { header: '身份证', key: 'personID', width: 26 },
    { header: '镇保', key: 'chengPayMonth', width: 24 },
    { header: '城保', key: 'zhenPayMonth', width: 18 },
    { header: '街镇', key: 'originalFile', width: 24 },
    { header: '收到原件', key: 'jiezhen', width: 24 },
    { header: '是否审批', key: 'status', width: 22 },
    { header: '备注', key: 'note', width: 22 },
  ];
  const { workbook, headers, worksheet } = genWorkbook(headersWithWidth);
  worksheet.addRow(headers);
  worksheet.mergeCells('A1:I1');
  worksheet.getCell('A1').value = `${monthSelect.value.slice(0, 10)}_农民补助金`;
  worksheet.getCell('I1').alignment = { vertical: 'middle', horizontal: 'center' };

  getData({ noindex: 1 }).then((rows: any) => {
    console.log('rows===>', rows);
    const exportData = rows;
    exportData.map((item, index) => {
      worksheet.addRow([
        index + 1,
        item.personName,
        item.personID,
        item.chengPayMonth,
        item.zhenPayMonth,
        item.jiezhen,
        item.originalFile === '1' ? '已收到' : '未收到',
        item.status == '1' ? '已审批' : '',
        item.note,
      ]);
    });
    worksheet.pageSetup.printArea = `A1:I${exportData.length + 4}`;
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
    downloadLink(workbook, `农民补助金_${monthSelect.value.slice(0, 10)}`);
  });
};
</script>
