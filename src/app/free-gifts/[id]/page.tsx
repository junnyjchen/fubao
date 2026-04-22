/**
 * @fileoverview 免费领商品详情页面
 * @description 填写领取信息，选择邮寄或到店自取
 * @module app/free-gifts/[id]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { RequireAuth } from '@/components/auth/RequireAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Gift,
  Truck,
  MapPin,
  ChevronLeft,
  CheckCircle2,
  Store,
  User,
  Phone,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Navigation,
  Clock,
  Sparkles,
  Star,
  MessageCircle,
  Heart,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { GiftDetailSkeleton } from '@/components/free-gifts/Skeleton';
import { ClaimCodeDisplay, QRCode } from '@/components/free-gifts/QRCode';
import { CopyClaimCode } from '@/components/free-gifts/ShareButton';
import { SuccessAnimation } from '@/components/free-gifts/SuccessAnimation';
import { SharePoster } from '@/components/free-gifts/SharePoster';
import { FavoriteButton, ReminderButton } from '@/components/free-gifts/FavoriteButton';
import { ReviewList, getMockReviews } from '@/components/free-gifts/ReviewList';
import { RecommendList } from '@/components/free-gifts/RecommendList';
import { QuickAddressSelect, AddressManager, Address } from '@/components/free-gifts/AddressManager';
import { CustomerService, HelpTipCard } from '@/components/free-gifts/CustomerService';
import { CategoryBadge } from '@/components/free-gifts/CategoryFilter';
import { InviteFriend, InviteBanner } from '@/components/free-gifts/InviteFriend';
import { NotificationButton, NotificationCenter } from '@/components/free-gifts/NotificationCenter';
import { Bell } from 'lucide-react';

interface FreeGift {
  id: number;
  name: string;
  description: string;
  image: string | null;
  original_price: string;
  stock: number;
  claimed: number;
  limit_per_user: number;
  shipping_fee: string;
  is_active: boolean;
  is_new_user_only?: boolean;
  rating?: number;
  review_count?: number;
  merchant?: {
    id: number;
    name: string;
    address: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FreeGiftDetailPage({ params }: PageProps) {
  return (
    <RequireAuth>
      <FreeGiftDetailContent params={params} />
    </RequireAuth>
  );
}

function FreeGiftDetailContent({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [gift, setGift] = useState<FreeGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receiveType, setReceiveType] = useState<'shipping' | 'pickup'>('shipping');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    claim_no: string;
    shipping_fee: string;
    pay_amount: string;
    need_pay?: boolean;
    pickup_address?: string;
    gift_name?: string;
  } | null>(null);

  // 地址管理
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>();

  // 邀请好友
  const [showInvite, setShowInvite] = useState(false);
  
  // 消息通知
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'gift' as const, title: '領取成功', content: '您已成功領取商品', read: false, createdAt: '2024-01-15' },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // 表单数据
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
  });

  useEffect(() => {
    loadGift();
    // 加载保存的地址
    const savedAddresses = localStorage.getItem('userAddresses');
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  }, [id]);

  const loadGift = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/free-gifts');
      const data = await res.json();
      const giftData = (data.data || []).find((g: FreeGift) => g.id === parseInt(id));
      if (giftData) {
        setGift({
          ...giftData,
          is_new_user_only: parseInt(id) === 1,
          rating: 4.5 + Math.random() * 0.5,
          review_count: Math.floor(Math.random() * 100) + 20,
        });
      } else {
        toast.error('商品不存在');
        router.push('/free-gifts');
      }
    } catch (error) {
      console.error('加载商品失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  // 地址管理函数
  const handleAddAddress = (address: Omit<Address, 'id'>) => {
    const newAddresses = [...addresses, { ...address, id: Date.now().toString() }];
    setAddresses(newAddresses);
    localStorage.setItem('userAddresses', JSON.stringify(newAddresses));
  };

  const handleUpdateAddress = (address: Address) => {
    const newAddresses = addresses.map(a => a.id === address.id ? address : a);
    setAddresses(newAddresses);
    localStorage.setItem('userAddresses', JSON.stringify(newAddresses));
  };

  const handleDeleteAddress = (id: string) => {
    const newAddresses = addresses.filter(a => a.id !== id);
    setAddresses(newAddresses);
    localStorage.setItem('userAddresses', JSON.stringify(newAddresses));
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setFormData({
      shipping_name: address.name,
      shipping_phone: address.phone,
      shipping_address: address.address,
    });
    setShowAddressDialog(false);
  };

  const handleSubmit = async () => {
    if (!gift) return;

    // 验证表单
    if (receiveType === 'shipping') {
      if (!formData.shipping_name.trim()) {
        toast.error('請填寫收貨人姓名');
        return;
      }
      if (!formData.shipping_phone.trim()) {
        toast.error('請填寫手機號碼');
        return;
      }
      if (!formData.shipping_address.trim()) {
        toast.error('請填寫收貨地址');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/free-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gift_id: gift.id,
          receive_type: receiveType,
          shipping_name: formData.shipping_name,
          shipping_phone: formData.shipping_phone,
          shipping_address: formData.shipping_address,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setClaimResult({
          ...data.data,
          gift_name: gift.name,
        });
        
        // 显示成功动画
        setShowSuccessAnimation(true);
        
        setTimeout(() => {
          setShowSuccessAnimation(false);
          
          if (data.data.need_pay) {
            setShowPaymentDialog(true);
          } else {
            setShowSuccessDialog(true);
          }
        }, 1500);
      } else {
        toast.error(data.error || '領取失敗');
      }
    } catch (error) {
      console.error('领取失败:', error);
      toast.error('領取失敗，請稍後重試');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    toast.info('正在處理支付...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setShowPaymentDialog(false);
    setShowSuccessDialog(true);
    toast.success('支付成功！');
  };

  const handleNavigate = () => {
    if (gift?.merchant?.address) {
      const address = encodeURIComponent(gift.merchant.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    }
  };

  // 模拟评价
  const mockReviews = getMockReviews();

  if (loading) {
    return <GiftDetailSkeleton />;
  }

  if (!gift) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Gift className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">商品不存在</p>
        <Link href="/free-gifts">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  const isExpired = gift.stock <= 0;

  return (
    <>
      {/* 成功动画 */}
      {showSuccessAnimation && <SuccessAnimation autoHide={false} />}
      
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 pb-8">
        {/* 顶部导航 */}
        <div className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-semibold">商品詳情</h1>
            </div>
            <div className="flex items-center gap-1">
              <NotificationButton count={unreadCount} onClick={() => setShowNotifications(true)} />
              <FavoriteButton
                giftId={gift.id}
                giftName={gift.name}
              />
              <ReminderButton
                giftId={gift.id}
                giftName={gift.name}
                endTime={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}
              />
              <SharePoster
                gift={gift}
                trigger={
                  <Button variant="ghost" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-lg mx-auto space-y-4">
            {/* 商品信息 */}
            <Card className="overflow-hidden">
              {/* 商品图片 */}
              <div className="relative aspect-video bg-gradient-to-br from-red-100 to-orange-100">
                {gift.image ? (
                  <Image src={gift.image} alt={gift.name} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <Gift className="w-20 h-20 text-red-300" />
                  </div>
                )}
                
                {/* 标签 */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-red-500 text-white">免費</Badge>
                  {gift.is_new_user_only && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      新人專享
                    </Badge>
                  )}
                </div>
                
                {/* 原价 */}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-sm px-2 py-1 rounded backdrop-blur-sm">
                  原價 HK${gift.original_price}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold text-xl">{gift.name}</h2>
                  {gift.rating && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{gift.rating.toFixed(1)}</span>
                      {gift.review_count && (
                        <span className="text-xs text-muted-foreground">
                          ({gift.review_count})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {gift.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    每人限領 {gift.limit_per_user} 件
                  </span>
                  <span>·</span>
                  <span className={gift.stock < 20 ? 'text-orange-600' : ''}>
                    剩餘 {gift.stock} 件
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 用户评价 */}
            {gift.rating && (
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setShowReviewDialog(true)}
              >
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-lg">{gift.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {gift.review_count}條評價
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      查看全部
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </div>
                  </div>
                  {mockReviews.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                      「{mockReviews[0].content}」
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 领取方式选择 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  選擇領取方式
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={receiveType}
                  onValueChange={(v) => setReceiveType(v as 'shipping' | 'pickup')}
                  className="space-y-3"
                >
                  {/* 邮寄 */}
                  <div className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    receiveType === 'shipping' 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setReceiveType('shipping')}
                  >
                    <RadioGroupItem value="shipping" id="shipping" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="shipping" className="flex items-center gap-2 cursor-pointer">
                        <Truck className="w-5 h-5 text-orange-600" />
                        <span className="font-medium">郵寄到家</span>
                        <Badge variant="secondary">需付運費 HK${gift.shipping_fee}</Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        支付運費後，我們將快遞送到您手中
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        <span>包裹保險 · 快遞追蹤</span>
                      </div>
                    </div>
                  </div>

                  {/* 到店自取 */}
                  <div className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    receiveType === 'pickup' 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setReceiveType('pickup')}
                  >
                    <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer">
                        <Store className="w-5 h-5 text-green-600" />
                        <span className="font-medium">到店免費領取</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">完全免費</Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        前往門店出示領取碼即可免費領取
                      </p>
                      {gift.merchant && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">{gift.merchant.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{gift.merchant.address}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate();
                              }}
                            >
                              <Navigation className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 收货信息（邮寄时显示） */}
            {receiveType === 'shipping' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    收貨信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 快速选择地址 */}
                  {addresses.length > 0 && (
                    <div className="mb-4">
                      <QuickAddressSelect
                        addresses={addresses}
                        selectedId={selectedAddressId}
                        onSelect={handleSelectAddress}
                        onManageClick={() => setShowAddressDialog(true)}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      收貨人姓名 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.shipping_name}
                      onChange={(e) => setFormData({ ...formData, shipping_name: e.target.value })}
                      placeholder="請輸入收貨人姓名"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      手機號碼 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={formData.shipping_phone}
                      onChange={(e) => setFormData({ ...formData, shipping_phone: e.target.value })}
                      placeholder="請輸入手機號碼"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      收貨地址 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={formData.shipping_address}
                      onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                      placeholder="請輸入詳細收貨地址"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 费用说明 */}
            <Card className={`${
              receiveType === 'shipping' 
                ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200/50' 
                : 'bg-green-50 dark:bg-green-950/20 border-green-200/50'
            }`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  {receiveType === 'shipping' ? (
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className={`font-medium ${
                      receiveType === 'shipping' 
                        ? 'text-orange-800 dark:text-orange-200' 
                        : 'text-green-800 dark:text-green-200'
                    }`}>
                      {receiveType === 'shipping' 
                        ? `需支付運費 HK${gift.shipping_fee}` 
                        : '到店領取完全免費'}
                    </p>
                    {receiveType === 'shipping' && (
                      <p className="text-muted-foreground mt-1">
                        商品免費，僅需支付運費
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 提交按钮 */}
            <Button
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || isExpired}
            >
              {submitting ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  提交中...
                </>
              ) : isExpired ? (
                '已領完'
              ) : receiveType === 'shipping' ? (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  確認並支付 HK${gift.shipping_fee} 運費
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  確認領取
                </>
              )}
            </Button>

            {/* 温馨提示 */}
            <div className="text-xs text-muted-foreground text-center space-y-1 bg-muted/30 rounded-lg p-3">
              <p>• 領取後請在7天內完成支付/領取</p>
              <p>• 每人每件商品限領 {gift.limit_per_user} 次</p>
              <p>• 如有問題請聯繫客服</p>
            </div>

            {/* 邀请好友入口 */}
            <div onClick={() => setShowInvite(true)}>
              <InviteBanner onClick={() => {}} />
            </div>
          </div>
        </div>
      </div>

      {/* 评价弹窗 */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              用戶評價
            </DialogTitle>
          </DialogHeader>
          <ReviewList reviews={mockReviews} showGiftName={true} />
        </DialogContent>
      </Dialog>

      {/* 支付弹窗 */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              支付運費
            </DialogTitle>
            <DialogDescription>
              請選擇支付方式完成運費支付
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">運費金額</p>
              <p className="text-3xl font-bold text-primary">
                HK${claimResult?.shipping_fee || gift.shipping_fee}
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-4 border rounded-lg flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                  微信
                </div>
                <div className="flex-1">
                  <p className="font-medium">微信支付</p>
                  <p className="text-xs text-muted-foreground">推薦使用</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              
              <div className="p-4 border rounded-lg flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  支付
                </div>
                <div className="flex-1">
                  <p className="font-medium">支付寶</p>
                  <p className="text-xs text-muted-foreground">支持香港支付寶</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentDialog(false)}
              >
                取消
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={handlePayment}
              >
                確認支付
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 成功弹窗 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              {claimResult?.need_pay ? '支付成功' : '領取成功'}
            </DialogTitle>
            <DialogDescription>
              {claimResult?.need_pay ? '商品將在1-3個工作日內寄出' : '請前往門店領取'}
            </DialogDescription>
          </DialogHeader>

          {claimResult && (
            <div className="space-y-4 py-4">
              {/* 二维码（到店自取显示） */}
              {!claimResult.need_pay && (
                <div className="flex justify-center">
                  <ClaimCodeDisplay 
                    claimNo={claimResult.claim_no} 
                    giftName={claimResult.gift_name}
                    size={160}
                  />
                </div>
              )}

              {/* 领取信息 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品</span>
                  <span>{claimResult.gift_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">領取方式</span>
                  <span>{receiveType === 'shipping' ? '郵寄到家' : '到店自取'}</span>
                </div>
                {claimResult.need_pay && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">運費</span>
                    <span className="text-primary font-medium">
                      HK${claimResult.shipping_fee}（已支付）
                    </span>
                  </div>
                )}
                {receiveType === 'pickup' && claimResult.pickup_address && (
                  <div className="pt-2 p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground text-xs">領取地址</span>
                    <p className="mt-1 flex items-center gap-2">
                      {claimResult.pickup_address}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={handleNavigate}
                      >
                        <Navigation className="w-3 h-3" />
                      </Button>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    router.push('/free-gifts');
                  }}
                >
                  繼續領取
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    router.push('/user/free-gifts');
                  }}
                >
                  查看記錄
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 地址管理弹窗 */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              收貨地址管理
            </DialogTitle>
          </DialogHeader>
          <AddressManager
            addresses={addresses}
            selectedId={selectedAddressId}
            onSelect={handleSelectAddress}
            onAdd={handleAddAddress}
            onUpdate={handleUpdateAddress}
            onDelete={handleDeleteAddress}
          />
        </DialogContent>
      </Dialog>

      {/* 邀请好友弹窗 */}
      <InviteFriend
        open={showInvite}
        onOpenChange={setShowInvite}
        totalInvites={12}
        successInvites={10}
        remainingToday={3}
      />

      {/* 消息通知弹窗 */}
      <NotificationCenter
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={notifications}
        onRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        onReadAll={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
      />

      {/* 客服入口 */}
      <CustomerService variant="fab" />
    </>
  );
}
}
