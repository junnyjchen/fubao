/**
 * @fileoverview 商品管理页面
 * @description 商品列表、新增、编辑功能
 * @module app/admin/products/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  FormRichTextField,
} from '@/components/admin/AdminForm';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

/** 商品数据类型 */
interface Product {
  id: number;
  merchant_id: number;
  category_id: number | null;
  name: string;
  subtitle: string | null;
  type: number;
  purpose: string | null;
  price: string;
  original_price: string | null;
  stock: number;
  sales: number;
  main_image: string | null;
  description: string | null;
  is_certified: boolean;
  status: boolean;
  sort: number;
  created_at: string;
}

/** 商户数据类型 */
interface Merchant {
  id: number;
  name: string;
}

/** 分类数据类型 */
interface Category {
  id: number;
  name: string;
}

/** 表单数据类型 */
interface ProductFormData {
  name: string;
  subtitle: string;
  type: string;
  purpose: string;
  price: string;
  original_price: string;
  stock: string;
  description: string;
  is_certified: boolean;
  status: boolean;
}

/** 初始表单数据 */
const initialFormData: ProductFormData = {
  name: '',
  subtitle: '',
  type: '1',
  purpose: '',
  price: '',
  original_price: '',
  stock: '0',
  description: '',
  is_certified: false,
  status: true,
};

/** 商品类型选项 */
const typeOptions = [
  { value: '1', label: '符箓' },
  { value: '2', label: '法器' },
  { value: '3', label: '開光物品' },
  { value: '4', label: '其他' },
];

/** 用途选项 */
const purposeOptions = [
  { value: '鎮宅化煞', label: '鎮宅化煞' },
  { value: '招財進寶', label: '招財進寶' },
  { value: '平安護身', label: '平安護身' },
  { value: '事業學業', label: '事業學業' },
  { value: '姻緣感情', label: '姻緣感情' },
  { value: '健康長壽', label: '健康長壽' },
];

/**
 * 商品管理页面组件
 * @returns 商品管理页面
 */
