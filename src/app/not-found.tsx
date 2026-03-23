/**
 * @fileoverview 404页面未找到
 * @description 当用户访问不存在的页面时显示
 * @module app/not-found
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full text-center">
        <CardContent className="py-12">
          {/* 404图标 */}
          <div className="mb-6">
            <div className="text-8xl font-bold text-primary/20 mb-2">404</div>
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* 标题和描述 */}
          <h1 className="text-2xl font-bold mb-3">頁面未找到</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            抱歉，您訪問的頁面不存在或已被移除。<br />
            請檢查網址是否正確，或返回首頁繼續瀏覽。
          </p>

          {/* 快捷链接 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                返回首頁
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help">
                <HelpCircle className="w-4 h-4 mr-2" />
                幫助中心
              </Link>
            </Button>
          </div>

          {/* 热门链接 */}
          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">您可能在尋找：</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/shop">商品商城</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wiki">玄門百科</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/video">視頻學堂</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/verify">證書驗證</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
