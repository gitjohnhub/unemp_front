export interface DataItem {
  id: number;
  personName: string;
  personID: string;
  checkoperator: string;
  checknote: string;
  createtime: string;
  reviewoperator: string;
  reviewnote: string;
  // verification:string;
  alreadydelete: number;
}
export type editDataItem = Omit<DataItem, 'id'|'checkoperator'|'reviewoperator'|'createtime'>

