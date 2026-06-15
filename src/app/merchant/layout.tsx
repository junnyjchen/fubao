'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
  { href: '/merchant', label: '工作台', icon: '📊' },
  { href: '/merchant/goods', label: '商品管理', icon: '📦' },
  { href: '/merchant/orders', label: '订单管理', icon: '📋' },
  { href: '/merchant/profile', label: '店铺设置', icon: '⚙️' },
];

export default function MerchantLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [merchant, setMerchant] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoginPage = pathname === '/merchant/login';

  useEffect(() => {
    // 登录页面不需要检查认证
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('merchant_token');
    const stored = localStorage.getItem('merchant_info');
    if (!token || !stored) {
      router.replace('/merchant/login');
      return;
    }
    try {
      setMerchant(JSON.parse(stored));
    } catch {
      router.replace('/merchant/login');
      return;
    }
    setLoading(false);
  }, [router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('merchant_info');
    router.replace('/merchant/login');
  };

  // 登录页面直接渲染，不带布局
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <Link href="/merchant" className="text-lg font-bold text-amber-700">
            符寶網商家中心
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="text-sm text-gray-600 mb-2 truncate">
            {merchant?.name || '商家'}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-500 hover:text-red-700 px-2 py-1"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
