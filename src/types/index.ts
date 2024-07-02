export interface DataItem {
  id: number;
  personName: string;
  personID: string;
  jiezhen: string;
  checkoperator: string;
  checknote: string;
  createtime: string;
  reviewoperator: string;
  reviewnote: string;
  verification: string;
}
export type editDataItem = Omit<
  DataItem,
  "id" | "checkoperator" | "reviewoperator" | "createtime"
>;
export const rules = {
  personID: [
    { required: true, message: "请输入身份证号", trigger: "change" },
    { min: 18, max: 18, message: "请填写18位身份证", trigger: "blur" },
    // {type:'number', message:'请检查格式', trigger: 'change' }
  ],
  personName: [{ required: true, message: "请输入姓名", trigger: "change" }],
};
export const labelCol = { style: { width: "150px" } };
export const wrapperCol = { span: 14 };
export const jiezhenList = [
  "江桥镇",
  "马陆镇",
  "外冈镇",
  "华亭镇",
  "安亭镇",
  "南翔镇",
  "徐行镇",
  "黄渡镇",
  "嘉定镇街道",
  "嘉定工业区",
  "真新新村街道",
  "新成路街道",
  "菊园新区",
  "APP",
];
export const jiezhens = jiezhenList.map((item) => ({
  value: item,
  label: item,
}));
export type Xiecha = {
  personName: string;
  personID: string;
  canbaoInfo: Object;
  unempInfo: Object;
};
export const colorList = [
  "#25b1bf",
  "#acc2ef",
  "#3D5A80",
  "#2E8B57",
  "#c21d03",
  "#fd5732",
  "#fd5732",
  "#fd5732",
  "#25b1bf",
  "#acc2ef",
  "#3D5A80",
  "#2E8B57",
  "#c21d03",
  "#fd5732",
  "#fd5732",
  "#fd5732",
];
export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const alpahbets = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
