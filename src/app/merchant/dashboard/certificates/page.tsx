/**
 * @fileoverview 商户证书管理页面
 * @description 商户管理一物一证证书
 * @module app/merchant/dashboard/certificates/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  FileText,
  Plus,
  Search,
  QrCode,
  Eye,
  Download,
  Trash2,
  Link as LinkIcon,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  id: number;
  cert_no: string;
  goods_id: number;
  goods_name: string;
  order_id: number | null;
  order_no: string | null;
  cert_type: string;
  issue_date: string;
  issuer: string;
  status: number;
  qr_code: string;
  verify_url: string;
  created_at: string;
}

export default function MerchantCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, [statusFilter]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      // 模拟数据
      setCertificates([
        {
          id: 1,
          cert_no: 'CERT-2026-000001',
          goods_id: 101,
          goods_name: '開光平安符',
          order_id: 1001,
          order_no: 'FB20260324001',
          cert_type: '開光認證',
          issue_date: '2026-03-24',
          issuer: '武當山道觀',
          status: 1,
          qr_code: '/cert/qr/001.png',
          verify_url: 'https://fubao.ltd/cert/CERT-2026-000001',
          created_at: '2026-03-24T08:30:00',
        },
        {
          id: 2,
          cert_no: 'CERT-2026-000002',
          goods_id: 102,
          goods_name: '桃木劍',
          order_id: 1002,
          order_no: 'FB20260324002',
          cert_type: '開光認證',
          issue_date: '2026-03-24',
          issuer: '武當山道觀',
          status: 1,
          qr_code: '/cert/qr/002.png',
          verify_url: 'https://fubao.ltd/cert/CERT-2026-000002',
          created_at: '2026-03-24T09:15:00',
        },
        {
          id: 3,
          cert_no: 'CERT-2026-000003',
          goods_id: 103,
          goods_name: '八卦鏡',
          order_id: null,
          order_no: null,
          cert_type: '真品認證',
          issue_date: '2026-03-24',
          issuer: '武當山道觀',
          status: 0,
          qr_code: '/cert/qr/003.png',
          verify_url: 'https://fubao.ltd/cert/CERT-2026-000003',
          created_at: '2026-03-24T10:00:00',
        },
      ]);
    } catch (error) {
      console.error('加载证书失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const statuses: Record<number, { label: string; className: string }> = {
      0: { label: '待綁定', className: 'bg-yellow-100 text-yellow-800' },
      1: { label: '已綁定', className: 'bg-green-100 text-green-800' },
      2: { label: '已作廢', className: 'bg-red-100 text-red-800' },
    };
    const s = statuses[status] || statuses[0];
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const filteredCertificates = certificates.filter((cert) => {
    if (!keyword) return true;
    return (
      cert.cert_no.toLowerCase().includes(keyword.toLowerCase()) ||
      cert.goods_name.toLowerCase().includes(keyword.toLowerCase()) ||
      (cert.order_no && cert.order_no.toLowerCase().includes(keyword.toLowerCase()))
    );
  });

  const handleCreateCertificate = async (data: { goods_id: number; cert_type: string }) => {
    setCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('證書創建成功');
      setShowCreateDialog(false);
      loadCertificates();
    } catch (error) {
      toast.error('創建失敗，請重試');
    } finally {
      setCreating(false);
    }
  };

  const stats = [
    {
      title: '證書總數',
      value: certificates.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '已綁定',
      value: certificates.filter(c => c.status === 1).length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '待綁定',
      value: certificates.filter(c => c.status === 0).length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: '已作廢',
      value: certificates.filter(c => c.status === 2).length,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <MerchantLayout title="證書管理" description="管理一物一證認證證書">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 操作栏 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索證書編號、商品名稱、訂單號..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部狀態</SelectItem>
                <SelectItem value="pending">待綁定</SelectItem>
                <SelectItem value="bound">已綁定</SelectItem>
                <SelectItem value="invalid">已作廢</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              創建證書
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 证书列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>證書編號</TableHead>
                <TableHead>商品名稱</TableHead>
                <TableHead>證書類型</TableHead>
                <TableHead>關聯訂單</TableHead>
                <TableHead>簽發日期</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暫無證書數據
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono text-sm">{cert.cert_no}</TableCell>
                    <TableCell className="font-medium">{cert.goods_name}</TableCell>
                    <TableCell>{cert.cert_type}</TableCell>
                    <TableCell>
                      {cert.order_no ? (
                        <span className="font-mono text-sm">{cert.order_no}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cert.issue_date}
                    </TableCell>
                    <TableCell>{getStatusBadge(cert.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCert(cert);
                          setShowDetailDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        詳情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 证书详情弹窗 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>證書詳情</DialogTitle>
          </DialogHeader>
          {selectedCert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">證書編號</p>
                  <p className="font-mono">{selectedCert.cert_no}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">狀態</p>
                  <p>{getStatusBadge(selectedCert.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">商品名稱</p>
                  <p className="font-medium">{selectedCert.goods_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">證書類型</p>
                  <p>{selectedCert.cert_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">簽發機構</p>
                  <p>{selectedCert.issuer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">簽發日期</p>
                  <p>{selectedCert.issue_date}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">驗證二維碼</p>
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  <QrCode className="w-24 h-24 text-muted-foreground" />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">驗證鏈接</p>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm truncate flex-1">{selectedCert.verify_url}</span>
                  <Button variant="ghost" size="sm">
                    複製
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              關閉
            </Button>
            {selectedCert && (
              <Button>
                <Download className="w-4 h-4 mr-2" />
                下載證書
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建证书弹窗 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              創建認證證書
            </DialogTitle>
          </DialogHeader>
          <CreateCertificateForm
            onSubmit={handleCreateCertificate}
            loading={creating}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}

/** 创建证书表单组件 */
function CreateCertificateForm({
  onSubmit,
  loading,
  onCancel,
}: {
  onSubmit: (data: { goods_id: number; cert_type: string }) => void;
  loading: boolean;
  onCancel: () => void;
}) {
  const [goodsId, setGoodsId] = useState('');
  const [certType, setCertType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodsId || !certType) {
      toast.error('請填寫完整信息');
      return;
    }
    onSubmit({ goods_id: parseInt(goodsId), cert_type: certType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>選擇商品</Label>
        <Select value={goodsId} onValueChange={setGoodsId}>
          <SelectTrigger>
            <SelectValue placeholder="請選擇商品" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="101">開光平安符</SelectItem>
            <SelectItem value="102">桃木劍</SelectItem>
            <SelectItem value="103">八卦鏡</SelectItem>
            <SelectItem value="104">太極圖掛飾</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>證書類型</Label>
        <Select value={certType} onValueChange={setCertType}>
          <SelectTrigger>
            <SelectValue placeholder="請選擇證書類型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="開光認證">開光認證</SelectItem>
            <SelectItem value="真品認證">真品認證</SelectItem>
            <SelectItem value="收藏認證">收藏認證</SelectItem>
            <SelectItem value="傳承認證">傳承認證</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p>證書將在創建後自動生成唯一編號和驗證二維碼。</p>
        <p className="mt-1">每個證書可綁定一個訂單，實現「一物一證」追溯。</p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              創建中...
            </>
          ) : (
            '創建證書'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
