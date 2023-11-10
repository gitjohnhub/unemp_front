<template>
  <div style="margin-bottom: 16px">
    <a-button type="primary" @click="exportExcel">导出Excel</a-button>
  </div>
</template>

<script lang="ts" setup>
import * as XLSX from 'xlsx';
import Excel from 'exceljs'
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
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1', {
    pageSetup: {
      orientation: 'landscape',
      showGridLines: true,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      verticalCentered: true,
      paperSize: 9,
    },
  });
  worksheet.columns = [
    { header: '姓名', key: 'name', width: 12 },
    { header: '身份证', key: 'personID', width: 25 },
    { header: '协查地参加社保险种', key: 'shiye', width: 25 },
    { header: '协查地参保单位名称及时间', key: 'canbaoInfo', width: 35 },
    { header: '协查地领取失业保险待遇类别及时间段', key: 'shiyeInfo', width: 50 },
  ];
  const headers = [
    '姓名',
    '身份证',
    '协查地参加社保险种',
    '协查地参保单位名称及时间',
    '协查地领取失业保险待遇类别及时间段',
  ];
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = '失业保险待遇协查地协查信息';
  worksheet.mergeCells('B2:E2');
  worksheet.getCell('B2').value = '因上海失业保险系统更新，失业保险参保数据截止至2023年2月';
  worksheet.getCell('A2').value = '备注';
  worksheet.mergeCells('B3:E3');
  worksheet.getCell('B3').value = '上海嘉定失业保险科 021-39989063';
  worksheet.getCell('A3').value = '联系电话';
  worksheet.addRow(headers);

  props.excelData.map((item) => {
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
        worksheet.addRow([item.personName, item.personID, '失业保险', canbaoInfo, unempInfo]);

  });
  worksheet.eachRow((row, rowNumber) => {
      row.font = { size: 15 };
      row.height = 50
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center',wrapText:true };
      });
    });
    // for (let i = 1; i < exportData.value.length + 6; i++) {
    //   worksheet.getRow(i).font = { size: 15 };
    // }
    worksheet.getRow(1).font = { size: 18, bold: true };

    // 导出 Excel 文件
    workbook.xlsx.writeBuffer().then((buffer) => {
      // 将 buffer 下载为 Excel 文件
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `失业保险待遇协查地协查信息_${props.filename}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    });



};
</script>
