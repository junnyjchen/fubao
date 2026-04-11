/**
 * @fileoverview 百科内容管理页面
 * @description 玄门文化百科内容管理，支持分类、文章管理
 * @module app/admin/wiki/page
 */

'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  FolderTree,
  FileText,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

/** 百科分类类型 */
interface WikiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  sort_order: number;
  article_count?: number;
}

/** 百科文章类型 */
interface WikiArticle {
  id: number;
  title: string;
  slug: string;
  category_id: number;
  summary: string | null;
  content: string;
  cover_image: string | null;
  author: string;
  view_count: number;
  is_published: boolean;
  is_featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: WikiCategory;
}

/** 表单数据类型 */
interface ArticleForm {
  title: string;
  slug: string;
  category_id: string;
  summary: string;
  content: string;
  cover_image: string;
  author: string;
  is_published: boolean;
  is_featured: boolean;
  tags: string;
}

/** 初始表单数据 */
const initialForm: ArticleForm = {
  title: '',
  slug: '',
  category_id: '',
  summary: '',
  content: '',
  cover_image: '',
  author: '符寶網編輯部',
  is_published: false,
  is_featured: false,
  tags: '',
};

/** 分类表单数据类型 */
interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  sort_order: number;
}

/** 初始分类表单 */
const initialCategoryForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  parent_id: '',
  sort_order: 0,
};

/**
 * 百科内容管理页面组件
 * @returns 百科管理页面
 */
