/**
 * @fileoverview AI内容自动发布管理页面
 * @description AI自动生成产品、百科、新闻内容，实现SEO自动化
 * @module app/admin/ai-content/page
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Package,
  BookOpen,
  Newspaper,
  Send,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Eye,
  Save,
  Wand2,
  Settings,
  History,
  TrendingUp,
  Zap,
  Layers,
  CheckCircle,
  XCircle,
  BarChart3,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

/** 内容类型 */
type ContentType = 'product' | 'wiki' | 'news';

/** 生成的内容 */
interface GeneratedContent {
  title: string;
  summary: string;
  content: string;
  keywords: string[];
  metaDescription: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
}

/** 生成的图片 */
interface GeneratedImage {
  url: string;
  prompt: string;
}

/** 草稿 */
interface Draft {
  id: string;
  type: ContentType;
  keyword: string;
  content: GeneratedContent;
  category?: string;
  savedAt: string;
}

/** 生成历史 */
interface GenerationHistory {
  id: string;
  type: ContentType;
  keyword: string;
  title: string;
  createdAt: string;
  status: 'draft' | 'published';
}

/** SEO分析结果 */
interface SEOAnalysis {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  analysis: {
    title: { score: number; length: number; hasKeyword: boolean; suggestions: string[] };
    summary: { score: number; length: number; hasKeyword: boolean; suggestions: string[] };
    content: { score: number; length: number; keywordDensity: Record<string, number>; readability: number; suggestions: string[] };
    keywords: { score: number; count: number; relevance: number; suggestions: string[] };
    metaDescription: { score: number; length: number; hasKeyword: boolean; suggestions: string[] };
  };
  overallSuggestions: string[];
}

/** 内容类型配置 */
const contentTypeConfig: Record<ContentType, { label: string; icon: typeof Package; description: string; color: string }> = {
  product: { 
    label: '產品內容', 
    icon: Package, 
    description: '生成產品描述、規格、SEO信息',
    color: 'text-blue-500'
  },
  wiki: { 
    label: '百科內容', 
    icon: BookOpen, 
    description: '生成玄門文化知識科普文章',
    color: 'text-green-500'
  },
  news: { 
    label: '新聞資訊', 
    icon: Newspaper, 
    description: '生成行業新聞動態文章',
    color: 'text-purple-500'
  },
};

/** 产品分类 */
const productCategories = [
  { value: 'fulu', label: '符籙' },
  { value: 'faqie', label: '法器' },
  { value: 'nianzhu', label: '唸珠' },
  { value: 'jingshu', label: '經書' },
  { value: 'xunxiang', label: '熏香' },
  { value: 'other', label: '其他' },
];

/** 百科分类 */
const wikiCategories = [
  { value: 'fulu', label: '符籙知識' },
  { value: 'daoism', label: '道教文化' },
  { value: 'history', label: '歷史典故' },
  { value: 'practice', label: '修行入門' },
  { value: 'culture', label: '民俗文化' },
];

/** 新闻分类 */
const newsCategories = [
  { value: 'news', label: '新聞動態' },
  { value: 'culture', label: '玄門文化' },
  { value: 'knowledge', label: '符箓知識' },
  { value: 'notice', label: '公告通知' },
];

/** 批量生成项 */
interface BatchItem {
  id: string;
  type: ContentType;
  keyword: string;
  category: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  success: boolean;
  content?: GeneratedContent;
  error?: string;
}

