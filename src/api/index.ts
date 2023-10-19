/**
 * api管理
 */
import { POST, GET } from '../utils/request'
export default {
  /*
   * 用户管理模块
   */
  login(params: any) {
    return POST('/users/login', params)
  },
  addUser(params: any) {
    return POST('/users/addUser', params)
  },
  updateUser(params: any) {
    return POST('/users/update', params)
  },
  getUsers() {
    return GET('/users/getUsers')
  },
  // 失业金数据
  getUnempVeriData(params: any){
    return GET('/unempVeriAll',params)
  }
}
