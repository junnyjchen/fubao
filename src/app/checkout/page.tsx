'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CreditCard, 
  Wallet, 
  Building2,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface CartItem {
  id: number;
  goodsId: number;
  goodsName: string;
  goodsImage: string | null;
  price: string;
  quantity: number;
  selected: boolean;
  merchantId: number;
  merchantName: string;
}

export default function CheckoutPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [payMethod, setPayMethod] = useState('paypal');
  
  // 收货信息
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
  });

  useEffect(() => {
    // 从URL参数获取商品信息
    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      try {
        const items = JSON.parse(decodeURIComponent(itemsParam));
        setCartItems(items);
      } catch (e) {
        console.error('解析商品信息失败', e);
      }
    } else {
      // 如果没有商品信息，跳转回购物车
      router.push('/cart');
    }
  }, [searchParams, router]);

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  const handleSubmit = async () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert('请填写完整的收货信息');
      return;
    }

    setLoading(true);
    try {
      // 创建订单
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            goodsId: item.goodsId,
            quantity: item.quantity,
          })),
          shippingInfo,
          remark: '',
        }),
      });

      const result = await response.json();
      
      if (result.data) {
        // 跳转到支付页面
        router.push(`/order/${result.data.orderId}?pay=true`);
      } else {
        alert(result.error || '创建订单失败');
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      alert('创建订单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span>返回購物車</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-semibold">確認訂單</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：收货信息和商品列表 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 收货地址 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  收貨信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">收貨人姓名 *</Label>
                    <Input
                      id="name"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      placeholder="請輸入收貨人姓名"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">聯繫電話 *</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      placeholder="請輸入手機號碼"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="province">省份</Label>
                    <Input
                      id="province"
                      value={shippingInfo.province}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value })}
                      placeholder="省份"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">城市</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      placeholder="城市"
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">區縣</Label>
                    <Input
                      id="district"
                      value={shippingInfo.district}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value })}
                      placeholder="區縣"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">詳細地址 *</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    placeholder="請輸入詳細地址"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 商品列表 */}
            <Card>
              <CardHeader>
                <CardTitle>商品清單</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                        {item.goodsImage ? (
                          <img src={item.goodsImage} alt={item.goodsName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-xs">暫無圖片</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.goodsName}</h3>
                        <p className="text-sm text-muted-foreground">{item.merchantName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-semibold">HK${item.price}</span>
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：支付方式和订单汇总 */}
          <div className="space-y-6">
            {/* 支付方式 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  支付方式
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={payMethod} onValueChange={setPayMethod} className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="w-5 h-5 text-blue-500" />
                      <span>PayPal</span>
                      <span className="text-xs text-muted-foreground ml-auto">國際支付</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="wechat" id="wechat" />
                    <Label htmlFor="wechat" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building2 className="w-5 h-5 text-green-500" />
                      <span>微信支付</span>
                      <span className="text-xs text-muted-foreground ml-auto">微信掃碼支付</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="alipay" id="alipay" />
                    <Label htmlFor="alipay" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span>支付寶</span>
                      <span className="text-xs text-muted-foreground ml-auto">支付寶掃碼支付</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 订单汇总 */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>訂單匯總</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品金額</span>
                  <span>HK${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">運費</span>
                  <span className="text-green-600">免運費</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>應付金額</span>
                  <span className="text-primary">HK${totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? '提交中...' : '提交訂單'}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4" />
                    <span>安全支付保障</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
