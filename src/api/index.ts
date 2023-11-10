/**
 * api管理
 */
import { POST } from '../utils/request';
export default {
  /*
   * 用户管理模块
   */
  login(params: any) {
    return POST('/users/login', params);
  },
  addUser(params: any) {
    return POST('/users/addUser', params);
  },
  updateUser(params: any) {
    return POST('/users/update', params);
  },
  getUsers(params?: any) {
    return POST('/users/getUsers', params);
  },
  // 数据
  getUnempVeriData(params: any) {
    return POST('/unempVeriAll', params);
  },
  addUnempVeriData(params: any) {
    return POST('/addUnempVeriData', params);
  },
  updateUnempVeriData(params: any) {
    return POST('/updateUnempVeriData', params);
  },

  //协查
  getXiechaData(params?: any) {
    return POST('/getXiechaData', params);
  },
  addXiechaData(params?: any) {
    return POST('/addXiechaData', params);
  },
  updateXiechaData(params?: any) {
    return POST('/updateXiechaData', params);
  },
  // 通讯录
  getContactData(params?: any) {
    return POST('/Contacts/getContactData', params);
  },
  addContactData(params?: any) {
    return POST('/Contacts/addContactData', params);
  },
  updateContactData(params?: any) {
    return POST('/Contacts/updateContactData', params);
  },
  // 转移
  getZhuanyiData(params?: any) {
    return POST('/getZhuanyiData', params);
  },
  addZhuanyiData(params?: any) {
    return POST('/addZhuanyiData', params);
  },
  updateZhuanyiData(params?: any) {
    return POST('/updateZhuanyiData', params);
  },
  getZhuanyiDataCal(params?: any) {
    return POST('/getZhuanyiDataCal', params);
  },

};
