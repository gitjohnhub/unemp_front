import api from "@/api";
export const tagCancelUnemp = async (id: number,getData:any) => {
  await api.updateNongbuData({ id: id, cancelUnemp: '1' }).then((res: any) => {
    getData();
  });
};
