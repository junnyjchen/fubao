/**
 * @fileoverview 全局错误页面
 * @description 当发生服务器错误时显示
 * @module app/error
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error('页面错误:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full text-center">
        <CardContent className="py-12">
          {/* 错误图标 */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>

          {/* 标题和描述 */}
          <h1 className="text-2xl font-bold mb-3">出錯了</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            抱歉，服務器發生了錯誤。請稍後重試，或聯繫我們的客服團隊獲取幫助。
          </p>

          {/* 错误信息（开发环境） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-muted rounded-lg text-left">
              <p className="text-sm font-mono text-destructive break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
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

          {/* 联系客服 */}
          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              如果問題持續存在，請聯繫我們：
            </p>
            <Button variant="ghost" size="sm" asChild>
              <a href="mailto:support@fubao.ltd">
                <Mail className="w-4 h-4 mr-2" />
                support@fubao.ltd
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
