'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  MessageSquare,
  Brain,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Play,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  RefreshCw,
  FileText,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  Download,
  Wand2,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  Zap,
  ExternalLink,
} from 'lucide-react';
import {
  getKnowledgeList,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  batchImportKnowledge,
  getKnowledgeDetail,
  getQAList,
  createQA,
  updateQA,
  deleteQA,
  generateQA,
  getTrainingTasks,
  createTrainingTask,
  startTrainingTask,
  getTrainingStats,
} from '@/lib/ai-training';

// 分类选项
const CATEGORIES = [
  { value: 'culture', label: '文化科普', color: 'bg-amber-500/10 text-amber-600', border: 'border-amber-500/20' },
  { value: 'product', label: '商品咨询', color: 'bg-blue-500/10 text-blue-600', border: 'border-blue-500/20' },
  { value: 'usage', label: '使用指导', color: 'bg-green-500/10 text-green-600', border: 'border-green-500/20' },
  { value: 'fortune', label: '命理咨询', color: 'bg-purple-500/10 text-purple-600', border: 'border-purple-500/20' },
  { value: 'general', label: '通用', color: 'bg-gray-500/10 text-gray-600', border: 'border-gray-500/20' },
];

// 状态选项
const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿', color: 'bg-gray-500/10 text-gray-600' },
  { value: 'training', label: '训练中', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'ready', label: '就绪', color: 'bg-green-500/10 text-green-600' },
  { value: 'archived', label: '归档', color: 'bg-orange-500/10 text-orange-600' },
];

// 类型定义
interface TrainingStats {
  knowledge?: {
    total?: number;
    ready?: number;
    pending?: number;
    usage_total?: number;
  };
  qa?: {
    active?: number;
    avg_accuracy?: number;
  };
  task?: {
    total?: number;
    completed?: number;
  };
}

interface KnowledgeItem {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  usage_count?: number;
  created_at: string;
  tags?: string[];
}

interface QAItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  accuracy?: number;
  is_active?: boolean;
  knowledge_id?: number;
  created_at: string;
}

interface TrainingTask {
  id: number;
  name: string;
  type: string;
  status: string;
  progress?: number;
  created_at: string;
  completed_at?: string;
}

