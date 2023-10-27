<template>
  <div style="margin-bottom: 16px">
    <a-button type="primary" @click="exportExcel">导出Excel</a-button>
  </div>
</template>

<script lang="ts" setup>
import * as XLSX from 'xlsx';
import * as fs from 'fs';
XLSX.set_fs(fs);
const props = defineProps({
  excelData: Array<{
    personID: String;
    personName: String;
    canbaoInfo: Array<{ company: String; canbaoTime: String }>;
    unempInfo: Array<{ shiyeCategory: String; shiyeTime: String }>;
  }>,
  filename:String
});
const exportExcel = async () => {
  const result = props.excelData.map((item) => {
    const canbaoInfo =
      item.canbaoInfo
        ?.map((info) => {
          return `${info.company} ${info.canbaoTime}`;
        })
        .join(',  ') || '-';
    const unempInfo =
      item.unempInfo
        ?.map((info) => {
          return `${info.shiyeCategory} ${info.shiyeTime}`;
        })
        .join(',  ') || '-';
    return [item.personName, item.personID, '失业保险', canbaoInfo, unempInfo];
  });
  const workbook = XLSX.utils.book_new();

  const ws = XLSX.utils.aoa_to_sheet([
    ['失业保险待遇协查地协查信息'],
    ['备注：', '因上海失业保险系统更新，失业保险参保数据截止至2023年2月'],
    ['联系电话', '上海嘉定失业保险科 021-39989063'],
    [
      '姓名',
      '身份证号',
      '协查地参加社保险种',
      '协查地参保单位名称及时间段',
      '协查地领取失业保险待遇类别及时间段',
    ],
  ]);
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } },
  ];
  // ws['A1'].s = {
  //   alignment: { horizontal: 'center' },
  //   font: { sz: 20 },
  // };
  XLSX.utils.sheet_add_aoa(ws, result, { origin: 'A5' });
  XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1');
  XLSX.writeFile(workbook, `${props.filename}——失业保险待遇领取疑点数据协查.xlsx`, { compression: true });
};
</script>
