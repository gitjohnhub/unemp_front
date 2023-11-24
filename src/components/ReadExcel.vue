<template>
  <div>
    <input type="file" @change="handleFileUpload" />
    <button @click="readExcel">读取Excel</button>
  </div>
</template>

<script lang="ts">
import ExcelJS from 'exceljs';

export default {
  methods: {
    handleFileUpload(event) {
      // 获取文件
      this.selectedFile = event.target.files[0];
    },
    async readExcel() {
      if (!this.selectedFile) {
        console.error('请先选择一个Excel文件');
        return;
      }

      try {
        // 使用exceljs读取Excel文件
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(this.selectedFile);

        // 获取第一个工作表
        const worksheet = workbook.worksheets[0];

        // 遍历工作表中的行和列
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          row.eachCell((cell, colNumber) => {
            console.log(`单元格(${rowNumber}, ${colNumber}): ${cell.value}`);
          });
        });

        console.log('读取Excel成功');
      } catch (error) {
        console.error('读取Excel失败', error);
      }
    },
  },
};
</script>
