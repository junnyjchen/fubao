/**
 * @fileoverview Pay Protocol 支付工具库
 * @description 封装 Pay Protocol 加密货币支付网关的 API 调用、签名验证等功能
 * @module lib/payprotocol
 *
 * 文档: https://doc.payprotocol.network/zh-Hans/docs/api/quick-start/payment/
 */

import { createHmac } from 'crypto';
import { queryOne } from '@/lib/db';

/** Pay Protocol API 配置 */
export interface PayProtocolConfig {
  apiKey: string;
  apiSecret: string;
  sandbox: boolean;
  chainId: number;
  currency: string;
  isLegalTender: number; // 0=数字货币, 1=法币
}

/** 创建支付订单请求参数 */
export interface CreatePaymentOrderParams {
  outTradeNo: string;       // 商户订单号，必须唯一
  description: string;      // 订单描述
  quoteAmount: string;      // 报价金额
  quoteCurrencySymbol?: string; // 报价币种符号，默认取配置
  chainId?: number;         // 链ID，默认取配置
  isLegalTender?: number;   // 是否法币，默认取配置
  notifyUrl: string;        // 回调地址
  redirectionUrl: string;   // 跳转地址
}

/** 创建支付订单响应 */
export interface CreatePaymentOrderResponse {
  code: number;
  msg: string;
  data: {
    userWalletAddress: string;  // 用户支付钱包地址
    saltHash: string;           // 盐值哈希
    outPaymentNo: string;       // Pay Protocol 收单订单号
    paymentUrl: string;         // 支付页面路径
  };
}

/** 支付回调数据 */
export interface PaymentCallbackData {
  orgId: number;
  outTradeNo: string;           // 商户订单号
  outPaymentNo: string;         // Pay Protocol 订单号
  description: string;
  paymentStatus: number;        // 0=待支付, 1=已支付, 2=过期, 3=失败
  paymentType: number;
  isLegalTender: number;
  chainId: number;
  quoteCurrencySymbol: string;
  quoteAmount: string;
  expectedAmount: string;
  settlementCurrencySymbol: string;
  settlementAmount: string;
  fromAddress: string;
  userWalletAddress: string;
  transferHash: string;
  blockTime: number;
  createTime: string;
  sign?: string;
}

/** 查询订单响应 */
export interface QueryPaymentOrderResponse {
  code: number;
  msg: string;
  data: {
    outTradeNo: string;
    outPaymentNo: string;
    paymentStatus: number;
    quoteCurrencySymbol: string;
    quoteAmount: string;
    fromAddress: string;
    userWalletAddress: string;
    transferHash: string;
    blockTime: number;
    createTime: string;
  };
}

/**
 * 获取 Pay Protocol 配置（从数据库设置中读取）
 */
export async function getPayProtocolConfig(): Promise<PayProtocolConfig | null> {
  try {
    const enabled = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['payprotocol_enabled']);
    if (!enabled || enabled.value !== 'true') {
      return null;
    }

    const apiKeyRow = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['payprotocol_api_key']);
    const apiSecretRow = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['payprotocol_api_secret']);
    const sandboxRow = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['payprotocol_sandbox']);
    const chainIdRow = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['payprotocol_chain_id']);
    const currencyRow = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['payprotocol_currency']);
    const isLegalTenderRow = await queryOne('SELECT value FROM settings WHERE `key` = ?', ['payprotocol_is_legal_tender']);

    const apiKey = apiKeyRow?.value || '';
    const apiSecret = apiSecretRow?.value || '';

    if (!apiKey || !apiSecret) {
      console.warn('[PayProtocol] API Key 或 Secret 未配置');
      return null;
    }

    return {
      apiKey,
      apiSecret,
      sandbox: sandboxRow?.value !== 'false',
      chainId: parseInt(chainIdRow?.value || '136', 10),
      currency: currencyRow?.value || 'USDT',
      isLegalTender: parseInt(isLegalTenderRow?.value || '0', 10),
    };
  } catch (error) {
    console.error('[PayProtocol] 获取配置失败:', error);
    return null;
  }
}

/**
 * 获取 API 基础 URL
 */
export function getBaseUrl(sandbox: boolean): string {
  return sandbox
    ? 'https://api-sandbox.payprotocol.network/api/mer'
    : 'https://api.payprotocol.network/api/mer';
}

