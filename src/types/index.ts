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
  alreadydelete: number;
}
export type editDataItem = Omit<DataItem, 'id'|'checkoperator'|'reviewoperator'|'createtime'>
export const jiezhens = [
  {value:'江桥镇'},
  {value:'马陆镇'},
  {value:'外冈镇'},
  {value:'华亭镇'},
  {value:'安亭镇'},
  {value:'南翔镇'},
  {value:'徐行镇'},
  {value:'黄渡镇'},
  {value:'嘉定镇'},
  {value:'工业区'},
  {value:'真新街道'},
  {value:'新成街道'},
  {value:'菊园新区'}

]
export type Xiecha = {
  personName: string
  personID: string
  canbaoInfo: Object
  unempInfo: Object


}