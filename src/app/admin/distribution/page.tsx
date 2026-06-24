/**
 * @fileoverview 后台分销管理页面
 * @description 管理分销配置、分销员审核、团队长管理
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  UserCheck,
  UserX,
  Search,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface DistributionStats {
  total_distributors: number;
  total_team_members: number;
  total_commission: number;
  available_commission: number;
  today_commission: number;
  month_commission: number;
  pending_applications: number;
}

interface DistributionConfig {
  id?: number;
  level: number;
  rate: number;
  team_leader_rate: number;
  description?: string;
}

interface Distributor {
  id: number;
  user_id: string;
  invite_code: string;
  real_name: string;
  phone: string;
  status: number;
  is_team_leader: number;
  team_count: number;
  direct_count: number;
  total_commission: number;
  available_commission: number;
  total_team_sales: number;
  created_at: string;
}

interface PendingApplication {
  id: number;
  user_id: string;
  real_name: string;
  phone: string;
  wechat: string;
  reason: string;
  social_followers: number;
  social_platform: string;
  invite_code: string;
  status: number;
  created_at: string;
}

export default function AdminDistributionPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DistributionStats | null>(null);
  const [config, setConfig] = useState<DistributionConfig[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [pendingApps, setPendingApps] = useState<PendingApplication[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; app: PendingApplication | null; approve: boolean }>({
    open: false,
    app: null,
    approve: true,
  });
  const [reviewReason, setReviewReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, configRes, distRes, pendingRes] = await Promise.all([
        fetch('/api/admin/distribution'),
        fetch('/api/admin/distribution?action=config'),
        fetch('/api/admin/distribution?action=distributors'),
        fetch('/api/admin/distribution?action=pending'),
      ]);

      const statsResult = await statsRes.json();
      if (statsResult.success) setStats(statsResult.data);

      const configResult = await configRes.json();
      if (configResult.success) setConfig(configResult.data);

      const distResult = await distRes.json();
      if (distResult.success) {
        const d = distResult.data;
        setDistributors(d?.list || d || []);
      }

      const pendingResult = await pendingRes.json();
      if (pendingResult.success) setPendingApps(Array.isArray(pendingResult.data) ? pendingResult.data : []);
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
        body: JSON.stringify({ action: 'update_config', data: config }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('配置已保存');
      } else {
        toast.error(result.error || '保存失敗');
      }
    } catch {
      toast.error('保存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleReviewApplication = async () => {
    if (!reviewDialog.app) return;
    try {
      const res = await fetch('/api/admin/distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_distributor',
          data: {
            id: reviewDialog.app.id,
            approve: reviewDialog.approve,
            reason: reviewReason,
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(reviewDialog.approve ? '已通過申請' : '已拒絕申請');
        setReviewDialog({ open: false, app: null, approve: true });
        setReviewReason('');
        loadData();
      } else {
        toast.error(result.error || '操作失敗');
      }
    } catch {
      toast.error('操作失敗');
    }
  };

  const handleToggleDistributor = async (id: number, enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_distributor', data: { id, enabled } }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(enabled ? '已啟用分銷員' : '已停用分銷員');
        loadData();
      }
    } catch {
      toast.error('操作失敗');
    }
  };

  const updateConfig = (level: number, field: 'rate' | 'team_leader_rate', value: number) => {
    setConfig((prev) => prev.map((c) => (c.level === level ? { ...c, [field]: value } : c)));
  };

  const filteredDistributors = distributors.filter((d) => {
    if (filterStatus !== 'all') {
      const status = parseInt(filterStatus);
      if (d.status !== status) return false;
    }
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      return (
        (d.real_name || '').toLowerCase().includes(kw) ||
        (d.phone || '').toLowerCase().includes(kw) ||
        (d.invite_code || '').toLowerCase().includes(kw)
      );
    }
    return true;
  });

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
          <p className="text-muted-foreground">管理分銷配置、分銷員資格和審核</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">待審核</p>
                <p className="text-xl font-bold">{stats?.pending_applications || 0}</p>
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
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            待審核
            {stats?.pending_applications ? (
              <Badge className="ml-2 bg-red-500 text-white text-xs">{stats.pending_applications}</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="distributors">
            <Users className="w-4 h-4 mr-2" />
            分銷員管理
          </TabsTrigger>
          <TabsTrigger value="leaders">
            <Crown className="w-4 h-4 mr-2" />
            團隊長管理
          </TabsTrigger>
        </TabsList>

        {/* 佣金配置 */}
        <TabsContent value="config" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>分銷佣金配置</CardTitle>
              <CardDescription>設置各級分銷商的佣金比例和團隊長獎勵</CardDescription>
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
                        onChange={(e) => updateConfig(c.level, 'rate', parseFloat(e.target.value) || 0)}
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
                        onChange={(e) => updateConfig(c.level, 'team_leader_rate', parseFloat(e.target.value) || 0)}
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
                    <span>修改後即時生效，請謹慎操作</span>
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

        {/* 待审核申请 */}
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>待審核申請</CardTitle>
              <CardDescription>審核用戶提交的分銷員申請</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>暫無待審核申請</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申請人</TableHead>
                      <TableHead>手機號</TableHead>
                      <TableHead>微信</TableHead>
                      <TableHead>社交粉絲</TableHead>
                      <TableHead>申請理由</TableHead>
                      <TableHead>申請時間</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.real_name || '未填寫'}</TableCell>
                        <TableCell>{app.phone}</TableCell>
                        <TableCell>{app.wechat || '-'}</TableCell>
                        <TableCell>
                          {app.social_platform ? `${app.social_platform}: ${app.social_followers}` : '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{app.reason || '-'}</TableCell>
                        <TableCell>{app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setReviewDialog({ open: true, app, approve: true });
                                setReviewReason('');
                              }}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              通過
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setReviewDialog({ open: true, app, approve: false });
                                setReviewReason('');
                              }}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              拒絕
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分销员管理 */}
        <TabsContent value="distributors" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>分銷員列表</CardTitle>
                  <CardDescription>管理所有分銷員資格和狀態</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索姓名/手機/邀請碼"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="pl-9 w-[220px]"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="1">已啟用</SelectItem>
                      <SelectItem value="0">已停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDistributors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>暫無分銷員</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>邀請碼</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>手機</TableHead>
                      <TableHead>直推人數</TableHead>
                      <TableHead>團隊人數</TableHead>
                      <TableHead>累計佣金</TableHead>
                      <TableHead>團隊長</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDistributors.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono">{d.invite_code}</TableCell>
                        <TableCell className="font-medium">{d.real_name || '-'}</TableCell>
                        <TableCell>{d.phone || '-'}</TableCell>
                        <TableCell>{d.direct_count || 0}</TableCell>
                        <TableCell>{d.team_count || 0}</TableCell>
                        <TableCell>HK${(d.total_commission || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          {d.is_team_leader ? (
                            <Badge className="bg-amber-100 text-amber-700">
                              <Crown className="w-3 h-3 mr-1" />
                              團隊長
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {d.status === 1 ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              啟用
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              <XCircle className="w-3 h-3 mr-1" />
                              停用
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {d.status === 1 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleToggleDistributor(d.id, false)}
                            >
                              <ToggleRight className="w-4 h-4 mr-1" />
                              停用
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleToggleDistributor(d.id, true)}
                            >
                              <ToggleLeft className="w-4 h-4 mr-1" />
                              啟用
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 团队长管理 */}
        <TabsContent value="leaders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>團隊長列表</CardTitle>
              <CardDescription>管理已認證的團隊長，團隊長可獲得額外團隊獎勵</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDistributors.filter((d) => d.is_team_leader).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Crown className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>暫無團隊長</p>
                  <p className="text-sm mt-2">在分銷員列表中可將分銷員升級為團隊長</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>邀請碼</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>團隊人數</TableHead>
                      <TableHead>直推人數</TableHead>
                      <TableHead>團隊銷售額</TableHead>
                      <TableHead>累計佣金</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDistributors
                      .filter((d) => d.is_team_leader)
                      .map((leader) => (
                        <TableRow key={leader.id}>
                          <TableCell className="font-mono">{leader.invite_code}</TableCell>
                          <TableCell className="font-medium">{leader.real_name || '-'}</TableCell>
                          <TableCell>{leader.team_count || 0}</TableCell>
                          <TableCell>{leader.direct_count || 0}</TableCell>
                          <TableCell>HK${(leader.total_team_sales || 0).toFixed(2)}</TableCell>
                          <TableCell>HK${(leader.total_commission || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              已認證
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleToggleDistributor(leader.id, false)}
                            >
                              取消團隊長
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 审核对话框 */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.approve ? '通過分銷員申請' : '拒絕分銷員申請'}
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.app
                ? `申請人: ${reviewDialog.app.real_name} (${reviewDialog.app.phone})`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewDialog.app && (
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><strong>姓名:</strong> {reviewDialog.app.real_name}</p>
                <p><strong>手機:</strong> {reviewDialog.app.phone}</p>
                <p><strong>微信:</strong> {reviewDialog.app.wechat || '未填寫'}</p>
                <p><strong>社交粉絲:</strong> {reviewDialog.app.social_platform ? `${reviewDialog.app.social_platform} ${reviewDialog.app.social_followers}` : '未填寫'}</p>
                <p><strong>申請理由:</strong> {reviewDialog.app.reason || '未填寫'}</p>
              </div>
            )}
            <div>
              <Label>{reviewDialog.approve ? '備註（選填）' : '拒絕原因'}</Label>
              <Textarea
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder={reviewDialog.approve ? '可填寫通過備註...' : '請填寫拒絕原因...'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog({ open: false, app: null, approve: true })}>
              取消
            </Button>
            <Button
              variant={reviewDialog.approve ? 'default' : 'destructive'}
              onClick={handleReviewApplication}
            >
              {reviewDialog.approve ? '確認通過' : '確認拒絕'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