/**
 * 生成 HMAC-SHA256 签名
 *
 * 签名规则:
 * 1. signString = timestamp + method + requestPath + body
 * 2. HMAC_SHA256(apiSecret, signString)
 * 3. Base64 编码
 */
export function generateSignature(
  apiSecret: string,
  timestamp: number,
  method: string,
  requestPath: string,
  body: string
): string {
  const signString = `${timestamp}${method}${requestPath}${body}`;
  const hmac = createHmac('sha256', apiSecret);
  hmac.update(signString);
  return hmac.digest('base64');
}

/**
 * 构建请求头（包含签名认证）
 */
function buildHeaders(
  apiKey: string,
  apiSecret: string,
  method: string,
  requestPath: string,
  body: string
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = generateSignature(apiSecret, timestamp, method, requestPath, body);

  return {
    'Content-Type': 'application/json',
    'X-PAY-KEY': apiKey,
    'X-PAY-TIMESTAMP': timestamp.toString(),
    'X-PAY-SIGN': sign,
  };
}

/**
 * 创建支付订单
 */
export async function createPaymentOrder(
  config: PayProtocolConfig,
  params: CreatePaymentOrderParams
): Promise<CreatePaymentOrderResponse> {
  const baseUrl = getBaseUrl(config.sandbox);
  const requestPath = '/payment/createPaymentOrder';

  const body = JSON.stringify({
    chainId: params.chainId || config.chainId,
    description: params.description,
    outTradeNo: params.outTradeNo,
    isLegalTender: params.isLegalTender !== undefined ? params.isLegalTender : config.isLegalTender,
    quoteCurrencySymbol: params.quoteCurrencySymbol || config.currency,
    quoteAmount: params.quoteAmount,
    notifyUrl: params.notifyUrl,
    redirectionUrl: params.redirectionUrl,
  });

  const headers = buildHeaders(config.apiKey, config.apiSecret, 'POST', requestPath, body);
  const url = `${baseUrl}${requestPath}`;

  console.log(`[PayProtocol] 创建支付订单: ${params.outTradeNo}, 金额: ${params.quoteAmount} ${params.quoteCurrencySymbol || config.currency}`);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  const result: CreatePaymentOrderResponse = await response.json();

  if (result.code !== 200) {
    console.error('[PayProtocol] 创建订单失败:', result.msg);
    throw new Error(`Pay Protocol 创建订单失败: ${result.msg}`);
  }

  console.log(`[PayProtocol] 订单创建成功: outPaymentNo=${result.data.outPaymentNo}, paymentUrl=${result.data.paymentUrl}`);
  return result;
}

/**
 * 查询支付订单
 */
export async function queryPaymentOrder(
  config: PayProtocolConfig,
  outTradeNo: string
): Promise<QueryPaymentOrderResponse> {
  const baseUrl = getBaseUrl(config.sandbox);
  const requestPath = `/payment/detail`;

  const headers = buildHeaders(config.apiKey, config.apiSecret, 'GET', requestPath, '');
  const url = `${baseUrl}${requestPath}?outTradeNo=${encodeURIComponent(outTradeNo)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  const result: QueryPaymentOrderResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(`Pay Protocol 查询订单失败: ${result.msg}`);
  }

  return result;
}

/**
 * 验证回调签名
 *
 * 回调签名规则与请求签名相同，使用回调中的字段重新计算签名并比对
 */
export function verifyCallbackSignature(
  apiSecret: string,
  callbackData: PaymentCallbackData & { timestamp?: string },
  receivedSign: string
): boolean {
  try {
    // 回调签名验证: 使用回调数据中的关键字段重新计算
    const timestamp = callbackData.timestamp || Math.floor(Date.now() / 1000).toString();
    const method = 'POST';
    const requestPath = '/payment/callback';
    const body = JSON.stringify(callbackData);

    const expectedSign = generateSignature(apiSecret, parseInt(timestamp, 10), method, requestPath, body);
    return expectedSign === receivedSign;
  } catch (error) {
    console.error('[PayProtocol] 验证回调签名失败:', error);
    return false;
  }
}

/**
 * 获取支付页面完整 URL
 */
export function getPaymentPageUrl(config: PayProtocolConfig, paymentUrl: string): string {
  const baseUrl = getBaseUrl(config.sandbox);
  // paymentUrl 是相对路径，需要拼接基础 URL
  const domain = config.sandbox
    ? 'https://pay-sandbox.payprotocol.network'
    : 'https://pay.payprotocol.network';
  return `${domain}${paymentUrl}`;
}
