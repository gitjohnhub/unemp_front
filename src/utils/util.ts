import Excel from "exceljs";
import { ImageLike, createWorker } from "tesseract.js";
import { DataItem, months, alpahbets } from "@/types";
import { message } from "ant-design-vue";
import { useUserStore } from "@/stores";

// 通过月份获得月尾和月头的日期
export function getMonthRange(monthSelect) {
  const firstDay = monthSelect.startOf("month").format("YYYY-MM-DD");
  const lastDay = monthSelect.endOf("month").format("YYYY-MM-DD");
  return [firstDay, lastDay];
}
export function handleTesseract(
  file: File,
  handleResult: (params: string) => {}
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      try {
        const worker = await createWorker("chi_sim");
        const result = await worker
          .recognize(e.target!.result as ImageLike)
          .then((result) => {
            console.log("result.data.text==>", result.data.text);
            const dateArray = handleResult(result.data.text);
            resolve(dateArray);
          });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}
export function downloadLink(workbook, filename) {
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  });
}
//计算累计
export function calculateStatistics(data) {
  const monthlyTotals = Array(12).fill(0);
  const townTotals = {};

  for (const item of data) {
    const { jiezhen, value } = item;

    // 统计每个街镇每个月的数据
    if (!townTotals[jiezhen]) {
      townTotals[jiezhen] = Array(12).fill(0);
    }

    for (let i = 0; i < value.length; i++) {
      const monthlyValue = value[i];
      townTotals[jiezhen][i] += monthlyValue;
      monthlyTotals[i] += monthlyValue;
    }
  }

  return {
    monthlyTotals,
    townTotals,
  };
}

export function CalByMonthAndJiezhen(data: any) {
  const result: any = [];
  // 遍历原始数据，根据街镇进行分组
  const groupedData = data.reduce(
    (acc: Record<string, DataItem[]>, item: DataItem) => {
      if (!acc[item.jiezhen]) {
        acc[item.jiezhen] = [];
      }
      acc[item.jiezhen].push(item);
      return acc;
    },
    {}
  );
  const nextHandleData = [];

  // 将分组后的数据转换为目标格式
  for (const jiezhen in groupedData) {
    let total = 0;

    const groupedItems = groupedData[jiezhen];
    const value: (number | string)[] = [];

    // 初始化 value 数组
    for (let i = 0; i <= 11; i++) {
      value.push(0);
    }

    // 填充对应月份的值
    for (const item of groupedItems) {
      value[item.month - 1] = item.count;
      total += item.count;
    }
    nextHandleData.push({
      jiezhen,
      value,
      total,
    });

    result.push({
      jiezhen,
      ...Object.fromEntries(
        months.map((month, index) => [month, value[index]])
      ),
      total,
    });
  }
  const totalCal = calculateStatistics(nextHandleData);
  result.push({
    jiezhen: "合计",
    ...Object.fromEntries(
      months.map((month, index) => [month, totalCal.monthlyTotals[index]])
    ),
    total: totalCal.monthlyTotals.reduce((pre, cur) => {
      return pre + cur;
    }, 0),
  });
  return result;
}

export function genWorkbook(headersWithWidth) {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1", {
    pageSetup: {
      orientation: "landscape",
      showGridLines: true,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      verticalCentered: true,
      paperSize: 9,
    },
  });
  worksheet.columns = headersWithWidth;
  const headers = headersWithWidth.map((item) => item.header);

  return {
    workbook,
    headers,
    worksheet,
  };
}
function calculateAge(idNumber) {
  // 提取出生日期
  var birthday = idNumber.substr(6, 8);

  // 获取当前日期
  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  var currentMonth = currentDate.getMonth() + 1;
  var currentDay = currentDate.getDate();

  // 计算年龄
  var birthYear = parseInt(birthday.substr(0, 4));
  var birthMonth = parseInt(birthday.substr(4, 2));
  var birthDay = parseInt(birthday.substr(6, 2));

  var age = currentYear - birthYear;

  // 根据出生月份和日期判断是否已过生日
  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age--;
  }

  return age;
}
export function calculateEndDate(
  personID: string,
  startDate: string,
  months: String
): string {
  if (personID.length == 18) {
    const age = calculateAge(personID);
    const gender = personID.substring(16, 17);
    console.log(age, gender);
  }
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + Number(months));
  endDate.setDate(0);
  return endDate.toISOString().slice(0, 10);
}

