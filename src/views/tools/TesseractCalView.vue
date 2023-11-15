<template>
  <!-- 数字识别 -->
  <a-card>
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="false"
      :max-count="1"
      :customRequest="customRequest"
      @remove="handleRemove"
      list-type="picture-card"
      @preview="handlePreview"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text">点击或拖放图片</p>
      <p class="ant-upload-hint">支持图片格式的文件</p>
    </a-upload-dragger>
    <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </a-card>
  <!-- 工龄表单 -->
  <a-form
    ref="formRef"
    name="dynamic_form_nest_item"
    :model="dynamicValidateForm"
    @finish="onFinish"
  >
    <a-space
      v-for="(year, index) in dynamicValidateForm.years"
      :key="year.id"
      style="display: flex; margin-bottom: 8px"
      align="baseline"
    >
      <a-form-item
        :name="['years', index, 'first']"
        :rules="{
          required: true,
          message: '缺少年份',
        }"
      >
        <a-input v-model:value="year.first" placeholder="开始年份" />
      </a-form-item>
      <a-form-item
        :name="['years', index, 'last']"
        :rules="{
          required: true,
          message: '缺少终止年份',
        }"
      >
        <a-input v-model:value="year.last" placeholder="终止年份" />
      </a-form-item>
      <a-form-item>
        <a-input v-model:value="year.label" disabled></a-input>
      </a-form-item>
      <a-form-item>
        <a-checkbox v-model:checked="year.isOnlyleiji">只算缴费</a-checkbox>
      </a-form-item>
      <a-form-item label="减去">
        <a-input v-model:value="year.minusNum"></a-input>
      </a-form-item>
      <a-form-item label="本次计算后已领取：">
        <a-input v-model:value="year.yilingqu"></a-input>
      </a-form-item>
      <a-form-item>
        <a-button @click="calPayYear(index)" :disabled="year.isChecked">计算本次缴费</a-button>
      </a-form-item>
      <MinusCircleOutlined @click="removeyear(year)" />
    </a-space>
    <a-form-item>
      <a-button type="dashed" block @click="addyear">
        <PlusOutlined />
        增加工龄
      </a-button>
    </a-form-item>
    <a-form-item>
      <a-space>
        <a-button type="primary" @click="onFinish" v-if="dynamicValidateForm.years.length > 0"
          >修改后重新计算</a-button
        >
        <a-tag v-if="totalYear.value != 0"> {{ totalYear.label }}</a-tag>
      </a-space>
    </a-form-item>
  </a-form>

  <!-- 缴费表单 -->

  <a-form
    ref="formCheckRef"
    name="dynamic_form_check_item"
    :model="dynamicCheckForm"
    @finish="onFinish"
  >
    <a-space
      v-for="(checkValue, index) in dynamicCheckForm.checkValues"
      :key="checkValue.id"
      style="display: flex; margin-bottom: 8px"
      align="baseline"
    >
      <a-form-item :name="['checkValues', index, 'xinzeng']" label="新增">
        <a-input v-model:value="checkValue.xinzeng" />
      </a-form-item>
      <a-form-item :name="['checkValues', index, 'leiji']" label="累计">
        <a-input v-model:value="checkValue.leiji" />
      </a-form-item>
      <a-form-item label="可领取">
        <a-input v-model:value="checkValue.kelingqu"></a-input>
      </a-form-item>
      <a-form-item label="已领取">
        <a-input v-model:value="checkValue.yilingqu"></a-input>
      </a-form-item>
      <a-form-item label="剩余可领取">
        <a-input v-model:value="checkValue.remainingClaimMonths"></a-input>
      </a-form-item>
      <a-form-item label="未核定缴费月数">
        <a-input v-model:value="checkValue.remainingMonths"></a-input>
      </a-form-item>
    </a-space>
  </a-form>
  <a-button @click="recalPayYear" v-if="dynamicCheckForm.checkValues.length > 0"
    >重新计算结果</a-button
  >
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import Tesseract from 'tesseract.js';
import type { UploadProps } from 'ant-design-vue';