export default function WikiPage() {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [articleForm, setArticleForm] = useState<ArticleForm>(initialForm);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(initialCategoryForm);
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');

  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        fetch('/api/wiki/articles'),
        fetch('/api/wiki/categories'),
      ]);

      const [articlesData, categoriesData] = await Promise.all([
        articlesRes.json(),
        categoriesRes.json(),
      ]);

      setArticles(articlesData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('加載數據失敗:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 筛选文章列表
   */
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || article.category_id.toString() === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && article.is_published) ||
      (statusFilter === 'draft' && !article.is_published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  /**
   * 生成URL slug
   */
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  /**
   * 打开新增文章对话框
   */
  const handleAddArticle = () => {
    setEditingArticleId(null);
    setArticleForm(initialForm);
    setArticleDialogOpen(true);
  };

  /**
   * 打开编辑文章对话框
   */
  const handleEditArticle = (article: WikiArticle) => {
    setEditingArticleId(article.id);
    setArticleForm({
      title: article.title,
      slug: article.slug,
      category_id: article.category_id.toString(),
      summary: article.summary || '',
      content: article.content,
      cover_image: article.cover_image || '',
      author: article.author,
      is_published: article.is_published,
      is_featured: article.is_featured,
      tags: article.tags?.join(', ') || '',
    });
    setArticleDialogOpen(true);
  };

  /**
   * 删除文章
   */
  const handleDeleteArticle = async (id: number) => {
    if (!confirm('確定要刪除此文章嗎？')) return;

    try {
      const res = await fetch(`/api/wiki/articles/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('文章已刪除');
        setArticles((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      toast.error('刪除失敗');
    }
  };

  /**
   * 提交文章表单
   */
  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!articleForm.title || !articleForm.category_id) {
      toast.error('請填寫完整信息');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: articleForm.title,
        slug: articleForm.slug || generateSlug(articleForm.title),
        category_id: parseInt(articleForm.category_id),
        summary: articleForm.summary,
        content: articleForm.content,
        cover_image: articleForm.cover_image || null,
        author: articleForm.author,
        is_published: articleForm.is_published,
        is_featured: articleForm.is_featured,
        tags: articleForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const url = editingArticleId
        ? `/api/wiki/articles/${editingArticleId}`
        : '/api/wiki/articles';
      const method = editingArticleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.message || data.data) {
        toast.success(editingArticleId ? '文章已更新' : '文章已創建');
        setArticleDialogOpen(false);
        loadData();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('提交失敗:', error);
      toast.error('操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 打开新增分类对话框
   */
  const handleAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm(initialCategoryForm);
    setCategoryDialogOpen(true);
  };

  /**
   * 打开编辑分类对话框
   */
  const handleEditCategory = (category: WikiCategory) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id?.toString() || '',
      sort_order: category.sort_order,
    });
    setCategoryDialogOpen(true);
  };

  /**
   * 删除分类
   */
  const handleDeleteCategory = async (id: number) => {
    const hasArticles = articles.some((a) => a.category_id === id);
    if (hasArticles) {
      toast.error('該分類下有文章，無法刪除');
      return;
    }

    if (!confirm('確定要刪除此分類嗎？')) return;

    try {
      const res = await fetch(`/api/wiki/categories/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('分類已刪除');
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      toast.error('刪除失敗');
    }
  };

  /**
   * 提交分类表单
   */
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryForm.name) {
      toast.error('請填寫分類名稱');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: categoryForm.name,
        slug: categoryForm.slug || generateSlug(categoryForm.name),
        description: categoryForm.description,
        parent_id: categoryForm.parent_id ? parseInt(categoryForm.parent_id) : null,
        sort_order: categoryForm.sort_order,
      };

      const url = editingCategoryId
        ? `/api/wiki/categories/${editingCategoryId}`
        : '/api/wiki/categories';
      const method = editingCategoryId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.message || data.data) {
        toast.success(editingCategoryId ? '分類已更新' : '分類已創建');
        setCategoryDialogOpen(false);
        loadData();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('提交失敗:', error);
      toast.error('操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 获取根分类列表
   */
  const rootCategories = categories.filter((c) => !c.parent_id);

  return (
    <AdminLayout title="百科管理" description="玄門文化百科內容管理">
      {/* Tab切换 */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'articles' ? 'default' : 'outline'}
          onClick={() => setActiveTab('articles')}
        >
          <FileText className="w-4 h-4 mr-2" />
          文章管理
        </Button>
        <Button
          variant={activeTab === 'categories' ? 'default' : 'outline'}
          onClick={() => setActiveTab('categories')}
        >
          <FolderTree className="w-4 h-4 mr-2" />
          分類管理
        </Button>
      </div>

      {/* 文章管理 */}
      {activeTab === 'articles' && (
        <>
          {/* 操作栏 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索文章標題..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="全部分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分類</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="published">已發布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button onClick={handleAddArticle}>
                <Plus className="w-4 h-4 mr-2" />
                新增文章
              </Button>
            </div>
          </div>

          {/* 文章列表 */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">載入中...</div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">暫無文章數據</p>
                  <Button className="mt-4" onClick={handleAddArticle}>
                    創建第一篇文章
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>標題</TableHead>
                        <TableHead>分類</TableHead>
                        <TableHead>作者</TableHead>
                        <TableHead>瀏覽量</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>更新時間</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {article.is_featured && (
                                <Badge className="bg-amber-100 text-amber-700">
                                  置頂
                                </Badge>
                              )}
                              <span className="font-medium truncate max-w-[200px]">
                                {article.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {article.category?.name || '未分類'}
                            </Badge>
                          </TableCell>
                          <TableCell>{article.author}</TableCell>
                          <TableCell>{article.view_count}</TableCell>
                          <TableCell>
                            {article.is_published ? (
                              <Badge className="bg-green-100 text-green-600">已發布</Badge>
                            ) : (
                              <Badge variant="secondary">草稿</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(article.updated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                              >
                                <a href={`/wiki/${article.slug}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-4 h-4" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditArticle(article)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDeleteArticle(article.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 分类管理 */}
      {activeTab === 'categories' && (
        <>
          <div className="flex justify-end mb-6">
            <Button onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-2" />
              新增分類
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">載入中...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <FolderTree className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">暫無分類數據</p>
                  <Button className="mt-4" onClick={handleAddCategory}>
                    創建第一個分類
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>分類名稱</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead>文章數</TableHead>
                        <TableHead>排序</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rootCategories.map((category) => (
                        <>
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                {category.name}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {category.slug}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {category.description || '-'}
                            </TableCell>
                            <TableCell>
                              {articles.filter((a) => a.category_id === category.id).length}
                            </TableCell>
                            <TableCell>{category.sort_order}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteCategory(category.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {/* 子分类 */}
                          {categories
                            .filter((c) => c.parent_id === category.id)
                            .map((subCategory) => (
                              <TableRow key={subCategory.id} className="bg-muted/30">
                                <TableCell className="font-medium pl-8">
                                  <div className="flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                    {subCategory.name}
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {subCategory.slug}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {subCategory.description || '-'}
                                </TableCell>
                                <TableCell>
                                  {articles.filter((a) => a.category_id === subCategory.id).length}
                                </TableCell>
                                <TableCell>{subCategory.sort_order}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditCategory(subCategory)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive"
                                      onClick={() => handleDeleteCategory(subCategory.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 文章编辑对话框 */}
      <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArticleId ? '編輯文章' : '新增文章'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleArticleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>文章標題 *</Label>
                <Input
                  value={articleForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setArticleForm((prev) => ({
                      ...prev,
                      title,
                      slug: prev.slug || generateSlug(title),
                    }));
                  }}
                  placeholder="輸入文章標題"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>URL Slug</Label>
                <Input
                  value={articleForm.slug}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>所屬分類 *</Label>
                <Select
                  value={articleForm.category_id}
                  onValueChange={(v) => setArticleForm((prev) => ({ ...prev, category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>作者</Label>
                <Input
                  value={articleForm.author}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, author: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>摘要</Label>
              <Textarea
                value={articleForm.summary}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="文章摘要（選填）"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>正文內容</Label>
              <RichTextEditor
                value={articleForm.content}
                onChange={(content) => setArticleForm((prev) => ({ ...prev, content }))}
                placeholder="支持富文本格式"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>封面圖片</Label>
                <Input
                  value={articleForm.cover_image}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, cover_image: e.target.value }))}
                  placeholder="圖片URL"
                />
              </div>
              <div className="space-y-2">
                <Label>標籤</Label>
                <Input
                  value={articleForm.tags}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="多個標籤用逗號分隔"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={articleForm.is_published}
                  onCheckedChange={(v) => setArticleForm((prev) => ({ ...prev, is_published: v }))}
                />
                <Label>發布</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={articleForm.is_featured}
                  onCheckedChange={(v) => setArticleForm((prev) => ({ ...prev, is_featured: v }))}
                />
                <Label>置頂</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setArticleDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '提交中...' : editingArticleId ? '保存' : '創建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 分类编辑对话框 */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? '編輯分類' : '新增分類'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>分類名稱 *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCategoryForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug || generateSlug(name),
                  }));
                }}
                placeholder="輸入分類名稱"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="url-slug"
              />
            </div>

            <div className="space-y-2">
              <Label>父級分類</Label>
              <Select
                value={categoryForm.parent_id}
                onValueChange={(v) => setCategoryForm((prev) => ({ ...prev, parent_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="無（頂級分類）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">無（頂級分類）</SelectItem>
                  {rootCategories
                    .filter((c) => c.id !== editingCategoryId)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="分類描述（選填）"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>排序</Label>
              <Input
                type="number"
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '提交中...' : editingCategoryId ? '保存' : '創建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
