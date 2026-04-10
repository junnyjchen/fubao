'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAdminData } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Loader2, Plus, Edit, Trash2, Save, Play, Pause, Eye, CheckCircle, XCircle, RefreshCw, Zap, Globe, Clock, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// AI提供商配置
const AI_PROVIDERS = [
  { id: 'doubao', name: '豆包 (Doubao)', models: [
    { id: 'doubao-seed-2-0-pro-260215', name: 'Seed 2.0 Pro' },
    { id: 'doubao-seed-2-0-lite-260215', name: 'Seed 2.0 Lite' },
    { id: 'doubao-seed-2-0-mini-260215', name: 'Seed 2.0 Mini' },
    { id: 'doubao-seed-1-6-251015', name: 'Seed 1.6' },
  ]},
  { id: 'deepseek', name: 'DeepSeek', models: [
    { id: 'deepseek-v3-2-251201', name: 'DeepSeek V3' },
    { id: 'deepseek-r1-250528', name: 'DeepSeek R1' },
  ]},
  { id: 'kimi', name: 'Kimi', models: [
    { id: 'kimi-k2-5-260127', name: 'Kimi K2.5' },
    { id: 'kimi-k2-250905', name: 'Kimi K2' },
  ]},
  { id: 'glm', name: '智谱 GLM', models: [
    { id: 'glm-5-0-260211', name: 'GLM-5.0' },
    { id: 'glm-4-7-251222', name: 'GLM-4.7' },
  ]},
  { id: 'qwen', name: '通义千问', models: [
    { id: 'qwen-3-5-plus-260215', name: 'Qwen 3.5 Plus' },
  ]},
];

interface AIConfig {
  id?: number;
  name: string;
  provider: string;
  modelId: string;
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
  isDefault: boolean;
  settings?: {
    temperature?: number;
    maxTokens?: number;
  };
}

interface NewsSource {
  id?: number;
  name: string;
  keywords: string;
  language: string;
  targetLanguage: string;
  categoryId?: number;
  count: number;
  enabled: boolean;
  lastRunAt?: string;
}

interface AutoPublishTask {
  id?: number;
  name: string;
  sourceIds: number[];
  schedule: string;
  status: string;
  autoPublish: boolean;
  lastRunAt?: string;
}

interface AIGeneratedArticle {
  id: number;
  sourceId?: number;
  originalTitle: string;
  originalContent?: string;
  originalUrl?: string;
  translatedTitle?: string;
  translatedContent?: string;
  summary?: string;
  cover?: string;
  status: string;
  createdAt: string;
  aiModel?: string;
}

