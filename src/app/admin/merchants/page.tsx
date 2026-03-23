/**
 * @fileoverview 商户管理页面
 * @description 商户列表、详情查看、状态管理
 * @module app/admin/merchants/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminTable, Column } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FormContainer,
  FormInputField,
  FormTextareaField,
  FormSelectField,
  FormSwitchField,
  FormActions,
} from '@/components/admin/AdminForm';
import {
  Eye,
  Edit,
  Star,
  MapPin,
  Phone,
  Package,
} from 'lucide-react';

/** 商户数据类型 */
interface Merchant {
  id: number;
  name: string;
  type: number;
  logo: string | null;
  cover: string | null;
  description: string | null;
  certification_level: number;
  contact_name: string | null;
  contact_phone: string | null;
  address: string | null;
  province: string | null;
  city: string | null;
  rating: string;
  total_sales: number;
  status: boolean;
  created_at: string;
  goods?: Array<{
    id: number;
    name: string;
    price: string;
    main_image: string | null;
  }>;
}

/** 商户类型选项 */
const merchantTypeOptions = [
  { value: '1', label: '道觀' },
  { value: '2', label: '寺廟' },
  { value: '3', label: '商家' },
  { value: '4', label: '個人' },
];

/** 认证等级选项 */
const certificationOptions = [
  { value: '1', label: '一級認證' },
  { value: '2', label: '二級認證' },
  { value: '3', label: '三級認證（最高）' },
];

/**
 * 商户管理页面组件
 * @returns 商户管理页面
 */
