import api from "@/api";
export const tagWrong = async (id: number,getData:any) => {
  await api.updateNongbuData({ id: id, wrongTag: '1' }).then((res: any) => {
    getData();
  });
};

export const tagOriginalFile = async (id: number,getData:any) => {
  await api.updateYanchangData({ id: id, originalFile: '1' }).then((res: any) => {
    getData();
  });
};
export const updateStatus = async (id: number,params:any,getData:any) => {
  await api.updateYanchangData({ id: id, ...params }).then((res: any) => {
    getData();
  });
};