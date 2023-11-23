import api from "@/api";
export const statusList = ['已登记', '已审批','待登记', '已取消', '全部'];

export const tagOriginalFile = async (id: number,getData:any) => {
  await api.updateYanchangData({ id: id, originalFile: '1' }).then((res: any) => {
    getData();
  });
};
export const cancelData = async (id: number,getData:any) => {
  await api.updateYanchangData({ id: id, status: statusList.indexOf('已取消')}).then((res: any) => {
    getData();
  });
};
export const deleteData = async (id: number,getData:any) => {
  await api.updateYanchangData({ id: id, status: statusList.indexOf('已删除') }).then((res: any) => {
    getData();
  });
};
export const checkData = async (id: number,getData:any) => {
  await api.updateYanchangData({ id: id, status: statusList.indexOf('已登记') }).then((res: any) => {
    getData();
  });
};
export const getStatus = (status: String) => {
  return statusList[Number(status)];
};