//数据导出功能
export const nongbuHeader = [
  { header: "序号", key: "index", width: 6 },
  { header: "姓名", key: "personName", width: 10 },
  { header: "身份证", key: "personID", width: 26 },
  { header: "镇保", key: "chengPayMonth", width: 10 },
  { header: "城保", key: "zhenPayMonth", width: 10 },
  { header: "街镇", key: "jiezhen", width: 24 },
  { header: "原件", key: "originalFile", width: 24 },
  { header: "审批情况", key: "status", width: 22 },
  { header: "备注", key: "note", width: 22 },
];
export const formattedTime = (date: string) => {
  const originalDate = new Date(date);
  const updatedDate = new Date(
    originalDate.getTime() + 8 * 60 * 60 * 1000
  ).toISOString();
  return [`${updatedDate.slice(0, 10)}`, `${updatedDate.slice(11, 19)}`];
};
export const exportExcel = (
  headersWithWidth: any[],
  fileName: string,
  getData: any,
  monthRangeSelect: any[] | string = []
) => {
  return new Promise((resolve, reject) => {
    try {
      // 写入文件
      console.log("monthRangeSelect===>", monthRangeSelect);
      const { workbook, headers, worksheet } = genWorkbook(headersWithWidth);

      let title = `${fileName}`;
      if (typeof monthRangeSelect == "string") {
        if (monthRangeSelect !== "") {
          title = `${fileName}_${monthRangeSelect}`;
        }
      } else if (Array.isArray(monthRangeSelect)) {
        if (monthRangeSelect.length !== 0) {
          title = `${fileName}_${monthRangeSelect[0].format(
            "YYYY-MM-DD"
          )}_${monthRangeSelect[1].format("YYYY-MM-DD")}`;
        }
      }
      console.log("title===>", title);
      worksheet.addRow(headers);
      worksheet.mergeCells(`A1:${alpahbets[headers.length - 1]}1`);
      worksheet.getCell("A1").value = title;
      worksheet.getCell(`${alpahbets[headers.length - 1]}1`).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      console.log("headerwithWidth===>", headersWithWidth);
      getData({ noindex: 1 }).then((data: any) => {
        let totalPayNum = 0;
        data.map((item, index) => {
          const ItemList = [];
          headersWithWidth
            .map((header) => {
              return header.key;
            })
            .forEach((header) => {
              switch (header) {
                case "index":
                  ItemList.push(index + 1);
                  break;
                case "status":
                  ItemList.push(item[header] == "1" ? "已审核" : "");
                  break;
                case "originalFile":
                  ItemList.push(item[header] == "1" ? "已收到原件" : "无");
                  break;
                case "createtime":
                  ItemList.push(item[header].slice(0, 10));
                  break;
                case "rule":
                  ItemList.push(
                    Number(item.payMonth) < 12
                      ? "2175.00/1-12月"
                      : "2175.00/1-12月，1740.00/13-24月"
                  );
                  break;
                case "pay":
                  ItemList.push(CalPayMonth(item.payMonth));
                  totalPayNum += CalPayMonth(item.payMonth);
                  break;
                default:
                  ItemList.push(item[header]);
              }
            });
          worksheet.addRow(ItemList);
        });
        if (fileName == "非上海户籍失业保险转移支付汇总表") {
          worksheet.addRow(["合计", "", "", "", "", "", "", `${totalPayNum}`]);
          worksheet.addRow([
            "",
            "",
            `打印人:${userInfo.username}`,
            "打印日期:",
            `${new Date().toLocaleDateString()}`,
            "",
            "",
            "",
          ]);
        }

        worksheet.pageSetup.printArea = `A1:${alpahbets[headers.length - 1]}${
          data.length + 4
        }`;
        worksheet.eachRow((row, rowNumber) => {
          row.font = { size: 15 };
          row.eachCell((cell, colNumber) => {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          });
        });
        worksheet.getRow(2).font = { size: 15, bold: true };
        worksheet.getRow(1).font = { size: 18, bold: true };

        // 导出 Excel 文件
        downloadLink(workbook, title);
        resolve("success");
      });
    } catch (error) {
      message.info("导出失败,请联系管理员");
      reject(error);
    }
  });
};
// 计算核发标准
const CalPayMonth = (payMonth) => {
  if (payMonth) {
    const numPayMonth = Number(payMonth);
    if (numPayMonth <= 12) {
      return numPayMonth * 2175 * 1.5;
    } else {
      return 12 * 2175 * 1.5 + (numPayMonth - 12) * 1740 * 1.5;
    }
  } else {
    return 0;
  }
};
const userStore = useUserStore();
const userInfo = userStore.userInfo;
