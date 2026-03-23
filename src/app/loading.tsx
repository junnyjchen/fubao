/**
 * @fileoverview 全局加载页面
 * @description 页面加载时显示的加载状态
 * @module app/loading
 */

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">載入中...</p>
      </div>
    </div>
  );
}
