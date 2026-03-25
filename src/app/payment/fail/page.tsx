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

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          {/* 失败图标 */}
          <div className="mb-6">
            <XCircle className="w-20 h-20 mx-auto text-destructive" />
          </div>

          {/* 失败标题 */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            支付失敗
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || '支付過程中出現問題，請重試或聯繫客服'}
          </p>

          {/* 订单信息 */}
          {orderId && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="text-sm text-muted-foreground mb-1">訂單編號</div>
              <div className="font-mono font-medium">#{orderId}</div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3">
            {orderId && (
              <Button asChild className="w-full" size="lg">
                <Link href={`/user/orders/${orderId}`}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新支付
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/user/orders">
                查看我的訂單
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                返回首頁
              </Link>
            </Button>
          </div>

          {/* 客服提示 */}
          <div className="mt-8 text-xs text-muted-foreground">
            <p>如需幫助，請聯繫客服</p>
            <Button asChild variant="link" className="h-auto p-0 mt-1">
              <Link href="/user/feedback">
                <MessageCircle className="w-3 h-3 mr-1" />
                在線客服
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">載入中...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
