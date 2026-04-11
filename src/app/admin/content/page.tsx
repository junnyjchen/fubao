/**
 * @fileoverview 后台内容管理页面
 * @description 管理文章和新闻内容，支持增删改查
 * @module app/admin/content/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Newspaper,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/** 文章数据类型 */
interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover: string;
  category_id: number;
  author: string;
  status: boolean;
  is_featured: boolean;
  sort: number;
  views: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

/** 新闻数据类型 */
interface News {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover: string;
  type: number;
  author: string;
  status: boolean;
  is_featured: boolean;
  sort: number;
  views: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

/** 分页信息 */
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 新闻类型映射 */
const newsTypes: Record<number, string> = {
  0: '平台公告',
  1: '行業資訊',
  2: '玄門文化',
};

/** 文章分类映射 */
const articleCategories: Record<number, string> = {
  1: '符籙知識',
  2: '法器介紹',
  3: '玄門典故',
  4: '修行心得',
};

/**
 * 后台内容管理页面组件
 * @returns 内容管理页面
 */
export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 分页状态
  const [articlePagination, setArticlePagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [newsPagination, setNewsPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // 编辑弹窗状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Article | News | null>(null);
  const [editType, setEditType] = useState<'article' | 'news'>('article');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    cover: '',
    category_id: 1,
    type: 0,
    status: true,
    is_featured: false,
    sort: 0,
  });

