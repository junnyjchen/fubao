/**
 * @fileoverview 404页面
 * @description 页面未找到错误页面
 * @module app/not-found
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-12 pb-8 px-6">
          {/* 图标 */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-5xl">🔍</span>
          </div>
          
          {/* 错误码 */}
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          
          {/* 标题 */}
          <h2 className="text-xl font-semibold mb-3">頁面未找到</h2>
          
          {/* 描述 */}
          <p className="text-muted-foreground mb-8">
            抱歉，您訪問的頁面不存在或已被移除。請檢查網址是否正確，或返回首頁繼續瀏覽。
          </p>
          
          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="javascript:history.back()">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回上頁
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                返回首頁
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/search">
                <Search className="w-4 h-4 mr-2" />
                搜索商品
              </Link>
            </Button>
          </div>
          
          {/* 快捷链接 */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">您可能想訪問：</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/shop" className="text-sm text-primary hover:underline">
                商品中心
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/wiki" className="text-sm text-primary hover:underline">
                玄門百科
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/videos" className="text-sm text-primary hover:underline">
                視頻學堂
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/ai-assistant" className="text-sm text-primary hover:underline">
                AI助手
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
