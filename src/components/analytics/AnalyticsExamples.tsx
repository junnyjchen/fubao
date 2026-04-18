/**
 * @fileoverview 行为分析埋点示例组件
 * @description 展示如何在页面中使用埋点功能
 * @module components/analytics/AnalyticsExamples
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAnalytics, useProductTracking, useOrderTracking, useSearchTracking, useShareTracking } from '@/lib/analytics';
import { Package, ShoppingCart, Heart, Search, Share2, CreditCard } from 'lucide-react';

/**
 * 商品追踪示例
 */
export function ProductTrackingDemo() {
  const { trackView, trackAddToCart, trackAddToWishlist } = useProductTracking();

  const product = {
    id: 'PROD-001',
    name: '开光铜葫芦',
    category: '法器',
    price: 299,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">商品追踪示例</CardTitle>
        <CardDescription>追踪商品浏览、加入购物车、添加收藏</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{product.name}</h4>
            <p className="text-sm text-muted-foreground">分类: {product.category}</p>
            <p className="font-bold text-primary">¥{product.price}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => trackView(product)}
            className="flex-1"
          >
            浏览商品
          </Button>
          <Button
            size="sm"
            onClick={() => trackAddToCart(product, 1)}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            加入购物车
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => trackAddToWishlist(product)}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 搜索追踪示例
 */
export function SearchTrackingDemo() {
  const { trackSearch } = useSearchTracking();
  const [keyword, setKeyword] = useState('');

  // 模拟搜索结果
  const handleSearch = () => {
    if (keyword.trim()) {
      const mockResultCount = Math.floor(Math.random() * 50) + 1;
      trackSearch(keyword, mockResultCount);
      alert(`搜索"${keyword}"，找到 ${mockResultCount} 个结果`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">搜索追踪示例</CardTitle>
        <CardDescription>追踪用户搜索行为</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="输入关键词搜索..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-1" />
            搜索
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          点击搜索按钮或按回车键查看追踪效果
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * 订单追踪示例
 */
export function OrderTrackingDemo() {
  const { trackCheckout, trackPurchase } = useOrderTracking();

  const order = {
    id: 'ORD-' + Date.now(),
    totalAmount: 599,
    itemCount: 2,
  };

  const items = [
    { id: 'PROD-001', name: '开光铜葫芦', price: 299, quantity: 1 },
    { id: 'PROD-002', name: '桃木剑', price: 300, quantity: 1 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">订单追踪示例</CardTitle>
        <CardDescription>追踪结账和购买完成</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>订单号</span>
            <span className="font-mono">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>商品数量</span>
            <span>{order.itemCount}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>总计</span>
            <span className="text-primary">¥{order.totalAmount}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => trackCheckout(order)}
          >
            <CreditCard className="w-4 h-4 mr-1" />
            结账
          </Button>
          <Button
            className="flex-1"
            onClick={() => trackPurchase(order, items)}
          >
            完成购买
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 分享追踪示例
 */
export function ShareTrackingDemo() {
  const { trackShare } = useShareTracking();

  const shareOptions = [
    { platform: 'wechat', label: '微信' },
    { platform: 'weibo', label: '微博' },
    { platform: 'qq', label: 'QQ' },
    { platform: 'copy', label: '复制链接' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">分享追踪示例</CardTitle>
        <CardDescription>追踪内容分享行为</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">商品名称</h4>
          <p className="text-sm text-muted-foreground">商品描述内容...</p>
        </div>

        <div className="flex gap-2">
          {shareOptions.map((option) => (
            <Button
              key={option.platform}
              variant="outline"
              size="sm"
              onClick={() => trackShare('product', 'PROD-001', option.platform)}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-1" />
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 页面追踪示例
 */
export function PageTrackingDemo() {
  const { pageView } = useAnalytics();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">页面追踪示例</CardTitle>
        <CardDescription>追踪页面访问</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          点击按钮模拟进入其他页面
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => pageView('/products')}>
            商品列表页
          </Button>
          <Button variant="outline" onClick={() => pageView('/cart')}>
            购物车页
          </Button>
          <Button variant="outline" onClick={() => pageView('/user/profile')}>
            个人中心
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 完整追踪演示
 */
export function AnalyticsDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PageTrackingDemo />
      <ProductTrackingDemo />
      <SearchTrackingDemo />
      <OrderTrackingDemo />
      <ShareTrackingDemo />
    </div>
  );
}

// 添加缺失的 useState 导入
import { useState } from 'react';
