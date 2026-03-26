/**
 * @fileoverview 全局错误边界
 * @description 捕获根布局中的错误
 * @module app/global-error
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('全局错误:', error);
  }, [error]);

  return (
    <html lang="zh-TW">
      <body className="bg-background">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">系統錯誤</h1>
            <p className="text-muted-foreground mb-6">
              應用程式遇到了一個嚴重錯誤。請嘗試刷新頁面。
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {error.message}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                刷新頁面
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <a href="/">
                  <Home className="w-4 h-4" />
                  返回首頁
                </a>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
