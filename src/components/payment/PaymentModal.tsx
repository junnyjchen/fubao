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
          window.open(result.data.approvalUrl, '_blank');
          // 模拟等待支付完成
          setPaying(true);
          pollPaymentStatus(method);
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

  const pollPaymentStatus = async (method: string) => {
    // 模拟轮询支付状态
    let attempts = 0;
    const maxAttempts = 60; // 最多等待60秒

    const poll = async () => {
      attempts++;
      
      // 模拟支付成功（实际项目中需要调用后端接口查询支付状态）
      if (attempts >= 3) {
        try {
          const endpoint = `/api/payments/${method}`;
          await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          });
          
          onSuccess();
          onClose();
        } catch (error) {
          console.error('更新支付状态失败:', error);
        }
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, 1000);
      }
    };

    poll();
  };

  const handleSimulatePayment = async () => {
    if (!paymentMethod) return;
    
    try {
      const endpoint = `/api/payments/${paymentMethod}`;
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="wechat">微信</TabsTrigger>
              <TabsTrigger value="alipay">支付寶</TabsTrigger>
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
