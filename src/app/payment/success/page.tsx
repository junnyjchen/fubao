/**
 * @fileoverview 支付成功页面
 * @description 支付完成后显示成功信息
 * @module app/payment/success/page
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, Home, ArrowRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { t, isRTL } = useI18n();
  const orderId = searchParams.get('orderId');
  const orderNo = searchParams.get('orderNo');

  const pm = t.payment;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <Card className="max-w-md w-full animate-fade-in-up">
        <CardContent className="py-12 text-center">
          {/* 成功图标 */}
          <div className="mb-6">
            <CheckCircle2 className="w-20 h-20 mx-auto text-green-500 animate-scale-in" />
          </div>

          {/* 成功标题 */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {pm.successTitle}
          </h1>
          <p className="text-muted-foreground mb-6">
            {pm.successMessage}
          </p>

          {/* 订单信息 */}
          {orderNo && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="text-sm text-muted-foreground mb-1">{t.orderDetail.orderNo}</div>
              <div className="font-mono font-medium">{orderNo}</div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3">
            {orderId && (
              <Button asChild className="w-full" size="lg">
                <Link href={`/order/${orderId}`}>
                  <ShoppingBag className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                  {pm.viewOrder}
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/user/orders">
                {t.user.orders}
                <NextIcon className={`w-4 h-4 ${isRTL ? 'ms-2' : 'ml-2'}`} />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                <Home className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                {t.nav.home}
              </Link>
            </Button>
          </div>

          {/* 提示信息 */}
          <div className={`mt-8 text-xs text-muted-foreground ${isRTL ? 'text-end' : ''}`}>
            <p>{t.nav.contact}</p>
            <p className="mt-1">+852 1234 5678</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