interface year {
  first: string;
  last: string;
  value: number;
  label: string;
  yilingqu: number;
  serviceMonth: Array<string>;
  isChecked: boolean;
  id: number;
  minusNum: number;
  addNum: number;
  isRecoginizeWrong: boolean;
  isOnlyleiji: boolean;
  serviceYears: Array<string>;
  note: '';
}
interface checkValue {
  // 新增年限，累计
  xinzeng: number;
  leiji: number;
  // 可领取，已领取，剩余领取
  kelingqu: number;
  yilingqu: number;
  remainingClaimMonths: number;
  // 剩余累计
  remainingMonths: number;
  id: number;
}
const formRef = ref<FormInstance>();
const dynamicValidateForm = reactive<{ years: year[] }>({
  years: [],
});
const dynamicCheckForm = reactive<{ checkValues: checkValue[] }>({
  checkValues: [],
});
const uniqueServiceMonthsSet = reactive(new Set());
watch(
  () => dynamicValidateForm.years,
  (newValue, oldValue) => {
    console.log('dynamicValidateForm newValue===>', newValue);
  }
);
const removeyear = (item: year) => {
  const index = dynamicValidateForm.years.indexOf(item);
  if (index !== -1) {
    dynamicValidateForm.years.splice(index, 1);
  }
};
const addyear = () => {
  dynamicValidateForm.years = [
    ...dynamicValidateForm.years,
    {
      first: '',
      last: '',
      value: 0,
      label: '',
      serviceMonth: [],
      yilingqu: 0,
      isChecked: false,
      id: Date.now(),
      isRecoginizeWrong: false,
      minusNum: 0,
      addNum: 0,
      isOnlyleiji: false,
      note: '',
      serviceYears: [],
    },
  ];
};
const totalYear = reactive({ value: 0, label: '' });
const calPayYear = (index: number) => {
  const years = dynamicValidateForm.years[index];
  const lastCheckedIndex = dynamicValidateForm.years.findIndex((item) => item.isChecked === true);
  if (dynamicCheckForm.checkValues.length === 0) {
    dynamicCheckForm.checkValues = [
      {
        xinzeng: 0,
        leiji: 0,
        kelingqu: 0,
        yilingqu: Number(years.yilingqu),
        remainingClaimMonths: 0,
        remainingMonths: 0,
        id: Date.now(),
      },
    ];
  }
  const lastCheckedFormElement =
    dynamicCheckForm.checkValues[dynamicCheckForm.checkValues.length - 1];

  let xinzeng = lastCheckedFormElement.xinzeng;
  let leiji = lastCheckedFormElement.leiji;
  let keheding = lastCheckedFormElement.kelingqu;
  let kelingqu = lastCheckedFormElement.kelingqu;
  let remainingMonths = lastCheckedFormElement.remainingMonths;
  let remainingClaimMonths = lastCheckedFormElement.remainingClaimMonths;
  const yilingqu = Number(years.yilingqu);
  for (let i = lastCheckedIndex + 1; i <= index; i++) {
    xinzeng = Number(years.label.split(':')[0]);
    leiji = xinzeng + lastCheckedFormElement.leiji;
    keheding = xinzeng + lastCheckedFormElement.remainingMonths;

    kelingqu =
      Math.min(Math.floor(keheding / 12) * 2, 24) +
      Number(lastCheckedFormElement.remainingClaimMonths);
    remainingMonths = keheding % 12;
    remainingClaimMonths = kelingqu - Number(years.yilingqu);
    console.log(
      `lastyears:${JSON.stringify(years)},计算years中第 ${i}个元素，上次剩余可领取${
        lastCheckedFormElement.remainingClaimMonths
      },上次剩余未核定的缴费月份为${
        lastCheckedFormElement.remainingMonths
      },新增${xinzeng},累计为${leiji},可领取为${kelingqu},已领取为${yilingqu},剩余可领取为${remainingClaimMonths},剩余累计为${remainingMonths}`
    );
  }

  dynamicCheckForm.checkValues.push({
    xinzeng,
    leiji,
    kelingqu,
    yilingqu,
    remainingClaimMonths,
    remainingMonths,
    id: Date.now(),
  });
  for (let i = 0; i <= index; i++) {
    dynamicValidateForm.years[i].isChecked = true;
  }
};

const calServiceYear = (arr) => {
  console.log('每次计算前的值', dynamicValidateForm.years);
  arr.forEach((item) => {
    let first = item.first;
    let last = item.last;

    if (/^\d{8}$/.test(first) && /^\d{8}$/.test(last)) {
      const diff = calculateMonthDifference(
        [first.slice(0, 4), first.slice(4, 6), first.slice(6)],
        [last.slice(0, 4), last.slice(4, 6), last.slice(6)]
      );
      item.label = `${Math.floor(diff / 12)}年${diff % 12}月`;
      totalYear.value += diff;
      item.value = diff;
      item.serviceYears = getServiceMonths([first, last]);
      for (let i = 0; i < item.serviceYears.length; i++) {
        uniqueServiceMonthsSet.add(item.serviceYears[i]);
      }
    }
  });
  totalYear.label = `${Math.floor(totalYear.value / 12)}年${totalYear.value % 12}个月`;
  console.log('每次计算后的值', uniqueServiceMonthsSet);
};

