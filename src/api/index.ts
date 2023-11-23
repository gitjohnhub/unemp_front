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
  getZhuanyiAllDate(params?: any) {
    return POST('/getZhuanyiAllDate', params);
  },

  // yanchang
  getYanchangData(params?: any) {
    return POST('/getYanchangData', params);
  },
  addYanchangData(params?: any) {
    return POST('/addYanchangData', params);
  },
  updateYanchangData(params?: any) {
    return POST('/updateYanchangData', params);
  },
  getYanchangDataCal(params?: any) {
    return POST('/getYanchangDataCal', params);
  },
  getYanchangByJiezhen(params?: any) {
    return POST('/getYanchangByJiezhen', params);
  },
  getYanchangAllDate(params?: any) {
    return POST('/getYanchangAllDate', params);
  },

  // Nongbu
  getNongbuData(params?: any) {
    return POST('/getNongbuData', params);
  },
  addNongbuData(params?: any) {
    return POST('/addNongbuData', params);
  },
  updateNongbuData(params?: any) {
    return POST('/updateNongbuData', params);
  },
  getNongbuDataCal(params?: any) {
    return POST('/getNongbuDataCal', params);
  },
  getNongbuCalByMonthAndJiezhen(params?: any) {
    return POST('/getNongbuCalByMonthAndJiezhen', params);
  },
  getNongbuAllDate(params?: any) {
    return POST('/getNongbuAllDate', params);
  },
};
