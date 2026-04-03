/**
 * @fileoverview 佣金明细页面
 * @description 查看佣金收入记录
 * @module app/distribution/commissions/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Gift,
  Crown,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { DistributionSubSkeleton } from '@/components/common/PageSkeletons';
import { useI18n } from '@/lib/i18n';

interface Commission {
  id: string;
  order_no: string;
  type: 'level1' | 'level2' | 'level3' | 'team_leader' | 'activity';
  amount: number;
  rate: number;
  base_amount: number;
  buyer_name: string;
  product_name: string;
  status: number;
  created_at: string;
  settled_at?: string;
}

interface CommissionData {
  total_commission: number;
  available_commission: number;
  frozen_commission: number;
  today_commission: number;
  month_commission: number;
  commissions: Commission[];
}

export default function CommissionsPage() {
  const { t, isRTL } = useI18n();
  const d = t.distribution;
  const commissionsText = (d as any).commissions || {
    title: '佣金明細',
    monthCommission: '本月佣金',
    pendingCommission: '待結算',
    tabs: {
      all: '全部',
      pending: '待結算',
      settled: '已結算',
    },
    types: {
      level1: '一級佣金',
      level2: '二級佣金',
      level3: '三級佣金',
      team_leader: '團隊長獎勵',
      activity: '活動獎勵',
      other: '其他',
    },
    status: {
      pending: '待結算',
      settled: '已結算',
      unknown: '未知',
    },
    from: '來自',
    order: '訂單',
    noRecords: '暫無佣金記錄',
    explainTitle: '佣金說明',
    rules: [
      '一級分銷：好友購物可獲 10% 佣金',
      '二級分銷：好友的好友購物可獲 5% 佣金',
      '三級分銷：間接好友購物可獲 3% 佣金',
      '團隊長獎長獎勵：團隊總銷售額額外 1%',
      '訂單完成後 7 天自動結算',
    ],
    loadFailed: '加載失敗，請重試',
  };
  const comm = typeof commissionsText === 'object' ? commissionsText : commissionsText;
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CommissionData | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/distribution/commissions');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeText = (type: string) => {
    return comm.types[type as keyof typeof comm.types] || comm.types.other;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'level1':
        return '🥇';
      case 'level2':
        return '🥈';
      case 'level3':
        return '🥉';
      case 'team_leader':
        return '👑';
      default:
        return '💰';
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">{comm.status.pending}</Badge>;
      case 1:
        return <Badge className="bg-green-100 text-green-700">{comm.status.settled}</Badge>;
      default:
        return <Badge variant="outline">{comm.status.unknown}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isRTL ? 'ar-SA' : 'zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterCommissions = () => {
    if (!data) return [];
    switch (activeTab) {
      case 'pending':
        return data.commissions.filter((c) => c.status === 0);
      case 'settled':
        return data.commissions.filter((c) => c.status === 1);
      default:
        return data.commissions;
    }
  };

  if (loading) {
    return <DistributionSubSkeleton />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{comm.loadFailed}</p>
      </div>
    );
  }

  const filteredCommissions = filterCommissions();

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部 */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className={`container mx-auto px-4 py-3 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link href="/distribution">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">{comm.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 佣金统计 */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">{comm.monthCommission}</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  HK${data.month_commission.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">{comm.pendingCommission}</p>
                <p className="text-xl font-bold text-amber-600 mt-1">
                  HK${data.frozen_commission.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab 切换 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">{comm.tabs.all}</TabsTrigger>
            <TabsTrigger value="pending">{comm.tabs.pending}</TabsTrigger>
            <TabsTrigger value="settled">{comm.tabs.settled}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredCommissions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{comm.noRecords}</p>
              </div>
            ) : (
              filteredCommissions.map((commission, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                          {getTypeIcon(commission.type)}
                        </div>
                        <div className={isRTL ? 'text-right' : ''}>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <p className="font-medium">{getTypeText(commission.type)}</p>
                            {getStatusBadge(commission.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {commission.product_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {comm.order}：{commission.order_no}
                          </p>
                        </div>
                      </div>
                      <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                        <p className="text-lg font-bold text-green-600">
                          +HK${commission.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {commission.rate}% · HK${commission.base_amount}
                        </p>
                      </div>
                    </div>

                    <div className={`mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>
                        {commission.buyer_name && `${comm.from} ${commission.buyer_name}`}
                      </span>
                      <span>{formatDate(commission.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* 佣金说明 */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200/50">
          <CardContent className="py-4">
            <h3 className={`font-medium mb-2 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TrendingUp className="w-4 h-4" />
              {comm.explainTitle}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {comm.rules.map((rule: string, index: number) => (
                <li key={index}>· {rule}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
