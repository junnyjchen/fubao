/**
 * @fileoverview 全局加载页面
 * @description 页面加载中的加载状态
 * @module app/loading
 */

import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardContent className="pt-8 pb-8 px-6 text-center">
          {/* 加载动画 */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          
          {/* 加载文字 */}
          <p className="text-muted-foreground">載入中...</p>
          
          {/* 装饰元素 */}
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
