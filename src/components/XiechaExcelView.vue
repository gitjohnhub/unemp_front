<template>
  <div style="margin-bottom: 16px">
    <a-button type="primary" @click="exportExcel">导出Excel</a-button>
  </div>
</template>

<script lang="ts" setup>
import { downloadLink } from '@/utils/util';
import {xiechaInfo} from '@/utils/config';
import {genWorkbook} from '@/utils/util'
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
  const headersWithWidth = [
    { header: '姓名', width: 12 },
    { header: '身份证', key: 'personID', width: 25 },
    { header: '协查地参加社保险种', key: 'shiye', width: 25 },
    { header: '协查地参保单位名称及时间', key: 'canbaoInfo', width: 35 },
    { header: '协查地领取失业保险待遇类别及时间段', key: 'shiyeInfo', width: 50 },
  ];
  const {workbook,headers,worksheet} = genWorkbook(headersWithWidth)
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = xiechaInfo[0];
  worksheet.mergeCells('B2:E2');
  worksheet.getCell('B2').value = xiechaInfo[1];
  worksheet.getCell('A2').value = '备注';
  worksheet.mergeCells('B3:E3');
  worksheet.getCell('B3').value = xiechaInfo[2];
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
    worksheet.getRow(1).font = { size: 18, bold: true };

    // 导出 Excel 文件
    downloadLink(workbook, `失业保险待遇协查地协查信息_${props.filename}`)


};
</script>
