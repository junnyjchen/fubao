/**
 * @fileoverview 全局错误页面
 * @description 捕获并显示应用错误
 * @module app/error
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 记录错误到错误追踪服务
    console.error('应用错误:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">出錯了</h1>
          <p className="text-muted-foreground mb-6">
            抱歉，應用程式遇到了一個錯誤。請嘗試刷新頁面或返回首頁。
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-muted rounded-lg text-left">
              <p className="text-sm font-mono text-destructive break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  錯誤ID: {error.digest}
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              重試
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="/">
                <Home className="w-4 h-4" />
                首頁
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
