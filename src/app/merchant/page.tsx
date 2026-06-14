'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MerchantDashboard() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [stats, setStats] = useState({ goodsCount: 0, orderCount: 0, totalSales: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('merchant_token');
    const info = localStorage.getItem('merchant_info');
    if (!token || !info) {
      router.push('/merchant/login');
      return;
    }
    setMerchant(JSON.parse(info));
    loadStats(token);
  }, [router]);

  const loadStats = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [goodsRes, ordersRes] = await Promise.all([
        fetch('/api/merchant/goods', { headers }),
        fetch('/api/merchant/orders', { headers }),
      ]);
      const goodsData = await goodsRes.json();
      const ordersData = await ordersRes.json();
      setStats({
        goodsCount: goodsData.total || 0,
        orderCount: ordersData.total || 0,
        totalSales: 0,
      });
    } catch (e) {
      console.error('加载统计失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('merchant_info');
    router.push('/merchant/login');
  };

  if (!merchant) return null;

  const menuItems = [
    { icon: '📦', label: '商品管理', href: '/merchant/goods', desc: `共 ${stats.goodsCount} 件商品` },
    { icon: '📋', label: '订单管理', href: '/merchant/orders', desc: `共 ${stats.orderCount} 笔订单` },
    { icon: '🏪', label: '店铺设置', href: '/merchant/profile', desc: '修改店铺信息' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏪</span>
            <div>
              <h1 className="font-bold text-foreground text-lg">{merchant.name}</h1>
              <p className="text-xs text-muted-foreground">商家管理中心</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{merchant.contact_name || merchant.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: '商品数量', value: stats.goodsCount, icon: '📦', color: 'bg-blue-50 text-blue-700' },
            { label: '订单数量', value: stats.orderCount, icon: '📋', color: 'bg-green-50 text-green-700' },
            { label: '商家状态', value: merchant.status === 1 ? '营业中' : '待审核', icon: merchant.status === 1 ? '✅' : '⏳', color: merchant.status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => router.push(item.href)}
              className="bg-card rounded-xl border border-border p-6 text-left hover:shadow-md hover:border-primary/30 transition group"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition">{item.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
