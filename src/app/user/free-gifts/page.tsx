/**
 * @fileoverview 我的免费领记录页面
 * @description 查看免费领取记录
 * @module app/user/free-gifts/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Navigation,
  CreditCard,
  XCircle,
  Package,
  Calendar,
  Bell,
  Users,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { ClaimRecordSkeleton } from '@/components/free-gifts/Skeleton';
import { QRCode } from '@/components/free-gifts/QRCode';
import { CopyClaimCode } from '@/components/free-gifts/ShareButton';
import { EmptyState } from '@/components/free-gifts/EmptyState';
import { InviteFriend, InviteProgress } from '@/components/free-gifts/InviteFriend';
import { NotificationCenter, NotificationButton } from '@/components/free-gifts/NotificationCenter';

interface ClaimRecord {
  id: number;
  claim_no: string;
  gift_name: string;
  gift_image?: string;
  receive_type: 'shipping' | 'pickup';
  shipping_fee: string;
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address?: string;
  pay_status: number;
  status: number;
  created_at: string;
  pickup_address?: string;
  merchant_name?: string;
}

type FilterStatus = 'all' | 'pending' | 'completed' | 'cancelled';

// 状态映射
const statusMap: Record<number, { label: string; color: string; icon: typeof Clock }> = {
  0: { label: '待處理', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  1: { label: '待領取', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
  2: { label: '已領取', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  3: { label: '已取消', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
};

// 支付状态映射
const payStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待支付', color: 'text-yellow-600 bg-yellow-50' },
  1: { label: '已支付', color: 'text-green-600 bg-green-50' },
  2: { label: '已退款', color: 'text-gray-600 bg-gray-50' },
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
      shipping_name: '陳大文',
      shipping_phone: '98765432',
      shipping_address: '九龍旺角彌敦道100號',
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
      pickup_address: '九龍油尖旺區彌敦道100號',
      merchant_name: '玄門道院',
    },
    {
      id: 3,
      claim_no: 'FREEQWERTY',
      gift_name: '六字真言手環',
      receive_type: 'shipping',
      shipping_fee: '18.00',
      shipping_name: '陳大文',
      shipping_phone: '98765432',
      shipping_address: '九龍旺角彌敦道100號',
      pay_status: 1,
      status: 2,
      created_at: '2024-03-15 09:00:00',
    },
  ];
}

export default function MyFreeGiftsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedRecord, setSelectedRecord] = useState<ClaimRecord | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payingRecord, setPayingRecord] = useState<ClaimRecord | null>(null);
  
  // 邀请好友
  const [showInvite, setShowInvite] = useState(false);
  
  // 消息通知
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: '1', type: 'gift' as const, title: '領取成功', content: '您已成功領取商品', read: false, createdAt: '2024-01-15' },
  ]);

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

  const handleNavigate = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  const handlePay = (record: ClaimRecord) => {
    setPayingRecord(record);
    setShowPaymentDialog(true);
  };

  const confirmPay = async () => {
    toast.info('正在處理支付...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 更新状态
    if (payingRecord) {
      setRecords(records.map(r => 
        r.id === payingRecord.id 
          ? { ...r, pay_status: 1, status: 1 }
          : r
      ));
    }
    
    setShowPaymentDialog(false);
    setPayingRecord(null);
    toast.success('支付成功！');
  };

  const handleCancel = async (record: ClaimRecord) => {
    if (!confirm('確定要取消此訂單嗎？')) return;
    
    setRecords(records.map(r => 
      r.id === record.id ? { ...r, status: 3 } : r
    ));
    toast.success('訂單已取消');
  };

  // 过滤记录
  const filteredRecords = records.filter((record) => {
    switch (filterStatus) {
      case 'pending':
        return record.status === 0 || (record.receive_type === 'shipping' && record.pay_status === 0);
      case 'completed':
        return record.status === 2;
      case 'cancelled':
        return record.status === 3;
      default:
        return true;
    }
  });

  // 统计
  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 0 || (r.receive_type === 'shipping' && r.pay_status === 0)).length,
    completed: records.filter(r => r.status === 2).length,
    cancelled: records.filter(r => r.status === 3).length,
  };

  if (loading) {
    return <ClaimRecordSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-8">
      {/* 顶部 */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-white blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-yellow-300 blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-8 text-center relative">
          {/* 消息通知按钮 */}
          <div className="absolute right-4 top-4">
            <NotificationButton 
              count={notifications.filter(n => !n.read).length} 
              onClick={() => setShowNotifications(true)} 
            />
          </div>
          
          <Gift className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-xl font-bold">我的免費領</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 邀请进度 */}
        <Card className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200/50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowInvite(true)}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">邀請好友</p>
                  <p className="text-xs text-muted-foreground">每成功邀請1位，獲得1次額外領取機會</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card 
            className={`cursor-pointer transition-all ${filterStatus === 'all' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            <CardContent className="py-3 text-center">
              <p className="text-xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground">全部</p>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filterStatus === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            <CardContent className="py-3 text-center">
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">待處理</p>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filterStatus === 'completed' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            <CardContent className="py-3 text-center">
              <p className="text-xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">已完成</p>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${filterStatus === 'cancelled' ? 'ring-2 ring-gray-500' : ''}`}
            onClick={() => setFilterStatus('cancelled')}
          >
            <CardContent className="py-3 text-center">
              <p className="text-xl font-bold text-gray-600">{stats.cancelled}</p>
              <p className="text-xs text-muted-foreground">已取消</p>
            </CardContent>
          </Card>
        </div>

        {/* 记录列表 */}
        {filteredRecords.length === 0 ? (
          <EmptyState
            type="no_records"
            action={{ label: '去領取商品', href: '/free-gifts' }}
          />
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const status = statusMap[record.status] || statusMap[0];
              const payStatus = payStatusMap[record.pay_status] || payStatusMap[0];
              const StatusIcon = status.icon;

              return (
                <Card 
                  key={record.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{record.claim_no}</span>
                      <Badge className={status.color} variant="outline">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
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
                            <Badge className={payStatus.color} variant="secondary">
                              運費 HK${record.shipping_fee} ({payStatus.label})
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 到店领取地址 */}
                    {record.receive_type === 'pickup' && record.status === 1 && record.pickup_address && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-sm border border-green-200/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">領取地址</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7"
                            onClick={() => handleNavigate(record.pickup_address!)}
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            導航
                          </Button>
                        </div>
                        <p className="text-muted-foreground mt-1">{record.pickup_address}</p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        {record.receive_type === 'shipping' && record.pay_status === 0 && record.status !== 3 && (
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
                        {record.receive_type === 'shipping' && record.pay_status === 0 && record.status !== 3 && (
                          <Button size="sm" onClick={() => handlePay(record)}>
                            <CreditCard className="w-3 h-3 mr-1" />
                            支付
                          </Button>
                        )}
                        {record.status === 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => handleCancel(record)}
                          >
                            取消
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDetailDialog(true);
                          }}
                        >
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
          <Card className="mt-6 hover:shadow-md transition-shadow border-dashed">
            <CardContent className="py-4 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">去領取更多商品</p>
                <p className="text-sm text-muted-foreground">精選好物免費領</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 详情弹窗 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>領取詳情</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-4">
              {/* 二维码（到店自取且待领取时显示） */}
              {selectedRecord.receive_type === 'pickup' && selectedRecord.status === 1 && (
                <div className="flex justify-center">
                  <div className="text-center space-y-3">
                    <div className="p-3 bg-white rounded-xl inline-block shadow-sm border">
                      <QRCode value={selectedRecord.claim_no} size={160} />
                    </div>
                    <div className="flex justify-center">
                      <CopyClaimCode claimNo={selectedRecord.claim_no} />
                    </div>
                  </div>
                </div>
              )}

              {/* 详细信息 */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">商品名稱</span>
                  <span className="font-medium">{selectedRecord.gift_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">領取方式</span>
                  <span>{selectedRecord.receive_type === 'shipping' ? '郵寄到家' : '到店自取'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">訂單狀態</span>
                  <Badge className={statusMap[selectedRecord.status].color} variant="outline">
                    {statusMap[selectedRecord.status].label}
                  </Badge>
                </div>
                
                {selectedRecord.receive_type === 'shipping' && (
                  <>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">運費</span>
                      <span className="font-medium">HK${selectedRecord.shipping_fee}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">支付狀態</span>
                      <Badge className={payStatusMap[selectedRecord.pay_status].color}>
                        {payStatusMap[selectedRecord.pay_status].label}
                      </Badge>
                    </div>
                    {selectedRecord.shipping_address && (
                      <div className="py-2 border-b">
                        <span className="text-muted-foreground">收貨地址</span>
                        <p className="mt-1">{selectedRecord.shipping_address}</p>
                      </div>
                    )}
                  </>
                )}
                
                {selectedRecord.receive_type === 'pickup' && selectedRecord.pickup_address && (
                  <div className="py-2">
                    <span className="text-muted-foreground">領取地址</span>
                    <div className="mt-1 p-2 bg-muted rounded flex items-start justify-between gap-2">
                      <p className="text-sm">{selectedRecord.pickup_address}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => handleNavigate(selectedRecord.pickup_address!)}
                      >
                        <Navigation className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">領取時間</span>
                  <span>{formatDate(selectedRecord.created_at)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {selectedRecord.receive_type === 'shipping' && selectedRecord.pay_status === 0 && selectedRecord.status !== 3 && (
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setShowDetailDialog(false);
                      handlePay(selectedRecord);
                    }}
                  >
                    去支付
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowDetailDialog(false)}
                >
                  關閉
                </Button>
              </div>
            </div>
          )}
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

          {payingRecord && (
            <div className="py-4 space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">運費金額</p>
                <p className="text-3xl font-bold text-primary">
                  HK${payingRecord.shipping_fee}
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
                  onClick={confirmPay}
                >
                  確認支付
                </Button>
              </div>
            </div>
          )}
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
        onReadAll={() => {}}
        onClearAll={() => {}}
      />
    </div>
  );
}
