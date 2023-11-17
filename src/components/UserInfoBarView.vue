<template>
  <div class="components-page-header-demo-content">
    <a-page-header
      :title="userInfo.username"
      class="site-page-header"
      :sub-title="userInfo.account"
      :avatar="{ src: '' }"
    >
      <template #tags>
        <a-tag color="blue">ID: {{userInfo.role_id}}</a-tag>
      </template>
      <template #extra>
        <!-- <a-button key="3">Operation</a-button>
        <a-button key="2">Operation</a-button> -->
         <a-switch v-model:checked="checked" />
        <a-button key="1" type="primary" danger @click="logout">登出</a-button>
      </template>
    </a-page-header>
  </div>
</template>
<script lang="ts" setup>
import {ref,watch} from 'vue'
import { useUserStore } from '@/stores';
import { useRouter } from 'vue-router';

const checked = ref(false);
watch(()=>checked.value,()=>{
  if(checked.value){

  }else{
  }
})
const router = useRouter()
const userStore = useUserStore()
const userInfo = useUserStore().userInfo

const logout = ()=>{
  userStore.logout()
  router.push('login')

}
interface IconLink {
  src: string;
  text: string;
}
const iconLinks: IconLink[] = [
  {
    src: 'https://gw.alipayobjects.com/zos/rmsportal/MjEImQtenlyueSmVEfUD.svg',
    text: 'Quick Start',
  },
  {
    src: 'https://gw.alipayobjects.com/zos/rmsportal/NbuDUAuBlIApFuDvWiND.svg',
    text: 'Product Info',
  },
  {
    src: 'https://gw.alipayobjects.com/zos/rmsportal/ohOEPSYdDTNnyMbGuyLb.svg',
    text: 'Product Doc',
  },
];
</script>
<style scoped>
.ant-page-header{
  padding-top:5px;
}



</style>
