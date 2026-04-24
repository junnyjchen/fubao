/**
 * @fileoverview 商户审核页面
 * @description 后台审核商户入驻申请
 * @module app/admin/merchant-applications/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Store,
  Search,
  Eye,
  Check,
  X,
  Clock,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface MerchantApplication {
  id: number;
  user_id: string;
  shop_name: string;
  shop_type: string;
  shop_desc: string;
  logo: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  business_license: string | null;
  id_card_front: string | null;
  id_card_back: string | null;
  categories: string;
  status: string;
  remark: string;
  reject_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: '待審核', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: '已通過', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const shopTypeLabels: Record<string, string> = {
  individual: '個人商戶',
  company: '企業商戶',
  temple: '宗教場所',
};

export default function MerchantApplicationsPage() {
  const [applications, setApplications] = useState<MerchantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<MerchantApplication | null>(null);
  const [auditAction, setAuditAction] = useState<'approve' | 'reject'>('approve');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [activeTab]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/merchant-applications?status=${activeTab}`);
      const result = await res.json();
      if (result.success) {
        setApplications(result.data);
      } else {
        setApplications(getMockApplications());
      }
    } catch (error) {
      console.error('加载申请失败:', error);
      setApplications(getMockApplications());
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (application: MerchantApplication) => {
    setCurrentApplication(application);
    setShowDetailDialog(true);
  };

  const handleAudit = (application: MerchantApplication, action: 'approve' | 'reject') => {
    setCurrentApplication(application);
    setAuditAction(action);
    setRejectReason('');
    setShowAuditDialog(true);
  };

  const handleSubmitAudit = async () => {
    if (!currentApplication) return;
    
    if (auditAction === 'reject' && !rejectReason.trim()) {
      toast.error('請填寫拒絕原因');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/merchant-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentApplication.id,
          action: auditAction,
          rejectReason: auditAction === 'reject' ? rejectReason : null,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(auditAction === 'approve' ? '審核通過' : '已拒絕申請');
        setShowAuditDialog(false);
        loadApplications();
      } else {
        toast.error(result.error || '操作失敗');
      }
    } catch (error) {
      console.error('审核失败:', error);
      toast.error('操作失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">商戶入駐審核</h1>
          <p className="text-muted-foreground">審核商戶入駐申請</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('all')}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.all}</p>
                <p className="text-sm text-muted-foreground">全部申請</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('pending')}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">待審核</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('approved')}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">已通過</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('rejected')}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">已拒絕</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 申请列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>申請列表</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索店鋪名稱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暫無申請記錄</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>店鋪名稱</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>聯繫人</TableHead>
                  <TableHead>申請時間</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => {
                  const status = statusConfig[app.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {app.logo ? (
                              <img src={app.logo} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Store className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{app.shop_name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {app.shop_desc}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{shopTypeLabels[app.shop_type] || app.shop_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{app.contact_name}</p>
                          <p className="text-xs text-muted-foreground">{app.contact_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(app)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Button>
                          {app.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600"
                                onClick={() => handleAudit(app, 'approve')}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                通過
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleAudit(app, 'reject')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                拒絕
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 查看详情弹窗 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>申請詳情</DialogTitle>
          </DialogHeader>

          {currentApplication && (
            <div className="space-y-6">
              {/* 状态 */}
              <div className="flex items-center justify-between">
                <Badge className={statusConfig[currentApplication.status]?.color}>
                  {statusConfig[currentApplication.status]?.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  申請時間：{new Date(currentApplication.created_at).toLocaleString()}
                </span>
              </div>

              {/* 店铺信息 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  店鋪信息
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">店鋪名稱：</span>
                    <span>{currentApplication.shop_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">店鋪類型：</span>
                    <span>{shopTypeLabels[currentApplication.shop_type]}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">店鋪描述：</span>
                    <p className="mt-1">{currentApplication.shop_desc || '無'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 联系信息 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  聯繫信息
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{currentApplication.contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{currentApplication.contact_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{currentApplication.contact_email}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 资质信息 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  資質信息
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {currentApplication.business_license && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">營業執照</p>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <img src={currentApplication.business_license} alt="" className="max-w-full max-h-full rounded" />
                      </div>
                    </div>
                  )}
                  {currentApplication.id_card_front && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">身份證正面</p>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <img src={currentApplication.id_card_front} alt="" className="max-w-full max-h-full rounded" />
                      </div>
                    </div>
                  )}
                  {currentApplication.id_card_back && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">身份證背面</p>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <img src={currentApplication.id_card_back} alt="" className="max-w-full max-h-full rounded" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {currentApplication.reject_reason && (
                <>
                  <Separator />
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800">拒絕原因</p>
                    <p className="text-sm text-red-600 mt-1">{currentApplication.reject_reason}</p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {currentApplication?.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-green-600"
                  onClick={() => {
                    setShowDetailDialog(false);
                    handleAudit(currentApplication!, 'approve');
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  通過
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600"
                  onClick={() => {
                    setShowDetailDialog(false);
                    handleAudit(currentApplication!, 'reject');
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  拒絕
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 审核弹窗 */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {auditAction === 'approve' ? '審核通過' : '拒絕申請'}
            </DialogTitle>
            <DialogDescription>
              {auditAction === 'approve' 
                ? `確定通過「${currentApplication?.shop_name}」的入駐申請嗎？`
                : `確定拒絕「${currentApplication?.shop_name}」的入駐申請嗎？`
              }
            </DialogDescription>
          </DialogHeader>

          {auditAction === 'reject' && (
            <div className="space-y-2">
              <Label>拒絕原因 *</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="請說明拒絕原因，將發送給申請人..."
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuditDialog(false)}>
              取消
            </Button>
            <Button
              variant={auditAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleSubmitAudit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {auditAction === 'approve' ? '確認通過' : '確認拒絕'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 模拟数据
function getMockApplications(): MerchantApplication[] {
  return [
    {
      id: 1,
      user_id: 'user2',
      shop_name: '玄妙閣',
      shop_type: 'individual',
      shop_desc: '專營符籙、法器等玄門用品，傳承道家文化',
      logo: null,
      contact_name: '張道長',
      contact_phone: '+852 1234 5678',
      contact_email: 'xuanmiage@example.com',
      business_license: null,
      id_card_front: null,
      id_card_back: null,
      categories: 'fulei,faqqi',
      status: 'pending',
      remark: '',
      reject_reason: null,
      created_at: '2026-03-24T10:00:00',
      reviewed_at: null,
      reviewer_id: null,
    },
    {
      id: 2,
      user_id: 'user3',
      shop_name: '龍泉道場',
      shop_type: 'temple',
      shop_desc: '正規宗教場所，提供開光、祈福等服務',
      logo: null,
      contact_name: '李主持',
      contact_phone: '+852 8765 4321',
      contact_email: 'longquan@example.com',
      business_license: null,
      id_card_front: null,
      id_card_back: null,
      categories: 'fulei,faqqi,shuji',
      status: 'pending',
      remark: '',
      reject_reason: null,
      created_at: '2026-03-23T15:00:00',
      reviewed_at: null,
      reviewer_id: null,
    },
    {
      id: 3,
      user_id: 'user4',
      shop_name: '符緣齋',
      shop_type: 'company',
      shop_desc: '企業認證商戶，專業符籙製作與銷售',
      logo: null,
      contact_name: '王經理',
      contact_phone: '+852 5555 6666',
      contact_email: 'fuyuanzhai@example.com',
      business_license: null,
      id_card_front: null,
      id_card_back: null,
      categories: 'fulei',
      status: 'approved',
      remark: '',
      reject_reason: null,
      created_at: '2026-03-20T09:00:00',
      reviewed_at: '2026-03-21T14:00:00',
      reviewer_id: 'admin1',
    },
    {
      id: 4,
      user_id: 'user5',
      shop_name: '測試店鋪',
      shop_type: 'individual',
      shop_desc: '測試',
      logo: null,
      contact_name: '測試',
      contact_phone: '12345678',
      contact_email: 'test@example.com',
      business_license: null,
      id_card_front: null,
      id_card_back: null,
      categories: 'other',
      status: 'rejected',
      remark: '',
      reject_reason: '資質信息不完整，請補充營業執照和身份證件',
      created_at: '2026-03-18T10:00:00',
      reviewed_at: '2026-03-19T11:00:00',
      reviewer_id: 'admin1',
    },
  ];
}
