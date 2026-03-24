/**
 * @fileoverview 后台分销管理页面
 * @description 管理分销配置、统计数据、团队长管理
 * @module app/admin/distribution/page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  TrendingUp,
  Users,
  DollarSign,
  Crown,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface DistributionStats {
  total_distributors: number;
  total_team_members: number;
  total_commission: number;
  available_commission: number;
  today_commission: number;
  month_commission: number;
}

interface DistributionConfig {
  level: number;
  rate: number;
  team_leader_rate: number;
}

interface TeamLeader {
  user_id: string;
  invite_code: string;
  team_count: number;
  direct_count: number;
  total_team_sales: number;
  total_commission: number;
  is_team_leader: boolean;
  created_at: string;
}

export default function AdminDistributionPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DistributionStats | null>(null);
  const [config, setConfig] = useState<DistributionConfig[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载统计数据
      const statsRes = await fetch('/api/admin/distribution');
      const statsResult = await statsRes.json();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // 加载配置
      const configRes = await fetch('/api/admin/distribution?action=config');
      const configResult = await configRes.json();
      if (configResult.success) {
        setConfig(configResult.data);
      }

      // 加载团队长
      const leadersRes = await fetch('/api/admin/distribution?action=team_leaders');
      const leadersResult = await leadersRes.json();
      if (leadersResult.success) {
        setTeamLeaders(leadersResult.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_config',
          data: config,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('配置已保存');
      } else {
        toast.error(result.error || '保存失败');
      }
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (level: number, field: 'rate' | 'team_leader_rate', value: number) => {
    setConfig((prev) =>
      prev.map((c) => (c.level === level ? { ...c, [field]: value } : c))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">分銷管理</h1>
          <p className="text-muted-foreground">管理分銷配置、團隊長和統計數據</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">分銷商</p>
                <p className="text-xl font-bold">{stats?.total_distributors || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">團隊成員</p>
                <p className="text-xl font-bold">{stats?.total_team_members || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">累計佣金</p>
                <p className="text-xl font-bold">HK${stats?.total_commission?.toFixed(0) || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">本月佣金</p>
                <p className="text-xl font-bold">HK${stats?.month_commission?.toFixed(0) || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-2" />
            佣金配置
          </TabsTrigger>
          <TabsTrigger value="leaders">
            <Crown className="w-4 h-4 mr-2" />
            團隊長管理
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="w-4 h-4 mr-2" />
            統計報表
          </TabsTrigger>
        </TabsList>

        {/* 佣金配置 */}
        <TabsContent value="config" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>分銷佣金配置</CardTitle>
              <CardDescription>設置各級分銷商的佣金比例</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {config.map((c) => (
                  <div key={c.level} className="grid grid-cols-3 gap-4 items-end">
                    <div>
                      <Label>{c.level === 1 ? '一級' : c.level === 2 ? '二級' : '三級'}分銷</Label>
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">佣金等級</p>
                        <p className="text-lg font-bold">{c.level}級</p>
                      </div>
                    </div>
                    <div>
                      <Label>佣金比例 (%)</Label>
                      <Input
                        type="number"
                        value={c.rate}
                        onChange={(e) => updateConfig(c.level, 'rate', parseFloat(e.target.value))}
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label>團隊長獎勵 (%)</Label>
                      <Input
                        type="number"
                        value={c.team_leader_rate}
                        onChange={(e) =>
                          updateConfig(c.level, 'team_leader_rate', parseFloat(e.target.value))
                        }
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span>修改後即時生效</span>
                  </div>
                  <Button onClick={handleSaveConfig} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存配置
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 团队长管理 */}
        <TabsContent value="leaders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>團隊長列表</CardTitle>
              <CardDescription>管理已認證的團隊長</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>邀請碼</TableHead>
                    <TableHead>團隊人數</TableHead>
                    <TableHead>直推人數</TableHead>
                    <TableHead>團隊銷售額</TableHead>
                    <TableHead>累計佣金</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamLeaders.map((leader) => (
                    <TableRow key={leader.user_id}>
                      <TableCell className="font-mono">{leader.invite_code}</TableCell>
                      <TableCell>{leader.team_count}</TableCell>
                      <TableCell>{leader.direct_count}</TableCell>
                      <TableCell>HK${leader.total_team_sales.toFixed(2)}</TableCell>
                      <TableCell>HK${leader.total_commission.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          已認證
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 统计报表 */}
        <TabsContent value="stats" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>佣金趨勢</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  圖表組件待接入
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>團隊增長</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  圖表組件待接入
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
