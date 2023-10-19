import { defineStore } from 'pinia'
import storage from '@/utils/storage'
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: storage.getItem('userInfo') ?? "",
    // lostFound_all:"",
  }),
  actions:{
    saveUserInfo(userInfo:any){
      this.userInfo = userInfo;
      storage.setItem('userInfo',userInfo)
    },
    logout(){
      this.userInfo = {}
      storage.clearAll()
    }
  }

})