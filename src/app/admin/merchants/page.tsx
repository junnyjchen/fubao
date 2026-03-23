/**
 * @fileoverview 商户管理页面
 * @description 后台商户列表和管理
 * @module app/admin/merchants/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Store,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

interface Merchant {
  id: number;
  name: string;
  type: number;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  description: string | null;
  logo: string | null;
  status: boolean;
  rating: number;
  total_sales: number;
  certification_level: number | null;
  created_at: string;
}

interface MerchantForm {
  name: string;
  type: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  description: string;
  logo: string;
  status: boolean;
}

const initialForm: MerchantForm = {
  name: '',
  type: '1',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  address: '',
  description: '',
  logo: '',
  status: true,
};

const typeLabels: Record<number, string> = {
  1: '個人商戶',
  2: '企業商戶',
  3: '認證商戶',
};

export default function MerchantsManagePage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MerchantForm>(initialForm);
  const limit = 15;

  useEffect(() => {
    loadMerchants();
  }, [page, statusFilter]);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (keyword.trim()) {
        params.set('keyword', keyword.trim());
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/merchants?${params}`);
      const data = await res.json();

      setMerchants(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('加载商户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: Merchant) => {
    if (item) {
      setEditingId(item.id);
      setForm({
        name: item.name,
        type: item.type.toString(),
        contact_name: item.contact_name || '',
        contact_phone: item.contact_phone || '',
        contact_email: item.contact_email || '',
        address: item.address || '',
        description: item.description || '',
        logo: item.logo || '',
        status: item.status,
      });
    } else {
      setEditingId(null);
      setForm(initialForm);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('請填寫商戶名稱');
      return;
    }

    try {
      const url = '/api/merchants';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, ...form, type: parseInt(form.type) }
        : { ...form, type: parseInt(form.type) };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.data || data.message) {
        toast.success(editingId ? '更新成功' : '添加成功');
        handleCloseDialog();
        loadMerchants();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('保存商户失败:', error);
      toast.error('保存失敗');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/merchants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: !currentStatus }),
      });

      const data = await res.json();
      if (data.message) {
        setMerchants(merchants.map(m => 
          m.id === id ? { ...m, status: !currentStatus } : m
        ));
        toast.success('狀態已更新');
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新失敗');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此商戶嗎？')) return;

    try {
      const res = await fetch(`/api/merchants?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.message) {
        setMerchants(merchants.filter(m => m.id !== id));
        toast.success('刪除成功');
      } else {
        toast.error(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('删除商户失败:', error);
      toast.error('刪除失敗');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">商戶管理</h1>
                <p className="text-sm text-muted-foreground">共 {total} 個商戶</p>
              </div>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              添加商戶
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="搜索商戶名稱或聯繫人..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadMerchants()}
                />
                <Button onClick={loadMerchants}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="狀態篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="active">已啟用</SelectItem>
                  <SelectItem value="inactive">已禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                載入中...
              </div>
            ) : merchants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暫無商戶數據</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>商戶名稱</TableHead>
                    <TableHead className="w-[100px]">類型</TableHead>
                    <TableHead>聯繫方式</TableHead>
                    <TableHead className="w-[100px] text-center">評分</TableHead>
                    <TableHead className="w-[100px] text-center">銷量</TableHead>
                    <TableHead className="w-[80px] text-center">狀態</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
                            {item.logo ? (
                              <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              'LOGO'
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.certification_level && item.certification_level > 0 && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                V{item.certification_level}認證
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {typeLabels[item.type] || '其他'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.contact_name && <p>{item.contact_name}</p>}
                          {item.contact_phone && (
                            <p className="text-muted-foreground">{item.contact_phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{item.rating?.toFixed(1) || '5.0'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {item.total_sales || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={item.status}
                          onCheckedChange={() => handleToggleStatus(item.id, item.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(item)}
                            title="編輯"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  第 {page} / {totalPages} 頁
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 添加/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? '編輯商戶' : '添加商戶'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">商戶名稱 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="請輸入商戶名稱"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">商戶類型</Label>
                <Select
                  value={form.type}
                  onValueChange={v => setForm(prev => ({ ...prev, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">個人商戶</SelectItem>
                    <SelectItem value="2">企業商戶</SelectItem>
                    <SelectItem value="3">認證商戶</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">聯繫人</Label>
                <Input
                  id="contact_name"
                  value={form.contact_name}
                  onChange={e => setForm(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="請輸入聯繫人姓名"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">聯繫電話</Label>
                <Input
                  id="contact_phone"
                  value={form.contact_phone}
                  onChange={e => setForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="請輸入聯繫電話"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">電子郵箱</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={e => setForm(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="請輸入電子郵箱"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">商戶地址</Label>
              <Input
                id="address"
                value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="請輸入商戶地址"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={form.logo}
                onChange={e => setForm(prev => ({ ...prev, logo: e.target.value }))}
                placeholder="請輸入Logo圖片URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">商戶簡介</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="請輸入商戶簡介"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="status"
                checked={form.status}
                onCheckedChange={v => setForm(prev => ({ ...prev, status: v }))}
              />
              <Label htmlFor="status">啟用狀態</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? '保存修改' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
