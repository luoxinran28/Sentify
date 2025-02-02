import * as XLSX from 'xlsx';

export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 将Excel数据转换为数组
        const articles = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          .filter(row => row.length > 0 && row[0]) // 过滤空行
          .map(row => row[0].toString().trim()) // 只取第一列，并转为字符串
          .filter(text => text.length > 0); // 过滤空字符串
        
        resolve(articles);
      } catch (error) {
        reject(new Error('Excel文件格式错误'));
      }
    };

    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };

    reader.readAsArrayBuffer(file);
  });
}; 