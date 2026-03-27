/**
 * @fileoverview 购物车页面组件
 * @description 展示购物车、优惠券选择、结算
 * @module components/cart/CartPage
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CouponSelector } from '@/components/coupon/CouponSelector';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  ArrowRight,
  Ticket,
  Store,
  Shield,
  Truck,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

/** 购物车商品 */
interface CartGoods {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  image: string | null;
  stock: number;
  status: boolean;
}

/** 购物车项 */
interface CartItem {
  id: number;
  quantity: number;
  selected: boolean;
  goods: CartGoods;
}

/** 商户分组 */
interface MerchantGroup {
  merchant: {
    id: number;
    name: string;
    logo: string | null;
    verified: boolean;
  };
  items: CartItem[];
  selectedAll: boolean;
}

/** 优惠券 */
interface Coupon {
  id: number;
  name: string;
  code: string | null;
  type: string;
  discount_type: string;
  discount_value: number;
  min_amount: number;
  max_discount: number | null;
  start_time: string;
  end_time: string;
  description: string | null;
  received?: boolean;
  can_receive?: boolean;
  user_coupon_id?: number;
}

export function CartPage() {
  const router = useRouter();
  const [merchantGroups, setMerchantGroups] = useState<MerchantGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCouponSelector, setShowCouponSelector] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  /**
   * 加载购物车数据
   */
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.data) {
        setMerchantGroups(data.data);
      }
    } catch (error) {
      console.error('加載購物車失敗:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /**
   * 更新商品数量
   */
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity }),
      });

      if (res.ok) {
        // 更新本地状态
        setMerchantGroups(groups =>
          groups.map(group => ({
            ...group,
            items: group.items.map(item =>
              item.id === cartItemId
                ? { ...item, quantity: Math.min(quantity, item.goods.stock) }
                : item
            ),
          }))
        );
      }
    } catch (error) {
      console.error('更新數量失敗:', error);
    } finally {
      setUpdating(false);
    }
  };

  /**
   * 删除商品
   */
  const removeItem = async (cartItemId: number) => {
    if (!confirm('確定要刪除此商品嗎？')) return;

    try {
      const res = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMerchantGroups(groups =>
          groups
            .map(group => ({
              ...group,
              items: group.items.filter(item => item.id !== cartItemId),
            }))
            .filter(group => group.items.length > 0)
        );
        toast.success('已刪除商品');
      }
    } catch (error) {
      console.error('刪除商品失敗:', error);
      toast.error('刪除失敗');
    }
  };

  /**
   * 切换单个商品选中状态
   */
  const toggleItemSelect = async (cartItemId: number, selected: boolean) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, selected }),
      });

      if (res.ok) {
        setMerchantGroups(groups =>
          groups.map(group => {
            const newItems = group.items.map(item =>
              item.id === cartItemId ? { ...item, selected } : item
            );
            return {
              ...group,
              items: newItems,
              selectedAll: newItems.every(item => item.selected),
            };
          })
        );
      }
    } catch (error) {
      console.error('更新選中狀態失敗:', error);
    }
  };

  /**
   * 切换商户全选
   */
  const toggleMerchantSelectAll = async (
    merchantId: number,
    items: CartItem[],
    selected: boolean
  ) => {
    // 批量更新
    for (const item of items) {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId: item.id, selected }),
      });
    }

    setMerchantGroups(groups =>
      groups.map(group =>
        group.merchant.id === merchantId
          ? {
              ...group,
              items: group.items.map(item => ({ ...item, selected })),
              selectedAll: selected,
            }
          : group
      )
    );
  };

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = async () => {
    const allItems = merchantGroups.flatMap(g => g.items);
    const allSelected = allItems.every(item => item.selected);
    const newSelected = !allSelected;

    for (const group of merchantGroups) {
      for (const item of group.items) {
        await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemId: item.id, selected: newSelected }),
        });
      }
    }

    setMerchantGroups(groups =>
      groups.map(group => ({
        ...group,
        items: group.items.map(item => ({ ...item, selected: newSelected })),
        selectedAll: newSelected,
      }))
    );
  };

  /**
   * 清空购物车
   */
  const clearCart = async () => {
    if (!confirm('確定要清空購物車嗎？')) return;

    try {
      const res = await fetch('/api/cart?clearAll=true', { method: 'DELETE' });
      if (res.ok) {
        setMerchantGroups([]);
        toast.success('購物車已清空');
      }
    } catch (error) {
      console.error('清空購物車失敗:', error);
      toast.error('操作失敗');
    }
  };

  /**
   * 选择优惠券
   */
  const handleSelectCoupon = (coupon: Coupon | null) => {
    setSelectedCoupon(coupon);
    setShowCouponSelector(false);
    if (coupon) {
      toast.success(`已選擇優惠券：${coupon.name}`);
    }
  };

  // 计算选中商品
  const allItems = merchantGroups.flatMap(g => g.items);
  const selectedItems = allItems.filter(item => item.selected && item.goods.status);
  const totalItems = allItems.length;
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  // 计算金额
  const goodsAmount = selectedItems.reduce(
    (sum, item) => sum + item.goods.price * item.quantity,
    0
  );

  // 计算优惠金额
  let discountAmount = 0;
  if (selectedCoupon) {
    if (selectedCoupon.discount_type === 'fixed' || selectedCoupon.type === 'fixed') {
      discountAmount = selectedCoupon.discount_value;
    } else if (selectedCoupon.discount_type === 'percent' || selectedCoupon.type === 'percent') {
      discountAmount = goodsAmount * (selectedCoupon.discount_value / 100);
      // 应用最大优惠限制
      if (selectedCoupon.max_discount) {
        discountAmount = Math.min(discountAmount, selectedCoupon.max_discount);
      }
    }
  }

  // 运费（满500免运费）
  const shippingFee = goodsAmount >= 500 ? 0 : 30;
  const totalAmount = goodsAmount - discountAmount + shippingFee;

  /**
   * 去结算
   */
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('請選擇要結算的商品');
      return;
    }

    // 跳转到结算页
    const cartItemIds = selectedItems.map(item => item.id).join(',');
    router.push(`/checkout?cartItemIds=${cartItemIds}${selectedCoupon ? `&couponId=${selectedCoupon.id}` : ''}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            購物車
            {totalItems > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalItems}件商品)
              </span>
            )}
          </h1>
          {totalItems > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart}>
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {merchantGroups.length === 0 ? (
          <EmptyState type="cart" />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 商品列表 */}
            <div className="lg:col-span-2 space-y-4">
              {/* 全选栏 */}
              <Card>
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={allItems.length > 0 && allItems.every(item => item.selected)}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm">全選</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    已選 {selectedCount} 件
                  </span>
                </CardContent>
              </Card>

              {/* 按商户分组显示 */}
              {merchantGroups.map((group) => (
                <Card key={group.merchant.id}>
                  {/* 商户头部 */}
                  <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={group.selectedAll}
                        onCheckedChange={(checked) =>
                          toggleMerchantSelectAll(
                            group.merchant.id,
                            group.items,
                            checked as boolean
                          )
                        }
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                          <Store className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{group.merchant.name}</span>
                        {group.merchant.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            認證
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 商品列表 */}
                  <CardContent className="p-0 divide-y">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex gap-4 p-4 ${
                          !item.goods.status ? 'bg-muted/50' : ''
                        }`}
                      >
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={(checked) =>
                            toggleItemSelect(item.id, checked as boolean)
                          }
                        />
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.goods.image ? (
                            <img
                              src={item.goods.image}
                              alt={item.goods.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              暫無圖片
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/shop/${item.goods.id}`}
                            className="font-medium hover:text-primary line-clamp-2"
                          >
                            {item.goods.name}
                          </Link>
                          {!item.goods.status && (
                            <p className="text-xs text-destructive mt-1">商品已下架</p>
                          )}
                          {item.goods.stock < item.quantity && (
                            <p className="text-xs text-orange-600 mt-1">
                              庫存不足，僅剩 {item.goods.stock} 件
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <span className="text-primary font-semibold">
                                HK${item.goods.price.toFixed(2)}
                              </span>
                              {item.goods.original_price && (
                                <span className="text-sm text-muted-foreground line-through ml-2">
                                  HK${item.goods.original_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1 || updating}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(item.id, parseInt(e.target.value) || 1)
                                }
                                className="w-16 text-center h-8"
                                min={1}
                                max={item.goods.stock}
                                disabled={updating}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.goods.stock || updating}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 结算面板 */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>訂單結算</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 优惠券 */}
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setShowCouponSelector(true)}
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span>優惠券</span>
                    </div>
                    {selectedCoupon ? (
                      <span className="text-primary">-HK${discountAmount.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">選擇優惠券</span>
                    )}
                  </Button>

                  <Separator />

                  {/* 金额明细 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">商品金額</span>
                      <span>HK${goodsAmount.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>優惠券抵扣</span>
                        <span>-HK${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">運費</span>
                      {shippingFee === 0 ? (
                        <span className="text-green-600">免運費</span>
                      ) : (
                        <span>HK${shippingFee.toFixed(2)}</span>
                      )}
                    </div>
                    {shippingFee > 0 && (
                      <p className="text-xs text-muted-foreground">
                        滿 HK$500 免運費
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* 合计 */}
                  <div className="flex justify-between text-lg font-semibold">
                    <span>合計</span>
                    <span className="text-primary">HK${totalAmount.toFixed(2)}</span>
                  </div>

                  {/* 结算按钮 */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={selectedCount === 0}
                  >
                    去結算 ({selectedCount})
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  {/* 服务保障 */}
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      正品保證
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      快速發貨
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* 优惠券选择器 */}
      <CouponSelector
        open={showCouponSelector}
        onOpenChange={setShowCouponSelector}
        mode="select"
        orderAmount={goodsAmount}
        onSelect={handleSelectCoupon}
      />
    </div>
  );
}
