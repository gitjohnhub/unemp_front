import api from "@/api";
export const tagOriginalFile = async (id: number,getData:any) => {
  await api.updateNongbuData({ id: id, originalFile: '1' }).then((res: any) => {
    getData();
  });
};
export const tagWrong = async (id: number,getData:any) => {
  await api.updateNongbuData({ id: id, wrongTag: '1' }).then((res: any) => {
    getData();
  });
};
