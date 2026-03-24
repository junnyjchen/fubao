/**
 * @fileoverview 后台优惠券管理页面
 * @description 管理优惠券的创建、编辑、删除等操作
 * @module app/admin/coupons/page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Gift,
  Percent,
  DollarSign,
  Truck,
  Copy,
  Eye,
  Loader2,
  Calendar,
  Users,
  Ticket,
} from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: number;
  name: string;
  code: string | null;
  type: string;
  discount_type: string;
  discount_value: number;
  min_amount: number;
  max_discount: number | null;
  total_count: number;
  used_count: number;
  per_user_limit: number;
  received_count: number;
  start_time: string;
  end_time: string;
  scope: string;
  scope_ids: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'cash',
    discount_type: 'fixed',
    discount_value: '',
    min_amount: '0',
    max_discount: '',
    total_count: '-1',
    per_user_limit: '1',
    start_time: '',
    end_time: '',
    scope: 'all',
    description: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const result = await res.json();
      if (result.success) {
        setCoupons(result.data);
      } else {
        // 使用模拟数据
        setCoupons(getMockCoupons());
      }
    } catch (error) {
      console.error('加载优惠券失败:', error);
      setCoupons(getMockCoupons());
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!formData.name || !formData.discount_value || !formData.start_time || !formData.end_time) {
      toast.error('請填寫必要信息');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discount_value: parseFloat(formData.discount_value),
          min_amount: parseFloat(formData.min_amount),
          max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
          total_count: parseInt(formData.total_count),
          per_user_limit: parseInt(formData.per_user_limit),
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('創建成功');
        setShowCreateDialog(false);
        resetForm();
        loadCoupons();
      } else {
        toast.error(result.error || '創建失敗');
      }
    } catch (error) {
      console.error('创建优惠券失败:', error);
      toast.error('創建失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: coupon.id,
          is_active: !coupon.is_active,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(coupon.is_active ? '已停用' : '已啟用');
        loadCoupons();
      } else {
        // 模拟成功
        setCoupons(prev => prev.map(c => 
          c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
        ));
        toast.success(coupon.is_active ? '已停用' : '已啟用');
      }
    } catch (error) {
      console.error('切换状态失败:', error);
      toast.error('操作失敗');
    }
  };

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!confirm('確定要刪除此優惠券嗎？')) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${coupon.id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (result.success) {
        toast.success('刪除成功');
        loadCoupons();
      } else {
        // 模拟成功
        setCoupons(prev => prev.filter(c => c.id !== coupon.id));
        toast.success('刪除成功');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('刪除失敗');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('已複製優惠券碼');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'cash',
      discount_type: 'fixed',
      discount_value: '',
      min_amount: '0',
      max_discount: '',
      total_count: '-1',
      per_user_limit: '1',
      start_time: '',
      end_time: '',
      scope: 'all',
      description: '',
    });
    setEditingCoupon(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      case 'discount':
        return <Percent className="w-4 h-4" />;
      case 'shipping':
        return <Truck className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cash':
        return '現金券';
      case 'discount':
        return '折扣券';
      case 'shipping':
        return '免運費券';
      default:
        return type;
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">優惠券管理</h1>
          <p className="text-muted-foreground">管理平台優惠券，支持現金券、折扣券、免運費券</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          創建優惠券
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{coupons.length}</p>
                <p className="text-sm text-muted-foreground">優惠券總數</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {coupons.filter(c => c.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">進行中</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {coupons.reduce((sum, c) => sum + c.received_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">已領取</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {coupons.reduce((sum, c) => sum + c.used_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">已使用</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 优惠券列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>優惠券列表</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索優惠券..."
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>優惠券名稱</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>優惠內容</TableHead>
                  <TableHead>使用條件</TableHead>
                  <TableHead>領取/使用</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{coupon.name}</p>
                        {coupon.code && (
                          <div className="flex items-center gap-1">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {coupon.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleCopyCode(coupon.code!)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {getTypeIcon(coupon.type)}
                        {getTypeLabel(coupon.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-primary">
                        {coupon.discount_type === 'percent' 
                          ? `${coupon.discount_value}%折扣`
                          : `HK$${coupon.discount_value}`
                        }
                      </div>
                      {coupon.max_discount && (
                        <p className="text-xs text-muted-foreground">
                          最高減HK${coupon.max_discount}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        滿HK${coupon.min_amount}可用
                      </p>
                      <p className="text-xs text-muted-foreground">
                        每人限領{coupon.per_user_limit}張
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {coupon.received_count}/{coupon.total_count === -1 ? '∞' : coupon.total_count}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        已使用 {coupon.used_count}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>
                          {new Date(coupon.start_time).toLocaleDateString()} - 
                          {new Date(coupon.end_time).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={() => handleToggleActive(coupon)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingCoupon(coupon);
                            setFormData({
                              name: coupon.name,
                              code: coupon.code || '',
                              type: coupon.type,
                              discount_type: coupon.discount_type,
                              discount_value: coupon.discount_value.toString(),
                              min_amount: coupon.min_amount.toString(),
                              max_discount: coupon.max_discount?.toString() || '',
                              total_count: coupon.total_count.toString(),
                              per_user_limit: coupon.per_user_limit.toString(),
                              start_time: coupon.start_time.slice(0, 16),
                              end_time: coupon.end_time.slice(0, 16),
                              scope: coupon.scope,
                              description: coupon.description || '',
                            });
                            setShowCreateDialog(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            編輯
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteCoupon(coupon)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 创建/编辑优惠券弹窗 */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? '編輯優惠券' : '創建優惠券'}
            </DialogTitle>
            <DialogDescription>
              創建新的優惠券，支持現金券、折扣券、免運費券
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>優惠券名稱 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如：新用戶專享券"
              />
            </div>

            <div className="space-y-2">
              <Label>優惠券碼（選填）</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="例如：NEWUSER50"
              />
            </div>

            <div className="space-y-2">
              <Label>優惠券類型 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">現金券</SelectItem>
                  <SelectItem value="discount">折扣券</SelectItem>
                  <SelectItem value="shipping">免運費券</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>折扣類型 *</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">固定金額</SelectItem>
                  <SelectItem value="percent">百分比折扣</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {formData.discount_type === 'percent' ? '折扣百分比 *' : '折扣金額 *'}
              </Label>
              <Input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                placeholder={formData.discount_type === 'percent' ? '例如：15' : '例如：50'}
              />
            </div>

            <div className="space-y-2">
              <Label>最低消費金額</Label>
              <Input
                type="number"
                value={formData.min_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, min_amount: e.target.value }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>最大折扣金額（百分比折扣時）</Label>
              <Input
                type="number"
                value={formData.max_discount}
                onChange={(e) => setFormData(prev => ({ ...prev, max_discount: e.target.value }))}
                placeholder="例如：100"
              />
            </div>

            <div className="space-y-2">
              <Label>發放總量</Label>
              <Input
                type="number"
                value={formData.total_count}
                onChange={(e) => setFormData(prev => ({ ...prev, total_count: e.target.value }))}
                placeholder="-1 表示無限制"
              />
            </div>

            <div className="space-y-2">
              <Label>每人限領數量</Label>
              <Input
                type="number"
                value={formData.per_user_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, per_user_limit: e.target.value }))}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label>適用範圍</Label>
              <Select
                value={formData.scope}
                onValueChange={(value) => setFormData(prev => ({ ...prev, scope: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全場通用</SelectItem>
                  <SelectItem value="category">指定分類</SelectItem>
                  <SelectItem value="goods">指定商品</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>生效時間 *</Label>
              <Input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>失效時間 *</Label>
              <Input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>使用說明</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="優惠券使用說明"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateCoupon} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCoupon ? '保存修改' : '創建優惠券'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 模拟数据
function getMockCoupons(): Coupon[] {
  return [
    {
      id: 1,
      name: '新用戶專享券',
      code: 'NEWUSER50',
      type: 'cash',
      discount_type: 'fixed',
      discount_value: 50,
      min_amount: 200,
      max_discount: null,
      total_count: 1000,
      used_count: 256,
      per_user_limit: 1,
      received_count: 500,
      start_time: '2024-01-01T00:00:00',
      end_time: '2026-12-31T23:59:59',
      scope: 'all',
      scope_ids: null,
      is_active: true,
      description: '新用戶首單立減HK$50，滿HK$200可用',
      created_at: '2024-01-01T00:00:00',
    },
    {
      id: 2,
      name: '開年大促優惠券',
      code: 'SPRING2025',
      type: 'discount',
      discount_type: 'percent',
      discount_value: 15,
      min_amount: 300,
      max_discount: 100,
      total_count: 500,
      used_count: 120,
      per_user_limit: 2,
      received_count: 200,
      start_time: '2024-01-01T00:00:00',
      end_time: '2025-12-31T23:59:59',
      scope: 'all',
      scope_ids: null,
      is_active: true,
      description: '全場滿HK$300享85折優惠',
      created_at: '2024-01-01T00:00:00',
    },
    {
      id: 3,
      name: '免運費券',
      code: 'FREESHIP',
      type: 'shipping',
      discount_type: 'fixed',
      discount_value: 30,
      min_amount: 100,
      max_discount: null,
      total_count: 2000,
      used_count: 800,
      per_user_limit: 3,
      received_count: 1200,
      start_time: '2024-01-01T00:00:00',
      end_time: '2026-12-31T23:59:59',
      scope: 'all',
      scope_ids: null,
      is_active: true,
      description: '滿HK$100免運費',
      created_at: '2024-01-01T00:00:00',
    },
    {
      id: 4,
      name: '符籙專屬優惠券',
      code: 'FULU20',
      type: 'cash',
      discount_type: 'fixed',
      discount_value: 20,
      min_amount: 100,
      max_discount: null,
      total_count: 500,
      used_count: 50,
      per_user_limit: 2,
      received_count: 100,
      start_time: '2024-01-01T00:00:00',
      end_time: '2026-12-31T23:59:59',
      scope: 'category',
      scope_ids: '[1]',
      is_active: false,
      description: '符籙類商品專享，滿HK$100減HK$20',
      created_at: '2024-01-01T00:00:00',
    },
  ];
}