export default function AINewsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('config');

  // AI配置相关状态
  const [aiConfigs, setAIConfigs] = useState<AIConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // 新闻源相关状态
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [editingSource, setEditingSource] = useState<NewsSource | null>(null);
  const [showSourceDialog, setShowSourceDialog] = useState(false);

  // 定时任务相关状态
  const [tasks, setTasks] = useState<AutoPublishTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [editingTask, setEditingTask] = useState<AutoPublishTask | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  // 文章相关状态
  const [articles, setArticles] = useState<AIGeneratedArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [runningTask, setRunningTask] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<AIGeneratedArticle | null>(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [editingArticleContent, setEditingArticleContent] = useState({ title: '', content: '', summary: '' });

  // 加载AI配置
  const loadAIConfigs = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-news/configs');
      const data = await res.json();
      if (data.success) {
        setAIConfigs(data.data || []);
      }
    } catch (error) {
      console.error('加载AI配置失败:', error);
    } finally {
      setLoadingConfigs(false);
    }
  }, []);

  // 加载新闻源
  const loadNewsSources = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-news/sources');
      const data = await res.json();
      if (data.success) {
        setNewsSources(data.data || []);
      }
    } catch (error) {
      console.error('加载新闻源失败:', error);
    } finally {
      setLoadingSources(false);
    }
  }, []);

  // 加载定时任务
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-news/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.data || []);
      }
    } catch (error) {
      console.error('加载任务失败:', error);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // 加载生成的文章
  const loadArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-news/articles');
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
      }
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    loadAIConfigs();
    loadNewsSources();
    loadTasks();
    loadArticles();
  }, [loadAIConfigs, loadNewsSources, loadTasks, loadArticles]);

  // 保存AI配置
  const saveAIConfig = async (config: AIConfig) => {
    try {
      const res = await fetch('/api/ai-news/configs', {
        method: config.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(config.id ? '配置已更新' : '配置已创建');
        setShowConfigDialog(false);
        setEditingConfig(null);
        loadAIConfigs();
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch (error) {
      toast.error('保存失败');
    }
  };

  // 保存新闻源
  const saveNewsSource = async (source: NewsSource) => {
    try {
      const res = await fetch('/api/ai-news/sources', {
        method: source.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(source.id ? '新闻源已更新' : '新闻源已创建');
        setShowSourceDialog(false);
        setEditingSource(null);
        loadNewsSources();
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch (error) {
      toast.error('保存失败');
    }
  };

  // 保存定时任务
  const saveTask = async (task: AutoPublishTask) => {
    try {
      const res = await fetch('/api/ai-news/tasks', {
        method: task.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(task.id ? '任务已更新' : '任务已创建');
        setShowTaskDialog(false);
        setEditingTask(null);
        loadTasks();
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch (error) {
      toast.error('保存失败');
    }
  };

  // 手动执行任务
  const runTask = async (taskId: number) => {
    setRunningTask(taskId);
    try {
      const res = await fetch(`/api/ai-news/tasks/${taskId}/run`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`任务执行成功！生成了 ${data.data?.generated || 0} 篇文章`);
        loadArticles();
        loadNewsSources();
      } else {
        toast.error(data.error || '任务执行失败');
      }
    } catch (error) {
      toast.error('任务执行失败');
    } finally {
      setRunningTask(null);
    }
  };

  // 删除配置
  const deleteConfig = async (id: number) => {
    if (!confirm('确定要删除此配置吗？')) return;
    try {
      const res = await fetch(`/api/ai-news/configs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('配置已删除');
        loadAIConfigs();
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 删除新闻源
  const deleteSource = async (id: number) => {
    if (!confirm('确定要删除此新闻源吗？')) return;
    try {
      const res = await fetch(`/api/ai-news/sources/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('新闻源已删除');
        loadNewsSources();
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 更新文章状态
  const updateArticleStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/ai-news/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('状态已更新');
        loadArticles();
      }
    } catch (error) {
      toast.error('更新失败');
    }
  };

  // 切换配置启用状态
  const toggleConfig = async (config: AIConfig) => {
    await saveAIConfig({ ...config, enabled: !config.enabled });
  };

  // 切换新闻源启用状态
  const toggleSource = async (source: NewsSource) => {
    await saveNewsSource({ ...source, enabled: !source.enabled });
  };

  // 切换任务状态
  const toggleTask = async (task: AutoPublishTask) => {
    await saveTask({ ...task, status: task.status === 'active' ? 'paused' : 'active' });
  };

  // Cron表达式解释
  const explainSchedule = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length === 5) {
      const [minute, hour, day, month, week] = parts;
      if (minute === '0' && hour === '*' && day === '*' && month === '*' && week === '*') {
        return '每小时整点执行';
      }
      if (minute === '*' && hour === '*' && day === '*' && month === '*' && week === '*') {
        return '每分钟执行';
      }
      if (minute === '0' && hour !== '*') {
        return `每天 ${hour}:00 执行`;
      }
    }
    return cron;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8" />
            AI 新闻自动发布
          </h1>
          <p className="text-muted-foreground mt-1">
            配置第三方AI模型，自动搜索、翻译并发布新闻
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="config">
            <Zap className="w-4 h-4 mr-2" />
            AI配置
          </TabsTrigger>
          <TabsTrigger value="sources">
            <Globe className="w-4 h-4 mr-2" />
            新闻源
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <Clock className="w-4 h-4 mr-2" />
            定时任务
          </TabsTrigger>
          <TabsTrigger value="articles">
            <FileText className="w-4 h-4 mr-2" />
            生成文章
          </TabsTrigger>
        </TabsList>

        {/* AI配置标签页 */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI 模型配置</CardTitle>
                  <CardDescription>配置第三方AI模型用于新闻翻译和内容生成</CardDescription>
                </div>
                <Button onClick={() => { setEditingConfig({ name: '', provider: 'doubao', modelId: '', apiKey: '', enabled: true, isDefault: false }); setShowConfigDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加配置
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingConfigs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : aiConfigs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无AI配置，请添加第一个配置</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>配置名称</TableHead>
                      <TableHead>提供商</TableHead>
                      <TableHead>模型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>默认</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiConfigs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell className="font-medium">{config.name}</TableCell>
                        <TableCell>{AI_PROVIDERS.find(p => p.id === config.provider)?.name}</TableCell>
                        <TableCell>{config.modelId}</TableCell>
                        <TableCell>
                          <Badge variant={config.enabled ? 'default' : 'secondary'}>
                            {config.enabled ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {config.isDefault && <Badge variant="outline">默认</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleConfig(config)}>
                              {config.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingConfig(config); setShowConfigDialog(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteConfig(config.id!)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 新闻源标签页 */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>新闻源配置</CardTitle>
                  <CardDescription>配置要搜索的新闻关键词和来源</CardDescription>
                </div>
                <Button onClick={() => { setEditingSource({ name: '', keywords: '', language: 'zh', targetLanguage: 'zh-TW', count: 5, enabled: true }); setShowSourceDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加新闻源
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSources ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : newsSources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无新闻源配置</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>关键词</TableHead>
                      <TableHead>源语言</TableHead>
                      <TableHead>目标语言</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>最后运行</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsSources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell className="font-medium">{source.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{source.keywords}</TableCell>
                        <TableCell>{source.language}</TableCell>
                        <TableCell>{source.targetLanguage}</TableCell>
                        <TableCell>{source.count}</TableCell>
                        <TableCell>
                          <Badge variant={source.enabled ? 'default' : 'secondary'}>
                            {source.enabled ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {source.lastRunAt ? format(new Date(source.lastRunAt), 'MM-dd HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleSource(source)}>
                              {source.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingSource(source); setShowSourceDialog(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteSource(source.id!)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 定时任务标签页 */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>定时任务</CardTitle>
                  <CardDescription>配置自动执行的时间和频率</CardDescription>
                </div>
                <Button onClick={() => { setEditingTask({ name: '', sourceIds: [], schedule: '0 6 * * *', status: 'active', autoPublish: false }); setShowTaskDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建任务
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无定时任务</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务名称</TableHead>
                      <TableHead>执行时间</TableHead>
                      <TableHead>关联新闻源</TableHead>
                      <TableHead>自动发布</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>上次运行</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{task.schedule}</code>
                          <p className="text-xs text-muted-foreground mt-1">{explainSchedule(task.schedule)}</p>
                        </TableCell>
                        <TableCell>{task.sourceIds?.length || 0} 个源</TableCell>
                        <TableCell>
                          <Badge variant={task.autoPublish ? 'default' : 'outline'}>
                            {task.autoPublish ? '是' : '否'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={task.status === 'active' ? 'default' : 'secondary'}>
                            {task.status === 'active' ? '运行中' : '已暂停'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {task.lastRunAt ? format(new Date(task.lastRunAt), 'MM-dd HH:mm:ss') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleTask(task)}>
                              {task.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => runTask(task.id!)} disabled={runningTask === task.id}>
                              {runningTask === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingTask(task); setShowTaskDialog(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生成文章标签页 */}
        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI 生成的文章</CardTitle>
                  <CardDescription>查看和管理AI自动生成并翻译的新闻文章</CardDescription>
                </div>
                <Button variant="outline" onClick={() => loadArticles()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingArticles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无生成的文章</p>
                  <p className="text-sm">执行定时任务后将会生成文章</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>原文标题</TableHead>
                      <TableHead>翻译标题</TableHead>
                      <TableHead>使用模型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>生成时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="max-w-[250px] truncate">{article.originalTitle}</TableCell>
                        <TableCell className="max-w-[250px] truncate">{article.translatedTitle || '-'}</TableCell>
                        <TableCell className="text-sm">{article.aiModel || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            article.status === 'published' ? 'default' :
                            article.status === 'approved' ? 'secondary' :
                            article.status === 'rejected' ? 'destructive' : 'outline'
                          }>
                            {article.status === 'published' ? '已发布' :
                             article.status === 'approved' ? '已审核' :
                             article.status === 'rejected' ? '已拒绝' : '待审核'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(article.createdAt), 'MM-dd HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedArticle(article); setEditingArticleContent({ title: article.translatedTitle || '', content: article.translatedContent || '', summary: article.summary || '' }); setShowArticleDialog(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {article.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => updateArticleStatus(article.id, 'approved')}>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => updateArticleStatus(article.id, 'rejected')}>
                                  <XCircle className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI配置对话框 */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingConfig?.id ? '编辑AI配置' : '添加AI配置'}</DialogTitle>
            <DialogDescription>配置第三方AI模型的连接信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>配置名称</Label>
              <Input value={editingConfig?.name || ''} onChange={(e) => setEditingConfig({ ...editingConfig!, name: e.target.value })} placeholder="例如：豆包翻译配置" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>提供商</Label>
                <Select value={editingConfig?.provider || 'doubao'} onValueChange={(v) => setEditingConfig({ ...editingConfig!, provider: v, modelId: AI_PROVIDERS.find(p => p.id === v)?.models[0]?.id || '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>模型</Label>
                <Select value={editingConfig?.modelId || ''} onValueChange={(v) => setEditingConfig({ ...editingConfig!, modelId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.find(p => p.id === editingConfig?.provider)?.models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>API Key</Label>
              <Input type="password" value={editingConfig?.apiKey || ''} onChange={(e) => setEditingConfig({ ...editingConfig!, apiKey: e.target.value })} placeholder="输入API密钥" />
            </div>
            <div className="grid gap-2">
              <Label>Base URL（可选）</Label>
              <Input value={editingConfig?.baseUrl || ''} onChange={(e) => setEditingConfig({ ...editingConfig!, baseUrl: e.target.value })} placeholder="如使用代理或自定义endpoint" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={editingConfig?.enabled ?? true} onCheckedChange={(v) => setEditingConfig({ ...editingConfig!, enabled: v })} />
                <Label>启用</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingConfig?.isDefault ?? false} onCheckedChange={(v) => setEditingConfig({ ...editingConfig!, isDefault: v })} />
                <Label>设为默认</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowConfigDialog(false); setEditingConfig(null); }}>取消</Button>
            <Button onClick={() => saveAIConfig(editingConfig!)} disabled={!editingConfig?.name || !editingConfig?.modelId || !editingConfig?.apiKey}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新闻源对话框 */}
      <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSource?.id ? '编辑新闻源' : '添加新闻源'}</DialogTitle>
            <DialogDescription>配置要搜索的新闻关键词</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>新闻源名称</Label>
              <Input value={editingSource?.name || ''} onChange={(e) => setEditingSource({ ...editingSource!, name: e.target.value })} placeholder="例如：科技新闻" />
            </div>
            <div className="grid gap-2">
              <Label>搜索关键词</Label>
              <Textarea value={editingSource?.keywords || ''} onChange={(e) => setEditingSource({ ...editingSource!, keywords: e.target.value })} placeholder="多个关键词用逗号分隔，例如：人工智能,AI,机器学习" />
              <p className="text-xs text-muted-foreground">多个关键词用英文逗号分隔，系统会搜索包含这些关键词的新闻</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>源语言</Label>
                <Select value={editingSource?.language || 'zh'} onValueChange={(v) => setEditingSource({ ...editingSource!, language: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="en">英文</SelectItem>
                    <SelectItem value="ja">日文</SelectItem>
                    <SelectItem value="ko">韩文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>目标语言</Label>
                <Select value={editingSource?.targetLanguage || 'zh-TW'} onValueChange={(v) => setEditingSource({ ...editingSource!, targetLanguage: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-TW">繁体中文</SelectItem>
                    <SelectItem value="zh">简体中文</SelectItem>
                    <SelectItem value="en">英文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>每次抓取数量</Label>
                <Input type="number" value={editingSource?.count || 5} onChange={(e) => setEditingSource({ ...editingSource!, count: parseInt(e.target.value) || 5 })} min={1} max={20} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingSource?.enabled ?? true} onCheckedChange={(v) => setEditingSource({ ...editingSource!, enabled: v })} />
              <Label>启用</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSourceDialog(false); setEditingSource(null); }}>取消</Button>
            <Button onClick={() => saveNewsSource(editingSource!)} disabled={!editingSource?.name || !editingSource?.keywords}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 定时任务对话框 */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask?.id ? '编辑定时任务' : '创建定时任务'}</DialogTitle>
            <DialogDescription>配置自动执行的时间和新闻源</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>任务名称</Label>
              <Input value={editingTask?.name || ''} onChange={(e) => setEditingTask({ ...editingTask!, name: e.target.value })} placeholder="例如：每日科技新闻" />
            </div>
            <div className="grid gap-2">
              <Label>执行时间 (Cron表达式)</Label>
              <Input value={editingTask?.schedule || ''} onChange={(e) => setEditingTask({ ...editingTask!, schedule: e.target.value })} placeholder="0 6 * * *" />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>0 6 * * * - 每天早上6点</p>
                <p>0 */6 * * * - 每6小时</p>
                <p>0 6,12,18 * * * - 每天3次</p>
                <p>*/30 * * * * - 每30分钟</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>关联新闻源</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {newsSources.map((source) => (
                  <label key={source.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTask?.sourceIds?.includes(source.id!) || false}
                      onChange={(e) => {
                        const ids = editingTask?.sourceIds || [];
                        if (e.target.checked) {
                          setEditingTask({ ...editingTask!, sourceIds: [...ids, source.id!] });
                        } else {
                          setEditingTask({ ...editingTask!, sourceIds: ids.filter(id => id !== source.id) });
                        }
                      }}
                    />
                    <span className="text-sm">{source.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingTask?.autoPublish ?? false} onCheckedChange={(v) => setEditingTask({ ...editingTask!, autoPublish: v })} />
              <div>
                <Label>自动发布</Label>
                <p className="text-xs text-muted-foreground">开启后，生成的文章将自动发布到网站</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTaskDialog(false); setEditingTask(null); }}>取消</Button>
            <Button onClick={() => saveTask(editingTask!)} disabled={!editingTask?.name || !editingTask?.schedule}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 文章详情/编辑对话框 */}
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>文章详情</DialogTitle>
            <DialogDescription>查看并编辑AI生成的文章内容</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 原文信息 */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">原文标题</p>
              <p className="text-sm">{selectedArticle?.originalTitle}</p>
              {selectedArticle?.originalContent && (
                <>
                  <p className="text-sm font-medium text-muted-foreground mt-3 mb-1">原文内容</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedArticle.originalContent}</p>
                </>
              )}
              {selectedArticle?.originalUrl && (
                <a href={selectedArticle.originalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-2 block">
                  查看原文链接
                </a>
              )}
            </div>

            {/* 编辑区域 */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>翻译标题</Label>
                <Input 
                  value={editingArticleContent.title} 
                  onChange={(e) => setEditingArticleContent({ ...editingArticleContent, title: e.target.value })} 
                  placeholder="输入翻译后的标题"
                />
              </div>

              <div className="grid gap-2">
                <Label>文章摘要</Label>
                <Textarea 
                  value={editingArticleContent.summary} 
                  onChange={(e) => setEditingArticleContent({ ...editingArticleContent, summary: e.target.value })} 
                  placeholder="输入文章摘要"
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label>文章内容</Label>
                <RichTextEditor 
                  value={editingArticleContent.content} 
                  onChange={(content) => setEditingArticleContent({ ...editingArticleContent, content })} 
                  placeholder="使用富文本编辑器编辑文章内容"
                />
              </div>
            </div>

            {/* 状态 */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Badge variant={
                selectedArticle?.status === 'published' ? 'default' :
                selectedArticle?.status === 'approved' ? 'secondary' :
                selectedArticle?.status === 'rejected' ? 'destructive' : 'outline'
              }>
                {selectedArticle?.status === 'published' ? '已发布' :
                 selectedArticle?.status === 'approved' ? '已审核' :
                 selectedArticle?.status === 'rejected' ? '已拒绝' : '待审核'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                使用模型: {selectedArticle?.aiModel || '-'}
              </span>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowArticleDialog(false)}>关闭</Button>
            <Button variant="destructive" onClick={() => updateArticleStatus(selectedArticle!.id, 'rejected')}>拒绝</Button>
            <Button variant="default" onClick={() => updateArticleStatus(selectedArticle!.id, 'approved')}>审核通过</Button>
            <Button onClick={async () => {
              // 保存编辑内容
              try {
                const res = await fetch(`/api/ai-news/articles/${selectedArticle!.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    translatedTitle: editingArticleContent.title,
                    translatedContent: editingArticleContent.content,
                    summary: editingArticleContent.summary,
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  toast.success('文章已保存');
                  setShowArticleDialog(false);
                  loadArticles();
                } else {
                  toast.error(data.error || '保存失败');
                }
              } catch (error) {
                toast.error('保存失败');
              }
            }}>
              <Save className="w-4 h-4 mr-2" />
              保存编辑
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