export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 分页状态
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  /**
   * 加载商品列表
   */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      
      const response = await fetch(`/api/goods?${params}`);
      const result = await response.json();
      
      if (result.data) {
        setProducts(result.data);
        setTotal(result.total || result.data.length);
      }
    } catch (error) {
      console.error('加载商品失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  /**
   * 加载商户和分类
   */
  const loadOptions = async () => {
    try {
      const [merchantsRes] = await Promise.all([
        fetch('/api/merchants'),
      ]);
      
      const merchantsResult = await merchantsRes.json();
      if (merchantsResult.data) {
        setMerchants(merchantsResult.data);
      }
    } catch (error) {
      console.error('加载选项失败:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOptions();
  }, [loadProducts]);

  /**
   * 打开新增对话框
   */
  const handleAdd = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setFormErrors({});
    setDialogOpen(true);
  };

  /**
   * 打开编辑对话框
   */
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      subtitle: product.subtitle || '',
      type: String(product.type),
      purpose: product.purpose || '',
      price: product.price,
      original_price: product.original_price || '',
      stock: String(product.stock),
      description: product.description || '',
      is_certified: product.is_certified,
      status: product.status,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  /**
   * 删除商品
   */
  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此商品嗎？')) return;
    
    try {
      const response = await fetch(`/api/goods/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  /**
   * 表单字段变更
   */
  const handleFieldChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /**
   * 验证表单
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = '請輸入商品名稱';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = '請輸入有效價格';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const url = editingId ? `/api/goods/${editingId}` : '/api/goods';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          subtitle: formData.subtitle || null,
          type: parseInt(formData.type),
          purpose: formData.purpose || null,
          price: formData.price,
          original_price: formData.original_price || null,
          stock: parseInt(formData.stock) || 0,
          description: formData.description || null,
          is_certified: formData.is_certified,
          status: formData.status,
        }),
      });
      
      if (response.ok) {
        setDialogOpen(false);
        loadProducts();
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
  const columns: Column<Product>[] = [
    {
      key: 'id',
      title: 'ID',
      width: '60px',
      align: 'center',
    },
    {
      key: 'name',
      title: '商品名稱',
      render: (record) => (
        <div>
          <p className="font-medium">{record.name}</p>
          {record.subtitle && (
            <p className="text-xs text-muted-foreground">{record.subtitle}</p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      title: '類型',
      width: '80px',
      render: (record) => {
        const type = typeOptions.find((t) => t.value === String(record.type));
        return type?.label || '-';
      },
    },
    {
      key: 'price',
      title: '價格',
      width: '100px',
      align: 'right',
      render: (record) => (
        <div>
          <span className="font-medium text-primary">HK${record.price}</span>
          {record.original_price && (
            <span className="text-xs text-muted-foreground line-through ml-1">
              ${record.original_price}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      title: '庫存',
      width: '80px',
      align: 'center',
    },
    {
      key: 'sales',
      title: '銷量',
      width: '80px',
      align: 'center',
    },
    {
      key: 'is_certified',
      title: '認證',
      width: '80px',
      align: 'center',
      render: (record) =>
        record.is_certified ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            已認證
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
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
            上架
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            下架
          </Badge>
        ),
    },
  ];

  return (
    <AdminLayout
      title="商品管理"
      description="管理所有商品信息"
      actions={
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增商品
        </Button>
      }
    >
      <AdminTable
        columns={columns}
        data={products}
        rowKey="id"
        searchable
        searchPlaceholder="搜尋商品名稱..."
        loading={loading}
        emptyText="暫無商品"
        pagination={{
          page,
          pageSize,
          total,
        }}
        onPaginationChange={(p) => setPage(p.page)}
        actions={(record) => {
          const product = record as Product;
          return (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/shop/' + product.id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(product)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(product.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          );
        }}
      />

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? '編輯商品' : '新增商品'}
            </DialogTitle>
          </DialogHeader>
          
          <FormContainer onSubmit={handleSubmit} loading={submitting}>
            <div className="grid md:grid-cols-2 gap-4">
              <FormInputField
                name="name"
                label="商品名稱"
                required
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                error={formErrors.name}
              />
              <FormInputField
                name="subtitle"
                label="副標題"
                value={formData.subtitle}
                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormSelectField
                label="商品類型"
                name="type"
                value={formData.type}
                onValueChange={(v) => handleFieldChange('type', v)}
                options={typeOptions}
              />
              <FormSelectField
                label="用途"
                name="purpose"
                value={formData.purpose}
                onValueChange={(v) => handleFieldChange('purpose', v)}
                options={purposeOptions}
                placeholder="請選擇用途"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <FormInputField
                name="price"
                label="售價"
                type="number"
                required
                value={formData.price}
                onChange={(e) => handleFieldChange('price', e.target.value)}
                error={formErrors.price}
              />
              <FormInputField
                name="original_price"
                label="原價"
                type="number"
                value={formData.original_price}
                onChange={(e) => handleFieldChange('original_price', e.target.value)}
              />
              <FormInputField
                name="stock"
                label="庫存"
                type="number"
                value={formData.stock}
                onChange={(e) => handleFieldChange('stock', e.target.value)}
              />
            </div>

            <FormRichTextField
              name="description"
              label="商品描述"
              value={formData.description}
              onChange={(value) => handleFieldChange('description', value)}
              height={250}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormSwitchField
                label="認證商品"
                name="is_certified"
                hint="一物一證認證商品"
                checked={formData.is_certified}
                onCheckedChange={(v) => handleFieldChange('is_certified', v)}
              />
              <FormSwitchField
                label="上架狀態"
                name="status"
                hint="商品是否在前台展示"
                checked={formData.status}
                onCheckedChange={(v) => handleFieldChange('status', v)}
              />
            </div>

            <FormActions
              submitText={editingId ? '保存' : '創建'}
              onCancel={() => setDialogOpen(false)}
              submitting={submitting}
            />
          </FormContainer>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
