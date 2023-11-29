import Excel from 'exceljs'
import Tesseract, { ImageLike } from 'tesseract.js';

//图片识别文字

// 通过月份获得月尾和月头的日期
export function getMonthRange(monthSelect) {
  const firstDay = monthSelect.startOf('month').format('YYYY-MM-DD');
  const lastDay = monthSelect.endOf('month').format('YYYY-MM-DD');
  return [firstDay, lastDay];
}
export function handleTesseract(file: File,handleResult:(params:string)=>{}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      try {
        const result = await Tesseract.recognize(e.target!.result as ImageLike).then((result) => {
          console.log('result.data.text==>',result.data.text)
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
export function downloadLink(workbook,filename){
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  });

}

export function genWorkbook(headersWithWidth){
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1', {
    pageSetup: {
      orientation: 'landscape',
      showGridLines: true,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      verticalCentered: true,
      paperSize: 9,
    },
  });
  worksheet.columns = headersWithWidth
  const headers = headersWithWidth.map((item) => item.header);

  return {
    workbook,
    headers,
    worksheet
  }

}
export function calculateEndDate(startDate: string, months: String): string {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + Number(months));
  endDate.setDate(0);
  return endDate.toISOString().slice(0,10);
}
export const colorList = [
  '#25b1bf',
  '#acc2ef',
  '#3D5A80',
  '#2E8B57',
  '#c21d03',
  '#fd5732',
  '#fd5732',
  '#fd5732',
];