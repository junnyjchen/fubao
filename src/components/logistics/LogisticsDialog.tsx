/**
 * @fileoverview 物流跟踪弹窗组件
 * @description 显示物流轨迹
 * @module components/logistics/LogisticsDialog
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  Loader2,
  Clock,
} from 'lucide-react';

interface LogisticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
}

/** 物流轨迹 */
interface Track {
  time: string;
  status: string;
  description: string;
  location: string;
}

/**
 * 物流跟踪弹窗组件
 */
export function LogisticsDialog({ open, onOpenChange, orderId }: LogisticsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<{
    id: number;
    order_no: string;
    status: number;
    tracking_number: string | null;
    tracking_company: string | null;
    shipping_name: string | null;
    shipping_phone: string | null;
    shipping_address: string | null;
  } | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (open && orderId) {
      loadLogistics();
    }
  }, [open, orderId]);

  /**
   * 加载物流信息
   */
  const loadLogistics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logistics/${orderId}`);
      const data = await res.json();
      setOrder(data.order);
      setTracks(data.tracks || []);
    } catch (error) {
      console.error('加载物流信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: string, index: number) => {
    if (index === 0) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    switch (status) {
      case '已簽收':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case '派送中':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case '運輸中':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case '已發貨':
        return <Package className="w-5 h-5 text-primary" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            物流信息
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 订单信息 */}
            {order && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">物流單號</span>
                  <span className="font-mono font-medium">
                    {order.tracking_number || '暫無'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">物流公司</span>
                  <span className="font-medium">
                    {order.tracking_company || '快遞'}
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">{order.shipping_name} {order.shipping_phone}</p>
                    <p className="text-muted-foreground">{order.shipping_address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 物流轨迹 */}
            <div className="relative">
              {tracks.map((track, index) => (
                <div key={index} className="flex gap-4 pb-6 last:pb-0">
                  {/* 时间线和图标 */}
                  <div className="flex flex-col items-center">
                    {getStatusIcon(track.status, index)}
                    {index < tracks.length - 1 && (
                      <div className="w-0.5 flex-1 bg-muted my-1" />
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${index === 0 ? 'text-primary' : ''}`}>
                        {track.status}
                      </span>
                    </div>
                    <p className={`text-sm ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {track.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(track.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