const onFinish = (values) => {
  calServiceYear(dynamicValidateForm.years);
};

//文字识别相关
const fileList = ref([]);
const customRequest = (options: any) => {
  dynamicCheckForm.checkValues = [];
  dynamicValidateForm.years = [];
  const { onProgress, onError, onSuccess, file } = options;
  handleTesseract(file)
    .then((result) => {
      onProgress({ percent: 100 });
      onSuccess(result);
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
function handleTesseract(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      try {
        const result = await Tesseract.recognize(e.target!.result).then((result) => {
          dynamicValidateForm.years = fixRecoginizedData(result.data.text);
          calServiceYear(dynamicValidateForm.years);
        });
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

function getServiceMonths(dateArray) {
  const startDate = new Date(
    dateArray[0].slice(0, 4) + '-' + dateArray[0].slice(4, 6) + '-' + dateArray[0].slice(6, 8)
  );
  const endDate = new Date(
    dateArray[1].slice(0, 4) + '-' + dateArray[1].slice(4, 6) + '-' + dateArray[1].slice(6, 8)
  );
  const monthsArray = [];
  const currentDate = new Date(startDate);
  console.log('endDate===>',endDate.getMonth())

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const formattedMonth = `${year}${month.toString().padStart(2, '0')}`;
    monthsArray.push(formattedMonth);
    currentDate.setMonth(currentDate.getMonth() + 1);

    if (year == 2020){
      console.log(endDate)

      console.log(currentDate)
      console.log(monthsArray)
      console.log('after currentDate==>',currentDate.getMonth())

    }

  }
  return monthsArray;
}
// const firstDate = [
//       parseInt(dates[i].slice(0, 4)),
//       parseInt(dates[i].slice(4, 6)),
//       parseInt(dates[i].slice(6)),
//     ];
//     const lastDate = [
//       parseInt(dates[i + 1].slice(0, 4)),
//       parseInt(dates[i + 1].slice(4, 6)),
//       parseInt(dates[i + 1].slice(6)),
//     ];
//     const diff = calculateMonthDifference(firstDate, lastDate);
function fixRecoginizedData(dateStr: string): any {
  const dates: string[] = dateStr.replace(/\s+/g, ' ').split(' ');
  const dateArray = [];
  //如果是18几几年说明识别错误，替换18年
  for (let i = 0; i < dates.length - 1; i += 2) {
    if (String(dates[i]).slice(0, 2) == '18') {
      dates[i] = '19' + String(dates[i]).slice(2);
    }
    if (String(dates[i + 1]).slice(0, 2) == '18') {
      dates[i + 1] = '19' + String(dates[i + 1]).slice(2);
    }

    dateArray.push({
      first: dates[i],
      last: dates[i + 1],
      value: 0,
      yilingqu: 0,
      isChecked: false,
      isRecoginizeWrong: false,
      isOnlyleiji: false,
      note: '',
      minusNum: 0,
      addNum: 0,
      label: '',
      serviceYears: [],
      id: Date.now(),
    });
  }
  return dateArray;
}
// 计算日期之间的差异（年数和月数）
function calculateMonthDifference(date1: Array<number>, date2: Array<number>) {
  const [year1, month1, day1] = date1;
  const [year2, month2, day2] = date2;

  // 创建日期对象
  const d1 = new Date(year1, month1 - 1, day1);
  const d2 = new Date(year2, month2 - 1, day2);

  // 判断是否需要减去一个月
  let adjustMonth1 = false;
  let adjustMonth2 = false;

  if (Number(year1) <= 1998 && Number(month1) < 10 && Number(day1) > 15) {
    adjustMonth1 = true;
  }

  if (Number(year2) <= 1998 && Number(month2) < 10 && Number(day2) < 15) {
    adjustMonth2 = true;
  }

  // 调整日期
  if (adjustMonth1) {
    d1.setMonth(d1.getMonth() + 1);
  }

  if (adjustMonth2) {
    d2.setMonth(d2.getMonth() - 1);
  }

  // 计算月份差
  const diffMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth() + 1;
  return diffMonths;
}

const recalPayYear = () => {
  // TODO
};

// 文件预览
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
//判断是否是一个日期
const isDate = (str) => {
  const date = new Date(str);
  return date instanceof Date;
};
// 查找重复的值
function findDuplicates(currentServiceMonths, previousServiceMonths) {
  const duplicates = [];

  for (const value of currentServiceMonths) {
    if (previousServiceMonths.includes(value)) {
      duplicates.push(value);
    }
  }
  return duplicates;
}
</script>
