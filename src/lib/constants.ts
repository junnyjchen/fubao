/**
 * @fileoverview 应用常量定义
 * @description 全局常量和配置
 * @module lib/constants
 */

// ============ 应用信息 ============

export const APP_INFO = {
  name: '符寶網',
  nameEn: 'Fubao',
  description: '全球玄門文化科普交易平台',
  version: '1.0.0',
  author: 'Fubao Team',
  website: 'https://fubao.ltd',
  keywords: ['符籙', '法器', '玄門文化', '道教', '玄學'],
} as const;

// ============ API配置 ============

export const API_CONFIG = {
  baseUrl: '/api',
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000,
} as const;

// ============ 分页配置 ============

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
} as const;

// ============ 订单状态 ============

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: '待付款',
  [ORDER_STATUS.PAID]: '已付款',
  [ORDER_STATUS.SHIPPED]: '已發貨',
  [ORDER_STATUS.DELIVERED]: '已送達',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款',
} as const;

// ============ 支付状态 ============

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  [PAYMENT_STATUS.PENDING]: '待支付',
  [PAYMENT_STATUS.PAID]: '已支付',
  [PAYMENT_STATUS.FAILED]: '支付失敗',
  [PAYMENT_STATUS.REFUNDED]: '已退款',
} as const;

// ============ 支付方式 ============

export const PAYMENT_METHODS = {
  ALIPAY: 'alipay',
  WECHAT: 'wechat',
  PAYPAL: 'paypal',
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PAYMENT_METHODS.ALIPAY]: '支付寶',
  [PAYMENT_METHODS.WECHAT]: '微信支付',
  [PAYMENT_METHODS.PAYPAL]: 'PayPal',
  [PAYMENT_METHODS.CREDIT_CARD]: '信用卡',
  [PAYMENT_METHODS.BANK_TRANSFER]: '銀行轉賬',
} as const;

// ============ 商品状态 ============

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
  DRAFT: 'draft',
} as const;

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  [PRODUCT_STATUS.ACTIVE]: '上架中',
  [PRODUCT_STATUS.INACTIVE]: '已下架',
  [PRODUCT_STATUS.OUT_OF_STOCK]: '已售罄',
  [PRODUCT_STATUS.DRAFT]: '草稿',
} as const;

// ============ 用户状态 ============

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
  PENDING: 'pending',
} as const;

export const USER_STATUS_LABELS: Record<string, string> = {
  [USER_STATUS.ACTIVE]: '正常',
  [USER_STATUS.INACTIVE]: '未激活',
  [USER_STATUS.BANNED]: '已禁用',
  [USER_STATUS.PENDING]: '待審核',
} as const;

// ============ 会员等级 ============

export const USER_LEVELS = {
  NORMAL: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  DIAMOND: 5,
} as const;

export const USER_LEVEL_LABELS: Record<number, string> = {
  [USER_LEVELS.NORMAL]: '普通會員',
  [USER_LEVELS.SILVER]: '銀卡會員',
  [USER_LEVELS.GOLD]: '金卡會員',
  [USER_LEVELS.PLATINUM]: '鉑金會員',
  [USER_LEVELS.DIAMOND]: '鑽石會員',
} as const;

// ============ 优惠券类型 ============

export const COUPON_TYPES = {
  PERCENT: 'percent',
  FIXED: 'fixed',
} as const;

export const COUPON_TYPE_LABELS: Record<string, string> = {
  [COUPON_TYPES.PERCENT]: '折扣券',
  [COUPON_TYPES.FIXED]: '代金券',
} as const;

// ============ 退款状态 ============

export const REFUND_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const REFUND_STATUS_LABELS: Record<string, string> = {
  [REFUND_STATUS.PENDING]: '待處理',
  [REFUND_STATUS.APPROVED]: '已同意',
  [REFUND_STATUS.REJECTED]: '已拒絕',
  [REFUND_STATUS.COMPLETED]: '已完成',
} as const;

// ============ 工单状态 ============

export const TICKET_STATUS = {
  OPEN: 'open',
  PROCESSING: 'processing',
  CLOSED: 'closed',
} as const;

export const TICKET_STATUS_LABELS: Record<string, string> = {
  [TICKET_STATUS.OPEN]: '待處理',
  [TICKET_STATUS.PROCESSING]: '處理中',
  [TICKET_STATUS.CLOSED]: '已關閉',
} as const;

// ============ 商户状态 ============

