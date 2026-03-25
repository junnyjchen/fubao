/**
 * @fileoverview 结账页面
 * @description 用户结算购物车商品
 * @module app/checkout/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { CouponSelector } from '@/components/coupon/CouponSelector';
import { 
  CreditCard,
  Smartphone,
  Wallet,
  ChevronLeft,
  Lock,
  Package,
  Loader2,
  Ticket,
} from 'lucide-react';

interface CartItem {
  id: number;
  goodsId: number;
  goodsName: string;
  goodsImage: string | null;
  price: string;
  quantity: number;
}

interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
}

interface UserBalance {
  balance: number;
  frozen_balance: number;
}

const payMethods = [
  { value: 'balance', label: '餘額支付', icon: Wallet, enabled: true },
  { value: 'alipay', label: '支付寶', icon: Wallet, enabled: false },
  { value: 'wechat', label: '微信支付', icon: Smartphone, enabled: false },
  { value: 'paypal', label: 'PayPal', icon: CreditCard, enabled: true },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // 收货信息
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  
  // 支付方式
  const [payMethod, setPayMethod] = useState('paypal');
  
  // 备注
  const [remark, setRemark] = useState('');

  // 用户余额
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);

  // 优惠券相关
  const [showCouponSelector, setShowCouponSelector] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<{
    id: number;
    name: string;
    discount_value: number;
    discount_type: string;
    user_coupon_id?: number;
  } | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // 检查用户登录状态
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // 从URL参数获取商品信息
    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      try {
        const items = JSON.parse(decodeURIComponent(itemsParam));
        setCartItems(items);
      } catch (e) {
        console.error('解析商品信息失败:', e);
        router.push('/cart');
      }
    } else {
      router.push('/cart');
    }
    setLoading(false);
  }, [searchParams, router]);

  // 加载用户地址
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await fetch('/api/addresses');
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          const defaultAddr = data.data.find((a: Address) => a.isDefault) || data.data[0];
          setShippingInfo({
            name: defaultAddr.name,
            phone: defaultAddr.phone,
            address: `${defaultAddr.province}${defaultAddr.city}${defaultAddr.district}${defaultAddr.address}`,
          });
        }
      } catch (error) {
        console.error('加载地址失败:', error);
      }
    };
    loadAddresses();
    
    // 加载用户余额
    const loadBalance = async () => {
      try {
        const res = await fetch('/api/user/balance');
        const data = await res.json();
        if (data.data?.balance) {
          setUserBalance(data.data.balance);
        }
      } catch (error) {
        console.error('加载余额失败:', error);
      }
    };
    loadBalance();
  }, []);

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  // 计算运费
  const shippingFee = totalAmount >= 500 ? 0 : 30;

  // 计算优惠券折扣
  const calculateCouponDiscount = () => {
    if (!selectedCoupon) return 0;
    
    if (selectedCoupon.discount_type === 'percent') {
      const discount = totalAmount * (selectedCoupon.discount_value / 100);
      return Math.min(discount, 100); // 假设最大折扣100
    }
    return selectedCoupon.discount_value;
  };

  const couponDiscountAmount = calculateCouponDiscount();

  // 最终支付金额
  const finalAmount = totalAmount + shippingFee - couponDiscountAmount;

  // 处理优惠券选择
  const handleCouponSelect = (coupon: typeof selectedCoupon) => {
    setSelectedCoupon(coupon);
    if (coupon) {
      // 验证优惠券
      if (totalAmount < 100) { // 假设最低消费100
        alert('訂單金額不滿足優惠券使用條件');
        return;
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // 检查登录状态
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    // 验证收货信息
    if (!shippingInfo.name.trim()) {
      alert('請輸入收貨人姓名');
      return;
    }
    if (!shippingInfo.phone.trim()) {
      alert('請輸入聯繫電話');
      return;
    }
    if (!shippingInfo.address.trim()) {
      alert('請輸入收貨地址');
      return;
    }

    // 余额支付时检查余额
    if (payMethod === 'balance') {
      if (!userBalance || userBalance.balance < finalAmount) {
        alert('餘額不足，請選擇其他支付方式或先充值');
        return;
      }
    }

    setSubmitting(true);
    try {
      // 创建订单
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItemIds: cartItems.map(item => item.id),
          shippingInfo,
          remark,
        }),
      });

      const data = await res.json();
      if (data.message && data.order) {
        // 根据支付方式处理
        if (payMethod === 'balance') {
          // 余额支付
          const payRes = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: data.order.id,
              payment_method: 'balance',
            }),
          });
          
          const payData = await payRes.json();
          if (payData.data?.status === 'success') {
            router.push(`/payment/success?orderId=${data.order.id}&orderNo=${data.order.order_no}`);
          } else {
            router.push(`/payment/fail?error=${encodeURIComponent(payData.error || '支付失敗')}`);
          }
        } else {
          // 其他支付方式 - 模拟支付成功
          await fetch(`/api/orders/${data.order.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pay_status: 1,
              pay_method: payMethod,
              pay_time: new Date().toISOString(),
            }),
          });
          
          router.push(`/payment/success?orderId=${data.order.id}&orderNo=${data.order.order_no}`);
        }
      } else if (data.error) {
        router.push(`/payment/fail?error=${encodeURIComponent(data.error)}`);
      }
    } catch (error) {
      console.error('提交订单失败:', error);
      router.push(`/payment/fail?error=${encodeURIComponent('提交訂單失敗，請重試')}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">沒有選中商品</h2>
            <Button asChild className="mt-4">
              <Link href="/cart">返回購物車</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">確認訂單</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：收货信息和支付方式 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 收货信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">收貨信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">收貨人姓名 *</Label>
                    <Input
                      id="name"
                      value={shippingInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="請輸入收貨人姓名"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">聯繫電話 *</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="請輸入聯繫電話"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">詳細地址 *</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="請輸入詳細收貨地址"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 支付方式 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">支付方式</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={payMethod} onValueChange={setPayMethod}>
                  {payMethods.map((method) => {
                    const Icon = method.icon;
                    const isBalancePayment = method.value === 'balance';
                    const hasEnoughBalance = userBalance && userBalance.balance >= finalAmount;
                    const balanceEnabled = isBalancePayment ? !!userBalance && hasEnoughBalance : method.enabled;
                    
                    return (
                      <div
                        key={method.value}
                        className={`flex items-center space-x-3 p-4 rounded-lg border ${
                          balanceEnabled ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => balanceEnabled && setPayMethod(method.value)}
                      >
                        <RadioGroupItem value={method.value} disabled={!balanceEnabled} />
                        <Icon className="w-5 h-5" />
                        <div className="flex-1">
                          <span>{method.label}</span>
                          {isBalancePayment && userBalance && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (餘額: HK${userBalance.balance.toFixed(2)})
                            </span>
                          )}
                        </div>
                        {isBalancePayment && userBalance && !hasEnoughBalance && (
                          <span className="text-xs text-destructive">餘額不足</span>
                        )}
                        {!isBalancePayment && !method.enabled && (
                          <span className="text-xs text-muted-foreground">暫未開通</span>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 订单备注 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">訂單備註</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="選填，請輸入訂單備註信息"
                  maxLength={200}
                />
              </CardContent>
            </Card>

            {/* 商品列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">商品明細</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border-b last:border-0">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                      {item.goodsImage ? (
                        <img src={item.goodsImage} alt={item.goodsName} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        '暫無圖片'
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.goodsName}</p>
                      <p className="text-sm text-muted-foreground">數量：{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">HK${item.price}</p>
                      <p className="text-sm text-muted-foreground">
                        小計：HK${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：订单汇总 */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>訂單匯總</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">商品數量</span>
                  <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}件</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">商品金額</span>
                  <span>HK${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">運費</span>
                  <span className="text-green-600">
                    {shippingFee === 0 ? '免運費' : `HK$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                
                {/* 优惠券 */}
                <div 
                  className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setShowCouponSelector(true)}
                >
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span>優惠券</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCoupon ? (
                      <span className="text-primary font-medium">
                        -HK${couponDiscountAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {user ? '選擇優惠券' : '登錄後可用'}
                      </span>
                    )}
                    <span className="text-muted-foreground">{'>'}</span>
                  </div>
                </div>

                {/* 已选优惠券显示 */}
                {selectedCoupon && (
                  <div className="flex items-center justify-between text-sm bg-primary/5 p-2 rounded">
                    <span className="text-primary">{selectedCoupon.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setSelectedCoupon(null)}
                    >
                      取消使用
                    </Button>
                  </div>
                )}
                
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>應付金額</span>
                  <span className="text-primary">
                    HK${finalAmount.toFixed(2)}
                  </span>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {submitting ? '提交中...' : '提交訂單'}
                </Button>
                
                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>提交訂單即表示您同意</p>
                  <p>
                    <Link href="/terms" className="text-primary hover:underline">《用戶協議》</Link>
                    {' '}和{' '}
                    <Link href="/privacy" className="text-primary hover:underline">《隱私政策》</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />

      {/* Coupon Selector */}
      <CouponSelector
        open={showCouponSelector}
        onOpenChange={setShowCouponSelector}
        userId={user?.id}
        orderAmount={totalAmount}
        mode="select"
        selectedCouponId={selectedCoupon?.id}
        onSelect={handleCouponSelect}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">載入中...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
