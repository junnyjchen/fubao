/**
 * @fileoverview 支付失败页面
 * @description 支付失败后显示错误信息
 * @module app/payment/fail/page
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const { t, isRTL } = useI18n();
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error');

  const pm = t.payment;

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <Card className="max-w-md w-full animate-fade-in-up">
        <CardContent className="py-12 text-center">
          {/* 失败图标 */}
          <div className="mb-6">
            <XCircle className="w-20 h-20 mx-auto text-destructive animate-scale-in" />
          </div>

          {/* 失败标题 */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {pm.failedTitle}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || pm.failedMessage}
          </p>

          {/* 订单信息 */}
          {orderId && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="text-sm text-muted-foreground mb-1">{t.orderDetail.orderNo}</div>
              <div className="font-mono font-medium">#{orderId}</div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3">
            {orderId && (
              <Button asChild className="w-full" size="lg">
                <Link href={`/order/${orderId}`}>
                  <RefreshCw className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                  {pm.retryPayment}
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/user/orders">
                {t.user.orders}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                <Home className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                {t.nav.home}
              </Link>
            </Button>
          </div>

          {/* 客服提示 */}
          <div className={`mt-8 text-xs text-muted-foreground ${isRTL ? 'text-end' : ''}`}>
            <p>{pm.contactSupportText}</p>
            <Button asChild variant="link" className={`h-auto p-0 mt-1 ${isRTL ? 'text-end' : ''}`}>
              <Link href="/help">
                <MessageCircle className={`w-3 h-3 ${isRTL ? 'ms-1' : 'me-1'}`} />
                {t.nav.contact}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
