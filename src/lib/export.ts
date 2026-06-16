/**
 * 数据导出工具
 * 标准：所有表格数据导出必须通过此模块
 */

interface ExportColumn {
  id?: string;
  key?: string;
  header: string;
}

/**
 * 导出为 CSV 文件
 */
export function exportToCSV(data: Record<string, unknown>[], columns: ExportColumn[], filename: string): void {
  const headers = columns.map((c) => c.header).join(',');
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const fieldKey = c.id || c.key || '';
        const val = row[fieldKey];
        const str = val == null ? '' : String(val);
        // CSV 中含逗号/换行/双引号的字段需要用双引号包裹
        return /[,"\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      })
      .join(',')
  );
  const csv = [headers, ...rows].join('\n');
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
}

/**
 * 导出为 Excel 兼容的 HTML 表格文件
 */
export function exportToExcel(data: Record<string, unknown>[], columns: ExportColumn[], filename: string): void {
  const headerRow = '<tr>' + columns.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('') + '</tr>';
  const dataRows = data
    .map(
      (row) =>
        '<tr>' + columns.map((c) => {
          const fieldKey = c.id || c.key || '';
          return `<td>${escapeHtml(row[fieldKey] == null ? '' : String(row[fieldKey]))}</td>`;
        }).join('') + '</tr>'
    )
    .join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>${headerRow}${dataRows}</table></body></html>`;
  downloadFile(html, `${filename}.xls`, 'application/vnd.ms-excel');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
