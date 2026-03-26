/**
 * @fileoverview 商品推荐组件
 * @description 根据不同策略推荐商品
 * @module components/shop/ProductRecommendations
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  TrendingUp,
  Eye,
  Heart,
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
 * 商品推荐组件
 */
export function ProductRecommendations({
  currentProductId,
  categoryId,
  type = 'home',
  maxItems = 8,
  title,
}: ProductRecommendationsProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('hot');

  useEffect(() => {
    loadRecommendations(activeTab);
  }, [activeTab, categoryId, currentProductId, type]);

  const loadRecommendations = async (tab: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: tab,
        limit: maxItems.toString(),
      });

      if (currentProductId) {
        params.append('exclude', currentProductId.toString());
      }
      if (categoryId) {
        params.append('category_id', categoryId.toString());
      }

      const res = await fetch(`/api/recommendations?${params.toString()}`);
      const data = await res.json();

      if (data.success || data.data) {
        setProducts(data.data || getMockProducts(maxItems));
      } else {
        setProducts(getMockProducts(maxItems));
      }
    } catch (error) {
      console.error('加载推荐商品失败:', error);
      setProducts(getMockProducts(maxItems));
    } finally {
      setLoading(false);
    }
  };

  const tabs = type === 'detail' 
    ? [
        { value: 'similar', label: '相似商品', icon: Package },
        { value: 'hot', label: '熱門推薦', icon: TrendingUp },
        { value: 'viewed', label: '看過的人還看', icon: Eye },
      ]
    : [
        { value: 'hot', label: '熱門推薦', icon: TrendingUp },
        { value: 'new', label: '新品上架', icon: Sparkles },
        { value: 'personal', label: '猜你喜歡', icon: Heart },
      ];

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {title || (type === 'detail' ? '相關推薦' : '為你推薦')}
        </h2>
        <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
          查看更多
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tab切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-2">
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
            >
              <tab.icon className="w-4 h-4 mr-1" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
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
          </TabsContent>
        ))}
      </Tabs>
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
 * 获取模拟商品数据
 */
function getMockProducts(count: number): Product[] {
  const allProducts: Product[] = [
    {
      id: 1,
      name: '五路財神符',
      price: '288.00',
      original_price: '388.00',
      main_image: undefined,
      sales: 156,
      is_certified: true,
      merchant: { id: 1, name: '玄門道院' },
    },
    {
      id: 2,
      name: '太歲平安符',
      price: '168.00',
      main_image: undefined,
      sales: 89,
      is_certified: true,
      merchant: { id: 1, name: '玄門道院' },
    },
    {
      id: 3,
      name: '桃木劍·七星龍泉',
      price: '588.00',
      original_price: '688.00',
      main_image: undefined,
      sales: 45,
      is_certified: true,
      merchant: { id: 2, name: '龍虎山法器店' },
    },
    {
      id: 4,
      name: '開光八卦鏡',
      price: '128.00',
      main_image: undefined,
      sales: 234,
      is_certified: false,
      merchant: { id: 2, name: '龍虎山法器店' },
    },
    {
      id: 5,
      name: '檀香佛珠手串',
      price: '388.00',
      original_price: '488.00',
      main_image: undefined,
      sales: 67,
      is_certified: true,
      merchant: { id: 3, name: '禪心閣' },
    },
    {
      id: 6,
      name: '文昌帝君符',
      price: '198.00',
      main_image: undefined,
      sales: 123,
      is_certified: true,
      merchant: { id: 1, name: '玄門道院' },
    },
    {
      id: 7,
      name: '銅製香爐',
      price: '458.00',
      original_price: '558.00',
      main_image: undefined,
      sales: 34,
      is_certified: false,
      merchant: { id: 2, name: '龍虎山法器店' },
    },
    {
      id: 8,
      name: '天然沈香線香',
      price: '298.00',
      main_image: undefined,
      sales: 89,
      is_certified: true,
      merchant: { id: 3, name: '禪心閣' },
    },
  ];

  return allProducts.slice(0, count);
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
  categoryId 
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
