'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload, SingleImageUpload } from '@/components/upload/ImageUpload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export default function MerchantNewGoodsPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    price: '',
    original_price: '',
    stock: '',
    category_id: '',
    type: '1',
    purpose: '',
    description: '',
    main_image: '',
    images: '',
    is_certified: false,
  });

  useEffect(() => {
    const t = localStorage.getItem('merchant_token');
    if (!t) { router.push('/merchant/login'); return; }
    setToken(t);
    loadCategories();
  }, [router]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.data || data.list || []);
    } catch (e) {
      console.error('加载分类失败:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price) || 0,
        original_price: parseFloat(form.original_price) || undefined,
        stock: parseInt(form.stock) || 0,
        category_id: parseInt(form.category_id) || undefined,
        type: parseInt(form.type) || 1,
        status: 1,
      };

      const res = await fetch('/api/merchant/goods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success !== false) {
        alert('商品发布成功！');
        router.push('/merchant/goods');
      } else {
        alert(data.error || '发布失败');
      }
    } catch (e) {
      alert('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/merchant/goods')} className="text-muted-foreground hover:text-foreground">← 返回</button>
          <h1 className="font-bold text-foreground text-lg">发布商品</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 基本信息 */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-foreground text-base border-b border-border pb-3">基本信息</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">商品名称 *</label>
              <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)}
                placeholder="请输入商品名称" required
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">副标题</label>
              <input type="text" value={form.subtitle} onChange={e => updateForm('subtitle', e.target.value)}
                placeholder="简短描述商品特点"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">售价 *</label>
                <input type="number" step="0.01" value={form.price} onChange={e => updateForm('price', e.target.value)}
                  placeholder="0.00" required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">原价</label>
                <input type="number" step="0.01" value={form.original_price} onChange={e => updateForm('original_price', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">库存 *</label>
                <input type="number" value={form.stock} onChange={e => updateForm('stock', e.target.value)}
                  placeholder="0" required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">分类</label>
                <select value={form.category_id} onChange={e => updateForm('category_id', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition">
                  <option value="">选择分类</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">商品类型</label>
                <select value={form.type} onChange={e => updateForm('type', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition">
                  <option value="1">实体商品</option>
                  <option value="2">虚拟商品</option>
                  <option value="3">服务类</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">用途</label>
                <input type="text" value={form.purpose} onChange={e => updateForm('purpose', e.target.value)}
                  placeholder="如：镇宅、招财"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition" />
              </div>
            </div>
          </div>

          {/* 主图上传 */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-base">主图</h2>
            <p className="text-sm text-muted-foreground">第一张图片将作为商品主图，建议尺寸 800x800，支持 JPG/PNG/WebP</p>
            <SingleImageUpload
              value={form.main_image}
              onChange={(url) => updateForm('main_image', url)}
              folder="merchant/goods"
            />
          </div>

          {/* 商品描述 - 富文本编辑器 */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-base">商品描述</h2>
            <RichTextEditor
              value={form.description}
              onChange={(html) => updateForm('description', html)}
              placeholder="详细描述商品信息..."
            />
          </div>

          {/* 其他选项 */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-base">其他选项</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_certified} onChange={e => updateForm('is_certified', e.target.checked)}
                className="w-4 h-4 rounded border-border" />
              <span className="text-sm text-foreground">认证商品（开光/加持认证）</span>
            </label>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.push('/merchant/goods')}
              className="px-6 py-3 border border-border rounded-lg text-muted-foreground hover:bg-muted transition">
              取消
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50">
              {submitting ? '发布中...' : '发布商品'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
