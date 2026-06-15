'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, QrCode } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  amount: string;
  onSuccess: () => void;
}

export function PaymentModal({ open, onClose, orderId, amount, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  const handlePay = async (method: string) => {
    setLoading(true);
    setPaymentMethod(method);
    
    try {
      let endpoint = '';
      if (method === 'paypal') {
        endpoint = '/api/payments/paypal';
      } else if (method === 'wechat') {
        endpoint = '/api/payments/wechat';
      } else if (method === 'alipay') {
        endpoint = '/api/payments/alipay';
      } else if (method === 'payprotocol') {
        endpoint = '/api/payments/payprotocol';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      });

      const result = await response.json();
      
      if (result.data) {
        if (method === 'paypal') {
          // PayPal 跳转到支付页面
          if (result.data.approvalUrl) {
            setPaypalOrderId(result.data.paypalOrderId);
            window.open(result.data.approvalUrl, '_blank');
            setPaying(true);
            pollPaymentStatus(method, result.data.paypalOrderId);
          }
        } else if (method === 'payprotocol') {
          // Pay Protocol 跳转到加密货币支付页面
          const paymentUrl = result.data.paymentUrl;
          if (paymentUrl) {
            window.open(paymentUrl, '_blank');
            setPaying(true);
            pollPaymentStatus(method);
          }
        } else {
          // 微信/支付宝显示二维码
          setQrCode(result.data.codeUrl || result.data.qrCode);
          setPaying(true);
          pollPaymentStatus(method);
        }
      }
    } catch (error) {
      console.error('创建支付失败:', error);
      alert('创建支付失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (method: string, paypalOrderId?: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 最多等待120秒

    const poll = async () => {
      attempts++;
      
      try {
        let statusEndpoint = '';
        if (method === 'paypal' && paypalOrderId) {
          statusEndpoint = `/api/paypal/webhook?paypalOrderId=${paypalOrderId}`;
        } else if (method === 'payprotocol') {
          statusEndpoint = `/api/payprotocol/callback?orderId=${orderId}`;
        } else {
          statusEndpoint = `/api/payments/${method}?orderId=${orderId}`;
        }

        const res = await fetch(statusEndpoint);
        const data = await res.json();

        if (data.status === 'completed') {
          onSuccess();
          onClose();
          return;
        }
      } catch {
        // 继续轮询
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, 2000);
      }
    };

    // 延迟3秒后开始轮询
    setTimeout(poll, 3000);
  };

  const handleSimulatePayment = async () => {
    if (!paymentMethod) return;
    
    try {
      if (paymentMethod === 'paypal' && paypalOrderId) {
        // PayPal: 捕获支付
        await fetch('/api/payments/paypal', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, paypalOrderId }),
        });
      } else {
        const endpoint = `/api/payments/${paymentMethod}`;
        await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('支付失败:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>選擇支付方式</DialogTitle>
          <DialogDescription>
            訂單金額：<span className="text-primary font-bold text-lg">HK${amount}</span>
          </DialogDescription>
        </DialogHeader>

        {!paying ? (
          <Tabs defaultValue="paypal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="wechat">微信</TabsTrigger>
              <TabsTrigger value="alipay">支付寶</TabsTrigger>
              <TabsTrigger value="payprotocol">加密貨幣</TabsTrigger>
            </TabsList>
            
            <TabsContent value="paypal" className="mt-4">
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">使用PayPal安全支付</p>
                <Button 
                  onClick={() => handlePay('paypal')} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  使用PayPal支付
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="wechat" className="mt-4">
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">使用微信掃碼支付</p>
                <Button 
                  onClick={() => handlePay('wechat')} 
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  微信支付
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="alipay" className="mt-4">
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">使用支付寶掃碼支付</p>
                <Button 
                  onClick={() => handlePay('alipay')} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  支付寶支付
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="payprotocol" className="mt-4">
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="font-semibold">Pay Protocol</span>
                </div>
                <p className="text-muted-foreground mb-4 text-sm">使用USDT/USDC等加密貨幣安全支付</p>
                <Button 
                  onClick={() => handlePay('payprotocol')} 
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  加密貨幣支付
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-6 text-center">
            {qrCode ? (
              <>
                <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">掃碼支付</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">請使用{paymentMethod === 'wechat' ? '微信' : '支付寶'}掃碼支付</p>
              </>
            ) : (
              <>
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                <p className="text-muted-foreground mb-4">正在等待支付...</p>
              </>
            )}
            
            {/* 模拟支付按钮（仅用于演示） */}
            <Button 
              variant="outline" 
              onClick={handleSimulatePayment}
              className="mt-2"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              模擬支付成功
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
