/**
 * @fileoverview 用户地址管理页面
 * @description 管理用户收货地址
 * @module app/user/addresses/page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { MapPin, Plus, Edit, Trash2, Check } from 'lucide-react';

/** 地址数据类型 */
interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default: boolean;
  created_at: string;
}

/** 表单数据类型 */
interface AddressFormData {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
}

/** 初始表单数据 */
const initialFormData: AddressFormData = {
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  isDefault: false,
};

/**
 * 用户地址管理页面组件
 * @returns 地址管理页面
 */
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  /**
   * 加载地址列表
   */
  const loadAddresses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/addresses');
      const result = await response.json();
      if (result.data) {
        setAddresses(result.data);
      }
    } catch (error) {
      console.error('加载地址失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开新增对话框
   */
  const handleAdd = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  /**
   * 打开编辑对话框
   */
  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      address: address.address,
      isDefault: address.is_default,
    });
    setDialogOpen(true);
  };

  /**
   * 删除地址
   */
  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此地址嗎？')) return;

    try {
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('删除地址失败:', error);
    }
  };

  /**
   * 设为默认
   */
  const handleSetDefault = async (id: number) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      });

      if (response.ok) {
        loadAddresses();
      }
    } catch (error) {
      console.error('设置默认地址失败:', error);
    }
  };

  /**
   * 表单字段变更
   */
  const handleFieldChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.name || !formData.phone || !formData.province || 
        !formData.city || !formData.district || !formData.address) {
      alert('請填寫完整地址信息');
      return;
    }

    setSubmitting(true);

    try {
      const url = '/api/addresses';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { ...formData, id: editingId }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setDialogOpen(false);
        loadAddresses();
      } else {
        const result = await response.json();
        alert(result.error || '操作失敗');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('操作失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            收貨地址
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* 新增按钮 */}
        <div className="mb-6">
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            新增地址
          </Button>
        </div>

        {/* 地址列表 */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">載入中...</div>
        ) : addresses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">暫無地址</h2>
              <p className="text-muted-foreground mb-6">添加一個收貨地址吧</p>
              <Button onClick={handleAdd}>新增地址</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className={address.is_default ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{address.name}</span>
                        <span className="text-muted-foreground">{address.phone}</span>
                        {address.is_default && (
                          <Badge className="bg-primary/10 text-primary">默認</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.province} {address.city} {address.district} {address.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          設為默認
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(address.id)}
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

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? '編輯地址' : '新增地址'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">收貨人 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="請輸入姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">聯繫電話 *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="請輸入手機號"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">省份 *</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => handleFieldChange('province', e.target.value)}
                  placeholder="省份"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">城市 *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="城市"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">區縣 *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleFieldChange('district', e.target.value)}
                  placeholder="區縣"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">詳細地址 *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="請輸入詳細地址"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isDefault">設為默認地址</Label>
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(v) => handleFieldChange('isDefault', v)}
              />
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '提交中...' : '保存'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
