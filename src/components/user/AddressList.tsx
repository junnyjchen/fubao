'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2,
  Check,
  Loader2,
  Star,
} from 'lucide-react';

interface AddressItem {
  id: number;
  consignee: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default: number;
  label?: string;
}

interface AddressListProps {
  addresses: AddressItem[];
  onSelect?: (address: AddressItem) => void;
  onEdit?: (address: AddressItem) => void;
  onDelete?: (id: number) => Promise<void>;
  onSetDefault?: (id: number) => Promise<void>;
  showActions?: boolean;
  selectable?: boolean;
  selectedId?: number;
}

export function AddressList({
  addresses,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
  selectable = false,
  selectedId,
}: AddressListProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { success, error } = useToast();

  const handleDelete = async () => {
    if (!onDelete || deleteId === null) return;
    try {
      setDeleting(true);
      await onDelete(deleteId);
      success('删除成功');
    } catch (err) {
      error('删除失败');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSelect = (address: AddressItem) => {
    if (selectable && onSelect) {
      onSelect(address);
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-4">暂无收货地址</p>
        {showActions && onEdit && (
          <Button variant="outline" onClick={() => onEdit({} as AddressItem)}>
            <Plus className="w-4 h-4 mr-1" />
            添加地址
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            onSelect={handleSelect}
            onEdit={showActions ? () => onEdit?.(addr) : undefined}
            onDelete={showActions ? () => setDeleteId(addr.id) : undefined}
            onSetDefault={showActions ? () => onSetDefault?.(addr.id) : undefined}
            isSelected={selectedId === addr.id}
            selectable={selectable}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="确定要删除该地址吗？"
        title="删除地址"
        type="danger"
        loading={deleting}
      />
    </>
  );
}

interface AddressCardProps {
  address: AddressItem;
  onSelect?: (address: AddressItem) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  isSelected?: boolean;
  selectable?: boolean;
}

function AddressCard({
  address,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  isSelected = false,
  selectable = false,
}: AddressCardProps) {
  const fullAddress = `${address.province}${address.city}${address.district}${address.address}`;

  return (
    <Card
      className={cn(
        'transition-all cursor-pointer',
        selectable && 'hover:border-primary',
        isSelected && 'border-primary bg-primary/5'
      )}
      onClick={() => onSelect?.(address)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{address.consignee}</span>
              <span className="text-sm text-muted-foreground">{address.phone}</span>
              {address.is_default === 1 && (
                <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  默认
                </span>
              )}
              {address.label && (
                <span className="px-1.5 py-0.5 text-xs bg-muted rounded">
                  {address.label}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{fullAddress}</p>
          </div>

          {(onEdit || onDelete || onSetDefault) && (
            <div className="flex items-center gap-1 ml-4">
              {selectable && isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              {onSetDefault && address.is_default !== 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault();
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="设为默认"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Address Form Modal
interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  initialData?: Partial<AddressItem>;
  loading?: boolean;
}

export interface AddressFormData {
  consignee: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default: number;
  label?: string;
}

export function AddressForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    consignee: initialData?.consignee || '',
    phone: initialData?.phone || '',
    province: initialData?.province || '',
    city: initialData?.city || '',
    district: initialData?.district || '',
    address: initialData?.address || '',
    is_default: initialData?.is_default || 0,
    label: initialData?.label || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  const handleChange = (field: keyof AddressFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};
    
    if (!formData.consignee.trim()) {
      newErrors.consignee = '请输入收货人';
    }
    if (!formData.phone.trim() || !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号';
    }
    if (!formData.province.trim()) {
      newErrors.province = '请选择省份';
    }
    if (!formData.city.trim()) {
      newErrors.city = '请选择城市';
    }
    if (!formData.district.trim()) {
      newErrors.district = '请选择区县';
    }
    if (!formData.address.trim()) {
      newErrors.address = '请输入详细地址';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(formData);
  };

  // Simple province/city/district selector (placeholder)
  const ProvinceSelector = () => (
    <div className="flex gap-2">
      <div className="flex-1">
        <label className="text-sm text-muted-foreground mb-1 block">省份</label>
        <input
          type="text"
          value={formData.province}
          onChange={(e) => handleChange('province', e.target.value)}
          placeholder="省份"
          className={cn(
            'w-full px-3 py-2 border rounded-lg',
            errors.province ? 'border-red-500' : 'border-input'
          )}
        />
        {errors.province && (
          <p className="text-xs text-red-500 mt-1">{errors.province}</p>
        )}
      </div>
      <div className="flex-1">
        <label className="text-sm text-muted-foreground mb-1 block">城市</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="城市"
          className={cn(
            'w-full px-3 py-2 border rounded-lg',
            errors.city ? 'border-red-500' : 'border-input'
          )}
        />
        {errors.city && (
          <p className="text-xs text-red-500 mt-1">{errors.city}</p>
        )}
      </div>
      <div className="flex-1">
        <label className="text-sm text-muted-foreground mb-1 block">区县</label>
        <input
          type="text"
          value={formData.district}
          onChange={(e) => handleChange('district', e.target.value)}
          placeholder="区县"
          className={cn(
            'w-full px-3 py-2 border rounded-lg',
            errors.district ? 'border-red-500' : 'border-input'
          )}
        />
        {errors.district && (
          <p className="text-xs text-red-500 mt-1">{errors.district}</p>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? '编辑地址' : '添加地址'}
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">收货人</label>
          <input
            type="text"
            value={formData.consignee}
            onChange={(e) => handleChange('consignee', e.target.value)}
            placeholder="请输入收货人姓名"
            className={cn(
              'w-full px-3 py-2 border rounded-lg',
              errors.consignee ? 'border-red-500' : 'border-input'
            )}
          />
          {errors.consignee && (
            <p className="text-xs text-red-500 mt-1">{errors.consignee}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">手机号</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="请输入手机号"
            maxLength={11}
            className={cn(
              'w-full px-3 py-2 border rounded-lg',
              errors.phone ? 'border-red-500' : 'border-input'
            )}
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <ProvinceSelector />

        <div>
          <label className="text-sm font-medium mb-1 block">详细地址</label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="请输入详细地址"
            rows={2}
            className={cn(
              'w-full px-3 py-2 border rounded-lg resize-none',
              errors.address ? 'border-red-500' : 'border-input'
            )}
          />
          {errors.address && (
            <p className="text-xs text-red-500 mt-1">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">地址标签</label>
          <input
            type="text"
            value={formData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="如：家、公司、学校"
            className="w-full px-3 py-2 border border-input rounded-lg"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_default === 1}
            onChange={(e) => handleChange('is_default', e.target.checked ? 1 : 0)}
            className="w-4 h-4 rounded border-input"
          />
          <span className="text-sm">设为默认地址</span>
        </label>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
}
