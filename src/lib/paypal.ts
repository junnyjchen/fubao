/**
 * @fileoverview PayPal 支付工具库
 * @description PayPal REST API v2 集成，支持创建订单、捕获支付、退款等
 * @module lib/paypal
 */

import { query, queryOne } from '@/lib/db';

/** PayPal API 配置 */
export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
}

/** PayPal 订单创建参数 */
export interface PayPalOrderParams {
  orderId: string | number;
  orderNo: string;
  amount: string;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

/** PayPal API 响应 */
export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * 从数据库读取 PayPal 配置
 */
export async function getPayPalConfig(): Promise<PayPalConfig | null> {
  try {
    const enabled = await queryOne(
      "SELECT value FROM settings WHERE key = 'paypal_enabled'"
    );
    if (!enabled || enabled.value !== 'true') {
      return null;
    }

    const clientId = await queryOne(
      "SELECT value FROM settings WHERE key = 'paypal_client_id'"
    );
    const clientSecret = await queryOne(
      "SELECT value FROM settings WHERE key = 'paypal_secret'"
    );
    const sandbox = await queryOne(
      "SELECT value FROM settings WHERE key = 'paypal_sandbox'"
    );

    if (!clientId?.value || !clientSecret?.value) {
      return null;
    }

    return {
      clientId: clientId.value,
      clientSecret: clientSecret.value,
      sandbox: sandbox?.value !== 'false',
    };
  } catch (error) {
    console.error('[PayPal] 读取配置失败:', error);
    return null;
  }
}

/**
 * 获取 PayPal API 基础 URL
 */
function getApiBaseUrl(sandbox: boolean): string {
  return sandbox
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

/**
 * 获取 PayPal Access Token (OAuth2)
 */
export async function getPayPalAccessToken(config: PayPalConfig): Promise<string> {
  const baseUrl = getApiBaseUrl(config.sandbox);
  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PayPal] 获取Access Token失败:', response.status, errorText);
    throw new Error(`PayPal OAuth 失敗: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * 创建 PayPal 订单 (Orders V2 API)
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
export async function createPayPalOrder(
  config: PayPalConfig,
  params: PayPalOrderParams
): Promise<PayPalOrderResponse> {
  const baseUrl = getApiBaseUrl(config.sandbox);
  const accessToken = await getPayPalAccessToken(config);

  const requestBody = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: String(params.orderId),
        description: params.description,
        custom_id: params.orderNo,
        amount: {
          currency_code: params.currency,
          value: params.amount,
        },
      },
    ],
    application_context: {
      brand_name: '符寶網',
      locale: 'zh-HK',
      landing_page: 'LOGIN',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
    },
  };

  console.log('[PayPal] 创建订单:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'PayPal-Request-Id': `FB-${params.orderId}-${Date.now()}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PayPal] 创建订单失败:', response.status, errorText);
    throw new Error(`PayPal 創建訂單失敗: ${response.status} - ${errorText}`);
  }

  const data: PayPalOrderResponse = await response.json();
  console.log('[PayPal] 订单创建成功:', data.id, data.status);
  return data;
}

/**
 * 捕获 PayPal 订单 (买家批准后)
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
export async function capturePayPalOrder(
  config: PayPalConfig,
  paypalOrderId: string
): Promise<any> {
  const baseUrl = getApiBaseUrl(config.sandbox);
  const accessToken = await getPayPalAccessToken(config);

  console.log('[PayPal] 捕获订单:', paypalOrderId);

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PayPal] 捕获订单失败:', response.status, errorText);
    throw new Error(`PayPal 捕獲訂單失敗: ${response.status}`);
  }

  const data = await response.json();
  console.log('[PayPal] 订单捕获成功:', paypalOrderId, data.status);
  return data;
}

/**
 * 查询 PayPal 订单状态
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_get
 */
export async function getPayPalOrder(
  config: PayPalConfig,
  paypalOrderId: string
): Promise<any> {
  const baseUrl = getApiBaseUrl(config.sandbox);
  const accessToken = await getPayPalAccessToken(config);

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PayPal] 查询订单失败:', response.status, errorText);
    throw new Error(`PayPal 查詢訂單失敗: ${response.status}`);
  }

  return response.json();
}

/**
 * 从 PayPal 订单响应中提取批准链接
 */
export function getPayPalApprovalUrl(orderResponse: PayPalOrderResponse): string | null {
  const approveLink = orderResponse.links?.find(
    (link) => link.rel === 'approve'
  );
  return approveLink?.href || null;
}

/**
 * 验证 PayPal Webhook 签名
 * @see https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
 */
export async function verifyPayPalWebhookSignature(
  config: PayPalConfig,
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  // 在沙盒模式下跳过签名验证
  if (config.sandbox) {
    console.warn('[PayPal] 沙盒模式，跳过Webhook签名验证');
    return true;
  }

  try {
    const baseUrl = getApiBaseUrl(config.sandbox);
    const accessToken = await getPayPalAccessToken(config);

    const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'] || headers['PAYPAL-AUTH-ALGO'],
        cert_url: headers['paypal-cert-url'] || headers['PAYPAL-CERT-URL'],
        transmission_id: headers['paypal-transmission-id'] || headers['PAYPAL-TRANSMISSION-ID'],
        transmission_sig: headers['paypal-transmission-sig'] || headers['PAYPAL-TRANSMISSION-SIG'],
        transmission_time: headers['paypal-transmission-time'] || headers['PAYPAL-TRANSMISSION-TIME'],
        webhook_id: '', // 需要在设置中配置 webhook_id
        webhook_event: JSON.parse(body),
      }),
    });

    if (!response.ok) {
      console.error('[PayPal] Webhook签名验证请求失败:', response.status);
      return false;
    }

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('[PayPal] Webhook签名验证异常:', error);
    return false;
  }
}
