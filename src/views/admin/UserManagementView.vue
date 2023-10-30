<template>
  <a-form
    :model="formState"
    name="basic"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
  >
    <a-form-item
      label="Username"
      name="username"
      :rules="[{ required: true, message: 'Please input your username!' }]"
    >
      <a-input v-model:value="formState.username" />
    </a-form-item>
    <a-form-item label="登陆用户名" name="account">
      <a-input v-model:value="account" disabled></a-input>
    </a-form-item>

    <a-form-item
      label="Password"
      name="password"
      :rules="[{ required: true, message: 'Please input your password!' }]"
    >
      <a-input-password v-model:value="formState.password" />
    </a-form-item>

    <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
      <a-button type="primary" @click="addUser">新增用户</a-button>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
import { pinyin } from 'pinyin-pro';
import { message } from 'ant-design-vue';
import api from '@/api';

interface FormState {
  username: string;
  password: string;
  checkObject:string;
  role_id: number;
  status: number;
}

const formState = ref<FormState>({
  username: '',
  checkObject:'',
  password: '',
  role_id: 1,
  status: 1,
});
const account = computed(() => {
  return pinyin(formState.value.username, { toneType: 'none' }).replace(/\s/g, '');
});
const addUser = () => {
  console.log('add user start');
  api
    .addUser({ ...formState.value, account: account.value })
    .then((res) => {
      console.log(res);
      message.info('添加成功');
    })
    .catch((e) => {
      console.log(e);
    });
};
</script>
