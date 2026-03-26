/**
 * @fileoverview 订单追踪页面
 * @description 实时追踪订单物流状态
 * @module app/order/[id]/track/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

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

// 物流状态映射
const statusMap: Record<number, { label: string; icon: typeof Package; color: string }> = {
  0: { label: '已下單', icon: CheckCircle, color: 'text-blue-600' },
  1: { label: '已攬收', icon: Package, color: 'text-yellow-600' },
  2: { label: '運輸中', icon: Truck, color: 'text-purple-600' },
  3: { label: '派送中', icon: Truck, color: 'text-orange-600' },
  4: { label: '已簽收', icon: CheckCircle, color: 'text-green-600' },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);

  useEffect(() => {
    loadTracking();
  }, [orderId]);

  const loadTracking = async () => {
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
            { status: '已下單', location: '江西龍虎山', time: '03-24 10:30', description: '訂單已提交' },
            { status: '已攬收', location: '江西鷹潭', time: '03-24 15:20', description: '快遞員已攬收' },
            { status: '運輸中', location: '深圳轉運中心', time: '03-25 08:45', description: '快件已到達深圳轉運中心' },
            { status: '運輸中', location: '深圳轉運中心', time: '03-25 10:30', description: '快件已發往香港' },
            { status: '派送中', location: '香港九龍分撥中心', time: '03-26 09:00', description: '快件正在派送中' },
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
  };

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
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">無法獲取物流信息</h2>
            <p className="text-muted-foreground mb-4">該訂單暫無物流信息</p>
            <Button onClick={() => router.back()}>返回</Button>
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
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">物流詳情</h1>
            <p className="text-sm text-muted-foreground">訂單編號: {tracking.orderNo}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 物流状态概览 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ${currentStatus.color}`}>
                  <currentStatus.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">{currentStatus.label}</p>
                  <p className="text-sm text-muted-foreground">
                    預計 {tracking.estimatedDelivery} 送達
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {tracking.carrier}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">快遞單號</p>
                <p className="font-mono">{tracking.trackingNo}</p>
              </div>
              <div>
                <p className="text-muted-foreground">承運公司</p>
                <p>{tracking.carrier}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">收貨地址</p>
                <p>{tracking.shippingAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 物流时间线 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">物流軌跡</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              {tracking.timeline.map((step, index) => (
                <div key={index} className="flex gap-4 pb-6 last:pb-0">
                  {/* 时间线 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`} />
                    {index < tracking.timeline.length - 1 && (
                      <div className="flex-1 w-0.5 bg-muted-foreground/20 min-h-8" />
                    )}
                  </div>
                  
                  {/* 内容 */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <p className={`font-medium ${index === 0 ? 'text-primary' : ''}`}>
                        {step.status}
                      </p>
                      <span className="text-xs text-muted-foreground">{step.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 收货信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              收貨信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">收貨人</span>
                <span>{tracking.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">聯繫電話</span>
                <span>{tracking.receiverPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">收貨地址</span>
                <span className="text-right max-w-[200px]">{tracking.shippingAddress}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 商品信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" />
              商品信息
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {tracking.goods.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/user/orders/${orderId}`}>
              查看訂單
            </Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href={`tel:400-888-8888`}>
              <Phone className="w-4 h-4 mr-2" />
              聯繫客服
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
