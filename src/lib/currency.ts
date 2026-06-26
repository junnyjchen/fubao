/**
 * 货币工具 - 从后台 settings 表读取货币符号
 * 服务端和客户端通用
 */

/**
 * 格式化金额显示
 * @param amount 金额数值
 * @param symbol 货币符号，如 'HK$'、'¥'、'$'
 * @param decimals 小数位数，默认 2
 */
export function formatMoney(amount: number, symbol: string, decimals = 2): string {
  return `${symbol}${amount.toFixed(decimals)}`;
}

/**
 * 格式化金额（整数版，不显示小数）
 */
export function formatMoneyInt(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString()}`;
}