export const MERCHANT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export const MERCHANT_STATUS_LABELS: Record<string, string> = {
  [MERCHANT_STATUS.PENDING]: '待審核',
  [MERCHANT_STATUS.APPROVED]: '已認證',
  [MERCHANT_STATUS.REJECTED]: '審核失敗',
  [MERCHANT_STATUS.SUSPENDED]: '已停用',
} as const;

// ============ 语言选项 ============

export const LANGUAGES = {
  'zh-TW': '繁體中文',
  'zh-CN': '簡體中文',
  'en': 'English',
} as const;

// ============ 货币选项 ============

export const CURRENCIES = {
  HKD: { symbol: 'HK$', name: '港幣' },
  CNY: { symbol: '¥', name: '人民幣' },
  USD: { symbol: '$', name: '美元' },
  TWD: { symbol: 'NT$', name: '新台幣' },
} as const;

// ============ 文件上传配置 ============

export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  imageMaxSize: 5 * 1024 * 1024, // 5MB
  videoMaxSize: 100 * 1024 * 1024, // 100MB
  acceptedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  acceptedVideoTypes: ['video/mp4', 'video/webm'],
  acceptedDocTypes: ['application/pdf', 'application/msword'],
} as const;

// ============ 正则表达式 ============

export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^09\d{8}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/,
  idCard: /^[A-Z][12]\d{8}$/,
  creditCard: /^\d{13,19}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  chinese: /^[\u4e00-\u9fa5]+$/,
} as const;

// ============ 错误消息 ============

export const ERROR_MESSAGES = {
  REQUIRED: '此欄位為必填項',
  INVALID_EMAIL: '請輸入有效的電子郵件地址',
  INVALID_PHONE: '請輸入有效的手機號碼',
  INVALID_PASSWORD: '密碼必須包含大小寫字母和數字，至少8位',
  PASSWORD_MISMATCH: '兩次輸入的密碼不一致',
  NETWORK_ERROR: '網絡錯誤，請稍後重試',
  SERVER_ERROR: '服務器錯誤，請稍後重試',
  UNAUTHORIZED: '請先登錄',
  FORBIDDEN: '無權限訪問',
  NOT_FOUND: '資源不存在',
  VALIDATION_ERROR: '數據驗證失敗',
} as const;

// ============ 成功消息 ============

export const SUCCESS_MESSAGES = {
  LOGIN: '登錄成功',
  LOGOUT: '已安全退出',
  REGISTER: '註冊成功',
  SAVE: '保存成功',
  DELETE: '刪除成功',
  UPDATE: '更新成功',
  CREATE: '創建成功',
  SUBMIT: '提交成功',
  COPY: '已複製到剪貼板',
  ORDER: '下單成功',
  PAYMENT: '支付成功',
} as const;

// ============ 路由路径 ============

export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  CART: '/cart',
  CHECKOUT: '/checkout',
  USER: '/user',
  USER_ORDERS: '/user/orders',
  USER_FAVORITES: '/user/favorites',
  USER_SETTINGS: '/user/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  WIKI: '/baike',
  VIDEO: '/video',
  AI_ASSISTANT: '/ai-assistant',
  CERTIFICATE: '/certificate',
  ADMIN: '/admin',
  MERCHANT: '/merchant',
} as const;

// ============ 存储键名 ============

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_info',
  CART: 'cart_items',
  LANGUAGE: 'language',
  THEME: 'theme',
  RECENT_SEARCH: 'recent_search',
  BROWSE_HISTORY: 'browse_history',
} as const;

// ============ 时间常量 ============

export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// ============ 默认值 ============

export const DEFAULTS = {
  PAGE_SIZE: 20,
  IMAGE_QUALITY: 80,
  AVATAR_SIZE: 200,
  THUMBNAIL_SIZE: 300,
  SEARCH_DEBOUNCE: 300,
  AUTO_SAVE_DELAY: 1000,
} as const;

// 导出所有常量
export default {
  APP_INFO,
  API_CONFIG,
  PAGINATION,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PRODUCT_STATUS,
  PRODUCT_STATUS_LABELS,
  USER_STATUS,
  USER_STATUS_LABELS,
  USER_LEVELS,
  USER_LEVEL_LABELS,
  COUPON_TYPES,
  COUPON_TYPE_LABELS,
  REFUND_STATUS,
  REFUND_STATUS_LABELS,
  TICKET_STATUS,
  TICKET_STATUS_LABELS,
  MERCHANT_STATUS,
  MERCHANT_STATUS_LABELS,
  LANGUAGES,
  CURRENCIES,
  FILE_UPLOAD,
  REGEX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  STORAGE_KEYS,
  TIME,
  DEFAULTS,
};
