import Excel from 'exceljs'

// 通过月份获得月尾和月头的日期
export function getMonthRange(monthSelect) {
  const firstDay = monthSelect.startOf('month').format('YYYY-MM-DD');
  const lastDay = monthSelect.endOf('month').format('YYYY-MM-DD');
  return [firstDay, lastDay];
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