/**
 * @fileoverview 用户地址管理页面
 * @description 管理收货地址
 * @module app/user/addresses/page
 */

'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  ArrowRight,
  Home,
  Building,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { useI18n } from '@/lib/i18n';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { AddressListSkeleton } from '@/components/common/PageSkeletons';

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
  'Hong Kong Island': ['Central & Western', 'Eastern', 'Southern', 'Wan Chai'],
  'Kowloon': ['Kowloon City', 'Kwun Tong', 'Sham Shui Po', 'Wong Tai Sin', 'Yau Tsim Mong'],
  'New Territories': ['Islands', 'Kwai Tsing', 'North', 'Sai Kung', 'Sha Tin', 'Tai Po', 'Tsuen Wan', 'Tuen Mun', 'Yuen Long'],
};

const addressTags = [
  { value: 'home', labelKey: 'tagHome', icon: Home },
  { value: 'company', labelKey: 'tagCompany', icon: Building },
  { value: 'other', labelKey: 'tagOther', icon: Briefcase },
];

// 地址卡片组件
const AddressCard = memo(function AddressCard({
  address,
  isDefault,
  onEdit,
  onDelete,
  onSetDefault,
  t,
  isRTL,
}: {
  address: Address;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  t: any;
  isRTL: boolean;
}) {
  const addr = t.userPage.address;
  const tagInfo = addressTags.find(tag => tag.value === address.tag);
  const TagIcon = tagInfo?.icon;

  return (
    <Card className={`${isDefault ? 'border-primary' : ''} animate-fade-in-up`}>
      <CardContent className="p-4">
        <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex-1 ${isRTL ? 'text-end' : ''}`}>
            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <span className="font-medium">{address.name}</span>
              <span className="text-muted-foreground">{address.phone}</span>
              {isDefault && (
                <Badge className="bg-primary text-primary-foreground">{addr.default}</Badge>
              )}
              {address.tag && TagIcon && (
                <Badge variant="outline" className={`gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <TagIcon className="w-3 h-3" />
                  {addr.form[tagInfo!.labelKey]}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {address.province} {address.district} {address.address}
            </p>
          </div>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {!isDefault && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSetDefault}
                aria-label={addr.setDefault}
              >
                <Star className={`w-4 h-4 ${isRTL ? 'ms-1' : 'me-1'}`} />
                {addr.setDefault}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              aria-label={addr.actions.edit}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={onDelete}
              aria-label={addr.actions.delete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, isRTL, lang } = useI18n();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // 地址表单
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    isDefault: false,
    tag: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // 删除确认
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const addr = t.userPage.address;

  // 根据语言选择地区数据
  const getDistricts = useCallback(() => {
    if (lang === 'en') {
      return {
        'Hong Kong Island': ['Central & Western', 'Eastern', 'Southern', 'Wan Chai'],
        'Kowloon': ['Kowloon City', 'Kwun Tong', 'Sham Shui Po', 'Wong Tai Sin', 'Yau Tsim Mong'],
        'New Territories': ['Islands', 'Kwai Tsing', 'North', 'Sai Kung', 'Sha Tin', 'Tai Po', 'Tsuen Wan', 'Tuen Mun', 'Yuen Long'],
      };
    }
    return hongKongDistricts;
  }, [lang]);

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

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      setAddresses(data.data || []);
    } catch (error) {
      console.error('加载地址失败:', error);
      toast.error(addr.messages.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [addr.messages.loadFailed]);

  const openAddForm = useCallback(() => {
    const districts = getDistricts();
    const firstRegion = Object.keys(districts)[0];
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      province: firstRegion,
      city: lang === 'en' ? 'Hong Kong' : '香港',
      district: '',
      address: '',
      isDefault: addresses.length === 0,
      tag: '',
    });
    setShowForm(true);
  }, [addresses.length, getDistricts, lang]);

  const openEditForm = useCallback((address: Address) => {
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
  }, []);

  const handleSubmit = useCallback(async () => {
    const form = addr.form;
    // 验证
    if (!formData.name.trim()) {
      toast.error(form.nameRequired);
      return;
    }
    // 手机号非必填，但如果有填写则验证格式
    const phone = formData.phone.trim();
    if (phone && !/^[\+]?[\d\s\-]{6,20}$/.test(phone)) {
      toast.error('請輸入正確的手機號碼');
      return;
    }
    if (!formData.district) {
      toast.error(form.districtRequired);
      return;
    }
    if (!formData.address.trim()) {
      toast.error(form.detailAddressRequired);
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
          toast.success(addr.messages.updateSuccess);
          setShowForm(false);
          loadAddresses();
        } else {
          toast.error(data.error || addr.messages.saveFailed);
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
          toast.success(addr.messages.addSuccess);
          setShowForm(false);
          loadAddresses();
        } else {
          toast.error(data.error || addr.messages.saveFailed);
        }
      }
    } catch (error) {
      console.error('保存地址失败:', error);
      toast.error(addr.messages.saveFailed);
    } finally {
      setSubmitting(false);
    }
  }, [editingId, formData, addr, loadAddresses]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/addresses?id=${deleteId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.message) {
        toast.success(addr.messages.deleteSuccess);
        setDeleteId(null);
        loadAddresses();
      } else {
        toast.error(data.error || addr.messages.deleteFailed);
      }
    } catch (error) {
      console.error('删除地址失败:', error);
      toast.error(addr.messages.deleteFailed);
    }
  }, [deleteId, addr.messages, loadAddresses]);

  const setDefault = useCallback(async (id: number) => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      });
      const data = await res.json();
      if (data.message) {
        toast.success(addr.messages.setDefaultSuccess);
        loadAddresses();
      }
    } catch (error) {
      console.error('设置默认地址失败:', error);
      toast.error(addr.messages.setDefaultFailed);
    }
  }, [addr.messages, loadAddresses]);

  const districts = getDistricts();

  if (authLoading || loading) {
    return <AddressListSkeleton />;
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/user" aria-label={t.nav.user}>
              <Button variant="ghost" size="icon">
                <BackIcon className="w-5 h-5" />
              </Button>
            </Link>
            <div className={isRTL ? 'text-end' : ''}>
              <h1 className={`text-xl font-semibold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-5 h-5 text-primary" />
                {addr.title}
              </h1>
              <p className="text-sm text-muted-foreground">{addr.subtitle}</p>
            </div>
          </div>
          <Button onClick={openAddForm}>
            <Plus className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
            {addr.addAddress}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {addresses.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="py-16 text-center">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{addr.noAddress}</h3>
              <p className="text-muted-foreground mb-6">{addr.noAddressDesc}</p>
              <Button onClick={openAddForm}>
                <Plus className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                {addr.addFirst}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <AddressCard
                key={address.id}
                address={address}
                isDefault={address.is_default}
                onEdit={() => openEditForm(address)}
                onDelete={() => setDeleteId(address.id)}
                onSetDefault={() => setDefault(address.id)}
                t={t}
                isRTL={isRTL}
              />
            ))}
          </div>
        )}
      </main>

      {/* 地址表单弹窗 */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? addr.editAddress : addr.addAddress}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{addr.form.name} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={addr.form.namePlaceholder}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label>{addr.form.phone}（選填）</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={addr.form.phonePlaceholder}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{addr.form.region} *</Label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => setFormData({ ...formData, province: value, district: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={addr.form.regionPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(districts).map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{addr.form.district} *</Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={addr.form.districtPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {(districts[formData.province] || []).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{addr.form.detailAddress} *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={addr.form.detailAddressPlaceholder}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="space-y-2">
              <Label>{addr.form.tag}</Label>
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {addressTags.map((tag) => {
                  const Icon = tag.icon;
                  const labelMap: Record<string, string> = {
                    tagHome: addr.form.tagHome,
                    tagCompany: addr.form.tagCompany,
                    tagOther: addr.form.tagOther,
                  };
                  return (
                    <Button
                      key={tag.value}
                      type="button"
                      variant={formData.tag === tag.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, tag: tag.value })}
                    >
                      <Icon className={`w-4 h-4 ${isRTL ? 'ms-1' : 'me-1'}`} />
                      {labelMap[tag.labelKey]}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Label>{addr.form.isDefault}</Label>
              <Button
                type="button"
                variant={formData.isDefault ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              >
                {formData.isDefault && <Check className={`w-4 h-4 ${isRTL ? 'ms-1' : 'me-1'}`} />}
                {formData.isDefault ? addr.form.yes : addr.form.no}
              </Button>
            </div>
          </div>
          <DialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              {addr.actions.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ms-2' : 'me-2'}`} />
                  {addr.actions.saving}
                </>
              ) : (
                addr.actions.save
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{addr.deleteConfirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {addr.deleteConfirm.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel>{addr.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {addr.deleteConfirm.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