  /**
   * 加载文章列表
   */
  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(articlePagination.page),
        limit: String(articlePagination.limit),
        status: statusFilter,
        search: searchQuery,
      });

      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();

      setArticles(data.data || []);
      setArticlePagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      }));
    } catch (error) {
      console.error('加載文章失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [articlePagination.page, articlePagination.limit, statusFilter, searchQuery]);

  /**
   * 加载新闻列表
   */
  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(newsPagination.page),
        limit: String(newsPagination.limit),
        status: statusFilter,
        search: searchQuery,
      });

      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();

      setNews(data.data || []);
      setNewsPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      }));
    } catch (error) {
      console.error('加載新聞失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [newsPagination.page, newsPagination.limit, statusFilter, searchQuery]);

  useEffect(() => {
    if (activeTab === 'articles') {
      loadArticles();
    } else {
      loadNews();
    }
  }, [activeTab, loadArticles, loadNews]);

  /**
   * 打开编辑弹窗
   * @param item - 要编辑的项目
   * @param type - 项目类型
   */
  const handleEdit = (item: Article | News, type: 'article' | 'news') => {
    setEditItem(item);
    setEditType(type);
    setFormData({
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      content: item.content || '',
      cover: item.cover || '',
      category_id: (item as Article).category_id || 1,
      type: (item as News).type || 0,
      status: item.status,
      is_featured: item.is_featured,
      sort: item.sort || 0,
    });
    setEditDialogOpen(true);
  };

  /**
   * 打开新增弹窗
   */
  const handleCreate = () => {
    setEditItem(null);
    setEditType(activeTab === 'articles' ? 'article' : 'news');
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      cover: '',
      category_id: 1,
      type: 0,
      status: true,
      is_featured: false,
      sort: 0,
    });
    setEditDialogOpen(true);
  };

  /**
   * 保存内容
   */
  const handleSave = async () => {
    try {
      const apiPath = editType === 'article' ? '/api/articles' : '/api/news';
      const method = editItem ? 'PUT' : 'POST';
      const id = editItem ? editItem.id : '';

      const body = editType === 'article' 
        ? {
            ...formData,
            category_id: formData.category_id,
          }
        : {
            ...formData,
            type: formData.type,
          };

      const res = await fetch(
        editItem ? `${apiPath}/${id}` : apiPath,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (data.message) {
        setEditDialogOpen(false);
        if (editType === 'article') {
          loadArticles();
        } else {
          loadNews();
        }
      } else {
        alert(data.error || '保存失敗');
      }
    } catch (error) {
      console.error('保存失敗:', error);
      alert('保存失敗');
    }
  };

  /**
   * 删除内容
   * @param id - 内容ID
   * @param type - 内容类型
   */
  const handleDelete = async (id: number, type: 'article' | 'news') => {
    if (!confirm('確定要刪除嗎？此操作不可恢復。')) return;

    try {
      const apiPath = type === 'article' ? '/api/articles' : '/api/news';
      const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.message) {
        if (type === 'article') {
          loadArticles();
        } else {
          loadNews();
        }
      } else {
        alert(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗');
    }
  };

  /**
   * 切换状态
   * @param id - 内容ID
   * @param type - 内容类型
   * @param status - 当前状态
   */
  const handleToggleStatus = async (
    id: number,
    type: 'article' | 'news',
    status: boolean
  ) => {
    try {
      const apiPath = type === 'article' ? '/api/articles' : '/api/news';
      const res = await fetch(`${apiPath}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !status }),
      });

      const data = await res.json();

      if (data.message) {
        if (type === 'article') {
          loadArticles();
        } else {
          loadNews();
        }
      }
    } catch (error) {
      console.error('狀態切換失敗:', error);
    }
  };

  return (
    <AdminLayout title="內容管理" description="管理文章和新聞內容">
      <div className="space-y-6">
        {/* 工具栏 */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索標題..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部狀態</SelectItem>
                <SelectItem value="true">已發布</SelectItem>
                <SelectItem value="false">草稿</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            新增內容
          </Button>
        </div>

        {/* 内容标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              文章管理
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              新聞管理
            </TabsTrigger>
          </TabsList>

          {/* 文章列表 */}
          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <CardTitle>文章列表</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    載入中...
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暫無文章
                  </div>
                ) : (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                      >
                        {article.cover && (
                          <img
                            src={article.cover}
                            alt={article.title}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{article.title}</h3>
                            {article.is_featured && (
                              <Badge variant="secondary">推薦</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {article.summary || '暫無摘要'}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>
                              分類: {articleCategories[article.category_id] || '未分類'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views}
                            </span>
                            <span>
                              {new Date(article.published_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={article.status ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() =>
                              handleToggleStatus(article.id, 'article', article.status)
                            }
                          >
                            {article.status ? '已發布' : '草稿'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(article, 'article')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(article.id, 'article')}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 分页 */}
                {articlePagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      共 {articlePagination.total} 篇文章
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={articlePagination.page <= 1}
                        onClick={() =>
                          setArticlePagination(prev => ({ ...prev, page: prev.page - 1 }))
                        }
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        {articlePagination.page} / {articlePagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={articlePagination.page >= articlePagination.totalPages}
                        onClick={() =>
                          setArticlePagination(prev => ({ ...prev, page: prev.page + 1 }))
                        }
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 新闻列表 */}
          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>新聞列表</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    載入中...
                  </div>
                ) : news.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暫無新聞
                  </div>
                ) : (
                  <div className="space-y-4">
                    {news.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                      >
                        {item.cover && (
                          <img
                            src={item.cover}
                            alt={item.title}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{item.title}</h3>
                            {item.is_featured && (
                              <Badge variant="secondary">推薦</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.summary || '暫無摘要'}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>類型: {newsTypes[item.type] || '其他'}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.views}
                            </span>
                            <span>
                              {new Date(item.published_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={item.status ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() =>
                              handleToggleStatus(item.id, 'news', item.status)
                            }
                          >
                            {item.status ? '已發布' : '草稿'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item, 'news')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id, 'news')}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 分页 */}
                {newsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      共 {newsPagination.total} 條新聞
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={newsPagination.page <= 1}
                        onClick={() =>
                          setNewsPagination(prev => ({ ...prev, page: prev.page - 1 }))
                        }
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        {newsPagination.page} / {newsPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={newsPagination.page >= newsPagination.totalPages}
                        onClick={() =>
                          setNewsPagination(prev => ({ ...prev, page: prev.page + 1 }))
                        }
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem ? '編輯內容' : '新增內容'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">標題 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="請輸入標題"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL別名</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="自動生成或自定義"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                placeholder="請輸入摘要"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover">封面圖片URL</Label>
              <Input
                id="cover"
                value={formData.cover}
                onChange={(e) =>
                  setFormData({ ...formData, cover: e.target.value })
                }
                placeholder="請輸入圖片URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">正文內容</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="請輸入正文內容"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {editType === 'article' ? (
                <div className="space-y-2">
                  <Label>文章分類</Label>
                  <Select
                    value={String(formData.category_id)}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category_id: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(articleCategories).map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>新聞類型</Label>
                  <Select
                    value={String(formData.type)}
                    onValueChange={(v) =>
                      setFormData({ ...formData, type: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇類型" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(newsTypes).map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sort">排序</Label>
                <Input
                  id="sort"
                  type="number"
                  value={formData.sort}
                  onChange={(e) =>
                    setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
                  }
                  placeholder="數字越小越靠前"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, status: checked })
                  }
                />
                <Label htmlFor="status">發布</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked })
                  }
                />
                <Label htmlFor="is_featured">推薦</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!formData.title}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
