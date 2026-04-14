/**
 * 格式化工具函数
 */

// ==================== 金额格式化 ====================

/**
 * 格式化金额（保留2位小数）
 */
export function formatPrice(amount: number | string, showSymbol = true): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '¥0.00';
  const formatted = num.toFixed(2);
  return showSymbol ? `¥${formatted}` : formatted;
}

/**
 * 格式化金额（简化显示）
 */
export function formatPriceSimple(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toFixed(0);
}

/**
 * 格式化折扣比例
 */
export function formatDiscount(original: number, current: number): string {
  if (original <= 0) return '';
  const discount = (current / original) * 10;
  return discount.toFixed(1) + '折';
}

/**
 * 计算折扣百分比
 */
export function calculateDiscountPercent(original: number, current: number): number {
  if (original <= 0) return 0;
  return Math.round((current / original) * 100);
}

// ==================== 数量格式化 ====================

/**
 * 格式化数量（带单位）
 */
export function formatCount(count: number): string {
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿';
  }
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
}

/**
 * 格式化库存
 */
export function formatStock(stock: number): string {
  if (stock === 0) return '缺货';
  if (stock <= 10) return `仅剩${stock}件`;
  return `库存${stock}件`;
}

// ==================== 日期格式化 ====================

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 相对时间
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (weeks < 4) return `${weeks}周前`;
  if (months < 12) return `${months}个月前`;
  return `${years}年前`;
}

/**
 * 格式化时长
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时`;
  return `${Math.floor(seconds / 86400)}天`;
}

// ==================== 文本格式化 ====================

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number, ellipsis = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * 隐藏手机号中间4位
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 隐藏邮箱
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [username, domain] = email.split('@');
  if (username.length <= 3) return email;
  return username.slice(0, 3) + '***@' + domain;
}

/**
 * 隐藏银行卡号
 */
export function maskBankCard(card: string): string {
  if (!card || card.length < 8) return card;
  return card.replace(/(\d{4})\d+(\d{4})/, '$1 **** **** $2');
}

/**
 * 格式化姓名
 */
export function formatName(name: string, type: 'full' | 'first' | 'last' = 'full'): string {
  if (!name) return '';
  if (type === 'first') return name.charAt(0);
  if (type === 'last') return name.slice(-1);
  return name.slice(0, 1) + '***' + name.slice(-1);
}

/**
 * 首字母大写
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * 转驼峰
 */
export function camelCase(text: string): string {
  return text
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

// ==================== 尺寸格式化 ====================

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化距离
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// ==================== 百分比格式化 ====================

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 计算百分比
 */
export function calculatePercent(value: number, total: number, decimals = 0): string {
  if (total === 0) return '0%';
  return formatPercent(value / total, decimals);
}

// ==================== 地址格式化 ====================

/**
 * 格式化完整地址
 */
export function formatAddress(address: {
  province?: string;
  city?: string;
  district?: string;
  address?: string;
}): string {
  const parts = [address.province, address.city, address.district, address.address].filter(Boolean);
  return parts.join('');
}

/**
 * 格式化收货地址
 */
export function formatFullAddress(
  address: {
    consignee?: string;
    phone?: string;
    province?: string;
    city?: string;
    district?: string;
    address?: string;
  },
  multiLine = true
): string {
  const parts = [
    address.consignee && address.phone ? `${address.consignee} ${maskPhone(address.phone)}` : null,
    formatAddress(address),
  ].filter(Boolean);

  return multiLine ? parts.join('\n') : parts.join(' ');
}

// ==================== 订单状态格式化 ====================

/**
 * 订单状态文本
 */
export function getOrderStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '待收货',
    delivered: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  };
  return statusMap[status] || status;
}

/**
 * 订单状态颜色
 */
export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'text-orange-600 bg-orange-50',
    paid: 'text-blue-600 bg-blue-50',
    shipped: 'text-purple-600 bg-purple-50',
    delivered: 'text-purple-600 bg-purple-50',
    completed: 'text-green-600 bg-green-50',
    cancelled: 'text-gray-600 bg-gray-50',
    refunded: 'text-red-600 bg-red-50',
  };
  return colorMap[status] || 'text-gray-600 bg-gray-50';
}
