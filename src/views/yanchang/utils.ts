import api from "@/api";
export const statusList = ["已登记", "已审批", "待登记", "已取消", "全部"];

export const cancelData = async (id: number, getData: any) => {
  await api
    .updateYanchangData({ id: id, status: statusList.indexOf("已取消") })
    .then((res: any) => {
      getData();
    });
};
export const deleteData = async (id: number, getData: any) => {
  await api
    .updateYanchangData({ id: id, status: statusList.indexOf("已删除") })
    .then((res: any) => {
      getData();
    });
};
export const checkData = async (id: number, getData: any) => {
  await api
    .updateYanchangData({ id: id, status: statusList.indexOf("已登记") })
    .then((res: any) => {
      getData();
    });
};
export const getStatus = (status: String) => {
  return statusList[Number(status)];
};
export function genAphabet() {
  const alphabet = [];
  // 生成A到H的字母序列
  for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
    let letter = String.fromCharCode(i);
    alphabet.push(letter);
  }
  console.log(alphabet, alphabet);

  return alphabet;
}
