<template>
  <div class="login-wrapper">
      <!-- <div class="title">登录页面</div> -->
      <a-form :model="user" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="用户名：">
          <a-input type="text" v-model:value="user.account"></a-input>
        </a-form-item>
        <a-form-item label="密码：">
          <a-input type="password" v-model:value="user.password" @keydown.enter="login"></a-input>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button type="primary" @click="login"   >登录</a-button>
          <!-- <a-button  @click="register">注册</a-button> -->
        </a-form-item>
      </a-form>

  </div>
</template>


<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import api from '../api/index'
import { useUserStore } from '@/stores/index';
const router = useRouter()
const userStore = useUserStore()
const user =ref({
  account:'',
  password:''
})

const login = (()=>{
  api.login(user.value).then((res:any)=>{
    console.log('userInfores=>',res)
    userStore.saveUserInfo(res)
    router.push('applyTable')
  })

})
// const register = (()=>{
//   api.register(user.value).then(()=>{
//     message.info('注册成功')
//   })
// })

</script>
<style scoped>
.login-wrapper{
  display: grid;
  place-items: center;
  margin-top: 100px;
}
</style>
