/**
 * @fileoverview 支付取消页面
 * @description 支付取消或失败的提示页面
 * @module app/payment/cancel/page
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, ShoppingBag } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const { t, isRTL } = useI18n();
  const paymentId = searchParams.get('payment_id');

  const pm = t.payment;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-orange-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">{pm.cancelledTitle}</h1>
          <p className="text-muted-foreground mb-6">
            {pm.cancelledMessage}
          </p>

          {paymentId && (
            <div className={`bg-muted/50 rounded-lg p-4 mb-6 ${isRTL ? 'text-end' : 'text-left'}`}>
              <p className="text-sm text-muted-foreground mb-1">{t.orderDetail.orderNo}</p>
              <p className="font-mono text-sm">{paymentId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/user/orders">{pm.backToOrderText}</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/shop">
                <ShoppingBag className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                {t.orderDetail.actions.continueShopping}
              </Link>
            </Button>
          </div>

          <p className={`text-xs text-muted-foreground mt-6 ${isRTL ? 'text-end' : ''}`}>
            {t.nav.contact}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
