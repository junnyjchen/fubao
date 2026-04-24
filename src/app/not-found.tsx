/**
 * @fileoverview 404页面
 * @description 页面未找到
 * @module app/not-found
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
          
          <h1 className="text-2xl font-bold mb-2">頁面未找到</h1>
          <p className="text-muted-foreground mb-6">
            抱歉，您訪問的頁面不存在或已被移除。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                返回首頁
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/search">
                <Search className="w-4 h-4" />
                搜索商品
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              您可能在尋找：
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: '商品商城', href: '/shop' },
                { label: '玄門百科', href: '/baike' },
                { label: '證書驗證', href: '/verify' },
                { label: '幫助中心', href: '/help' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-primary hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
