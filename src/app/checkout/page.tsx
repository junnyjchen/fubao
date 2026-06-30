/**
 * @fileoverview 结算页面
 * @description 订单结算、地址选择、支付方式选择
 * @module app/checkout/page
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef, Suspense, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CouponSelector } from '@/components/coupon/CouponSelector';
import { useAuth } from '@/lib/auth/context';
import { useI18n } from '@/lib/i18n';
import { useSiteSettings } from '@/lib/site-settings';
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
  t,
  currency
}: { 
  item: CartItem;
  t: any;
  currency: string;
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
          <span className="text-primary font-semibold">{currency}{item.goods.price.toFixed(2)}</span>
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
  const { settings } = useSiteSettings();
  const { user, loading: authLoading } = useAuth();
  const currency = settings.currency || 'HK$';
  const isGuest = !authLoading && !user;
  
  const cartItemIdsStr = searchParams.get('cartItemIds') || '';
  const cartItemIds = useMemo(() => cartItemIdsStr ? cartItemIdsStr.split(',').map(Number) : [], [cartItemIdsStr]);
  const orderId = searchParams.get('order_id');
  const couponId = searchParams.get('couponId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCouponSelector, setShowCouponSelector] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'balance' | 'paypal' | 'payprotocol'>('alipay');
  const [remark, setRemark] = useState('');

  // 游客地址表单
  const [guestAddress, setGuestAddress] = useState({
    name: '',
    phone: '',
    email: '',
    province: '香港',
    city: '九龍',
    district: '觀塘區',
    address: '',
  });

  const checkout = t.checkoutPage;

  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fubao_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      // Cookie 会自动携带 auth_token，无需手动添加
    }
    return headers;
  }, []);

  const loadedRef = useRef(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 游客模式：从 localStorage 加载购物车
      if (isGuest) {
        // 优先读取 fubao_guest_checkout（来自购物车结算/立即购买）
        const checkoutStored = localStorage.getItem('fubao_guest_checkout');
        if (checkoutStored) {
          try {
            const checkoutItems = JSON.parse(checkoutStored);
            const items = checkoutItems.map((item: any) => ({
              id: item.goods_id,
              goods_id: item.goods_id,
              quantity: item.quantity,
              goods: {
                id: item.goods_id,
                name: item.name || '商品',
                price: parseFloat(item.price || '0'),
                image: item.image || null,
              },
              spec: item.spec || '',
              merchant_id: item.merchant_id || 0,
              merchant_name: '',
            }));
            setCartItems(items);
          } catch { /* ignore */ }
          setLoading(false);
          return;
        }
        // 回退：从 fubao_guest_cart 加载
        const stored = localStorage.getItem('fubao_guest_cart');
        if (stored) {
          try {
            const guestCart = JSON.parse(stored);
            // 需要从 API 获取商品信息
            const goodsIds = guestCart.map((item: any) => item.goods_id);
            if (goodsIds.length > 0) {
              const goodsRes = await fetch(`/api/goods?ids=${goodsIds.join(',')}`);
              const goodsData = await goodsRes.json();
              const goodsMap = new Map();
              if (goodsData.data) {
                (goodsData.data as any[]).forEach((g: any) => goodsMap.set(g.id, g));
              }
              const items = guestCart.map((item: any) => {
                const goods = goodsMap.get(item.goods_id) || {};
                return {
                  id: item.id || item.goods_id,
                  goods_id: item.goods_id,
                  quantity: item.quantity,
                  goods: {
                    id: item.goods_id,
                    name: goods.name || '商品',
                    price: parseFloat(goods.price || '0'),
                    image: goods.main_image || null,
                  },
                  merchant_id: 0,
                  merchant_name: '',
                };
              });
              setCartItems(items);
            }
          } catch { /* ignore */ }
        }
        setLoading(false);
        return;
      }

      const headers = getAuthHeaders();
      // 加载地址
      const addrRes = await fetch('/api/addresses', { headers });
      if (addrRes.ok) {
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
      }

      // 模式1: 直接下单 (order_id)
      if (orderId) {
        const orderRes = await fetch(`/api/orders?id=${orderId}`, { headers });
        const orderData = await orderRes.json();
        if (orderData.data) {
          const order = orderData.data;
          // 将订单商品转为 CartItem 格式展示
          const items = (order.items || []).map((item: any) => ({
            id: item.id || item.goods_id,
            goods_id: item.goods_id,
            quantity: item.quantity,
            goods: {
              id: item.goods_id,
              name: item.goods_name,
              price: parseFloat(item.price || '0'),
              image: item.goods_image || null,
            },
            merchant_id: 0,
            merchant_name: '',
          }));
          setCartItems(items);
          // 如果有已选的地址快照
          if (order.address_snapshot) {
            try {
              const addr = JSON.parse(order.address_snapshot);
              // 从地址列表中找到匹配的或使用快照
              if (addr.id) setSelectedAddressId(addr.id);
            } catch { /* ignore */ }
          }
          if (order.payment_method) setPaymentMethod(order.payment_method);
          if (order.remark) setRemark(order.remark);
        } else {
          // 订单不存在，设置空购物车让页面显示空状态
          setCartItems([]);
        }
      }
      // 模式2: 购物车下单 (cartItemIds)
      else if (cartItemIds.length > 0) {
        const cartRes = await fetch('/api/cart', { headers });
        if (!cartRes.ok) {
          const errData = await cartRes.json().catch(() => ({}));
          toast.error(errData.error || '加載購物車失敗');
          setCartItems([]);
        } else {
          const cartData = await cartRes.json();
          if (cartData.data?.groups) {
            const allItems = cartData.data.groups.flatMap((g: { merchant: { id: number; name: string }; items: CartItem[] }) =>
              g.items.map((item: CartItem) => ({
                ...item,
                merchant_id: g.merchant.id,
                merchant_name: g.merchant.name,
              }))
            );
            const selectedItems = allItems.filter((item: CartItem) => cartItemIds.includes(item.id));
            setCartItems(selectedItems);
          } else if (cartData.error) {
            toast.error(cartData.error);
            setCartItems([]);
          }
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
  }, [cartItemIds, orderId, getAuthHeaders, isGuest]);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadData();
    }
  }, [loadData]);

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
    // 游客模式：验证地址表单
    if (isGuest) {
      if (!guestAddress.name.trim()) {
        toast.error('請填寫收貨人姓名');
        return;
      }
      if (!guestAddress.address.trim()) {
        toast.error('請填寫詳細地址');
        return;
      }
    } else if (!selectedAddressId) {
      toast.error(checkout.selectAddress);
      return;
    }

    if (cartItems.length === 0) {
      toast.error(checkout.cartEmpty);
      return;
    }

    setSubmitting(true);
    try {
      // 游客模式：创建游客订单
      if (isGuest) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(item => ({ goods_id: item.goods_id, quantity: item.quantity })),
            guest_address: {
              name: guestAddress.name.trim(),
              phone: guestAddress.phone.trim() || '未提供',
              email: guestAddress.email.trim() || '',
              province: guestAddress.province,
              city: guestAddress.city,
              district: guestAddress.district,
              address: guestAddress.address.trim(),
            },
            payment_method: paymentMethod,
            remark: remark.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (data.data) {
          // 保存游客订单ID到 localStorage
          const guestOrders = JSON.parse(localStorage.getItem('fubao_guest_orders') || '[]');
          guestOrders.push(data.data.id);
          localStorage.setItem('fubao_guest_orders', JSON.stringify(guestOrders));
          // 清除游客购物车
          localStorage.removeItem('fubao_guest_cart');
          localStorage.removeItem('fubao_guest_checkout');
          router.push(`/payment/${data.data.id}`);
        } else if (data.error) {
          toast.error(data.error);
        }
        setSubmitting(false);
        return;
      }

      // 直接下单模式：更新已有订单
      if (orderId) {
        const res = await fetch(`/api/orders`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            id: parseInt(orderId),
            address_id: selectedAddressId,
            coupon_id: selectedCoupon?.id,
            payment_method: paymentMethod,
            remark: remark.trim() || undefined,
            status: 'pending',
          }),
        });
        const data = await res.json();
        if (data.data || data.success) {
          router.push(`/payment/${orderId}`);
        } else {
          toast.error(data.error || checkout.submitFailed);
        }
      }
      // 购物车模式：创建新订单
      else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: getAuthHeaders(),
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
          router.push(`/payment/${data.data.id}`);
        } else if (data.error) {
          toast.error(data.error);
        }
      }
    } catch (error) {
      console.error('提交订单失败:', error);
      toast.error(checkout.submitFailed);
    } finally {
      setSubmitting(false);
    }
  }, [isGuest, guestAddress, selectedAddressId, cartItems, cartItemIds, orderId, selectedCoupon, paymentMethod, remark, router, checkout, getAuthHeaders]);

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
                {isGuest ? (
                  /* 游客地址表单 */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{checkout.address.name} *</Label>
                        <Input
                          value={guestAddress.name}
                          onChange={(e) => setGuestAddress({ ...guestAddress, name: e.target.value })}
                          placeholder="請輸入收貨人姓名"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{checkout.address.phone}</Label>
                        <Input
                          value={guestAddress.phone}
                          onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value })}
                          placeholder="選填"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email（可選，用於接收訂單通知）</Label>
                      <Input
                        type="email"
                        value={guestAddress.email}
                        onChange={(e) => setGuestAddress({ ...guestAddress, email: e.target.value })}
                        placeholder="example@email.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{checkout.address.detailAddress} *</Label>
                      <Input
                        value={guestAddress.address}
                        onChange={(e) => setGuestAddress({ ...guestAddress, address: e.target.value })}
                        placeholder="請輸入詳細地址（街道、門牌號等）"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      免註冊快速下單，訂單編號將在提交後顯示。如需查看訂單歷史，建議<Link href="/login" className="text-primary underline">登錄</Link>後下單。
                    </p>
                  </div>
                ) : selectedAddress ? (
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
                  <CartItemRow key={item.id} item={item} t={t} currency={currency} />
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
                    <span className="text-primary">-{currency}{discountAmount.toFixed(2)}</span>
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
                        <p className="text-xs text-muted-foreground">{checkout.payment.balanceDesc}：{currency}0.00</p>
                      </div>
                    </label>
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : ''
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <RadioGroupItem value="paypal" />
                      <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.562 0-1.037.41-1.115.964l-.744 4.72-.18 1.147-.01.062a.641.641 0 0 1-.633.563h.055z"/>
                        </svg>
                      </div>
                      <div className={isRTL ? 'text-end' : ''}>
                        <p className="font-medium">PayPal</p>
                        <p className="text-xs text-muted-foreground">國際信用卡/PayPal賬戶支付</p>
                      </div>
                    </label>
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'payprotocol' ? 'border-primary bg-primary/5' : ''
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <RadioGroupItem value="payprotocol" />
                      <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <div className={isRTL ? 'text-end' : ''}>
                        <p className="font-medium">Pay Protocol</p>
                        <p className="text-xs text-muted-foreground">加密貨幣支付（USDT/USDC等）</p>
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
                    <span>{currency}{goodsAmount.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{summary.discount}</span>
                      <span>-{currency}{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{summary.shipping}</span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600">{summary.freeShipping}</span>
                    ) : (
                      <span>{currency}{shippingFee.toFixed(2)}</span>
                    )}
                  </div>
                  {shippingFee > 0 && <p className="text-xs text-muted-foreground">{summary.freeShippingThreshold}</p>}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>{summary.total}</span>
                  <span className="text-primary">{currency}{totalAmount.toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting || (!isGuest && !selectedAddressId)}>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
