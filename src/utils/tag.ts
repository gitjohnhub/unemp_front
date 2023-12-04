import api from "@/api";
export const tagWrong = async (id: number, getData: any, from: string) => {
  switch (from) {
    case "nongbu":
      await api.updateNongbuData({ id: id, wrongTag: "1" }).then((res: any) => {
        getData();
      });
      break;
    case "yanchang":
      await api
        .updateYanchangData({ id: id, wrongTag: "1" })
        .then((res: any) => {
          getData();
        });
      break;
    default:
      break;
  }
};

export const tagOriginalFile = async (
  id: number,
  getData: any,
  from: string
) => {
  switch (from) {
    case "nongbu":
      await api
        .updateNongbuData({ id: id, originalFile: "1" })
        .then((res: any) => {
          getData();
        });
      break;
    case "yanchang":
      await api
        .updateYanchangData({ id: id, originalFile: "1" })
        .then((res: any) => {
          getData();
        });
      break;
    default:
      break;
  }
};
export const updateStatus = async (id: number, params: any, getData: any) => {
  await api.updateYanchangData({ id: id, ...params }).then((res: any) => {
    getData();
  });
};
