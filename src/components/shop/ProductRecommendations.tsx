/**
 * @fileoverview 商品推荐组件
 * @description 基于商品列表展示推荐商品
 * @module components/shop/ProductRecommendations
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  TrendingUp,
  ChevronRight,
  Loader2,
  Package,
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: string;
  original_price?: string;
  main_image?: string;
  sales: number;
  is_certified: boolean;
  merchant?: {
    id: number;
    name: string;
  };
}

interface ProductRecommendationsProps {
  /** 当前商品ID（用于排除） */
  currentProductId?: number;
  /** 分类ID（用于同类推荐） */
  categoryId?: number;
  /** 推荐类型 */
  type?: 'home' | 'detail' | 'cart' | 'checkout';
  /** 最大显示数量 */
  maxItems?: number;
  /** 标题 */
  title?: string;
}

/**
 * 商品推荐组件 - 使用商品列表API
 */
export function ProductRecommendations({
  currentProductId,
  maxItems = 8,
  title,
}: ProductRecommendationsProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, [currentProductId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: maxItems.toString(),
        page: '1',
      });
      const res = await fetch(`/api/goods?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        let items = data.data;
        // 排除当前商品
        if (currentProductId) {
          items = items.filter((p: Product) => p.id !== currentProductId);
        }
        setProducts(items.slice(0, maxItems));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('加载推荐商品失败:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {title || '精選推薦'}
        </h2>
        <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
          查看更多
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 商品列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          暫無推薦商品
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 商品卡片组件
 */
function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative aspect-square bg-muted">
          {product.main_image ? (
            <Image
              src={product.main_image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-4xl text-primary/30">符</span>
            </div>
          )}
          {product.is_certified && (
            <Badge className="absolute top-2 left-2 bg-gold text-gold-foreground text-xs">
              一物一證
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-primary">HK${product.price}</span>
            {product.original_price && (
              <span className="text-xs text-muted-foreground line-through">
                HK${product.original_price}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>已售 {product.sales}</span>
            {product.merchant && (
              <span className="truncate max-w-[60%]">{product.merchant.name}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * 首页推荐商品组件
 */
export function HomeRecommendations() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <ProductRecommendations
          type="home"
          maxItems={10}
          title="精選推薦"
        />
      </div>
    </section>
  );
}

/**
 * 商品详情页推荐组件
 */
export function DetailRecommendations({
  currentProductId,
  categoryId,
}: {
  currentProductId: number;
  categoryId?: number;
}) {
  return (
    <section className="py-6 border-t">
      <ProductRecommendations
        type="detail"
        currentProductId={currentProductId}
        categoryId={categoryId}
        maxItems={5}
        title="相關推薦"
      />
    </section>
  );
}

/**
 * 购物车推荐组件
 */
export function CartRecommendations() {
  return (
    <section className="py-6">
      <ProductRecommendations
        type="cart"
        maxItems={4}
        title="湊單推薦"
      />
    </section>
  );
}