export default function AITrainingPage() {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TrainingStats | null>(null);

  // 加载统计数据
  const loadStats = useCallback(async () => {
    try {
      const res = await getTrainingStats();
      setStats(res.data);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const tabs = [
    { id: 'knowledge', label: '知识库', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'qa', label: '问答对', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'training', label: '训练任务', icon: <Brain className="w-4 h-4" /> },
    { id: 'tools', label: '工具', icon: <Wand2 className="w-4 h-4" /> },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            AI训练中心
          </h1>
          <p className="text-muted-foreground mt-1">
            管理AI助手知识库、问答对和训练任务
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新统计
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && <StatsCards stats={stats} />}

      {/* 主内容区 */}
      <Card>
        <CardHeader className="pb-0">
          <Tabs
            tabs={tabs.map((t) => ({ ...t, value: t.id }))}
            defaultValue="knowledge"
            onValueChange={(v) => {
              setActiveTab(v);
              setLoading(true);
            }}
          />
        </CardHeader>
        <CardContent className="pt-6">
          <TabPanel id="knowledge">
            <KnowledgeTab onRefresh={loadStats} />
          </TabPanel>
          <TabPanel id="qa">
            <QATab />
          </TabPanel>
          <TabPanel id="training">
            <TrainingTab onRefresh={loadStats} />
          </TabPanel>
          <TabPanel id="tools">
            <ToolsTab onRefresh={loadStats} />
          </TabPanel>
        </CardContent>
      </Card>
    </div>
  );
}

// 统计卡片
function StatsCards({ stats }: { stats: TrainingStats }) {
  const items = [
    {
      label: '知识库总数',
      value: stats.knowledge?.total || 0,
      subtext: `使用 ${stats.knowledge?.usage_total || 0} 次`,
      icon: BookOpen,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
    {
      label: '已就绪',
      value: stats.knowledge?.ready || 0,
      subtext: `待处理 ${stats.knowledge?.pending || 0}`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
    },
    {
      label: '问答对',
      value: stats.qa?.active || 0,
      subtext: `准确率 ${stats.qa?.avg_accuracy || 0}%`,
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      label: '训练任务',
      value: stats.task?.completed || 0,
      subtext: `总计 ${stats.task?.total || 0} 个`,
      icon: Brain,
      color: 'text-purple-600',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', item.bg)}>
                  <item.icon className={cn('w-5 h-5', item.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{item.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 热门知识排行 */}
      {stats.top?.knowledge?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              热门知识
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.top.knowledge.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground w-4">{index + 1}.</span>
                    <span className="truncate">{item.title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {item.category}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {item.usage_count} 次
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分类分布 */}
      {stats.categories?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.filter((c) => c.value !== 'general').map((cat) => {
            const stat = stats.categories.find((c: any) => c.category === cat.value);
            const count = stat?.count || 0;
            const percentage = stats.knowledge?.total > 0 
              ? Math.round((count / stats.knowledge.total) * 100) 
              : 0;
            return (
              <div
                key={cat.value}
                className={cn('p-3 rounded-lg border', cat.border)}
              >
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs">{cat.label}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 知识库管理
function KnowledgeTab({ onRefresh }: { onRefresh?: () => void }) {
  const [list, setList] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<KnowledgeItem | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showPreview, setShowPreview] = useState<KnowledgeItem | null>(null);
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getKnowledgeList({
        page,
        page_size: 10,
        keyword: search,
        category,
        status,
      });
      setList(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, category, status]);

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: '确认删除',
      message: '确定要删除这条知识库记录吗？删除后关联的问答对也会被删除。',
      type: 'danger',
    });
    if (!ok) return;

    try {
      await deleteKnowledge(id);
      success('删除成功');
      loadData();
      onRefresh?.();
    } catch (err) {
      error('删除失败');
    }
  };

  const handleSubmit = async (data: Partial<QAItem>) => {
    try {
      if (editItem) {
        await updateKnowledge({ id: editItem.id, ...data });
        success('更新成功');
      } else {
        await createKnowledge(data);
        success('创建成功');
      }
      setShowModal(false);
      loadData();
      onRefresh?.();
    } catch (err) {
      error(editItem ? '更新失败' : '创建失败');
    }
  };

  const getCategoryInfo = (cat: string) => CATEGORIES.find((c) => c.value === cat) || CATEGORIES[4];
  const getStatusInfo = (s: string) => STATUS_OPTIONS.find((st) => st.value === s) || STATUS_OPTIONS[0];

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索标题或内容..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部分类</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部状态</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditItem(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-1" />
          添加知识
        </Button>
        <Button variant="outline" onClick={() => setShowImport(true)}>
          <Upload className="w-4 h-4 mr-1" />
          批量导入
        </Button>
      </div>

      {/* 列表 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>使用次数</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              list.map((item) => {
                const catInfo = getCategoryInfo(item.category);
                const statusInfo = getStatusInfo(item.status);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.content?.substring(0, 50)}...
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={catInfo.color}>{catInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{item.source_type}</TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{item.usage_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPreview(item)} title="预览">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditItem(item); setShowModal(true); }} title="编辑">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)} title="删除">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {total > 10 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">共 {total} 条</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              上一页
            </Button>
            <span className="px-3 py-2 text-sm">第 {page} / {Math.ceil(total / 10)} 页</span>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage((p) => p + 1)}>
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 预览弹窗 */}
      <Modal isOpen={!!showPreview} onClose={() => setShowPreview(null)} title="知识预览">
        {showPreview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryInfo(showPreview.category).color}>
                {getCategoryInfo(showPreview.category).label}
              </Badge>
              <Badge className={getStatusInfo(showPreview.status).color}>
                {getStatusInfo(showPreview.status).label}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg">{showPreview.title}</h3>
            <div className="bg-muted/50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm">{showPreview.content}</p>
            </div>
            {showPreview.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {showPreview.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">#{tag}</Badge>
                ))}
              </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>使用次数: {showPreview.usage_count}</span>
              <span>创建时间: {new Date(showPreview.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowPreview(null)}>关闭</Button>
              <Button onClick={() => {
                setEditItem(showPreview);
                setShowPreview(null);
                setShowModal(true);
              }}>
                <Edit2 className="w-4 h-4 mr-2" />
                编辑
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 添加/编辑弹窗 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? '编辑知识' : '添加知识'}>
        <KnowledgeForm initialData={editItem} onSubmit={handleSubmit} onCancel={() => setShowModal(false)} />
      </Modal>

      {/* 批量导入弹窗 */}
      <Modal isOpen={showImport} onClose={() => setShowImport(false)} title="批量导入">
        <BatchImportForm onSubmit={async (data) => {
          try {
            const res = await batchImportKnowledge(data);
            success(`导入完成：成功 ${res.data.imported} 条，失败 ${res.data.failed} 条`);
            setShowImport(false);
            loadData();
            onRefresh?.();
          } catch (err) {
            error('导入失败');
          }
        }} onCancel={() => setShowImport(false)} />
      </Modal>
    </div>
  );
}

// 知识表单
function KnowledgeForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Partial<KnowledgeItem>;
  onSubmit: (data: Partial<KnowledgeItem>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || 'general');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [sourceType, setSourceType] = useState(initialData?.source_type || 'text');
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      category,
      status,
      source_type: sourceType,
      source_url: sourceUrl,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">标题 <span className="text-destructive">*</span></label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入标题" required />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium">内容 <span className="text-destructive">*</span></label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? '编辑' : '预览'}
          </Button>
        </div>
        {showPreview ? (
          <div className="bg-muted/50 rounded-lg p-4 min-h-[150px]">
            <p className="whitespace-pre-wrap text-sm">{content || '暂无内容'}</p>
          </div>
        ) : (
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="请输入内容" rows={6} required />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">分类</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">状态</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">来源类型</label>
          <Select value={sourceType} onValueChange={setSourceType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">文本</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="document">文档</SelectItem>
              <SelectItem value="qa">问答</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">来源URL</label>
          <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="可选" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">标签（逗号分隔）</label>
        <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="例如：符籙, 道教, 文化" />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit">{initialData ? '更新' : '创建'}</Button>
      </div>
    </form>
  );
}

// 批量导入表单
function BatchImportForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState('');
  const [category, setCategory] = useState('general');
  const [format, setFormat] = useState<'json' | 'text'>('json');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let items: any[];
      if (format === 'json') {
        items = JSON.parse(data);
        if (!Array.isArray(items)) items = [items];
      } else {
        // 制表符分隔格式
        items = data.split('\n').filter((l) => l.trim()).map((line) => {
          const parts = line.split('\t');
          return { title: parts[0] || '', content: parts.slice(1).join('\t') || parts[0] || '' };
        }).filter((i) => i.title);
      }
      if (items.length === 0) return;
      onSubmit({ data: items, category });
    } catch {
      onSubmit({ data: [{ title: '解析失败', content: data }], category });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 mb-2">
        <Button type="button" variant={format === 'json' ? 'default' : 'outline'} size="sm" onClick={() => setFormat('json')}>JSON</Button>
        <Button type="button" variant={format === 'text' ? 'default' : 'outline'} size="sm" onClick={() => setFormat('text')}>制表符</Button>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">导入数据</label>
        <Textarea value={data} onChange={(e) => setData(e.target.value)} placeholder={
          format === 'json'
            ? '[{"title":"标题","content":"内容","tags":["标签"]}]'
            : '标题\t内容\n符籙介绍\t符籙是...'
        } rows={8} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">默认分类</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit">导入</Button>
      </div>
    </form>
  );
}

// 问答对管理
function QATab() {
  const [list, setList] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<QAItem | null>(null);
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getQAList({ page, page_size: 10 });
      setList(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: '确认删除', message: '确定要删除这条问答吗？', type: 'danger' });
    if (!ok) return;
    try {
      await deleteQA(id);
      success('删除成功');
      loadData();
    } catch (err) {
      error('删除失败');
    }
  };

  const handleSubmit = async (data: Partial<QAItem>) => {
    try {
      if (editItem) {
        await updateQA({ id: editItem.id, ...data });
        success('更新成功');
      } else {
        await createQA(data);
        success('创建成功');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      error(editItem ? '更新失败' : '创建失败');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">问答对列表</h3>
        <Button onClick={() => { setEditItem(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-1" />添加问答
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>问题</TableHead>
              <TableHead>回答</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>使用次数</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
            ) : (
              list.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[200px]"><p className="truncate">{item.question}</p></TableCell>
                  <TableCell className="max-w-[250px]"><p className="truncate text-sm">{item.answer}</p></TableCell>
                  <TableCell><Badge>{CATEGORIES.find((c) => c.value === item.category)?.label || item.category}</Badge></TableCell>
                  <TableCell className="text-sm">{item.usage_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditItem(item); setShowModal(true); }}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > 10 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>上一页</Button>
          <span className="px-3 py-2 text-sm">第 {page} / {Math.ceil(total / 10)} 页</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage((p) => p + 1)}>下一页</Button>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? '编辑问答' : '添加问答'}>
        <QAForm initialData={editItem} onSubmit={handleSubmit} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}

// 问答表单
function QAForm({ initialData, onSubmit, onCancel }: { initialData?: any; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [question, setQuestion] = useState(initialData?.question || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [category, setCategory] = useState(initialData?.category || 'general');
  const [keywords, setKeywords] = useState(initialData?.keywords?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      question,
      answer,
      category,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="text-sm font-medium mb-1 block">问题</label><Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="请输入问题" rows={2} required /></div>
      <div><label className="text-sm font-medium mb-1 block">回答</label><Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="请输入回答" rows={4} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm font-medium mb-1 block">分类</label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent></Select></div>
        <div><label className="text-sm font-medium mb-1 block">关键词</label><Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="逗号分隔" /></div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit">{initialData ? '更新' : '创建'}</Button>
      </div>
    </form>
  );
}

// 训练任务管理
function TrainingTab({ onRefresh }: { onRefresh?: () => void }) {
  const [list, setList] = useState<TrainingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [knowledgeIds, setKnowledgeIds] = useState<number[]>([]);
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getTrainingTasks({ page, page_size: 10 });
      setList(res.data.list || []);
    } catch (err) {
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleStart = async (id: number) => {
    try {
      await startTrainingTask(id);
      success('任务已启动');
      loadData();
      onRefresh?.();
    } catch (err) {
      error('启动失败');
    }
  };

  const handleCreate = async (data: { name: string; description?: string; type?: string; knowledge_ids?: number[] }) => {
    try {
      await createTrainingTask(data);
      success('任务创建成功');
      setShowModal(false);
      loadData();
      onRefresh?.();
    } catch (err) {
      error('创建失败');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-600" />;
      case 'cancelled': return <X className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">训练任务列表</h3>
        <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-1" />创建任务</Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (<Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>))
        ) : list.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">暂无训练任务</CardContent></Card>
        ) : (
          list.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">{getStatusIcon(task.status)}</div>
                    <div>
                      <h4 className="font-medium">{task.name}</h4>
                      <p className="text-sm text-muted-foreground">{task.description || '无描述'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'pending' || task.status === 'failed' ? (
                      <Button size="sm" onClick={() => handleStart(task.id)}><Play className="w-4 h-4 mr-1" />启动</Button>
                    ) : task.status === 'running' ? (
                      <Badge className="bg-blue-500/10 text-blue-600">训练中</Badge>
                    ) : task.status === 'completed' ? (
                      <Badge className="bg-green-500/10 text-green-600">已完成</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>进度</span><span>{task.progress}%</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${task.progress}%` }} /></div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>处理: {task.processed_records} / {task.total_records}</span>
                    {task.failed_records > 0 && <span className="text-red-600">失败: {task.failed_records}</span>}
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>类型: {task.type}</span>
                  {task.started_at && <span>开始: {new Date(task.started_at).toLocaleString()}</span>}
                  {task.completed_at && <span>完成: {new Date(task.completed_at).toLocaleString()}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="创建训练任务">
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}

// 任务表单
function TaskForm({ onSubmit, onCancel }: { onSubmit: (data: { name: string; description?: string; type?: string; knowledge_ids?: number[] }) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('incremental');
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeItem[]>([]);
  const [showKnowledgeSelect, setShowKnowledgeSelect] = useState(false);
  const [availableKnowledge, setAvailableKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadKnowledge = async () => {
    setLoading(true);
    try {
      const res = await getKnowledgeList({ page: 1, page_size: 50, status: 'ready' });
      setAvailableKnowledge(res.data.list || []);
      setShowKnowledgeSelect(true);
    } catch (err) {
      console.error('加载知识库失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleKnowledge = (item: KnowledgeItem) => {
    setSelectedKnowledge((prev) => {
      const exists = prev.find((k) => k.id === item.id);
      if (exists) return prev.filter((k) => k.id !== item.id);
      return [...prev, item];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, description, type, knowledge_ids: selectedKnowledge.map((k) => k.id) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="text-sm font-medium mb-1 block">任务名称</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入任务名称" required /></div>
      <div><label className="text-sm font-medium mb-1 block">描述</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="可选描述" rows={2} /></div>
      <div><label className="text-sm font-medium mb-1 block">训练类型</label><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full">全量训练</SelectItem><SelectItem value="incremental">增量训练</SelectItem><SelectItem value="fine_tune">微调训练</SelectItem></SelectContent></Select></div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">选择知识库</label>
          {!showKnowledgeSelect && <Button type="button" variant="outline" size="sm" onClick={loadKnowledge} disabled={loading}>{loading ? '加载中...' : '选择知识'}</Button>}
        </div>
        {showKnowledgeSelect && (
          <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
            {availableKnowledge.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-4">暂无可用知识库</p>) : (
              availableKnowledge.map((item) => {
                const isSelected = selectedKnowledge.some((k) => k.id === item.id);
                return (
                  <div key={item.id} onClick={() => toggleKnowledge(item)} className={cn('flex items-center gap-2 p-2 rounded cursor-pointer transition-colors', isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted')}>
                    <input type="checkbox" checked={isSelected} onChange={() => {}} className="rounded" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.title}</p><p className="text-xs text-muted-foreground">{item.category}</p></div>
                    <Badge variant="outline" className="text-xs">{item.usage_count} 使用</Badge>
                  </div>
                );
              })
            )}
          </div>
        )}
        {selectedKnowledge.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">{selectedKnowledge.map((k) => (<Badge key={k.id} variant="secondary" className="gap-1">{k.title.substring(0, 15)}<X className="w-3 h-3 cursor-pointer" onClick={() => toggleKnowledge(k)} /></Badge>))}</div>
        )}
        {selectedKnowledge.length > 0 && <p className="text-xs text-muted-foreground mt-1">已选择 {selectedKnowledge.length} 个知识库</p>}
      </div>
      <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onCancel}>取消</Button><Button type="submit">创建</Button></div>
    </form>
  );
}

// 工具Tab
function ToolsTab({ onRefresh }: { onRefresh?: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeItem[]>([]);
  const [showKnowledgeSelect, setShowKnowledgeSelect] = useState(false);
  const [availableKnowledge, setAvailableKnowledge] = useState<KnowledgeItem[]>([]);
  const [generatedCount, setGeneratedCount] = useState(0);
  const { success, error } = useToast();

  const loadKnowledge = async () => {
    try {
      const res = await getKnowledgeList({ page: 1, page_size: 50, status: 'ready' });
      setAvailableKnowledge(res.data.list || []);
      setShowKnowledgeSelect(true);
    } catch (err) {
      console.error('加载失败:', err);
    }
  };

  const toggleKnowledge = (item: KnowledgeItem) => {
    setSelectedKnowledge((prev) => {
      const exists = prev.find((k) => k.id === item.id);
      if (exists) return prev.filter((k) => k.id !== item.id);
      return [...prev, item];
    });
  };

  const handleGenerateQA = async () => {
    if (selectedKnowledge.length === 0) {
      error('请先选择知识库');
      return;
    }
    setGenerating(true);
    let total = 0;
    try {
      for (const k of selectedKnowledge) {
        const res = await generateQA(k.id);
        total += res.data.count || 0;
      }
      setGeneratedCount(total);
      success(`成功生成 ${total} 个问答对`);
      onRefresh?.();
    } catch (err) {
      error('生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 导出训练报告
  const exportTrainingReport = async () => {
    try {
      const [knowledgeRes, qaRes, tasksRes, statsRes] = await Promise.all([
        getKnowledgeList({ page: 1, page_size: 1000 }),
        getQAList({ page: 1, page_size: 1000 }),
        getTrainingTasks(),
        getTrainingStats(),
      ]);

      const report = {
        title: '符寶網 AI訓練報告',
        generatedAt: new Date().toLocaleString('zh-TW'),
        summary: statsRes.data,
        knowledge: {
          total: knowledgeRes.data.total || 0,
          list: (knowledgeRes.data.list || []).map((k: KnowledgeItem) => ({
            id: k.id,
            title: k.title,
            category: k.category,
            status: k.status,
            usage_count: k.usage_count || 0,
            created_at: k.created_at,
          })),
        },
        qa: {
          total: qaRes.data.total || 0,
          list: (qaRes.data.list || []).map((q: QAItem) => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            accuracy: q.accuracy || 0,
            knowledge_id: q.knowledge_id,
          })),
        },
        tasks: {
          total: tasksRes.data.length || 0,
          list: (tasksRes.data || []).map((t: TrainingTask) => ({
            id: t.id,
            name: t.name,
            type: t.type,
            status: t.status,
            progress: t.progress || 0,
            created_at: t.created_at,
            completed_at: t.completed_at,
          })),
        },
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI訓練報告_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('報告導出成功');
    } catch (err) {
      console.error('導出失敗:', err);
      error('導出失敗');
    }
  };

  // 导出知识库为CSV
  const exportKnowledgeCSV = async () => {
    try {
      const res = await getKnowledgeList({ page: 1, page_size: 1000 });
      const list = res.data.list || [];
      
      const headers = ['ID', '標題', '分類', '狀態', '使用次數', '創建時間'];
      const rows = list.map((k: any) => [
        k.id,
        `"${k.title.replace(/"/g, '""')}"`,
        k.category,
        k.status,
        k.usage_count || 0,
        k.created_at,
      ]);
      
      const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `知識庫_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      success('CSV導出成功');
    } catch (err) {
      error('導出失敗');
    }
  };

  // 导出问答对为CSV
  const exportQACSV = async () => {
    try {
      const res = await getQAList({ page: 1, page_size: 1000 });
      const list = res.data.list || [];
      
      const headers = ['ID', '問題', '答案', '準確率', '創建時間'];
      const rows = list.map((q: any) => [
        q.id,
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.answer.replace(/"/g, '""')}"`,
        q.accuracy || 0,
        q.created_at,
      ]);
      
      const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `問答對_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      success('CSV導出成功');
    } catch (err) {
      error('導出失敗');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4" />AI生成问答</CardTitle>
          <CardDescription>从选定的知识库自动生成问答对</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">选择知识库</label>
              {!showKnowledgeSelect && <Button type="button" variant="outline" size="sm" onClick={loadKnowledge}>选择</Button>}
            </div>
            {showKnowledgeSelect && (
              <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {availableKnowledge.map((item) => {
                  const isSelected = selectedKnowledge.some((k) => k.id === item.id);
                  return (
                    <div key={item.id} onClick={() => toggleKnowledge(item)} className={cn('flex items-center gap-2 p-2 rounded cursor-pointer', isSelected ? 'bg-primary/10' : 'hover:bg-muted')}>
                      <input type="checkbox" checked={isSelected} onChange={() => {}} className="rounded" />
                      <span className="flex-1 text-sm truncate">{item.title}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedKnowledge.length > 0 && <p className="text-xs text-muted-foreground mt-2">已选择 {selectedKnowledge.length} 个知识库</p>}
          </div>
          <Button onClick={handleGenerateQA} disabled={generating || selectedKnowledge.length === 0}>
            {generating ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />生成中...</>) : (<><Zap className="w-4 h-4 mr-2" />生成问答</>)}
          </Button>
          {generatedCount > 0 && <p className="text-sm text-green-600">本次生成 {generatedCount} 个问答对</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />数据导出</CardTitle>
          <CardDescription>导出训练数据和报告</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" onClick={exportTrainingReport} className="h-20 flex-col gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-xs">完整训练报告 (JSON)</span>
            </Button>
            <Button variant="outline" onClick={exportKnowledgeCSV} className="h-20 flex-col gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">知识库 (CSV)</span>
            </Button>
            <Button variant="outline" onClick={exportQACSV} className="h-20 flex-col gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">问答对 (CSV)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><ExternalLink className="w-4 h-4" />快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <a href="/knowledge" target="_blank"><BookOpen className="w-5 h-5" /><span className="text-xs">查看知识库</span></a>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <a href="/ai-assistant" target="_blank"><Sparkles className="w-5 h-5" /><span className="text-xs">AI助手</span></a>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={onRefresh}>
              <RefreshCw className="w-5 h-5" /><span className="text-xs">刷新统计</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
