/**
 * @fileoverview 管理后台 - 百科管理
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { SingleImageUpload } from '@/components/upload/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  cover_image: string;
  status: number;
  views: number;
  created_at: string;
}

const CATEGORIES = ['符咒', '法器', '风水', '周易', '道教', '佛教', '其他'];

export default function AdminBaikePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<Article | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: '符咒',
    cover_image: '',
    status: 1,
  });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (keyword) params.set('keyword', keyword);
      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();
      setArticles(Array.isArray(data.data) ? data.data : []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', slug: '', summary: '', content: '', category: '符咒', cover_image: '', status: 1 });
    setDialogOpen(true);
  };

  const openEdit = (article: Article) => {
    setEditing(article);
    setForm({
      title: article.title,
      slug: article.slug,
      summary: article.summary || '',
      content: article.content || '',
      category: article.category || '符咒',
      cover_image: article.cover_image || '',
      status: article.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      // Auto-generate slug
      if (!form.slug) {
        form.slug = form.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      }
      if (editing) {
        await fetch(`/api/articles`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
      } else {
        await fetch(`/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setDialogOpen(false);
      fetchArticles();
    } catch (err) {
      console.error('保存失败:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要删除此文嗎？')) return;
    await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
    fetchArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">百科管理</h1>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-1" /> 新增文章
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="搜索文章..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm">標題</th>
                <th className="px-4 py-3 text-left text-sm">分類</th>
                <th className="px-4 py-3 text-left text-sm">狀態</th>
                <th className="px-4 py-3 text-left text-sm">瀏覽</th>
                <th className="px-4 py-3 text-right text-sm">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.map(article => (
                <tr key={article.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{article.title}</div>
                    <div className="text-xs text-muted-foreground">/{article.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{article.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${article.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {article.status === 1 ? '已發布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{article.views}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(article)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">暫無百科文章</div>
          )}
        </div>
      )}

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? '編輯文章' : '新增文章'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">標題</label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="文章標題"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">分類</label>
                <select
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">封面圖</label>
              <SingleImageUpload
                value={form.cover_image}
                onChange={url => setForm(f => ({ ...f, cover_image: url }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">摘要</label>
              <Input
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                placeholder="文章摘要"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">正文内容</label>
              <RichTextEditor
                value={form.content}
                onChange={html => setForm(f => ({ ...f, content: html }))}
                onImageUpload={async (file) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('folder', 'baike');
                  const res = await fetch('/api/upload', { method: 'POST', body: formData });
                  const result = await res.json();
                  if (result.success && result.data?.key) {
                    return `/api/file/${result.data.key}`;
                  }
                  throw new Error('上傳失敗');
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.status === 1}
                  onChange={e => setForm(f => ({ ...f, status: e.target.checked ? 1 : 0 }))}
                />
                發布
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
