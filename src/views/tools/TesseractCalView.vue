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
      <a-form-item label="本次计算后已领取：">
        <a-input v-model:value="year.yilingqu"></a-input>
      </a-form-item>
      <a-form-item>
        <a-button @click="calCheck(index)" :disabled="year.isChecked">计算本次缴费</a-button>
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
        <a-button type="primary" @click="onFinish" v-if="dynamicValidateForm.years.length>0">修改后重新计算</a-button>
        <a-tag v-if="totalYear"> {{ totalYear }}</a-tag>
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
  <a-button @click="reCalCheck" v-if="dynamicCheckForm.checkValues.length > 0">重新计算结果</a-button>
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
  label: string;
  yilingqu: number;
  isChecked: boolean;
  id: number;
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
// watch(
//   () => dynamicValidateForm.years,
//   (newValue, oldValue) => {
//     console.log('dynamicValidateForm newValue===>', newValue);
//   }
// );
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
      label: '',
      yilingqu: 0,
      isChecked: false,
      id: Date.now(),
    },
  ];
  console.log('addYear===>', dynamicValidateForm.years);
};
const totalYear = ref();
const calCheck = (index: number) => {
  const years = dynamicValidateForm.years[index];
  const lastCheckedIndex = dynamicValidateForm.years.findIndex((item) => item.isChecked === true);
  console.log(`lastCheckedIndex===>${lastCheckedIndex}`);
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
    console.log(`keheding===>${keheding},${Math.floor(keheding / 12)}`);

    kelingqu =
      Math.min(Math.floor(keheding / 12) * 2, 24) +
      Number(lastCheckedFormElement.remainingClaimMonths);
    console.log(
      `kelingqu===>${kelingqu},${Math.floor(kelingqu / 12)}+${lastCheckedFormElement.kelingqu}`
    );
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

const getDifferent = (arr) => {
  totalYear.value = 0;
  arr.forEach((item) => {
    let first = item.first;
    let last = item.last;

    if (/^\d{8}$/.test(first) && /^\d{8}$/.test(last)) {
      console.log('first',first)

      const diff = calculateMonthDifference(
        [first.slice(0, 4), first.slice(4, 6), first.slice(6)],
        [last.slice(0, 4), last.slice(4, 6), last.slice(6)]
      );
      item.label = `${diff}:${Math.floor(diff / 12)}年${diff % 12}月`;
      totalYear.value += diff;
    }
    console.log(`${first}-${last},total:${totalYear.value}`)
  });
  totalYear.value = `${totalYear.value} : ${Math.floor(totalYear.value / 12)}年${
    totalYear.value % 12
  }个月`;
};

const onFinish = (values) => {
  getDifferent(dynamicValidateForm.years);
  // dynamicValidateForm.years.forEach((item, index) => (item.label = results.value[index]));
  // const total = results.value.reduce((acc, curr) => {
  //   const months = Number(curr.split(':')[0]);
  //   return acc + months;
  // }, 0);

};

//文字识别相关
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
  recognitionResult.value = '';
};
function handleTesseract(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      try {
        const result = await Tesseract.recognize(e.target!.result).then((result) => {
          recognitionResult.value = cal(result.data.text);
          dynamicValidateForm.years = cal(result.data.text);
          getDifferent(dynamicValidateForm.years);

          // resolve(result.data.text)
          // recognitionResult.value = result.data.text
        });
        resolve(result);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

const fileList = ref([]);

function cal(dateStr: string): any {
  const dates: string[] = dateStr.replace(/\s+/g, ' ').split(' ');
  const dateArray = [];

  for (let i = 0; i < dates.length -1; i += 2) {
    if (String(dates[i]).slice(0,2) == '18'){
      console.log('找到一个识别错误的')
      dates[i] = '19' + String(dates[i]).slice(2)
    }
    if (String(dates[i+1]).slice(0,2) == '18'){
      dates[i+1] = '19' + String(dates[i+1]).slice(2)
    }

    const firstDate = [
      parseInt(dates[i].slice(0, 4)),
      parseInt(dates[i].slice(4, 6)),
      parseInt(dates[i].slice(6)),
    ];
    const lastDate = [
      parseInt(dates[i + 1].slice(0, 4)),
      parseInt(dates[i + 1].slice(4, 6)),
      parseInt(dates[i + 1].slice(6)),
    ];
    //如果是18几几年说明识别错误，替换18年
    console.log('firstDate====>',firstDate)
    const diff = calculateMonthDifference(firstDate, lastDate);
    dateArray.push({
      first: dates[i],
      last: dates[i + 1],
      yilingqu: 0,
      isChecked: false,
      label: diff,
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
    console.log('year1 > 1998 && day1 > 15', year1);
    adjustMonth1 = true;
  }

  if (Number(year2) <= 1998 && Number(month2) < 10 && Number(day2) < 15) {
    adjustMonth2 = true;
  }

  // 调整日期
  if (adjustMonth1) {
    d1.setMonth(d1.getMonth() + 1);
    console.log('第一个日期已加上去1个月');
  }

  if (adjustMonth2) {
    d2.setMonth(d2.getMonth() - 1);
    console.log('第二个日期已减去1个月');
  }

  // 计算月份差
  const diffMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth() + 1;
  return diffMonths;
}

const recognitionResult = ref('');
const reCalCheck = ()=>{
  // TODO
}

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
</script>
