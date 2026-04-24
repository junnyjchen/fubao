/**
 * @fileoverview 数据导出工具
 * @description 支持CSV、Excel格式导出
 * @module lib/export
 */

/**
 * 导出CSV文件
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[],
  filename: string
) {
  // 生成表头
  const headers = columns.map(col => col.header).join(',');
  
  // 生成数据行
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      // 处理特殊字符和换行
      const cell = String(value ?? '');
      // 如果包含逗号、换行或引号，需要用引号包裹
      if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  );
  
  // 组合CSV内容
  const csv = [headers, ...rows].join('\n');
  
  // 添加BOM以支持中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  
  // 下载文件
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * 导出Excel文件（简化版，实际可用xlsx库）
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[],
  filename: string
) {
  // 生成HTML表格（Excel可以识别）
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
  html += '<head><meta charset="UTF-8"></head><body>';
  html += '<table border="1">';
  
  // 表头
  html += '<tr>';
  columns.forEach(col => {
    html += `<th style="background-color: #f0f0f0; font-weight: bold;">${col.header}</th>`;
  });
  html += '</tr>';
  
  // 数据行
  data.forEach(item => {
    html += '<tr>';
    columns.forEach(col => {
      const value = item[col.key];
      html += `<td>${escapeHtml(String(value ?? ''))}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</table></body></html>';
  
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadBlob(blob, `${filename}.xls`);
}

/**
 * 导出JSON文件
 */
export function exportToJSON<T>(
  data: T,
  filename: string
) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * 导出PDF（需要前端库支持，此处为占位）
 */
export async function exportToPDF(
  elementId: string,
  filename: string
) {
  // 实际项目中可以使用 html2pdf.js 或 jspdf
  console.log(`导出PDF: ${elementId} -> ${filename}`);
  alert('PDF導出功能需要安裝額外的庫，如 html2pdf.js');
}

/**
 * 下载Blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * HTML转义
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 预设的导出列配置

/**
 * 订单导出列配置
 */
export const orderExportColumns = [
  { key: 'id' as const, header: '訂單編號' },
  { key: 'order_no' as const, header: '訂單號' },
  { key: 'user_name' as const, header: '用戶名' },
  { key: 'total_amount' as const, header: '訂單金額' },
  { key: 'status' as const, header: '訂單狀態' },
  { key: 'payment_status' as const, header: '支付狀態' },
  { key: 'created_at' as const, header: '創建時間' },
  { key: 'paid_at' as const, header: '支付時間' },
];

/**
 * 商品导出列配置
 */
export const productExportColumns = [
  { key: 'id' as const, header: '商品ID' },
  { key: 'name' as const, header: '商品名稱' },
  { key: 'category_name' as const, header: '分類' },
  { key: 'price' as const, header: '價格' },
  { key: 'stock' as const, header: '庫存' },
  { key: 'sales' as const, header: '銷量' },
  { key: 'status' as const, header: '狀態' },
  { key: 'created_at' as const, header: '創建時間' },
];

/**
 * 用户导出列配置
 */
export const userExportColumns = [
  { key: 'id' as const, header: '用戶ID' },
  { key: 'username' as const, header: '用戶名' },
  { key: 'email' as const, header: '郵箱' },
  { key: 'phone' as const, header: '手機' },
  { key: 'level' as const, header: '會員等級' },
  { key: 'points' as const, header: '積分' },
  { key: 'status' as const, header: '狀態' },
  { key: 'created_at' as const, header: '註冊時間' },
];

/**
 * 分销佣金导出列配置
 */
export const commissionExportColumns = [
  { key: 'id' as const, header: 'ID' },
  { key: 'user_name' as const, header: '分銷商' },
  { key: 'order_no' as const, header: '訂單號' },
  { key: 'amount' as const, header: '佣金金額' },
  { key: 'rate' as const, header: '佣金比例' },
  { key: 'status' as const, header: '狀態' },
  { key: 'created_at' as const, header: '創建時間' },
];

/**
 * 优惠券导出列配置
 */
export const couponExportColumns = [
  { key: 'id' as const, header: 'ID' },
  { key: 'name' as const, header: '優惠券名稱' },
  { key: 'code' as const, header: '優惠碼' },
  { key: 'type' as const, header: '類型' },
  { key: 'value' as const, header: '優惠金額/折扣' },
  { key: 'min_amount' as const, header: '最低消費' },
  { key: 'used_count' as const, header: '已使用' },
  { key: 'total_count' as const, header: '總數量' },
  { key: 'status' as const, header: '狀態' },
  { key: 'expire_at' as const, header: '過期時間' },
];
