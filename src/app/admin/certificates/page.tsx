/**
 * @fileoverview 证书管理页面
 * @description 一物一证认证管理，支持证书列表、新增、编辑、查询验证
 * @module app/admin/certificates/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  QrCode,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

/** 证书数据类型 */
interface Certificate {
  id: number;
  certificate_no: string;
  goods_id: number;
  merchant_id: number | null;
  issue_date: string;
  issued_by: string;
  valid_until: string | null;
  verification_count: number;
  last_verification: string | null;
  status: 'valid' | 'expired' | 'revoked';
  details: {
    material?: string;
    origin?: string;
    craftsmanship?: string;
    blessing?: string;
    master?: string;
  } | null;
  goods?: {
    id: number;
    name: string;
    main_image: string | null;
  };
  merchant?: {
    id: number;
    name: string;
  };
  created_at: string;
}

/** 商品数据类型 */
interface Goods {
  id: number;
  name: string;
}

/** 商户数据类型 */
interface Merchant {
  id: number;
  name: string;
}

/** 表单数据类型 */
interface CertificateForm {
  goods_id: string;
  merchant_id: string;
  issue_date: string;
  issued_by: string;
  valid_until: string;
  material: string;
  origin: string;
  craftsmanship: string;
  blessing: string;
  master: string;
}

/** 初始表单数据 */
const initialForm: CertificateForm = {
  goods_id: '',
  merchant_id: '',
  issue_date: new Date().toISOString().split('T')[0],
  issued_by: '符寶網認證中心',
  valid_until: '',
  material: '',
  origin: '',
  craftsmanship: '',
  blessing: '',
  master: '',
};

/**
 * 证书管理页面组件
 * @returns 证书管理页面
 */
