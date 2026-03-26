/**
 * @fileoverview 用户地址管理页面
 * @description 管理收货地址
 * @module app/user/addresses/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  Check,
  Loader2,
  ArrowLeft,
  Home,
  Building,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';

interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default: boolean;
  tag?: string;
  created_at: string;
}

// 香港地区数据
const hongKongDistricts: Record<string, string[]> = {
  '香港島': ['中西區', '東區', '南區', '灣仔區'],
  '九龍': ['九龍城區', '觀塘區', '深水埗區', '黃大仙區', '油尖旺區'],
  '新界': ['離島區', '葵青區', '北區', '西貢區', '沙田區', '大埔區', '荃灣區', '屯門區', '元朗區'],
};

const addressTags = [
  { value: 'home', label: '家', icon: Home },
  { value: 'company', label: '公司', icon: Building },
  { value: 'other', label: '其他', icon: Briefcase },
];

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // 地址表单
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: '香港島',
    city: '香港',
    district: '',
    address: '',
    isDefault: false,
    tag: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  // 删除确认
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
      setLoading(false);
      return;
    }
    
    if (user) {
      loadAddresses();
    }
  }, [user, authLoading]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      setAddresses(data.data || []);
    } catch (error) {
      console.error('加载地址失败:', error);
      toast.error('加載地址失敗');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      province: '香港島',
      city: '香港',
      district: '',
      address: '',
      isDefault: addresses.length === 0,
      tag: '',
    });
    setShowForm(true);
  };

  const openEditForm = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      address: address.address,
      isDefault: address.is_default,
      tag: address.tag || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    // 验证
    if (!formData.name.trim()) {
      toast.error('請輸入收貨人姓名');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('請輸入聯繫電話');
      return;
    }
    if (!formData.district) {
      toast.error('請選擇地區');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('請輸入詳細地址');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // 更新
        const res = await fetch('/api/addresses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            ...formData,
            isDefault: formData.isDefault,
          }),
        });
        const data = await res.json();
        if (data.message) {
          toast.success('地址已更新');
          setShowForm(false);
          loadAddresses();
        } else {
          toast.error(data.error || '更新失敗');
        }
      } else {
        // 新增
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.message) {
          toast.success('地址已添加');
          setShowForm(false);
          loadAddresses();
        } else {
          toast.error(data.error || '添加失敗');
        }
      }
    } catch (error) {
      console.error('保存地址失败:', error);
      toast.error('保存失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/addresses?id=${deleteId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.message) {
        toast.success('地址已刪除');
        setDeleteId(null);
        loadAddresses();
      } else {
        toast.error(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('删除地址失败:', error);
      toast.error('刪除失敗');
    }
  };

  const setDefault = async (id: number) => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      });
      const data = await res.json();
      if (data.message) {
        toast.success('已設為默認地址');
        loadAddresses();
      }
    } catch (error) {
      console.error('设置默认地址失败:', error);
      toast.error('設置失敗');
    }
  };

  const getTagIcon = (tag: string) => {
    const tagInfo = addressTags.find(t => t.value === tag);
    if (tagInfo) {
      const Icon = tagInfo.icon;
      return <Icon className="w-3 h-3" />;
    }
    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/user">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                收貨地址
              </h1>
              <p className="text-sm text-muted-foreground">管理您的收貨地址</p>
            </div>
          </div>
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            新增地址
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">暫無收貨地址</h3>
              <p className="text-muted-foreground mb-6">添加收貨地址，享受便捷的購物體驗</p>
              <Button onClick={openAddForm}>
                <Plus className="w-4 h-4 mr-2" />
                添加地址
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className={address.is_default ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{address.name}</span>
                        <span className="text-muted-foreground">{address.phone}</span>
                        {address.is_default && (
                          <Badge className="bg-primary text-primary-foreground">默認</Badge>
                        )}
                        {address.tag && (
                          <Badge variant="outline" className="gap-1">
                            {getTagIcon(address.tag)}
                            {addressTags.find(t => t.value === address.tag)?.label || address.tag}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.province} {address.district} {address.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDefault(address.id)}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          設為默認
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(address)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteId(address.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* 地址表单弹窗 */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? '編輯地址' : '新增地址'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>收貨人 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="請輸入姓名"
                />
              </div>
              <div className="space-y-2">
                <Label>聯繫電話 *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="請輸入電話"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>區域 *</Label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => setFormData({ ...formData, province: value, district: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇區域" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(hongKongDistricts).map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>地區 *</Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇地區" />
                  </SelectTrigger>
                  <SelectContent>
                    {(hongKongDistricts[formData.province] || []).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>詳細地址 *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="街道、樓宇名稱、門牌號等"
              />
            </div>

            <div className="space-y-2">
              <Label>地址標籤</Label>
              <div className="flex gap-2">
                {addressTags.map((tag) => {
                  const Icon = tag.icon;
                  return (
                    <Button
                      key={tag.value}
                      type="button"
                      variant={formData.tag === tag.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, tag: tag.value })}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {tag.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>設為默認地址</Label>
              <Button
                type="button"
                variant={formData.isDefault ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              >
                {formData.isDefault && <Check className="w-4 h-4 mr-1" />}
                {formData.isDefault ? '是' : '否'}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除這個地址嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
