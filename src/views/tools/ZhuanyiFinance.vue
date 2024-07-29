<template>
  <div>
    <h2>输入 财务凭证 数据</h2>
    <a-textarea v-model:value="originalJson" cols="50"></a-textarea>

    <h2>输入 业务 数据</h2>
    <a-textarea v-model:value="checkJson" cols="50"></a-textarea>

    <a-button type="primary" @click="processData">处理数据</a-button>

    <h2>结果1: 身份证号完全匹配</h2>
    <div v-html="result1"></div>

    <h2>结果2: 姓名模糊匹配</h2>
    <div v-html="result2"></div>

    <h2>结果3: 金额模糊匹配</h2>
    <div v-html="result3"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      originalJson: "",
      checkJson: "",
      result1: "",
      result2: "",
      result3: "",
    };
  },
  methods: {
    processData() {
      // console.log("originalJson==>", this.originalJson);
      const original = JSON.parse(this.originalJson);
      const check = JSON.parse(this.checkJson);

      const result1Rows = [];
      const result2Rows = [];
      const result3Rows = [];
      const matchedCheckValues = new Set<string>();

      const parseDate = (dateStr: string) =>
        new Date(
          dateStr.slice(0, 4) +
            "-" +
            dateStr.slice(4, 6) +
            "-" +
            dateStr.slice(6, 8)
        );

      check.forEach((checkRow: any) => {
        const matchedAac002Rows = original.filter((originalRow: any) =>
          originalRow.xm.includes(checkRow.aac002)
        );
        matchedAac002Rows.forEach((originalRow: any) => {
          result1Rows.push(this.createCombinedRow(originalRow, checkRow));
          matchedCheckValues.add(checkRow.aac002);
        });
      });

      check.forEach((checkRow: any) => {
        const matchedAac003Rows = original.filter(
          (originalRow: any) =>
            originalRow.xm.includes(checkRow.aac003) &&
            !matchedCheckValues.has(checkRow.aac002)
        );
        matchedAac003Rows.forEach((originalRow: any) => {
          result2Rows.push(this.createCombinedRow(originalRow, checkRow));
          matchedCheckValues.add(checkRow.aac003);
        });
      });

      check.forEach((checkRow: any) => {
        if (
          !matchedCheckValues.has(checkRow.aac002) &&
          !matchedCheckValues.has(checkRow.aac003)
        ) {
          const matchedSpecialRows = original.filter((originalRow: any) => {
            return (
              parseFloat(originalRow.zrje) === parseFloat(checkRow.ajc079) &&
              originalRow.zrsj > checkRow.qrsj
            );
          });

          matchedSpecialRows.forEach((originalRow: any) => {
            result3Rows.push(this.createCombinedRow(originalRow, checkRow));
          });
        }
      });

      this.result1 = this.generateTable(result1Rows);
      this.result2 = this.generateTable(result2Rows);
      this.result3 = this.generateSpecialTable(result3Rows);
    },
    createCombinedRow(originalRow: any, checkRow: any) {
      return {
        票据编号: originalRow.pjbh,
        转移单身份证: checkRow.aac002,
        转移单姓名: checkRow.aac003,
        财务转出备注: originalRow.xm,
        确认转出日期: checkRow.aae035,
        财务转出日期: originalRow.zrsj,
        财务金额: originalRow.zrje,
        转移单金额: checkRow.ajc079,
        转移单转出地: checkRow.aab301,
        财务转出账户: originalRow.zcd,
        // 确认转出日期: checkRow.aae270,
        // aae035: checkRow.aae035,
        // aae036: checkRow.aae036,
      };
    },
    generateTable(rows: any[]) {
      if (rows.length === 0) return "No matching results found.";

      const headers = Object.keys(rows[0]);
      let table = '<table border="1"><tr>';
      headers.forEach((header) => {
        table += `<th>${header}</th>`;
      });
      table += "</tr>";

      rows.forEach((row) => {
        table += "<tr>";
        headers.forEach((header) => {
          table += `<td>${row[header]}</td>`;
        });
        table += "</tr>";
      });

      table += "</table>";
      return table;
    },
    generateSpecialTable(rows: any[]) {
      if (rows.length === 0) return "No matching results found.";

      const uniqueCheckRowsObj: any = {};
      rows.forEach((row) => {
        const key = JSON.stringify({
          转移单姓名: row["转移单姓名"],
          转移单身份证: row["转移单身份证"],
          转移单转出地: row["转移单转出地"],
          确认转出日期: row["确认转出日期"],
          转移单金额: row["转移单金额"],
          // aae035: row["aae035"],
          // aae036: row["aae036"],
        });
        if (!uniqueCheckRowsObj[key]) {
          uniqueCheckRowsObj[key] = [];
        }
        uniqueCheckRowsObj[key].push(row);
      });

      let table = "";
      for (const key in uniqueCheckRowsObj) {
        const checkRow = JSON.parse(key);
        table += '<div class="check-row">';
        table += "<h3>Check Row</h3>";
        table += this.generateTable([checkRow]);
        table += "</div>";
        table += "<h3>Corresponding Original Rows</h3>";

        const correspondingOriginalRows = uniqueCheckRowsObj[key].map(
          (row: any) => ({
            票据编号: row["票据编号"],
            财务转出备注: row["财务转出备注"],
            财务转出账户: row["财务转出账户"],
            财务转出日期: row["财务转出日期"],
            财务金额: row["财务金额"],
          })
        );

        table += this.generateTable(correspondingOriginalRows);
        table += "<hr />";
      }

      return table;
    },
  },
});
</script>

<style>
textarea {
  width: 100%;
  margin-bottom: 10px;
}
hr {
  margin: 10px 0;
  border: 1px solid #ccc;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}
.check-row {
  background-color: #e0f7fa;
  padding: 10px;
  margin-bottom: 10px;
}
</style>
