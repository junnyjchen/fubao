'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MerchantProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', email: '', address: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('merchant_token');
    if (!t) { router.push('/merchant/login'); return; }
    setToken(t);
    loadProfile(t);
  }, [router]);

  const loadProfile = async (t: string) => {
    try {
      const res = await fetch('/api/merchant/profile', { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (data.data) {
        setProfile(data.data);
        setForm({
          name: data.data.name || '',
          contact_name: data.data.contact_name || data.data.contact || '',
          phone: data.data.phone || '',
          email: data.data.email || '',
          address: data.data.address || '',
          description: data.data.description || '',
        });
      }
    } catch (e) {
      console.error('加载商家信息失败:', e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/merchant/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success !== false) {
        setProfile((prev: any) => ({ ...prev, ...form }));
        setEditing(false);
        alert('保存成功');
      }
    } catch (e) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('merchant_token');
    router.push('/merchant/login');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/merchant')} className="text-muted-foreground hover:text-foreground">← 返回</button>
            <h1 className="font-bold text-foreground text-lg">商家信息</h1>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">
              编辑
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-card rounded-xl border border-border p-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">商家名称</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">联系人</label>
                <input type="text" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">手机</label>
                  <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">邮箱</label>
                  <input type="text" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">地址</label>
                <input type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">简介</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setEditing(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">取消</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition disabled:opacity-50">
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">🏪</div>
                <div>
                  <h2 className="font-bold text-foreground text-xl">{profile.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${profile.status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {profile.status === 1 ? '营业中' : '审核中'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">联系人:</span> <span className="text-foreground ml-2">{profile.contact_name || profile.contact || '-'}</span></div>
                <div><span className="text-muted-foreground">手机:</span> <span className="text-foreground ml-2">{profile.phone || '-'}</span></div>
                <div><span className="text-muted-foreground">邮箱:</span> <span className="text-foreground ml-2">{profile.email || '-'}</span></div>
                <div><span className="text-muted-foreground">地址:</span> <span className="text-foreground ml-2">{profile.address || '-'}</span></div>
              </div>
              {profile.description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-muted-foreground text-sm">简介:</span>
                  <p className="text-foreground mt-1">{profile.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <button onClick={handleLogout}
            className="w-full py-3 border border-destructive/30 text-destructive rounded-lg text-sm hover:bg-destructive/10 transition">
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