export default function MerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    type: '1',
    description: '',
    certification_level: '1',
    contact_name: '',
    contact_phone: '',
    address: '',
    province: '',
    city: '',
    status: true,
  });

  // 分页状态
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  /**
   * 加载商户列表
   */
  const loadMerchants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      
      const response = await fetch(`/api/merchants?${params}`);
      const result = await response.json();
      
      if (result.data) {
        setMerchants(result.data);
        setTotal(result.total || result.data.length);
      }
    } catch (error) {
      console.error('加载商户失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  /**
   * 查看商户详情
   */
  const handleViewDetail = async (merchant: Merchant) => {
    try {
      const response = await fetch(`/api/merchants/${merchant.id}`);
      const result = await response.json();
      
      if (result.data) {
        setSelectedMerchant(result.data);
        setDetailOpen(true);
      }
    } catch (error) {
      console.error('获取商户详情失败:', error);
    }
  };

  /**
   * 打开编辑对话框
   */
  const handleEdit = (merchant: Merchant) => {
    setEditingId(merchant.id);
    setFormData({
      name: merchant.name,
      type: String(merchant.type),
      description: merchant.description || '',
      certification_level: String(merchant.certification_level),
      contact_name: merchant.contact_name || '',
      contact_phone: merchant.contact_phone || '',
      address: merchant.address || '',
      province: merchant.province || '',
      city: merchant.city || '',
      status: merchant.status,
    });
    setEditOpen(true);
  };

  /**
   * 表单字段变更
   */
  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('請輸入商戶名稱');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/merchants/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: parseInt(formData.type),
          description: formData.description || null,
          certification_level: parseInt(formData.certification_level),
          contact_name: formData.contact_name || null,
          contact_phone: formData.contact_phone || null,
          address: formData.address || null,
          province: formData.province || null,
          city: formData.city || null,
          status: formData.status,
        }),
      });
      
      if (response.ok) {
        setEditOpen(false);
        loadMerchants();
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

  /** 表格列配置 */
  const columns: Column<Merchant>[] = [
    {
      key: 'id',
      title: 'ID',
      width: '60px',
      align: 'center',
    },
    {
      key: 'name',
      title: '商戶名稱',
      render: (record) => (
        <div>
          <p className="font-medium">{record.name}</p>
          <p className="text-xs text-muted-foreground">
            {merchantTypeOptions.find((t) => t.value === String(record.type))?.label || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'certification_level',
      title: '認證等級',
      width: '100px',
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: record.certification_level }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      ),
    },
    {
      key: 'rating',
      title: '評分',
      width: '80px',
      align: 'center',
      render: (record) => (
        <span className="font-medium">{record.rating}</span>
      ),
    },
    {
      key: 'total_sales',
      title: '銷量',
      width: '80px',
      align: 'center',
    },
    {
      key: 'address',
      title: '地區',
      width: '120px',
      render: (record) => (
        <span className="text-sm text-muted-foreground">
          {record.province} {record.city}
        </span>
      ),
    },
    {
      key: 'status',
      title: '狀態',
      width: '80px',
      align: 'center',
      render: (record) =>
        record.status ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            正常
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            禁用
          </Badge>
        ),
    },
  ];

  return (
    <AdminLayout
      title="商戶管理"
      description="管理所有商戶信息"
    >
      <AdminTable
        columns={columns}
        data={merchants}
        rowKey="id"
        searchable
        searchPlaceholder="搜尋商戶名稱..."
        loading={loading}
        emptyText="暫無商戶"
        pagination={{
          page,
          pageSize,
          total,
        }}
        onPaginationChange={(p) => setPage(p.page)}
        actions={(record) => {
          const merchant = record as Merchant;
          return (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetail(merchant)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(merchant)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </>
          );
        }}
      />

      {/* 商户详情对话框 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>商戶詳情</DialogTitle>
          </DialogHeader>
          
          {selectedMerchant && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  {selectedMerchant.logo ? '圖' : '暫無'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedMerchant.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {merchantTypeOptions.find((t) => t.value === String(selectedMerchant.type))?.label}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: selectedMerchant.certification_level }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">評分</p>
                  <p className="text-xl font-bold text-primary">{selectedMerchant.rating}</p>
                </div>
              </div>

              {/* 联系信息 */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedMerchant.contact_name} - {selectedMerchant.contact_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedMerchant.address}</span>
                </div>
              </div>

              {/* 描述 */}
              {selectedMerchant.description && (
                <div>
                  <h4 className="font-medium mb-2">商戶介紹</h4>
                  <p className="text-sm text-muted-foreground">{selectedMerchant.description}</p>
                </div>
              )}

              {/* 商品列表 */}
              {selectedMerchant.goods && selectedMerchant.goods.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    商品列表 ({selectedMerchant.goods.length})
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedMerchant.goods.map((goods) => (
                      <div
                        key={goods.id}
                        className="flex gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                        onClick={() => router.push('/admin/products')}
                      >
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                          {goods.main_image ? '圖' : '暫無'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{goods.name}</p>
                          <p className="text-sm text-primary">HK${goods.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 统计 */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{selectedMerchant.total_sales}</p>
                  <p className="text-sm text-muted-foreground">總銷量</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{selectedMerchant.goods?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">商品數</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{selectedMerchant.rating}</p>
                  <p className="text-sm text-muted-foreground">評分</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>編輯商戶</DialogTitle>
          </DialogHeader>
          
          <FormContainer onSubmit={handleSubmit} loading={submitting}>
            <div className="grid md:grid-cols-2 gap-4">
              <FormInputField
                name="name"
                label="商戶名稱"
                required
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
              <FormSelectField
                label="商戶類型"
                name="type"
                value={formData.type}
                onValueChange={(v) => handleFieldChange('type', v)}
                options={merchantTypeOptions}
              />
            </div>

            <FormSelectField
              label="認證等級"
              name="certification_level"
              value={formData.certification_level}
              onValueChange={(v) => handleFieldChange('certification_level', v)}
              options={certificationOptions}
            />

            <FormTextareaField
              name="description"
              label="商戶介紹"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormInputField
                name="contact_name"
                label="聯繫人"
                value={formData.contact_name}
                onChange={(e) => handleFieldChange('contact_name', e.target.value)}
              />
              <FormInputField
                name="contact_phone"
                label="聯繫電話"
                value={formData.contact_phone}
                onChange={(e) => handleFieldChange('contact_phone', e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <FormInputField
                name="province"
                label="省份"
                value={formData.province}
                onChange={(e) => handleFieldChange('province', e.target.value)}
              />
              <FormInputField
                name="city"
                label="城市"
                value={formData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
              />
            </div>

            <FormInputField
              name="address"
              label="詳細地址"
              value={formData.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
            />

            <FormSwitchField
              label="啟用狀態"
              name="status"
              hint="商戶是否正常營業"
              checked={formData.status}
              onCheckedChange={(v) => handleFieldChange('status', v)}
            />

            <FormActions
              submitText="保存"
              onCancel={() => setEditOpen(false)}
              submitting={submitting}
            />
          </FormContainer>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
