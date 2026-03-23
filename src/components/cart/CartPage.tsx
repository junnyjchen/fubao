'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface CartItem {
  id: number;
  goodsId: number;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  merchantName: string;
  isCertified: boolean;
}

// 模拟购物车数据
const mockCartItems: CartItem[] = [
  {
    id: 1,
    goodsId: 1,
    name: '武當鎮宅符',
    image: null,
    price: 288,
    quantity: 1,
    merchantName: '武當山道觀官方店',
    isCertified: true,
  },
  {
    id: 2,
    goodsId: 3,
    name: '天師平安符',
    image: null,
    price: 168,
    quantity: 2,
    merchantName: '龍虎山天師府店',
    isCertified: true,
  },
];

export function CartPage() {
  const { t } = useI18n();
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [selectedItems, setSelectedItems] = useState<number[]>(cartItems.map((item) => item.id));

  const handleQuantityChange = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemove = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.id));
  const totalPrice = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalQuantity = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          購物車
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cartItems.length}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">全選</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    已選擇 {selectedItems.length} 件商品
                  </span>
                </CardContent>
              </Card>

              {/* Items */}
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary mt-6"
                      />
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
                            <span className="text-3xl text-primary/20">符</span>
                          </div>
                        )}
                        {item.isCertified && (
                          <Badge className="absolute top-1 left-1 bg-gold text-gold-foreground text-xs">
                            認證
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.goodsId}`} className="font-medium hover:text-primary">
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{item.merchantName}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-primary">HK${item.price}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => handleQuantityChange(item.id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => handleQuantityChange(item.id, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemove(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-4">訂單摘要</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">商品金額</span>
                      <span>HK${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">運費</span>
                      <span className="text-success">免運費</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-baseline">
                    <span className="font-medium">合計</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">HK${totalPrice.toFixed(2)}</span>
                      <p className="text-xs text-muted-foreground">共 {totalQuantity} 件商品</p>
                    </div>
                  </div>

                  <Button className="w-full mt-6" size="lg" disabled={selectedItems.length === 0}>
                    去結算
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>平台擔保交易</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" />
                      <span>全球配送</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">購物車是空的</h2>
              <p className="text-muted-foreground mb-6">快去選購您心儀的符箓法器吧</p>
              <Button asChild>
                <Link href="/shop">去商城逛逛</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
