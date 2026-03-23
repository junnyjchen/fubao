'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Package,
  ArrowRight,
} from 'lucide-react';

interface CartItem {
  id: number;
  goodsId: number;
  goodsName: string;
  goodsImage: string | null;
  price: string;
  quantity: number;
  selected: boolean;
  stock: number;
  merchantId: number;
  merchantName: string;
}

// 模拟购物车数据
const mockCartItems: CartItem[] = [
  {
    id: 1,
    goodsId: 1,
    goodsName: '武當鎮宅符',
    goodsImage: null,
    price: '288',
    quantity: 1,
    selected: true,
    stock: 100,
    merchantId: 1,
    merchantName: '武當山道觀官方店',
  },
  {
    id: 2,
    goodsId: 2,
    goodsName: '武當招財符',
    goodsImage: null,
    price: '388',
    quantity: 2,
    selected: true,
    stock: 80,
    merchantId: 1,
    merchantName: '武當山道觀官方店',
  },
  {
    id: 3,
    goodsId: 3,
    goodsName: '天師平安符',
    goodsImage: null,
    price: '168',
    quantity: 1,
    selected: false,
    stock: 200,
    merchantId: 2,
    merchantName: '龍虎山天師府官方店',
  },
];

export function CartPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟加载购物车数据
    setTimeout(() => {
      setCartItems(mockCartItems);
      setLoading(false);
    }, 500);
  }, []);

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const toggleSelect = (id: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(items =>
      items.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const totalAmount = selectedItems.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);
  const totalCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('請選擇要結算的商品');
      return;
    }

    // 将选中的商品信息编码到URL中
    const itemsParam = encodeURIComponent(JSON.stringify(selectedItems));
    router.push(`/checkout?items=${itemsParam}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            購物車
            {cartItems.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({cartItems.length}件商品)
              </span>
            )}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">購物車是空的</h2>
              <p className="text-muted-foreground mb-6">快去挑選心儀的商品吧</p>
              <Button asChild>
                <Link href="/shop">去購物</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 商品列表 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={cartItems.every(item => item.selected)}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm">全選</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border-b last:border-0 hover:bg-muted/30">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                        {item.goodsImage ? (
                          <img src={item.goodsImage} alt={item.goodsName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          '暫無圖片'
                        )}
                      </div>
                      <div className="flex-1">
                        <Link href={`/shop/${item.goodsId}`} className="font-medium hover:text-primary">
                          {item.goodsName}
                        </Link>
                        <p className="text-xs text-muted-foreground">{item.merchantName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-semibold">HK${item.price}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              min={1}
                              max={item.stock}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
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
            </div>

            {/* 结算信息 */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>訂單匯總</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">已選商品</span>
                    <span>{selectedItems.length}件</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">商品金額</span>
                    <span>HK${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">運費</span>
                    <span className="text-green-600">免運費</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>合計</span>
                    <span className="text-primary">HK${totalAmount.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                  >
                    去結算 ({totalCount})
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    結算即表示您同意《用戶協議》和《隱私政策》
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
