/**
 * @fileoverview 表单验证工具
 * @description 统一的表单验证规则和工具函数
 * @module lib/validation
 */

// 验证结果类型
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

// 验证规则类型
export type ValidationRule = 
  | 'required'
  | 'email'
  | 'phone'
  | 'url'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'integer'
  | 'positiveNumber'
  | 'password'
  | 'confirmPassword'
  | 'chinese'
  | 'english'
  | 'idCard'
  | 'creditCard';

// 验证规则配置
export interface ValidationConfig {
  rule: ValidationRule;
  value?: unknown;
  message?: string;
}

// 预设验证规则
const validators: Record<string, (value: unknown, config?: ValidationConfig) => ValidationResult> = {
  // 必填验证
  required: (value) => {
    if (value === undefined || value === null || value === '') {
      return { valid: false, message: '此欄位為必填項' };
    }
    if (Array.isArray(value) && value.length === 0) {
      return { valid: false, message: '請至少選擇一項' };
    }
    return { valid: true };
  },

  // 邮箱验证
  email: (value) => {
    if (!value) return { valid: true };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      return { valid: false, message: '請輸入有效的電子郵件地址' };
    }
    return { valid: true };
  },

  // 手机号验证（台湾）
  phone: (value) => {
    if (!value) return { valid: true };
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(String(value).replace(/[-\s]/g, ''))) {
      return { valid: false, message: '請輸入有效的手機號碼（09開頭）' };
    }
    return { valid: true };
  },

  // URL验证
  url: (value) => {
    if (!value) return { valid: true };
    try {
      new URL(String(value));
      return { valid: true };
    } catch {
      return { valid: false, message: '請輸入有效的網址' };
    }
  },

  // 最小长度验证
  minLength: (value, config) => {
    if (!value) return { valid: true };
    const length = String(value).length;
    const min = config?.value as number;
    if (length < min) {
      return { valid: false, message: `長度不能少於 ${min} 個字符` };
    }
    return { valid: true };
  },

  // 最大长度验证
  maxLength: (value, config) => {
    if (!value) return { valid: true };
    const length = String(value).length;
    const max = config?.value as number;
    if (length > max) {
      return { valid: false, message: `長度不能超過 ${max} 個字符` };
    }
    return { valid: true };
  },

  // 最小值验证
  min: (value, config) => {
    if (!value && value !== 0) return { valid: true };
    const num = Number(value);
    const min = config?.value as number;
    if (isNaN(num) || num < min) {
      return { valid: false, message: `值不能小於 ${min}` };
    }
    return { valid: true };
  },

  // 最大值验证
  max: (value, config) => {
    if (!value && value !== 0) return { valid: true };
    const num = Number(value);
    const max = config?.value as number;
    if (isNaN(num) || num > max) {
      return { valid: false, message: `值不能大於 ${max}` };
    }
    return { valid: true };
  },

  // 正则表达式验证
  pattern: (value, config) => {
    if (!value) return { valid: true };
    const pattern = config?.value as RegExp;
    if (!pattern.test(String(value))) {
      return { valid: false, message: config?.message || '格式不正確' };
    }
    return { valid: true };
  },

  // 整数验证
  integer: (value) => {
    if (!value && value !== 0) return { valid: true };
    if (!Number.isInteger(Number(value))) {
      return { valid: false, message: '請輸入整數' };
    }
    return { valid: true };
  },

  // 正数验证
  positiveNumber: (value) => {
    if (!value && value !== 0) return { valid: true };
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return { valid: false, message: '請輸入正數' };
    }
    return { valid: true };
  },

  // 密码强度验证
  password: (value) => {
    if (!value) return { valid: true };
    const password = String(value);
    
    if (password.length < 8) {
      return { valid: false, message: '密碼長度至少為8位' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: '密碼需包含小寫字母' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: '密碼需包含大寫字母' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: '密碼需包含數字' };
    }
    
    return { valid: true };
  },

  // 中文验证
  chinese: (value) => {
    if (!value) return { valid: true };
    if (!/^[\u4e00-\u9fa5]+$/.test(String(value))) {
      return { valid: false, message: '請輸入中文字符' };
    }
    return { valid: true };
  },

  // 英文验证
  english: (value) => {
    if (!value) return { valid: true };
    if (!/^[a-zA-Z]+$/.test(String(value))) {
      return { valid: false, message: '請輸入英文字符' };
    }
    return { valid: true };
  },

  // 身份证验证（台湾）
  idCard: (value) => {
    if (!value) return { valid: true };
    const id = String(value).toUpperCase();
    
    // 台湾身份证格式：1个字母 + 9个数字
    const idRegex = /^[A-Z][12]\d{8}$/;
    if (!idRegex.test(id)) {
      return { valid: false, message: '請輸入有效的身份證字號' };
    }
    
    // 验证校验码
    const letterMap: Record<string, number> = {
      A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17,
      I: 34, J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23,
      Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, W: 32, X: 30,
      Y: 31, Z: 33
    };
    
    const letterValue = letterMap[id[0]];
    const digits = id.slice(1).split('').map(Number);
    
    let sum = Math.floor(letterValue / 10) + (letterValue % 10) * 9;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * (8 - i);
    }
    sum += digits[8];
    
    if (sum % 10 !== 0) {
      return { valid: false, message: '身份證字號校驗不正確' };
    }
    
    return { valid: true };
  },

  // 信用卡验证
  creditCard: (value) => {
    if (!value) return { valid: true };
    const cardNumber = String(value).replace(/[-\s]/g, '');
    
    if (!/^\d{13,19}$/.test(cardNumber)) {
      return { valid: false, message: '請輸入有效的信用卡號' };
    }
    
    // Luhn算法验证
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      return { valid: false, message: '信用卡號校驗不正確' };
    }
    
    return { valid: true };
  },
};

