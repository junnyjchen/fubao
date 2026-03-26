/**
 * @fileoverview 我的免费领记录页面
 * @description 查看免费领取记录
 * @module app/user/free-gifts/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  Truck,
  MapPin,
  Loader2,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ClaimRecord {
  id: number;
  claim_no: string;
  gift_name: string;
  receive_type: 'shipping' | 'pickup';
  shipping_fee: string;
  pay_status: number;
  status: number;
  created_at: string;
  pickup_address?: string;
}

// 状态映射
const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待處理', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: '待領取', color: 'bg-blue-100 text-blue-800' },
  2: { label: '已領取', color: 'bg-green-100 text-green-800' },
  3: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
};

// 支付状态映射
const payStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待支付', color: 'text-yellow-600' },
  1: { label: '已支付', color: 'text-green-600' },
  2: { label: '已退款', color: 'text-gray-600' },
};

// 模拟数据
function getMockRecords(): ClaimRecord[] {
  return [
    {
      id: 1,
      claim_no: 'FREEA1B2C3',
      gift_name: '平安符（開光加持）',
      receive_type: 'shipping',
      shipping_fee: '20.00',
      pay_status: 0,
      status: 0,
      created_at: '2024-03-20 10:30:00',
    },
    {
      id: 2,
      claim_no: 'FREEX9Y8Z7',
      gift_name: '道家養生香囊',
      receive_type: 'pickup',
      shipping_fee: '0',
      pay_status: 1,
      status: 1,
      created_at: '2024-03-18 14:20:00',
      pickup_address: '九龍油尖旺區彌敦道100號 玄門道院',
    },
  ];
}

export default function MyFreeGiftsPage() {
  const [records, setRecords] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      // 模拟加载
      await new Promise(resolve => setTimeout(resolve, 500));
      setRecords(getMockRecords());
    } catch (error) {
      console.error('加载记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-8">
      {/* 顶部 */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <Gift className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-xl font-bold">我的免費領</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 统计 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-primary">{records.length}</p>
              <p className="text-sm text-muted-foreground">已領取</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {records.filter(r => r.status === 0 && r.pay_status === 0).length}
              </p>
              <p className="text-sm text-muted-foreground">待處理</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {records.filter(r => r.status === 2).length}
              </p>
              <p className="text-sm text-muted-foreground">已完成</p>
            </CardContent>
          </Card>
        </div>

        {/* 记录列表 */}
        {records.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Gift className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">暫無領取記錄</p>
              <Link href="/free-gifts">
                <Button className="mt-4 bg-gradient-to-r from-red-500 to-orange-500">
                  去領取商品
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const status = statusMap[record.status] || statusMap[0];
              const payStatus = payStatusMap[record.pay_status] || payStatusMap[0];

              return (
                <Card key={record.id} className="overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{record.claim_no}</span>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(record.created_at)}
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-8 h-8 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-1">{record.gift_name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          {record.receive_type === 'shipping' ? (
                            <>
                              <Truck className="w-4 h-4" />
                              <span>郵寄到家</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              <span>到店自取</span>
                            </>
                          )}
                          {record.receive_type === 'shipping' && (
                            <span className={payStatus.color}>
                              · 運費 HK${record.shipping_fee} ({payStatus.label})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {record.receive_type === 'pickup' && record.status === 1 && record.pickup_address && (
                      <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">領取地址</span>
                        </div>
                        <p className="text-muted-foreground">{record.pickup_address}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        {record.receive_type === 'shipping' && record.pay_status === 0 && (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            請盡快支付運費
                          </span>
                        )}
                        {record.receive_type === 'pickup' && record.status === 1 && (
                          <span className="text-blue-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            請於7天內到店領取
                          </span>
                        )}
                        {record.status === 2 && (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            已完成
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {record.receive_type === 'shipping' && record.pay_status === 0 && (
                          <Button size="sm">
                            去支付
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          詳情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 去领取更多 */}
        <Link href="/free-gifts">
          <Card className="mt-6 hover:shadow-md transition-shadow">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">去領取更多商品</p>
                  <p className="text-sm text-muted-foreground">精選好物免費領</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
