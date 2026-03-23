/**
 * @fileoverview 支付成功页面
 * @description 支付成功后的结果展示
 * @module app/payment/success/page
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">正在確認支付結果...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">支付成功</h1>
          <p className="text-muted-foreground mb-6">
            您的訂單已成功支付，我們將盡快為您發貨
          </p>

          {paymentId && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-1">支付單號</p>
              <p className="font-mono text-sm">{paymentId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/user/orders">查看訂單</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">繼續購物</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            如有問題請聯繫客服
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
