/**
 * @fileoverview 用户地址管理组件
 * @description 保存和管理常用收货地址
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Check,
  Home,
  Building,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  tag?: 'home' | 'office' | 'other';
  is_default?: boolean;
}

interface AddressManagerProps {
  addresses: Address[];
  selectedId?: string;
  onSelect: (address: Address) => void;
  onAdd: (address: Address) => void;
  onUpdate: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

const tagIcons = {
  home: Home,
  office: Building,
  other: MapPin,
};

const tagLabels = {
  home: '住宅',
  office: '公司',
  other: '其他',
};

export function AddressManager({
  addresses,
  selectedId,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
  onSetDefault,
}: AddressManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddDialog(true);
  };

  const handleClose = () => {
    setShowAddDialog(false);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-3">
      {/* 地址列表 */}
      {addresses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground mb-1">暫無收貨地址</p>
            <p className="text-sm text-muted-foreground">添加常用地址，領取更便捷</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {addresses.map((address) => {
            const TagIcon = tagIcons[address.tag || 'other'];
            const isSelected = selectedId === address.id;

            return (
              <Card 
                key={address.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-muted-foreground/30'
                }`}
                onClick={() => onSelect(address)}
              >
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <RadioGroup value={selectedId} className="mt-1">
                      <RadioGroupItem value={address.id} />
                    </RadioGroup>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{address.name}</span>
                        <span className="text-muted-foreground">{address.phone}</span>
                        {address.tag && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-muted">
                            <TagIcon className="w-3 h-3" />
                            {tagLabels[address.tag]}
                          </span>
                        )}
                        {address.is_default && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                            <Star className="w-3 h-3" />
                            默認
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {address.address}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {!address.is_default && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDelete(address.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 添加按钮 */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowAddDialog(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        添加新地址
      </Button>

      {/* 添加/编辑弹窗 */}
      <AddressFormDialog
        open={showAddDialog}
        onOpenChange={handleClose}
        address={editingAddress}
        onSave={(data) => {
          if (editingAddress) {
            onUpdate({ ...editingAddress, ...data });
          } else {
            onAdd({ ...data, id: Date.now().toString() });
          }
          handleClose();
        }}
      />
    </div>
  );
}

/**
 * 地址表单弹窗
 */
function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address | null;
  onSave: (data: Omit<Address, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    tag: 'home' as Address['tag'],
    is_default: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        phone: address.phone,
        address: address.address,
        tag: address.tag || 'home',
        is_default: address.is_default || false,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        tag: 'home',
        is_default: false,
      });
    }
  }, [address, open]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('請輸入收貨人姓名');
      return;
    }
    // 手机号非必填，但如果有填写则验证格式
    const phone = formData.phone.trim();
    if (phone && !/^[\+]?[\d\s\-]{6,20}$/.test(phone)) {
      toast.error('請輸入正確的手機號碼');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('請輸入詳細地址');
      return;
    }
    onSave(formData);
    toast.success(address ? '地址已更新' : '地址已添加');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? '編輯地址' : '添加新地址'}</DialogTitle>
          <DialogDescription>
            填寫收貨地址信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="收貨人姓名"
              />
            </div>
            <div className="space-y-2">
              <Label>手機（選填）</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="手機號碼（選填）"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>地址</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="詳細收貨地址"
            />
          </div>

          <div className="space-y-2">
            <Label>標籤</Label>
            <div className="flex gap-2">
              {(['home', 'office', 'other'] as const).map((tag) => {
                const TagIcon = tagIcons[tag];
                return (
                  <button
                    key={tag}
                    onClick={() => setFormData({ ...formData, tag })}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                      formData.tag === tag
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <TagIcon className="w-4 h-4" />
                    {tagLabels[tag]}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">設為默認地址</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            {address ? '保存' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 快速选择地址卡片
 */
export function QuickAddressSelect({
  addresses,
  selectedId,
  onSelect,
  onManageClick,
}: {
  addresses: Address[];
  selectedId?: string;
  onSelect: (address: Address) => void;
  onManageClick?: () => void;
}) {
  const selectedAddress = addresses.find(a => a.id === selectedId);

  if (addresses.length === 0) {
    return (
      <Card className="border-dashed cursor-pointer hover:border-primary/50 transition-colors">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">添加收貨地址</p>
              <p className="text-sm text-muted-foreground">保存常用地址，領取更便捷</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            添加
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => selectedAddress && onSelect(selectedAddress)}
    >
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              {selectedAddress ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedAddress.name}</span>
                    <span className="text-muted-foreground">{selectedAddress.phone}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {selectedAddress.address}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">請選擇收貨地址</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onManageClick?.();
              }}
            >
              管理
            </Button>
            {!selectedAddress && (
              <Button variant="ghost" size="sm">
                選擇
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
