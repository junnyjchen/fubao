/**
 * @fileoverview 全局错误页面
 * @description 服务器错误页面
 * @module app/error
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 将错误记录到错误报告服务
    console.error('页面错误:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-12 pb-8 px-6">
          {/* 图标 */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          
          {/* 错误码 */}
          <h1 className="text-6xl font-bold text-destructive mb-2">500</h1>
          
          {/* 标题 */}
          <h2 className="text-xl font-semibold mb-3">服務器錯誤</h2>
          
          {/* 描述 */}
          <p className="text-muted-foreground mb-8">
            抱歉，服務器發生了錯誤。我們的技術團隊已收到通知，正在緊急處理中。請稍後再試。
          </p>
          
          {/* 错误详情（开发环境） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-muted rounded-lg text-left">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重試
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                返回首頁
              </Link>
            </Button>
          </div>
          
          {/* 帮助链接 */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              如果問題持續存在，請
              <Link href="/contact" className="text-primary hover:underline ml-1">
                聯繫我們
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
