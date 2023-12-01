export interface DataItem {
  id: number;
  personName: string;
  personID: string;
  jiezhen:string,
  checkoperator: string;
  checknote: string;
  createtime: string;
  reviewoperator: string;
  reviewnote: string;
  verification:string;
}
export type editDataItem = Omit<DataItem, 'id'|'checkoperator'|'reviewoperator'|'createtime'>
export const jiezhens = [
  {value:'江桥镇',label:'江桥镇'},
  {value:'马陆镇',label:'马陆镇'},
  {value:'外冈镇',label:'外冈镇'},
  {value:'华亭镇',label:'华亭镇'},
  {value:'安亭镇',label:'安亭镇'},
  {value:'南翔镇',label:'南翔镇'},
  {value:'徐行镇',label:'徐行镇'},
  {value:'黄渡镇',label:'黄渡镇'},
  {value:'嘉定镇',label:'嘉定镇'},
  {value:'工业区',label:'工业区'},
  {value:'真新街道',label:'真新街道'},
  {value:'新成路街道',label:'新成路街道'},
  {value:'菊园新区',label:'菊园新区'},
  {value:'APP',label:'APP'}

]
export type Xiecha = {
  personName: string
  personID: string
  canbaoInfo: Object
  unempInfo: Object


}