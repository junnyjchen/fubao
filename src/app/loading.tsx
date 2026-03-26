/**
 * @fileoverview 全局加载页面
 * @description 页面加载时显示的加载状态
 * @module app/loading
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          {/* 外圈旋转 */}
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
          
          {/* 内圈符字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">符</span>
          </div>
        </div>
        
        <p className="text-muted-foreground animate-pulse">加載中...</p>
      </div>
    </div>
  );
}
