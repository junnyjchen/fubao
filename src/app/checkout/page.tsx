/**
 * @fileoverview 结算页面
 * @description 订单结算、地址选择、支付方式选择
 * @module app/checkout/page
 */

'use client';

import { useState, useEffect, useCallback, Suspense, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CouponSelector } from '@/components/coupon/CouponSelector';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useI18n } from '@/lib/i18n';
import {
  MapPin,
  Plus,
  ChevronRight,
  CreditCard,
  Wallet,
  Shield,
  Truck,
  Package,
  Loader2,
  Ticket,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { CheckoutSkeleton } from '@/components/common/PageSkeletons';

/** 地址 */
interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default: boolean;
}

/** 购物车商品 */
interface CartGoods {
  id: number;
  name: string;
  price: number;
  image: string | null;
}

/** 购物车项 */
interface CartItem {
  id: number;
  goods_id: number;
  quantity: number;
  goods: CartGoods;
  merchant_id: number;
  merchant_name: string;
}

/** 优惠券 */
interface Coupon {
  id: number;
  name: string;
  discount_type: string;
  discount_value: number;
  min_amount: number;
  max_discount: number | null;
}

// 商品项组件
const CartItemRow = memo(function CartItemRow({ 
  item,
  t 
}: { 
  item: CartItem;
  t: any;
}) {
  const goodsList = t.checkoutPage.goodsList;
  
  return (
    <div className="flex gap-4 p-4">
      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
        {item.goods.image ? (
          <Image
            src={item.goods.image}
            alt={item.goods.name}
            fill
            sizes="80px"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Package className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium line-clamp-2">{item.goods.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{item.merchant_name}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-semibold">HK${item.goods.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">x{item.quantity}</span>
        </div>
      </div>
    </div>
  );
});

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useI18n();
  
  const cartItemIds = searchParams.get('cartItemIds')?.split(',').map(Number) || [];
  const couponId = searchParams.get('couponId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCouponSelector, setShowCouponSelector] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'balance'>('alipay');
  const [remark, setRemark] = useState('');

  const checkout = t.checkoutPage;

  useEffect(() => {
    loadData();
  }, [cartItemIds]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 加载地址
      const addrRes = await fetch('/api/addresses');
      const addrData = await addrRes.json();
      if (addrData.data) {
        setAddresses(addrData.data);
        const defaultAddr = addrData.data.find((a: Address) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (addrData.data.length > 0) {
          setSelectedAddressId(addrData.data[0].id);
        }
      }

      // 加载购物车商品
      if (cartItemIds.length > 0) {
        const cartRes = await fetch('/api/cart');
        const cartData = await cartRes.json();
        if (cartData.data) {
          const allItems = cartData.data.flatMap((g: { merchant: { id: number; name: string }; items: CartItem[] }) =>
            g.items.map((item: CartItem) => ({
              ...item,
              merchant_id: g.merchant.id,
              merchant_name: g.merchant.name,
            }))
          );
          const selectedItems = allItems.filter((item: CartItem) => cartItemIds.includes(item.id));
          setCartItems(selectedItems);
        }
      }

      if (couponId) {
        // TODO: 加载优惠券详情
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [cartItemIds]);

  // 计算金额
  const goodsAmount = cartItems.reduce((sum, item) => sum + item.goods.price * item.quantity, 0);

  let discountAmount = 0;
  if (selectedCoupon) {
    if (selectedCoupon.discount_type === 'fixed') {
      discountAmount = selectedCoupon.discount_value;
    } else if (selectedCoupon.discount_type === 'percent') {
      discountAmount = goodsAmount * (selectedCoupon.discount_value / 100);
      if (selectedCoupon.max_discount) {
        discountAmount = Math.min(discountAmount, selectedCoupon.max_discount);
      }
    }
  }

  const shippingFee = goodsAmount >= 500 ? 0 : 30;
  const totalAmount = goodsAmount - discountAmount + shippingFee;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectCoupon = useCallback((coupon: Coupon | null) => {
    setSelectedCoupon(coupon);
    setShowCouponSelector(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedAddressId) {
      toast.error(checkout.selectAddress);
      return;
    }

    if (cartItems.length === 0) {
      toast.error(checkout.cartEmpty);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_id: selectedAddressId,
          cart_item_ids: cartItemIds,
          coupon_id: selectedCoupon?.id,
          payment_method: paymentMethod,
          remark: remark.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.data) {
        router.push(`/payment?orderId=${data.data.id}`);
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('提交订单失败:', error);
      toast.error(checkout.submitFailed);
    } finally {
      setSubmitting(false);
    }
  }, [selectedAddressId, cartItems, cartItemIds, selectedCoupon, paymentMethod, remark, router, checkout]);

  if (loading) {
    return <CheckoutSkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md animate-fade-in">
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">{checkout.cartEmpty}</h2>
            <p className="text-muted-foreground mb-6">{checkout.selectGoods}</p>
            <Button asChild>
              <Link href="/cart">{checkout.backToCart}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const summary = checkout.summary;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">{checkout.title}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧内容 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 收货地址 */}
            <Card className="animate-fade-in-up">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4" />
                  {checkout.address.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAddress ? (
                  <div
                    className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                    onClick={() => router.push('/user/addresses?select=true')}
                    role="button"
                    tabIndex={0}
                    aria-label={`${selectedAddress.name} ${selectedAddress.phone} ${selectedAddress.province}${selectedAddress.city}${selectedAddress.district}${selectedAddress.address}`}
                  >
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={isRTL ? 'text-end' : ''}>
                        <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-medium">{selectedAddress.name}</span>
                          <span className="text-muted-foreground">{selectedAddress.phone}</span>
                          {selectedAddress.is_default && (
                            <Badge variant="secondary">{checkout.address.default}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddress.province}
                          {selectedAddress.city}
                          {selectedAddress.district}
                          {selectedAddress.address}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                ) : addresses.length === 0 ? (
                  <Button variant="outline" className="w-full" onClick={() => router.push('/user/addresses/new')}>
                    <Plus className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                    {checkout.address.add}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedAddressId(addr.id)}
                        role="radio"
                        aria-checked={selectedAddressId === addr.id}
                        tabIndex={0}
                      >
                        <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <RadioGroupItem value={addr.id.toString()} checked={selectedAddressId === addr.id} />
                          <div className="flex-1">
                            <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span className="font-medium">{addr.name}</span>
                              <span className="text-muted-foreground">{addr.phone}</span>
                              {addr.is_default && <Badge variant="secondary">{checkout.address.default}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {addr.province}{addr.city}{addr.district}{addr.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 商品清单 */}
            <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="w-4 h-4" />
                  {checkout.goodsList.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y">
                {cartItems.map((item) => (
                  <CartItemRow key={item.id} item={item} t={t} />
                ))}
              </CardContent>
            </Card>

            {/* 优惠券 */}
            <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <CardContent className="py-4">
                <Button variant="outline" className="w-full justify-between group" onClick={() => setShowCouponSelector(true)}>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span>{checkout.coupon.title}</span>
                  </div>
                  {selectedCoupon ? (
                    <span className="text-primary">-HK${discountAmount.toFixed(2)}</span>
                  ) : (
                    <div className={`flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{goodsAmount >= 100 ? checkout.coupon.available : checkout.coupon.select}</span>
                      <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 支付方式 */}
            <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="w-4 h-4" />
                  {checkout.payment.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'alipay' ? 'border-primary bg-primary/5' : ''
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <RadioGroupItem value="alipay" />
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">支</div>
                      <div className={isRTL ? 'text-end' : ''}>
                        <p className="font-medium">{checkout.payment.alipay}</p>
                        <p className="text-xs text-muted-foreground">{checkout.payment.alipayDesc}</p>
                      </div>
                    </label>
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'wechat' ? 'border-primary bg-primary/5' : ''
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <RadioGroupItem value="wechat" />
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">微</div>
                      <div className={isRTL ? 'text-end' : ''}>
                        <p className="font-medium">{checkout.payment.wechat}</p>
                        <p className="text-xs text-muted-foreground">{checkout.payment.wechatDesc}</p>
                      </div>
                    </label>
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'balance' ? 'border-primary bg-primary/5' : ''
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <RadioGroupItem value="balance" />
                      <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div className={isRTL ? 'text-end' : ''}>
                        <p className="font-medium">{checkout.payment.balance}</p>
                        <p className="text-xs text-muted-foreground">{checkout.payment.balanceDesc}：HK$0.00</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 订单备注 */}
            <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <CardContent className="py-4">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{checkout.remark.title}</span>
                </div>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder={checkout.remark.placeholder}
                  className={`w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${isRTL ? 'text-end' : ''}`}
                  rows={2}
                  maxLength={200}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </CardContent>
            </Card>
          </div>

          {/* 右侧结算面板 */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>{summary.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{summary.goodsAmount} ({totalQuantity}{summary.items})</span>
                    <span>HK${goodsAmount.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{summary.discount}</span>
                      <span>-HK${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{summary.shipping}</span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600">{summary.freeShipping}</span>
                    ) : (
                      <span>HK${shippingFee.toFixed(2)}</span>
                    )}
                  </div>
                  {shippingFee > 0 && <p className="text-xs text-muted-foreground">{summary.freeShippingThreshold}</p>}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>{summary.total}</span>
                  <span className="text-primary">HK${totalAmount.toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting || !selectedAddressId}>
                  {submitting ? (
                    <>
                      <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ms-2' : 'me-2'}`} />
                      {summary.submitting}
                    </>
                  ) : (
                    summary.submit
                  )}
                </Button>

                {/* 服务保障 */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {checkout.service.authentic}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {checkout.service.fastShipping}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="min-h-screen bg-muted/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <CheckoutPageContent />
      </Suspense>
    </RequireAuth>
  );
}