export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [goods, setGoods] = useState<Goods[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CertificateForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载证书列表和相关数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [certRes, goodsRes, merchantRes] = await Promise.all([
        fetch('/api/admin/certificates'),
        fetch('/api/goods?limit=100'),
        fetch('/api/merchants?limit=100'),
      ]);

      const [certData, goodsData, merchantData] = await Promise.all([
        certRes.json(),
        goodsRes.json(),
        merchantRes.json(),
      ]);

      setCertificates(certData.data || []);
      setGoods(goodsData.data || []);
      setMerchants(merchantData.data || []);
    } catch (error) {
      console.error('加載數據失敗:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 筛选证书列表
   */
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.certificate_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.goods?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'valid') {
      return matchesSearch && cert.status === 'valid' && (!cert.valid_until || new Date(cert.valid_until) > new Date());
    }
    if (statusFilter === 'expired') {
      return matchesSearch && (cert.status === 'expired' || (cert.valid_until && new Date(cert.valid_until) <= new Date()));
    }
    if (statusFilter === 'revoked') {
      return matchesSearch && cert.status === 'revoked';
    }
    return matchesSearch;
  });

  /**
   * 打开新增对话框
   */
  const handleAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setDialogOpen(true);
  };

  /**
   * 打开编辑对话框
   */
  const handleEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setFormData({
      goods_id: cert.goods_id.toString(),
      merchant_id: cert.merchant_id?.toString() || '',
      issue_date: cert.issue_date.split('T')[0],
      issued_by: cert.issued_by,
      valid_until: cert.valid_until?.split('T')[0] || '',
      material: cert.details?.material || '',
      origin: cert.details?.origin || '',
      craftsmanship: cert.details?.craftsmanship || '',
      blessing: cert.details?.blessing || '',
      master: cert.details?.master || '',
    });
    setDialogOpen(true);
  };

  /**
   * 查看证书详情
   */
  const handleView = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setDetailDialogOpen(true);
  };

  /**
   * 吊销证书
   */
  const handleRevoke = async (id: number) => {
    if (!confirm('確定要吊銷此證書嗎？吊銷後將無法恢復。')) return;

    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'revoked' }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('證書已吊銷');
        loadData();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('吊銷證書失敗:', error);
      toast.error('操作失敗');
    }
  };

  /**
   * 删除证书
   */
  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此證書嗎？')) return;

    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('證書已刪除');
        setCertificates((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('刪除證書失敗:', error);
      toast.error('刪除失敗');
    }
  };

  /**
   * 生成证书编号
   */
  const generateCertificateNo = () => {
    const prefix = 'FB';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.goods_id) {
      toast.error('請選擇關聯商品');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        certificate_no: generateCertificateNo(),
        goods_id: parseInt(formData.goods_id),
        merchant_id: formData.merchant_id ? parseInt(formData.merchant_id) : null,
        issue_date: formData.issue_date,
        issued_by: formData.issued_by,
        valid_until: formData.valid_until || null,
        details: {
          material: formData.material,
          origin: formData.origin,
          craftsmanship: formData.craftsmanship,
          blessing: formData.blessing,
          master: formData.master,
        },
      };

      const url = editingId
        ? `/api/admin/certificates/${editingId}`
        : '/api/admin/certificates';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.message || data.data) {
        toast.success(editingId ? '證書已更新' : '證書已創建');
        setDialogOpen(false);
        loadData();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('提交失敗:', error);
      toast.error('操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 获取证书状态显示
   */
  const getStatusBadge = (cert: Certificate) => {
    if (cert.status === 'revoked') {
      return <Badge className="bg-gray-100 text-gray-600">已吊銷</Badge>;
    }
    if (cert.valid_until && new Date(cert.valid_until) < new Date()) {
      return <Badge className="bg-red-100 text-red-600">已過期</Badge>;
    }
    return <Badge className="bg-green-100 text-green-600">有效</Badge>;
  };

  return (
    <AdminLayout title="證書管理" description="一物一證認證管理">
      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索證書編號或商品名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部狀態</SelectItem>
              <SelectItem value="valid">有效</SelectItem>
              <SelectItem value="expired">已過期</SelectItem>
              <SelectItem value="revoked">已吊銷</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            新增證書
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {certificates.filter((c) => c.status === 'valid' && (!c.valid_until || new Date(c.valid_until) > new Date())).length}
                </p>
                <p className="text-xs text-muted-foreground">有效證書</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {certificates.filter((c) => c.status === 'revoked').length}
                </p>
                <p className="text-xs text-muted-foreground">已吊銷</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {certificates.filter((c) => c.valid_until && new Date(c.valid_until) < new Date() && c.status !== 'revoked').length}
                </p>
                <p className="text-xs text-muted-foreground">已過期</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {certificates.reduce((sum, c) => sum + c.verification_count, 0)}
                </p>
                <p className="text-xs text-muted-foreground">驗證次數</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 证书列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            證書列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">載入中...</div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">暫無證書數據</p>
              <Button className="mt-4" onClick={handleAdd}>
                創建第一個證書
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>證書編號</TableHead>
                    <TableHead>關聯商品</TableHead>
                    <TableHead>頒發機構</TableHead>
                    <TableHead>頒發日期</TableHead>
                    <TableHead>有效期至</TableHead>
                    <TableHead>驗證次數</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-sm">
                        {cert.certificate_no}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {cert.goods?.main_image && (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs">
                              圖
                            </div>
                          )}
                          <span className="truncate max-w-[120px]">
                            {cert.goods?.name || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{cert.issued_by}</TableCell>
                      <TableCell>
                        {new Date(cert.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {cert.valid_until
                          ? new Date(cert.valid_until).toLocaleDateString()
                          : '永久有效'}
                      </TableCell>
                      <TableCell>{cert.verification_count}</TableCell>
                      <TableCell>{getStatusBadge(cert)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(cert)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cert)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {cert.status !== 'revoked' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-yellow-600"
                              onClick={() => handleRevoke(cert.id)}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(cert.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? '編輯證書' : '新增證書'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>關聯商品 *</Label>
              <Select
                value={formData.goods_id}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, goods_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇商品" />
                </SelectTrigger>
                <SelectContent>
                  {goods.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>所屬商戶</Label>
              <Select
                value={formData.merchant_id}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, merchant_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇商戶（可選）" />
                </SelectTrigger>
                <SelectContent>
                  {merchants.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>頒發日期 *</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, issue_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>有效期至</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData((prev) => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>頒發機構 *</Label>
              <Input
                value={formData.issued_by}
                onChange={(e) => setFormData((prev) => ({ ...prev, issued_by: e.target.value }))}
                placeholder="證書頒發機構名稱"
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">認證詳情</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>材質</Label>
                  <Input
                    value={formData.material}
                    onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
                    placeholder="如：銅、玉、木"
                  />
                </div>
                <div className="space-y-2">
                  <Label>產地</Label>
                  <Input
                    value={formData.origin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, origin: e.target.value }))}
                    placeholder="如：江西龍虎山"
                  />
                </div>
                <div className="space-y-2">
                  <Label>工藝</Label>
                  <Input
                    value={formData.craftsmanship}
                    onChange={(e) => setFormData((prev) => ({ ...prev, craftsmanship: e.target.value }))}
                    placeholder="如：手工雕刻"
                  />
                </div>
                <div className="space-y-2">
                  <Label>開光法師</Label>
                  <Input
                    value={formData.master}
                    onChange={(e) => setFormData((prev) => ({ ...prev, master: e.target.value }))}
                    placeholder="法師名號"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>加持信息</Label>
                <Textarea
                  value={formData.blessing}
                  onChange={(e) => setFormData((prev) => ({ ...prev, blessing: e.target.value }))}
                  placeholder="開光加持說明..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '提交中...' : editingId ? '保存' : '創建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 证书详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              證書詳情
            </DialogTitle>
          </DialogHeader>

          {selectedCertificate && (
            <div className="space-y-4">
              {/* 证书编号 */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">證書編號</p>
                <p className="text-xl font-mono font-bold">
                  {selectedCertificate.certificate_no}
                </p>
                <div className="mt-2">{getStatusBadge(selectedCertificate)}</div>
              </div>

              {/* 商品信息 */}
              <div className="space-y-2">
                <p className="font-medium">關聯商品</p>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    圖
                  </div>
                  <div>
                    <p className="font-medium">{selectedCertificate.goods?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {selectedCertificate.goods_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">頒發機構</p>
                  <p className="font-medium">{selectedCertificate.issued_by}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">頒發日期</p>
                  <p className="font-medium">
                    {new Date(selectedCertificate.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">有效期至</p>
                  <p className="font-medium">
                    {selectedCertificate.valid_until
                      ? new Date(selectedCertificate.valid_until).toLocaleDateString()
                      : '永久有效'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">驗證次數</p>
                  <p className="font-medium">{selectedCertificate.verification_count} 次</p>
                </div>
              </div>

              {/* 认证详情 */}
              {selectedCertificate.details && (
                <div className="space-y-2 border-t pt-4">
                  <p className="font-medium">認證詳情</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedCertificate.details.material && (
                      <div>
                        <p className="text-muted-foreground">材質</p>
                        <p>{selectedCertificate.details.material}</p>
                      </div>
                    )}
                    {selectedCertificate.details.origin && (
                      <div>
                        <p className="text-muted-foreground">產地</p>
                        <p>{selectedCertificate.details.origin}</p>
                      </div>
                    )}
                    {selectedCertificate.details.craftsmanship && (
                      <div>
                        <p className="text-muted-foreground">工藝</p>
                        <p>{selectedCertificate.details.craftsmanship}</p>
                      </div>
                    )}
                    {selectedCertificate.details.master && (
                      <div>
                        <p className="text-muted-foreground">開光法師</p>
                        <p>{selectedCertificate.details.master}</p>
                      </div>
                    )}
                  </div>
                  {selectedCertificate.details.blessing && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">加持信息</p>
                      <p>{selectedCertificate.details.blessing}</p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  關閉
                </Button>
                <Button asChild>
                  <Link href={`/verify/${selectedCertificate.certificate_no}`} target="_blank">
                    <Eye className="w-4 h-4 mr-2" />
                    查看驗證頁
                  </Link>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
