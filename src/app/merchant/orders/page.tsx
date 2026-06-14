'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  order_no: string;
  user_id: number;
  status: number;
  total_amount: number;
  created_at: string;
  items?: any[];
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待付款', color: 'bg-amber-50 text-amber-700' },
  1: { label: '待发货', color: 'bg-blue-50 text-blue-700' },
  2: { label: '已发货', color: 'bg-indigo-50 text-indigo-700' },
  3: { label: '已完成', color: 'bg-emerald-50 text-emerald-700' },
  4: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
  5: { label: '退款中', color: 'bg-red-50 text-red-700' },
};

export default function MerchantOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('merchant_token');
    if (!t) { router.push('/merchant/login'); return; }
    setToken(t);
    loadOrders(t);
  }, [router]);

  const loadOrders = async (t: string) => {
    try {
      const res = await fetch('/api/merchant/orders', { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      setOrders(data.data || data.list || []);
    } catch (e) {
      console.error('加载订单失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: number) => {
    try {
      await fetch(`/api/merchant/orders?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (e) {
      console.error('更新状态失败:', e);
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/merchant')} className="text-muted-foreground hover:text-foreground">← 返回</button>
          <h1 className="font-bold text-foreground text-lg">订单管理</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-muted-foreground">暂无订单</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const st = statusMap[order.status] || { label: '未知', color: 'bg-gray-100 text-gray-500' };
              return (
                <div key={order.id} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">订单号: {order.order_no || order.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{order.created_at || ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-primary text-lg">¥{order.total_amount || 0}</div>
                    <div className="flex gap-2">
                      {order.status === 1 && (
                        <button onClick={() => updateStatus(order.id, 2)}
                          className="px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
                          发货
                        </button>
                      )}
                      {order.status === 2 && (
                        <button onClick={() => updateStatus(order.id, 3)}
                          className="px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
                          确认完成
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
