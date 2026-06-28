'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface GoodsForm {
  name: string;
  subtitle: string;
  price: string;
  original_price: string;
  stock: string;
  category_id: string;
  type: number;
  purpose: string;
  images: string[];
  content: string;
  is_certified: boolean;
  status: number;
}

export default function MerchantGoodsEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<GoodsForm>({
    name: '',
    subtitle: '',
    price: '',
    original_price: '',
    stock: '',
    category_id: '',
    type: 1,
    purpose: '',
    images: [],
    content: '',
    is_certified: false,
    status: 1,
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('merchant_token');
    if (!t) { router.push('/merchant/login'); return; }
    setToken(t);
    loadCategories();
    loadGoods(id, t);
  }, [id, router]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success !== false) {
        setCategories(data.data || data.list || []);
      }
    } catch (e) {
      console.error('加载分类失败:', e);
    }
  };

  const loadGoods = async (goodsId: string, t: string) => {
    try {
      const res = await fetch(`/api/merchant/goods?id=${goodsId}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success !== false && data.data) {
        const g = data.data;
        // Parse images: could be JSON array or comma-separated string
        let imageList: string[] = [];
        if (Array.isArray(g.images)) {
          imageList = g.images;
        } else if (typeof g.images === 'string' && g.images) {
          try {
            imageList = JSON.parse(g.images);
          } catch {
            imageList = g.images.split(',').filter(Boolean);
          }
        }
        // If main_image exists but not in images array, prepend it
        if (g.main_image && !imageList.includes(g.main_image)) {
          imageList = [g.main_image, ...imageList];
        }

        setForm({
          name: g.name || '',
          subtitle: g.subtitle || '',
          price: String(g.price ?? ''),
          original_price: String(g.original_price ?? ''),
          stock: String(g.stock ?? 0),
          category_id: String(g.category_id ?? ''),
          type: g.type ?? 1,
          purpose: g.purpose || '',
          images: imageList,
          content: g.content || g.detail || '',
          is_certified: !!g.is_certified,
          status: g.status ?? 1,
        });
      }
    } catch (e) {
      console.error('加载商品失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert('请输入商品名称');
    if (!form.price || Number(form.price) < 0) return alert('请输入有效售价');

    setSubmitting(true);
    try {
      const res = await fetch(`/api/merchant/goods?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          main_image: form.images[0] || '',
          price: Number(form.price),
          original_price: form.original_price ? Number(form.original_price) : null,
          stock: Number(form.stock),
          category_id: form.category_id ? Number(form.category_id) : null,
        }),
      });
      const data = await res.json();
      if (data.success === false) throw new Error(data.error || '更新失败');
      alert('商品已更新');
      router.push('/merchant/goods');
    } catch (e: any) {
      alert(e.message || '更新失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/merchant/goods')} className="text-muted-foreground hover:text-foreground text-sm">← 返回</button>
          <h1 className="font-bold text-lg text-foreground">编辑商品</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 基本信息 */}
        <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="font-bold text-base mb-5 pb-3 border-b border-border">基本信息</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                商品名称 <span className="text-destructive">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="请输入商品名称"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">副标题</label>
              <input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="简短描述商品特点"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  售价 <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">原价</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.original_price}
                  onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  库存 <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">分类</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">选择分类</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">商品类型</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value={1}>实体商品</option>
                  <option value={2}>虚拟商品</option>
                  <option value={3}>服务</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">用途</label>
                <input
                  value={form.purpose}
                  onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                  placeholder="如：镇宅、招财"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 商品图片 */}
        <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="font-bold text-base mb-4">商品图片</h2>
          <p className="text-sm text-muted-foreground mb-3">第一张图片将作为商品主图，建议尺寸 800x800，支持 JPG/PNG/WebP，最多上传 9 张</p>
          <ImageUpload
            value={form.images}
            onChange={(urls) => setForm((f) => ({ ...f, images: urls }))}
            maxCount={9}
            folder="merchant/goods"
          />
        </section>

        {/* 商品描述 */}
        <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="font-bold text-base mb-4">商品描述</h2>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            placeholder="详细描述商品信息..."
          />
        </section>

        {/* 其他选项 */}
        <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="font-bold text-base mb-4">其他选项</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_certified}
                onChange={(e) => setForm((f) => ({ ...f, is_certified: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">认证商品（开光/加持认证）</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.status === 1}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? 1 : 0 }))}
                className="rounded"
              />
              <span className="text-sm">立即上架</span>
            </label>
          </div>
        </section>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => router.push('/merchant/goods')}
            className="px-6 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            {submitting ? '保存中...' : '保存修改'}
          </button>
        </div>
      </main>
    </div>
  );
}
