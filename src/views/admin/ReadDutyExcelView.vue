<template>
  <a-card>
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="false"
      :max-count="1"
      :customRequest="customRequest"
      @remove="handleRemove"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text">上传excel</p>
      <p class="ant-upload-hint">只支持.xlsx</p>
    </a-upload-dragger>
  </a-card>
  {{ data }}
  <a-button type="primary" @click="pushToDataBase">推送</a-button>
</template>

<script lang="ts" setup>
import Excel from 'exceljs';
import { ref } from 'vue';
import { MinusCircleOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons-vue';
import api from '@/api';

const spinning = ref(false);
const data = ref([]);
const pushToDataBase = async ()=>{
  api.addDutyData(data.value)
 .then(res=>{
    console.log('res==>',res)
  })
}
//自定义上传文件后处理
const fileList = ref([]);
const customRequest = (options: any) => {
  const { onProgress, onError, onSuccess, file } = options;
  processExcel(file)
    .then((result: any) => {
      console.log('result==>',result)
      onProgress({ percent: 100 });
      onSuccess(result);
      spinning.value = false;
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
const processExcel = async (file: any) => {
  spinning.value = true;
  const dutyArray = []
  return new Promise(async (resolve, reject) => {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(file);
    // 获取第一个表格的数据
    const firstSheet = workbook.getWorksheet('Sheet1');
    const firstTitle = firstSheet.getRow(1).values;
    console.log('firstTitle==>',firstTitle)
    let firstYear = ''
    let firstMonth = ''
    // Assuming the data starts from the 2nd row (index 1)
    firstSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber > 1) {
        console.log(row.values)
        if (row.values[1] != null){
          firstYear = row.getCell(1).text.match(/(\d{4})年/)[1]
          console.log('firstYear',firstYear)
        }
        if (row.values[2] != null){
          const number = row.getCell(2).text.match(/(\d{1,2})/)[1]
          firstMonth = number ?  String(number).padStart(2, '0') : 'null'
          console.log('firstMonth',firstMonth)
        }
        const numberDay = row.getCell(3).text.match(/(\d{1,2})/)[1]
        const firstDay = numberDay ?  String(numberDay).padStart(2, '0') : 'null'

        const rowData = {
          dutyDay: `${firstYear}-${firstMonth}-${firstDay}`,
          dutyPerson: firstTitle[findIndexOfChecked(row.values)]
        };
        data.value.push(rowData);
        dutyArray.push(rowData);
      }
    });
    resolve(dutyArray);
  });
};
function findIndexOfChecked(array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === "√") {
      return i;
    }
  }
  return -1;
}
</script>
