/**
 * @fileoverview 支付取消页面
 * @description 支付取消或失败的提示页面
 * @module app/payment/cancel/page
 */

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-orange-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">支付已取消</h1>
          <p className="text-muted-foreground mb-6">
            您已取消本次支付，訂單仍保留，您可以隨時繼續支付
          </p>

          {paymentId && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-1">支付單號</p>
              <p className="font-mono text-sm">{paymentId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/user/orders">返回訂單</Link>
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
