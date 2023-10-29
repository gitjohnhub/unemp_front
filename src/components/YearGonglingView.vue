<template>
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
          message: 'Missing first name',
        }"
      >
        <a-input v-model:value="year.first" placeholder="First year" />
      </a-form-item>
      <a-form-item
        :name="['years', index, 'last']"
        :rules="{
          required: true,
          message: 'Missing last name',
        }"
      >
        <a-input v-model:value="year.last" placeholder="Last year" />
      </a-form-item>
      <a-form-item>
        <a-input v-model:value="year.label" disabled></a-input>
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
      <a-button type="primary" html-type="submit">计算</a-button>
    </a-form-item>
    <p>{{ totalYear }}</p>
  </a-form>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';

interface year {
  first: string;
  last: string;
  label: string;
  id: number;
}
const formRef = ref<FormInstance>();
const dynamicValidateForm = reactive<{ years: year[] }>({
  years: [],
});
watch(
  () => dynamicValidateForm.years,
  (newValue, oldValue) => {
    console.log('newValue===>', newValue);
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
      label: '',
      id: Date.now(),
    },
  ];
};
const totalYear = ref();
const getDifferent = (arr) => {
  totalYear.value = 0
  const result: string[] = [];
  arr.forEach((item) => {
    const first = item.first;
    const last = item.last;

    if (/^\d{6}$/.test(first) && /^\d{6}$/.test(last)) {
      const firstDate = new Date(first.slice(0, 4) + '/' + first.slice(4));
      const lastDate = new Date(last.slice(0, 4) + '/' + last.slice(4));

      const diff =
        (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
        (lastDate.getMonth() - firstDate.getMonth()) +
        1;
      item.label = `${diff}:${Math.floor(diff / 12)}年${diff % 12}月`
      totalYear.value += diff
    }
  });

};

const onFinish = (values) => {
  console.log('Received values of form:', values);
  getDifferent(dynamicValidateForm.years);
  // dynamicValidateForm.years.forEach((item, index) => (item.label = results.value[index]));
  // const total = results.value.reduce((acc, curr) => {
  //   const months = Number(curr.split(':')[0]);
  //   return acc + months;
  // }, 0);
  totalYear.value =  `${totalYear.value} : ${Math.floor(totalYear.value / 12)}年${totalYear.value % 12}个月`;
};
</script>