export default function AIContentPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('product');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  
  // 批量生成状态
  const [batchMode, setBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchKeywords, setBatchKeywords] = useState('');
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchItem[]>([]);
  
  // 草稿状态
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  
  // SEO分析状态
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const [analyzingSeo, setAnalyzingSeo] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  
  // 图片生成状态
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // 加载历史记录和草稿
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-content-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    const savedDrafts = localStorage.getItem('ai-content-drafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  }, []);

  // 保存历史记录
  const saveToHistory = (type: ContentType, keyword: string, title: string) => {
    const newHistory: GenerationHistory = {
      id: Date.now().toString(),
      type,
      keyword,
      title,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    const updatedHistory = [newHistory, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('ai-content-history', JSON.stringify(updatedHistory));
  };

  // 保存草稿
  const saveDraft = (type: ContentType, keyword: string, content: GeneratedContent, category?: string) => {
    const newDraft: Draft = {
      id: Date.now().toString(),
      type,
      keyword,
      content,
      category,
      savedAt: new Date().toISOString(),
    };
    const updatedDrafts = [newDraft, ...drafts].slice(0, 50);
    setDrafts(updatedDrafts);
    localStorage.setItem('ai-content-drafts', JSON.stringify(updatedDrafts));
    toast.success('草稿已保存');
  };

  // 加载草稿
  const loadDraft = (draft: Draft) => {
    setActiveTab(draft.type);
    setKeyword(draft.keyword);
    setCategory(draft.category || '');
    setGeneratedContent(draft.content);
    setShowDrafts(false);
    toast.success('草稿已加載');
  };

  // 删除草稿
  const deleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem('ai-content-drafts', JSON.stringify(updatedDrafts));
    toast.success('草稿已刪除');
  };

  // 保存当前内容为草稿
  const handleSaveDraft = () => {
    if (!generatedContent) return;
    saveDraft(activeTab, keyword, generatedContent, category);
  };

  // SEO分析
  const handleSEOAnalysis = async () => {
    if (!generatedContent) return;
    
    setAnalyzingSeo(true);
    setSeoAnalysis(null);
    
    try {
      const res = await fetch('/api/admin/ai-content/seo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedContent),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'SEO分析失敗');
      }
      
      setSeoAnalysis(data.data);
      setShowSeoPanel(true);
    } catch (error) {
      console.error('SEO分析失败:', error);
      toast.error(error instanceof Error ? error.message : 'SEO分析失敗');
    } finally {
      setAnalyzingSeo(false);
    }
  };

  // 获取SEO等级颜色
  const getGradeColor = (grade: 'A' | 'B' | 'C' | 'D' | 'F') => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
    }
  };

  // 获取分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 生成配图
  const handleGenerateImage = async () => {
    if (!generatedContent) return;
    
    setGeneratingImage(true);
    setGeneratedImages([]);
    
    try {
      const res = await fetch('/api/admin/ai-content/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          title: generatedContent.title,
          summary: generatedContent.summary,
          keywords: generatedContent.keywords,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '圖片生成失敗');
      }
      
      setGeneratedImages(data.imageUrls.map((url: string) => ({
        url,
        prompt: data.prompt,
      })));
      
      toast.success('配圖生成成功');
    } catch (error) {
      console.error('图片生成失败:', error);
      toast.error(error instanceof Error ? error.message : '圖片生成失敗');
    } finally {
      setGeneratingImage(false);
    }
  };

  // 选择图片作为封面
  const handleSelectCoverImage = (url: string) => {
    if (!generatedContent) return;
    setGeneratedContent({ ...generatedContent, coverImage: url });
    toast.success('已選擇封面圖片');
  };

