'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GoodsItem {
  id: number;
  name: string;
  subtitle?: string;
  main_image?: string;
  price: number;
  original_price?: number;
  stock: number;
  sales?: number;
  status: number;
  category_id?: number;
  is_certified?: boolean;
  type?: number;
  purpose?: string;
  created_at?: string;
}

export default function MerchantGoodsPage() {
  const router = useRouter();
  const [goods, setGoods] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('merchant_token');
    if (!t) { router.push('/merchant/login'); return; }
    setToken(t);
    loadGoods(t);
  }, [router]);

  const loadGoods = async (t: string) => {
    try {
      const res = await fetch('/api/merchant/goods', { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (data.success !== false) {
        setGoods(data.data || data.list || []);
      }
    } catch (e) {
      console.error('加载商品失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await fetch(`/api/merchant/goods?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      setGoods(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
    } catch (e) {
      console.error('更新状态失败:', e);
    }
  };

  const deleteGoods = async (id: number) => {
    if (!confirm('确定删除此商品？')) return;
    try {
      await fetch(`/api/merchant/goods?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoods(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      console.error('删除商品失败:', e);
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
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/merchant')} className="text-muted-foreground hover:text-foreground">← 返回</button>
            <h1 className="font-bold text-foreground text-lg">商品管理</h1>
          </div>
          <button
            onClick={() => router.push('/merchant/goods/new')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
          >
            + 发布商品
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {goods.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-muted-foreground mb-4">还没有商品，快来发布第一个吧！</p>
            <button
              onClick={() => router.push('/merchant/goods/new')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
            >
              发布商品
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goods.map(item => (
              <div key={item.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  {item.main_image ? <img src={item.main_image} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : '🏷️'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="text-primary font-bold">¥{item.price}</span>
                    {item.original_price && <span className="line-through">¥{item.original_price}</span>}
                    <span>库存: {item.stock}</span>
                    <span>销量: {item.sales || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.status === 1 ? '上架' : '下架'}
                  </span>
                  <button
                    onClick={() => router.push(`/merchant/goods/${item.id}`)}
                    className="px-3 py-1.5 text-xs border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => toggleStatus(item.id, item.status)}
                    className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition"
                  >
                    {item.status === 1 ? '下架' : '上架'}
                  </button>
                  <button
                    onClick={() => deleteGoods(item.id)}
                    className="px-3 py-1.5 text-xs border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
