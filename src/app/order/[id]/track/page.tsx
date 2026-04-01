/**
 * @fileoverview 订单追踪页面
 * @description 实时追踪订单物流状态
 * @module app/order/[id]/track/page
 */

'use client';

import { useState, useEffect, useCallback, memo, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  Phone,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface TrackingStep {
  status: string;
  location: string;
  time: string;
  description: string;
}

interface OrderTracking {
  orderNo: string;
  status: number;
  carrier: string;
  trackingNo: string;
  estimatedDelivery: string;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  timeline: TrackingStep[];
  goods: Array<{
    name: string;
    image: string;
    quantity: number;
  }>;
}

// 物流时间线项组件
const TimelineItem = memo(function TimelineItem({
  step,
  isLatest,
  isRTL,
}: {
  step: TrackingStep;
  isLatest: boolean;
  isRTL: boolean;
}) {
  return (
    <div className={`flex gap-4 pb-6 last:pb-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* 时间线 */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${isLatest ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
        <div className="flex-1 w-0.5 bg-muted-foreground/20 min-h-8" />
      </div>

      {/* 内容 */}
      <div className={`flex-1 pb-4 ${isRTL ? 'text-end' : ''}`}>
        <div className={`flex items-start justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <p className={`font-medium ${isLatest ? 'text-primary' : ''}`}>
            {step.status}
          </p>
          <span className="text-xs text-muted-foreground">{step.time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{step.description}</p>
        <p className="text-xs text-muted-foreground mt-1">{step.location}</p>
      </div>
    </div>
  );
});

// 商品项组件
const GoodsItem = memo(function GoodsItem({
  item,
  isRTL,
}: {
  item: { name: string; image: string; quantity: number };
  isRTL: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 p-4 border-b last:border-b-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" loading="lazy" />
        ) : (
          <Package className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      <div className={`flex-1 ${isRTL ? 'text-end' : ''}`}>
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
      </div>
    </div>
  );
});

function OrderTrackingContent() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [copied, setCopied] = useState(false);

  const ot = t.orderTracking;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // 物流状态映射
  const statusMap: Record<number, { label: string; icon: typeof Package; color: string }> = {
    0: { label: ot.timeline.placed, icon: CheckCircle, color: 'text-blue-600' },
    1: { label: ot.timeline.placed, icon: Package, color: 'text-yellow-600' },
    2: { label: ot.timeline.inTransit, icon: Truck, color: 'text-purple-600' },
    3: { label: ot.timeline.inTransit, icon: Truck, color: 'text-orange-600' },
    4: { label: ot.timeline.delivered, icon: CheckCircle, color: 'text-green-600' },
  };

  useEffect(() => {
    loadTracking();
  }, [orderId]);

  const loadTracking = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logistics/${orderId}`);
      const data = await res.json();

      if (data.data) {
        setTracking(data.data);
      } else {
        // 模拟数据
        setTracking({
          orderNo: `FB${orderId.padStart(8, '0')}`,
          status: 2,
          carrier: '順豐速運',
          trackingNo: `SF${Date.now().toString().slice(-10)}`,
          estimatedDelivery: '3月28日',
          shippingAddress: '香港九龍旺角彌敦道123號',
          receiverName: '陳先生',
          receiverPhone: '****8888',
          timeline: [
            { status: ot.timeline.placed, location: '江西龍虎山', time: '03-24 10:30', description: ot.timeline.placed },
            { status: ot.timeline.shipped, location: '江西鷹潭', time: '03-24 15:20', description: ot.timeline.shipped },
            { status: ot.timeline.inTransit, location: '深圳轉運中心', time: '03-25 08:45', description: ot.timeline.inTransit },
            { status: ot.timeline.inTransit, location: '深圳轉運中心', time: '03-25 10:30', description: ot.timeline.inTransit },
            { status: ot.timeline.inTransit, location: '香港九龍分撥中心', time: '03-26 09:00', description: ot.timeline.inTransit },
          ],
          goods: [
            { name: '太上老君鎮宅符', image: '', quantity: 1 },
            { name: '五雷護身符', image: '', quantity: 2 },
          ],
        });
      }
    } catch (error) {
      console.error('加载物流信息失败:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, ot.timeline]);

  const handleCopyTrackingNo = useCallback(() => {
    if (tracking?.trackingNo) {
      navigator.clipboard.writeText(tracking.trackingNo);
      setCopied(true);
      toast.success(t.common.copied);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [tracking?.trackingNo, t.common.copied]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md animate-fade-in">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">{ot.noTracking}</h2>
            <p className="text-muted-foreground mb-4">{ot.noTracking}</p>
            <Button onClick={() => router.back()}>{t.common.back}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatus = statusMap[tracking.status] || statusMap[0];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 头部 */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label={t.common.back}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <div className={isRTL ? 'text-end' : ''}>
            <h1 className="text-lg font-bold">{ot.title}</h1>
            <p className="text-sm text-muted-foreground">{t.orderDetail.orderNo}: {tracking.orderNo}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 物流状态概览 */}
        <Card className="animate-fade-in-up">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ${currentStatus.color}`}>
                  <currentStatus.icon className="w-6 h-6" />
                </div>
                <div className={isRTL ? 'text-end' : ''}>
                  <p className="font-bold text-lg">{currentStatus.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {tracking.estimatedDelivery}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {tracking.carrier}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className={isRTL ? 'text-end' : ''}>
                <p className="text-muted-foreground">{ot.trackingNo}</p>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <p className="font-mono">{tracking.trackingNo}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyTrackingNo}
                    aria-label={ot.copy}
                  >
                    {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              <div className={isRTL ? 'text-end' : ''}>
                <p className="text-muted-foreground">{ot.courier}</p>
                <p>{tracking.carrier}</p>
              </div>
              <div className={`col-span-2 ${isRTL ? 'text-end' : ''}`}>
                <p className="text-muted-foreground">{t.orderDetail.shipping.title}</p>
                <p>{tracking.shippingAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 物流时间线 */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className={`text-base ${isRTL ? 'text-end' : ''}`}>{ot.subtitle}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              {tracking.timeline.map((step, index) => (
                <TimelineItem
                  key={index}
                  step={step}
                  isLatest={index === 0}
                  isRTL={isRTL}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 收货信息 */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className={`text-base flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <MapPin className="w-4 h-4" />
              {t.orderDetail.shipping.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{t.userPage.address.form.name}</span>
                <span>{tracking.receiverName}</span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{t.userPage.address.form.phone}</span>
                <span>{tracking.receiverPhone}</span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{t.orderDetail.shipping.title}</span>
                <span className={`max-w-[200px] ${isRTL ? 'text-end' : 'text-right'}`}>{tracking.shippingAddress}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 商品信息 */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className={`text-base flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <Package className="w-4 h-4" />
              {t.orderDetail.goodsList}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {tracking.goods.map((item, index) => (
              <GoodsItem key={index} item={item} isRTL={isRTL} />
            ))}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/order/${orderId}`}>
              {t.orderDetail.title}
            </Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href="tel:400-888-8888">
              <Phone className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
              {t.nav.contact}
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}
