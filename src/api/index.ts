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
  getUsers(params?: any) {
    return POST('/users/getUsers',params)
  },
  // 失业金数据
  getUnempVeriData(params: any){
    return POST('/unempVeriAll',params)
  },
  addUnempVeriData(params: any){
    return POST('/addUnempVeriData',params)
  },
  updateUnempVeriData(params:any){
    return POST('/updateUnempVeriData',params)
  },

  //失业金协查
  getXiechaData(params?: any){
    return POST('/getXiechaData',params)
  },
  addXiechaData(params?: any){
    return POST('/addXiechaData',params)
  },
  updateXiechaData(params?:any){
    return POST('/updateXiechaData',params)
  },
}