/**
 * 单个字段验证
 */
export function validate(
  value: unknown,
  rules: ValidationConfig[]
): ValidationResult {
  for (const config of rules) {
    const validator = validators[config.rule];
    if (!validator) continue;
    
    const result = validator(value, config);
    if (!result.valid) {
      return {
        valid: false,
        message: config.message || result.message,
      };
    }
  }
  
  return { valid: true };
}

/**
 * 表单验证
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: Partial<Record<keyof T, ValidationConfig[]>>
): { valid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let valid = true;

  for (const field in schema) {
    const rules = schema[field];
    if (!rules) continue;

    const result = validate(data[field], rules);
    if (!result.valid) {
      errors[field] = result.message;
      valid = false;
    }
  }

  return { valid, errors };
}

/**
 * 创建验证规则
 */
export const rules = {
  required: (message?: string): ValidationConfig => ({
    rule: 'required',
    message,
  }),

  email: (message?: string): ValidationConfig => ({
    rule: 'email',
    message,
  }),

  phone: (message?: string): ValidationConfig => ({
    rule: 'phone',
    message,
  }),

  url: (message?: string): ValidationConfig => ({
    rule: 'url',
    message,
  }),

  minLength: (length: number, message?: string): ValidationConfig => ({
    rule: 'minLength',
    value: length,
    message,
  }),

  maxLength: (length: number, message?: string): ValidationConfig => ({
    rule: 'maxLength',
    value: length,
    message,
  }),

  min: (value: number, message?: string): ValidationConfig => ({
    rule: 'min',
    value,
    message,
  }),

  max: (value: number, message?: string): ValidationConfig => ({
    rule: 'max',
    value,
    message,
  }),

  pattern: (regex: RegExp, message?: string): ValidationConfig => ({
    rule: 'pattern',
    value: regex,
    message,
  }),

  integer: (message?: string): ValidationConfig => ({
    rule: 'integer',
    message,
  }),

  positiveNumber: (message?: string): ValidationConfig => ({
    rule: 'positiveNumber',
    message,
  }),

  password: (message?: string): ValidationConfig => ({
    rule: 'password',
    message,
  }),

  chinese: (message?: string): ValidationConfig => ({
    rule: 'chinese',
    message,
  }),

  english: (message?: string): ValidationConfig => ({
    rule: 'english',
    message,
  }),

  idCard: (message?: string): ValidationConfig => ({
    rule: 'idCard',
    message,
  }),

  creditCard: (message?: string): ValidationConfig => ({
    rule: 'creditCard',
    message,
  }),
};

// 预设验证模式
export const schemas = {
  // 用户名验证
  username: [
    rules.required('請輸入用戶名'),
    rules.minLength(3, '用戶名至少3個字符'),
    rules.maxLength(20, '用戶名最多20個字符'),
    rules.pattern(/^[a-zA-Z0-9_]+$/, '用戶名只能包含字母、數字和下劃線'),
  ],

  // 密码验证
  password: [
    rules.required('請輸入密碼'),
    rules.password(),
  ],

  // 邮箱验证
  email: [
    rules.required('請輸入電子郵件'),
    rules.email(),
  ],

  // 手机号验证
  phone: [
    rules.required('請輸入手機號碼'),
    rules.phone(),
  ],

  // 真实姓名验证
  realName: [
    rules.required('請輸入姓名'),
    rules.minLength(2, '姓名至少2個字符'),
    rules.maxLength(10, '姓名最多10個字符'),
  ],

  // 商品名称验证
  productName: [
    rules.required('請輸入商品名稱'),
    rules.minLength(2, '商品名稱至少2個字符'),
    rules.maxLength(100, '商品名稱最多100個字符'),
  ],

  // 价格验证
  price: [
    rules.required('請輸入價格'),
    rules.positiveNumber('價格必須大於0'),
    rules.max(9999999, '價格超出限制'),
  ],

  // 库存验证
  stock: [
    rules.required('請輸入庫存'),
    rules.integer('庫存必須為整數'),
    rules.min(0, '庫存不能為負數'),
  ],

  // 地址验证
  address: [
    rules.required('請輸入地址'),
    rules.minLength(5, '地址至少5個字符'),
    rules.maxLength(200, '地址最多200個字符'),
  ],
};

/**
 * 自定义验证器
 */
export function addValidator(
  name: string,
  validator: (value: unknown, config?: ValidationConfig) => ValidationResult
) {
  validators[name] = validator;
}

/**
 * 密码确认验证（需要特殊处理）
 */
export function confirmPassword(
  password: string,
  confirm: string
): ValidationResult {
  if (password !== confirm) {
    return { valid: false, message: '兩次輸入的密碼不一致' };
  }
  return { valid: true };
}

export default {
  validate,
  validateForm,
  rules,
  schemas,
  addValidator,
  confirmPassword,
};