// 批量生成相关函数
  const parseBatchKeywords = (text: string): string[] => {
    return text
      .split(/[\n,，]/)
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .slice(0, 10);
  };

  const handleBatchGenerate = async () => {
    const keywords = parseBatchKeywords(batchKeywords);
    if (keywords.length === 0) {
      toast.error('請輸入關鍵詞（每行一個或用逗號分隔）');
      return;
    }

    setBatchGenerating(true);
    setBatchResults([]);

    try {
      const res = await fetch('/api/admin/ai-content/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: keywords.map(keyword => ({
            type: activeTab,
            keyword,
            category: category || undefined,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '批量生成失敗');
      }

      // 转换结果
      const results: BatchItem[] = data.results.map((r: { keyword: string; type: ContentType; success: boolean; content?: GeneratedContent; error?: string }, index: number) => ({
        id: index.toString(),
        type: r.type,
        keyword: r.keyword,
        category: category,
        status: r.success ? 'success' : 'error',
        success: r.success,
        content: r.content,
        error: r.error,
      }));

      setBatchResults(results);
      toast.success(`成功生成 ${data.successCount} 條內容`);
      
      // 保存到历史
      results.filter(r => r.success && r.content).forEach(r => {
        if (r.content) {
          saveToHistory(r.type, r.keyword, r.content.title);
        }
      });
    } catch (error) {
      console.error('批量生成失败:', error);
      toast.error(error instanceof Error ? error.message : '批量生成失敗');
    } finally {
      setBatchGenerating(false);
    }
  };

  const handleBatchPublish = async (item: BatchItem) => {
    if (!item.content) return;

    try {
      // 使用统一的发布API
      const res = await fetch('/api/admin/ai-content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: item.type,
          content: item.content,
          options: {
            status: true,
            price: item.type === 'product' ? 288 : undefined,
            original_price: item.type === 'product' ? 388 : undefined,
            stock: item.type === 'product' ? 100 : undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '發佈失敗');
      }

      toast.success(`「${item.content.title}」已成功發佈`);
      
      // 更新状态
      setBatchResults(prev => 
        prev.map(r => r.id === item.id ? { ...r, status: 'success' as const } : r)
      );
    } catch (error) {
      console.error('发布失败:', error);
      toast.error(error instanceof Error ? error.message : '發佈失敗');
    }
  };

  const handlePublishAll = async () => {
    const successItems = batchResults.filter(r => r.success && r.content);
    if (successItems.length === 0) return;

    try {
      const res = await fetch('/api/admin/ai-content/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: successItems.map(item => ({
            type: item.type,
            content: item.content!,
            options: {
              status: true,
              price: item.type === 'product' ? 288 : undefined,
              original_price: item.type === 'product' ? 388 : undefined,
              stock: item.type === 'product' ? 100 : undefined,
            },
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '批量發佈失敗');
      }

      toast.success(`成功發佈 ${data.successCount} 條內容`);
      
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((e: { title: string; error: string }) => {
          toast.error(`「${e.title}」發佈失敗: ${e.error}`);
        });
      }
    } catch (error) {
      console.error('批量发布失败:', error);
      toast.error(error instanceof Error ? error.message : '批量發佈失敗');
    }
  };

  // 生成内容
  const handleGenerate = async () => {
    if (!keyword.trim()) {
      toast.error('請輸入關鍵詞或主題');
      return;
    }

    setGenerating(true);
    setGeneratedContent(null);

    try {
      const res = await fetch('/api/admin/ai-content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          keyword: keyword.trim(),
          category: category || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '生成失敗');
      }

      setGeneratedContent(data.content);
      saveToHistory(activeTab, keyword, data.content.title);
      toast.success('內容生成成功');
    } catch (error) {
      console.error('生成失败:', error);
      toast.error(error instanceof Error ? error.message : '生成失敗，請重試');
    } finally {
      setGenerating(false);
    }
  };

  // 发布内容
  const handlePublish = async () => {
    if (!generatedContent) return;

    setPublishing(true);

    try {
      // 使用统一的发布API
      const res = await fetch('/api/admin/ai-content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          content: generatedContent,
          options: {
            status: true,
            price: activeTab === 'product' ? 288 : undefined,
            original_price: activeTab === 'product' ? 388 : undefined,
            stock: activeTab === 'product' ? 100 : undefined,
            cover_image: generatedContent.coverImage || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '發佈失敗');
      }

      toast.success(`「${generatedContent.title}」已成功發佈`);
      
      // 更新历史记录状态
      const updatedHistory = history.map(h => 
        h.title === generatedContent.title ? { ...h, status: 'published' as const } : h
      );
      setHistory(updatedHistory);
      localStorage.setItem('ai-content-history', JSON.stringify(updatedHistory));
      
      // 清空生成的内容
      setGeneratedContent(null);
      setKeyword('');
    } catch (error) {
      console.error('发布失败:', error);
      toast.error(error instanceof Error ? error.message : '發佈失敗，請重試');
    } finally {
      setPublishing(false);
    }
  };

  // 复制内容
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success('已複製到剪貼板');
    setTimeout(() => setCopied(null), 2000);
  };

  // 快捷关键词
  const quickKeywords: Record<ContentType, string[]> = {
    product: ['鎮宅符', '護身符', '桃木劍', '檀香唸珠', '八卦鏡', '太歲符'],
    wiki: ['符籙起源', '道教禮儀', '開光儀式', '風水知識', '太上老君', '龍虎山'],
    news: ['道教文化節', '符籙展覽', '法會活動', '道觀新聞', '文化遺產', '民俗節日'],
  };

  const TypeIcon = contentTypeConfig[activeTab].icon;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI內容發佈
                </h1>
                <p className="text-sm text-muted-foreground">
                  智能生成產品、百科、新聞內容，實現SEO自動化
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={batchMode ? "default" : "outline"}
                size="sm"
                onClick={() => setBatchMode(!batchMode)}
              >
                <Layers className="w-4 h-4 mr-1" />
                批量生成
              </Button>
              <Badge variant="secondary" className="hidden md:flex">
                <Zap className="w-3 h-3 mr-1" />
                智能SEO優化
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 批量生成模式 */}
        {batchMode && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  批量生成內容
                </CardTitle>
                <CardDescription>
                  一次生成多條內容，每行一個關鍵詞或用逗號分隔，最多10條
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 内容类型选择 */}
                <div className="space-y-2">
                  <Label>內容類型</Label>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)}>
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                      {Object.entries(contentTypeConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                            <span>{config.label}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>

                {/* 分类选择 */}
                <div className="space-y-2">
                  <Label>分類（可選）</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                      {(activeTab === 'product' ? productCategories : 
                        activeTab === 'wiki' ? wikiCategories : newsCategories
                      ).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 关键词输入 */}
                <div className="space-y-2">
                  <Label>關鍵詞列表</Label>
                  <Textarea
                    placeholder={`輸入關鍵詞，每行一個或用逗號分隔&#10;例如：&#10;鎮宅符&#10;護身符&#10;桃木劍&#10;或：鎮宅符, 護身符, 桃木劍`}
                    value={batchKeywords}
                    onChange={(e) => setBatchKeywords(e.target.value)}
                    rows={6}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    已輸入 {parseBatchKeywords(batchKeywords).length} 個關鍵詞（最多10個）
                  </p>
                </div>

                {/* 快捷关键词 */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">快捷添加</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickKeywords[activeTab].map((kw) => (
                      <Button
                        key={kw}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = parseBatchKeywords(batchKeywords);
                          if (current.length < 10 && !current.includes(kw)) {
                            setBatchKeywords(prev => prev + (prev ? '\n' : '') + kw);
                          }
                        }}
                        className="text-xs"
                      >
                        + {kw}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleBatchGenerate} 
                    disabled={batchGenerating || parseBatchKeywords(batchKeywords).length === 0}
                  >
                    {batchGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        開始批量生成
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setBatchKeywords('');
                    setBatchResults([]);
                  }}>
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 批量生成结果 */}
            {batchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>生成結果</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        成功 {batchResults.filter(r => r.success).length} / {batchResults.length}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={handlePublishAll}
                        disabled={batchResults.filter(r => r.success && r.content).length === 0}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        一鍵發佈全部
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {batchResults.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 border rounded-lg ${item.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {item.success ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium">{item.keyword}</span>
                              <Badge variant="outline" className="text-xs">
                                {contentTypeConfig[item.type].label}
                              </Badge>
                            </div>
                            {item.success && item.content && (
                              <div className="mt-2">
                                <p className="font-medium text-sm">{item.content.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {item.content.summary}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                  {item.content.keywords.slice(0, 3).map((kw, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {kw}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {!item.success && item.error && (
                              <p className="text-sm text-red-600 mt-1">{item.error}</p>
                            )}
                          </div>
                          {item.success && item.content && (
                            <Button 
                              size="sm" 
                              onClick={() => handleBatchPublish(item)}
                            >
                              發佈
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 单个生成模式 */}
        {!batchMode && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：内容生成 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 内容类型选择 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">選擇內容類型</CardTitle>
                <CardDescription>選擇要生成的內容類型，AI將自動優化SEO</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)}>
                  <TabsList className="grid w-full grid-cols-3">
                    {Object.entries(contentTypeConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="hidden sm:inline">{config.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {contentTypeConfig[activeTab].description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 关键词输入 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  輸入關鍵詞或主題
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>關鍵詞 / 主題</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`例如：${quickKeywords[activeTab][0]}`}
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button onClick={handleGenerate} disabled={generating}>
                      {generating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 分类选择 */}
                <div className="space-y-2">
                  <Label>分類（可選）</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                      {(activeTab === 'product' ? productCategories : 
                        activeTab === 'wiki' ? wikiCategories : newsCategories
                      ).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 快捷关键词 */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">快捷關鍵詞</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickKeywords[activeTab].map((kw) => (
                      <Button
                        key={kw}
                        variant="outline"
                        size="sm"
                        onClick={() => setKeyword(kw)}
                        className="text-xs"
                      >
                        {kw}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 生成结果 */}
            {generatedContent && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      生成結果
                      {seoAnalysis && (
                        <Badge className={getGradeColor(seoAnalysis.grade)}>
                          SEO {seoAnalysis.grade}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSEOAnalysis}
                        disabled={analyzingSeo}
                      >
                        {analyzingSeo ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <BarChart3 className="w-4 h-4 mr-1" />
                        )}
                        SEO分析
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleGenerateImage}
                        disabled={generatingImage}
                      >
                        {generatingImage ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4 mr-1" />
                        )}
                        生成配圖
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                        <Eye className="w-4 h-4 mr-1" />
                        預覽
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleGenerate}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        重新生成
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4" ref={contentRef}>
                  {/* 生成的图片 */}
                  {generatedImages.length > 0 && (
                    <div className="space-y-2">
                      <Label>AI生成配圖</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {generatedImages.map((img, i) => (
                          <div 
                            key={i} 
                            className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                              generatedContent.coverImage === img.url 
                                ? 'border-primary' 
                                : 'border-transparent hover:border-muted-foreground/50'
                            }`}
                            onClick={() => handleSelectCoverImage(img.url)}
                          >
                            <img 
                              src={img.url} 
                              alt={`Generated ${i + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            {generatedContent.coverImage === img.url && (
                              <div className="absolute top-1 right-1">
                                <Badge className="bg-primary text-primary-foreground">
                                  已選擇
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        點擊圖片選擇作為封面
                      </p>
                    </div>
                  )}
                  
                  {/* 标题 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        標題
                        <Badge variant="secondary" className="text-xs">SEO優化</Badge>
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(generatedContent.title, 'title')}
                      >
                        {copied === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <Input
                      value={generatedContent.title}
                      onChange={(e) => setGeneratedContent({ ...generatedContent, title: e.target.value })}
                      className="font-medium"
                    />
                  </div>

                  {/* 摘要 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>摘要</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(generatedContent.summary, 'summary')}
                      >
                        {copied === 'summary' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <Textarea
                      value={generatedContent.summary}
                      onChange={(e) => setGeneratedContent({ ...generatedContent, summary: e.target.value })}
                      rows={2}
                    />
                  </div>

                  {/* 正文 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>正文內容</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(generatedContent.content, 'content')}
                      >
                        {copied === 'content' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <Textarea
                      value={generatedContent.content}
                      onChange={(e) => setGeneratedContent({ ...generatedContent, content: e.target.value })}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>

                  {/* SEO信息 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* 关键词 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        SEO關鍵詞
                        <Badge variant="outline" className="text-xs">自動提取</Badge>
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {generatedContent.keywords.map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Meta描述 */}
                    <div className="space-y-2">
                      <Label>Meta描述</Label>
                      <Textarea
                        value={generatedContent.metaDescription}
                        onChange={(e) => setGeneratedContent({ ...generatedContent, metaDescription: e.target.value })}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* 发布按钮 */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setGeneratedContent(null)}>
                      取消
                    </Button>
                    <Button variant="outline" onClick={handleSaveDraft}>
                      <FileText className="w-4 h-4 mr-2" />
                      保存草稿
                    </Button>
                    <Button onClick={handlePublish} disabled={publishing}>
                      {publishing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      發佈內容
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 生成中状态 */}
            {generating && (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    </div>
                    <p className="mt-4 font-medium">AI正在生成內容...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      正在為您生成SEO優化的{contentTypeConfig[activeTab].label}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：统计和历史 */}
          <div className="space-y-6">
            {/* 统计信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  生成統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {history.filter(h => h.type === 'product').length}
                    </p>
                    <p className="text-xs text-muted-foreground">產品內容</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {history.filter(h => h.type === 'wiki').length}
                    </p>
                    <p className="text-xs text-muted-foreground">百科內容</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {history.filter(h => h.type === 'news').length}
                    </p>
                    <p className="text-xs text-muted-foreground">新聞資訊</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {history.filter(h => h.status === 'published').length}
                    </p>
                    <p className="text-xs text-muted-foreground">已發佈</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 生成历史 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  生成歷史
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {history.map((item) => {
                      const Icon = contentTypeConfig[item.type].icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setActiveTab(item.type);
                            setKeyword(item.keyword);
                          }}
                        >
                          <Icon className={`w-4 h-4 ${contentTypeConfig[item.type].color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.keyword}</p>
                          </div>
                          <Badge 
                            variant={item.status === 'published' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.status === 'published' ? '已發佈' : '草稿'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暫無生成記錄</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 草稿列表 */}
            {drafts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    草稿箱
                    <Badge variant="secondary" className="ml-auto">
                      {drafts.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {drafts.slice(0, 5).map((draft) => {
                      const Icon = contentTypeConfig[draft.type].icon;
                      return (
                        <div
                          key={draft.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group"
                        >
                          <Icon className={`w-4 h-4 ${contentTypeConfig[draft.type].color}`} />
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => loadDraft(draft)}
                          >
                            <p className="text-sm font-medium truncate">{draft.content.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(draft.savedAt).toLocaleDateString('zh-TW')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDraft(draft.id);
                            }}
                          >
                            <XCircle className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                    {drafts.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowDrafts(true)}
                      >
                        查看全部 {drafts.length} 個草稿
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO优化提示 */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  SEO優化說明
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 標題自動包含核心關鍵詞</p>
                <p>• 內容結構符合搜索引擎規範</p>
                <p>• 自動生成Meta描述和關鍵詞</p>
                <p>• 內容原創度高，利於收錄</p>
                <p>• 支持繁體中文SEO優化</p>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </main>

      {/* SEO分析对话框 */}
      <Dialog open={showSeoPanel} onOpenChange={setShowSeoPanel}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              SEO分析報告
            </DialogTitle>
            <DialogDescription>
              檢測內容的SEO質量並獲取優化建議
            </DialogDescription>
          </DialogHeader>
          
          {seoAnalysis && (
            <div className="space-y-6">
              {/* 总体评分 */}
              <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(seoAnalysis.score)}`}>
                    {seoAnalysis.score}
                  </div>
                  <Badge className={`mt-2 text-lg px-4 py-1 ${getGradeColor(seoAnalysis.grade)}`}>
                    等級 {seoAnalysis.grade}
                  </Badge>
                </div>
              </div>

              {/* 各项分析 */}
              <div className="space-y-4">
                {/* 标题分析 */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">標題</span>
                    <span className={getScoreColor(seoAnalysis.analysis.title.score)}>
                      {seoAnalysis.analysis.title.score}分
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>長度: {seoAnalysis.analysis.title.length}字</span>
                    <span>包含關鍵詞: {seoAnalysis.analysis.title.hasKeyword ? '✓' : '✗'}</span>
                  </div>
                  {seoAnalysis.analysis.title.suggestions.length > 0 && (
                    <div className="mt-2 text-sm text-orange-600">
                      {seoAnalysis.analysis.title.suggestions.map((s, i) => (
                        <p key={i}>• {s}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* 摘要分析 */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">摘要</span>
                    <span className={getScoreColor(seoAnalysis.analysis.summary.score)}>
                      {seoAnalysis.analysis.summary.score}分
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>長度: {seoAnalysis.analysis.summary.length}字</span>
                    <span>包含關鍵詞: {seoAnalysis.analysis.summary.hasKeyword ? '✓' : '✗'}</span>
                  </div>
                  {seoAnalysis.analysis.summary.suggestions.length > 0 && (
                    <div className="mt-2 text-sm text-orange-600">
                      {seoAnalysis.analysis.summary.suggestions.map((s, i) => (
                        <p key={i}>• {s}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* 内容分析 */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">正文內容</span>
                    <span className={getScoreColor(seoAnalysis.analysis.content.score)}>
                      {seoAnalysis.analysis.content.score}分
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                    <span>字數: {seoAnalysis.analysis.content.length}字</span>
                    <span>可讀性: {seoAnalysis.analysis.content.readability}分</span>
                  </div>
                  {Object.keys(seoAnalysis.analysis.content.keywordDensity).length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <span>關鍵詞密度: </span>
                      {Object.entries(seoAnalysis.analysis.content.keywordDensity).map(([kw, density]) => (
                        <Badge key={kw} variant="outline" className="mr-1">
                          {kw}: {density}%
                        </Badge>
                      ))}
                    </div>
                  )}
                  {seoAnalysis.analysis.content.suggestions.length > 0 && (
                    <div className="mt-2 text-sm text-orange-600">
                      {seoAnalysis.analysis.content.suggestions.map((s, i) => (
                        <p key={i}>• {s}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* 关键词分析 */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">關鍵詞</span>
                    <span className={getScoreColor(seoAnalysis.analysis.keywords.score)}>
                      {seoAnalysis.analysis.keywords.score}分
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>數量: {seoAnalysis.analysis.keywords.count}個</span>
                    <span>相關度: {seoAnalysis.analysis.keywords.relevance}%</span>
                  </div>
                  {seoAnalysis.analysis.keywords.suggestions.length > 0 && (
                    <div className="mt-2 text-sm text-orange-600">
                      {seoAnalysis.analysis.keywords.suggestions.map((s, i) => (
                        <p key={i}>• {s}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meta描述分析 */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Meta描述</span>
                    <span className={getScoreColor(seoAnalysis.analysis.metaDescription.score)}>
                      {seoAnalysis.analysis.metaDescription.score}分
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>長度: {seoAnalysis.analysis.metaDescription.length}字</span>
                    <span>包含關鍵詞: {seoAnalysis.analysis.metaDescription.hasKeyword ? '✓' : '✗'}</span>
                  </div>
                  {seoAnalysis.analysis.metaDescription.suggestions.length > 0 && (
                    <div className="mt-2 text-sm text-orange-600">
                      {seoAnalysis.analysis.metaDescription.suggestions.map((s, i) => (
                        <p key={i}>• {s}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 总体建议 */}
              {seoAnalysis.overallSuggestions.length > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-600">優化建議</span>
                  </div>
                  <div className="text-sm text-orange-700 space-y-1">
                    {seoAnalysis.overallSuggestions.map((s, i) => (
                      <p key={i}>• {s}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSeoPanel(false)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 预览对话框 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>內容預覽</DialogTitle>
            <DialogDescription>
              預覽生成的內容效果
            </DialogDescription>
          </DialogHeader>
          
          {generatedContent && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{generatedContent.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  {generatedContent.keywords.slice(0, 3).map((kw, i) => (
                    <Badge key={i} variant="secondary">{kw}</Badge>
                  ))}
                </div>
              </div>
              
              <p className="text-muted-foreground">{generatedContent.summary}</p>
              
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{generatedContent.content}</div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>SEO描述：</strong>{generatedContent.metaDescription}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              關閉
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              發佈
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
