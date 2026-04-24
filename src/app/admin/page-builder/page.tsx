/**
 * @fileoverview 可视化页面编辑器（优化版）
 * @description 拖拽式页面装修工具，支持实时预览、图片上传、API持久化
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Save,
  Eye,
  Undo,
  Redo,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Type,
  Layout,
  Box,
  ShoppingBag,
  FileText,
  Video,
  Star,
  ChevronUp,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
  Upload,
  X,
  Link as LinkIcon,
  Loader2,
  Settings,
  Palette,
  RotateCcw,
  EyeOff,
  Eye as EyeIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerImage {
  url: string;
  link: string;
  alt: string;
}

interface PageBlock {
  id: string;
  type: 'banner' | 'product_grid' | 'category' | 'text' | 'video' | 'featured';
  title: string;
  order: number;
  visible: boolean;
  config: Record<string, unknown>;
}

const blockTypes = [
  { type: 'banner', label: '輪播圖', icon: ImageIcon, color: 'text-blue-600', description: '支持多張圖片輪播展示' },
  { type: 'product_grid', label: '商品展示', icon: ShoppingBag, color: 'text-green-600', description: '展示精選商品列表' },
  { type: 'category', label: '分類導航', icon: Layout, color: 'text-purple-600', description: '展示商品分類入口' },
  { type: 'text', label: '富文本', icon: Type, color: 'text-orange-600', description: '自定義文本內容' },
  { type: 'video', label: '視頻區塊', icon: Video, color: 'text-red-600', description: '嵌入視頻內容' },
  { type: 'featured', label: '推薦區塊', icon: Star, color: 'text-yellow-600', description: '精選推薦內容' },
];

export default function PageBuilderPage() {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<PageBlock | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [history, setHistory] = useState<PageBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPageBlocks();
  }, []);

  const loadPageBlocks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/page-blocks');
      const data = await res.json();
      
      if (data.data && data.data.length > 0) {
        setBlocks(data.data.map((b: PageBlock) => ({
          id: String(b.id),
          type: b.type,
          title: b.title,
          order: b.order,
          visible: b.visible,
          config: b.config || {},
        })));
      } else {
        // 使用默认数据
        const defaultBlocks: PageBlock[] = [
          {
            id: 'block-1',
            type: 'banner',
            title: '首頁輪播圖',
            order: 1,
            visible: true,
            config: {
              images: [],
              autoplay: true,
              interval: 5000,
            },
          },
          {
            id: 'block-2',
            type: 'category',
            title: '商品分類',
            order: 2,
            visible: true,
            config: {
              columns: 4,
              showTitle: true,
            },
          },
          {
            id: 'block-3',
            type: 'product_grid',
            title: '熱門商品',
            order: 3,
            visible: true,
            config: {
              title: '熱門商品推薦',
              count: 8,
              columns: 4,
              showMore: true,
            },
          },
        ];
        setBlocks(defaultBlocks);
      }
      setHistory([blocks]);
      setHistoryIndex(0);
    } catch (error) {
      console.error('加载页面模块失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHistory = useCallback((newBlocks: PageBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1]);
    }
  };

  const handleAddBlock = (type: string) => {
    const newBlock: PageBlock = {
      id: `block-${Date.now()}`,
      type: type as PageBlock['type'],
      title: blockTypes.find(b => b.type === type)?.label || '新區塊',
      order: blocks.length + 1,
      visible: true,
      config: {},
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    saveHistory(newBlocks);
    setSelectedBlock(newBlock);
    setEditDialogOpen(true);
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('確定要刪除此區塊嗎？')) return;
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    saveHistory(newBlocks);
    
    // 如果是已保存的模块，调用API删除
    if (!id.startsWith('block-')) {
      try {
        await fetch(`/api/page-blocks/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('删除模块失败:', error);
      }
    }
  };

  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      newBlocks.forEach((b, i) => b.order = i + 1);
      setBlocks(newBlocks);
      saveHistory(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      newBlocks.forEach((b, i) => b.order = i + 1);
      setBlocks(newBlocks);
      saveHistory(newBlocks);
    }
  };

  // 拖拽相关
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);
    newBlocks.forEach((b, i) => b.order = i + 1);
    setBlocks(newBlocks);
    saveHistory(newBlocks);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleToggleVisible = (id: string) => {
    const newBlocks = blocks.map(b => 
      b.id === id ? { ...b, visible: !b.visible } : b
    );
    setBlocks(newBlocks);
    saveHistory(newBlocks);
  };

  const handleSaveBlock = (updatedBlock: PageBlock) => {
    const newBlocks = blocks.map(b => 
      b.id === updatedBlock.id ? updatedBlock : b
    );
    setBlocks(newBlocks);
    saveHistory(newBlocks);
    setEditDialogOpen(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/page-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
      const data = await res.json();
      
      if (data.message) {
        alert('保存成功！');
        // 重新加载数据以获取真实ID
        loadPageBlocks();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  // 图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banners');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.data?.url) {
        // 添加图片到当前选中的banner模块
        if (selectedBlock && selectedBlock.type === 'banner') {
          const images = (selectedBlock.config.images as BannerImage[]) || [];
          const newImages = [...images, { url: data.data.url, link: '', alt: file.name }];
          setSelectedBlock({
            ...selectedBlock,
            config: { ...selectedBlock.config, images: newImages },
          });
        }
      } else {
        throw new Error(data.error || '上傳失敗');
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      alert('上傳失敗，請重試');
    } finally {
      setUploading(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    if (selectedBlock && selectedBlock.type === 'banner') {
      const images = (selectedBlock.config.images as BannerImage[]) || [];
      const newImages = images.filter((_, i) => i !== index);
      setSelectedBlock({
        ...selectedBlock,
        config: { ...selectedBlock.config, images: newImages },
      });
    }
  };

  const updateImage = (index: number, field: 'url' | 'link' | 'alt', value: string) => {
    if (selectedBlock && selectedBlock.type === 'banner') {
      const images = (selectedBlock.config.images as BannerImage[]) || [];
      const newImages = [...images];
      newImages[index] = { ...newImages[index], [field]: value };
      setSelectedBlock({
        ...selectedBlock,
        config: { ...selectedBlock.config, images: newImages },
      });
    }
  };

  const getBlockTypeIcon = (type: string) => {
    const blockType = blockTypes.find(b => b.type === type);
    if (!blockType) return Box;
    return blockType.icon;
  };

  const getBlockTypeColor = (type: string) => {
    const blockType = blockTypes.find(b => b.type === type);
    return blockType?.color || 'text-gray-600';
  };

  const previewWidth = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-bold">頁面裝修</h1>
                <p className="text-xs text-muted-foreground">首頁可視化編輯器</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 撤销/重做 */}
              <Button variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="w-4 h-4" />
              </Button>
              
              {/* 预览模式切换 */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setPreviewMode('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                預覽
              </Button>
              <Button onClick={handleSaveAll} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* 左侧：区块列表 */}
        <div className="w-80 bg-background border-r flex flex-col flex-shrink-0">
          <ScrollArea className="flex-1">
            <div className="p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                頁面區塊
              </h2>
              
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                  載入中...
                </div>
              ) : blocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Box className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>暫無區塊</p>
                  <p className="text-xs">點擊下方按鈕添加</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blocks.map((block, index) => {
                    const Icon = getBlockTypeIcon(block.type);
                    return (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all",
                          selectedBlock?.id === block.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'hover:border-primary/50 hover:bg-muted/50',
                          !block.visible && 'opacity-50',
                          draggedIndex === index && 'opacity-50 scale-95',
                          dragOverIndex === index && 'border-primary border-dashed bg-primary/5'
                        )}
                        onClick={() => {
                          setSelectedBlock(block);
                          setEditDialogOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move flex-shrink-0" />
                          <Icon className={cn("w-5 h-5 flex-shrink-0", getBlockTypeColor(block.type))} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{block.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {blockTypes.find(b => b.type === block.type)?.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVisible(block.id);
                              }}
                            >
                              {block.visible ? (
                                <EyeIcon className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBlock(block.id);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 添加区块 */}
          <div className="p-4 border-t bg-muted/30">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加區塊
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {blockTypes.map((bt) => {
                const Icon = bt.icon;
                return (
                  <Button
                    key={bt.type}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2.5 flex flex-col items-center gap-1"
                    onClick={() => handleAddBlock(bt.type)}
                  >
                    <Icon className={cn("w-4 h-4", bt.color)} />
                    <span className="text-xs">{bt.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧：预览区域 */}
        <div className="flex-1 overflow-y-auto bg-muted/50 p-6">
          <div
            className="mx-auto bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300 border"
            style={{ width: previewWidth[previewMode] }}
          >
            {blocks.filter(b => b.visible).length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Layout className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>暫無可顯示的區塊</p>
                <p className="text-xs mt-2">添加區塊或啟用現有區塊</p>
              </div>
            ) : (
              blocks.filter(b => b.visible).map((block) => {
                const Icon = getBlockTypeIcon(block.type);
                return (
                  <div
                    key={block.id}
                    className={cn(
                      "border-2 border-dashed border-transparent hover:border-primary/30 p-4 cursor-pointer transition-colors relative group",
                      selectedBlock?.id === block.id && 'border-primary bg-primary/5'
                    )}
                    onClick={() => {
                      setSelectedBlock(block);
                      setEditDialogOpen(true);
                    }}
                  >
                    {/* 快捷操作栏 */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisible(block.id);
                        }}
                      >
                        {block.visible ? (
                          <EyeIcon className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlock(block);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {block.type === 'banner' && (
                      <div className="aspect-[3/1] bg-muted rounded-lg flex items-center justify-center">
                        {((block.config.images as BannerImage[]) || []).length > 0 ? (
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">{block.title}</p>
                            <p className="text-xs">{(block.config.images as BannerImage[]).length} 張圖片</p>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">{block.title}</p>
                            <p className="text-xs">點擊上傳圖片</p>
                          </div>
                        )}
                      </div>
                    )}
                    {block.type === 'category' && (
                      <div className="py-4">
                        <p className="text-center text-sm font-medium mb-4">{block.title}</p>
                        <div className="grid grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                              分類{i}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {block.type === 'product_grid' && (
                      <div className="py-4">
                        <p className="text-center text-sm font-medium mb-4">{block.config.title as string || block.title}</p>
                        <div className="grid grid-cols-4 gap-4">
                          {Array.from({ length: (block.config.count as number) || 4 }).map((_, i) => (
                            <div key={i} className="bg-muted rounded-lg p-3">
                              <div className="aspect-square bg-background rounded mb-2" />
                              <div className="h-3 bg-background rounded w-3/4 mb-1" />
                              <div className="h-4 bg-primary/20 rounded w-1/2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {block.type === 'text' && (
                      <div className="py-4 px-2">
                        <div className="text-sm text-muted-foreground">
                          {(block.config.content as string)?.replace(/<[^>]+>/g, '').slice(0, 100) || '富文本內容區塊'}
                        </div>
                      </div>
                    )}
                    {block.type === 'video' && (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Video className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">{block.title}</p>
                          <p className="text-xs">{(block.config.videoUrl as string) || '點擊配置視頻'}</p>
                        </div>
                      </div>
                    )}
                    {block.type === 'featured' && (
                      <div className="py-4">
                        <p className="text-center text-sm font-medium mb-4">{block.title}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="aspect-video bg-muted rounded-lg" />
                          <div className="aspect-video bg-muted rounded-lg" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedBlock && (
                <>
                  {(() => {
                    const Icon = getBlockTypeIcon(selectedBlock.type);
                    return <Icon className={cn("w-5 h-5", getBlockTypeColor(selectedBlock.type))} />;
                  })()}
                  編輯區塊
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedBlock && (
            <div className="space-y-6">
              {/* 基础设置 */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  基礎設置
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>區塊標題</Label>
                    <Input
                      value={selectedBlock.title}
                      onChange={(e) => setSelectedBlock({ ...selectedBlock, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>狀態</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <Switch
                        checked={selectedBlock.visible}
                        onCheckedChange={(checked) => setSelectedBlock({ ...selectedBlock, visible: checked })}
                      />
                      <span className="text-sm">{selectedBlock.visible ? '顯示' : '隱藏'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Banner配置 */}
              {selectedBlock.type === 'banner' && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    輪播圖設置
                  </h4>
                  
                  {/* 图片列表 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>圖片列表</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-1" />
                        )}
                        上傳圖片
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    
                    {((selectedBlock.config.images as BannerImage[]) || []).map((img, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex gap-3">
                          <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            {img.url && (
                              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="鏈接地址"
                                value={img.link}
                                onChange={(e) => updateImage(index, 'link', e.target.value)}
                                className="flex-1"
                              />
                              <Input
                                placeholder="替代文本"
                                value={img.alt}
                                onChange={(e) => updateImage(index, 'alt', e.target.value)}
                                className="w-32"
                              />
                            </div>
                            <Input
                              placeholder="圖片URL"
                              value={img.url}
                              onChange={(e) => updateImage(index, 'url', e.target.value)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {((selectedBlock.config.images as BannerImage[]) || []).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">點擊上方按鈕上傳圖片</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>自動播放</Label>
                      <Switch
                        checked={selectedBlock.config.autoplay as boolean}
                        onCheckedChange={(checked) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, autoplay: checked }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>輪播間隔（毫秒）</Label>
                      <Input
                        type="number"
                        value={selectedBlock.config.interval as number || 5000}
                        onChange={(e) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, interval: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 商品展示配置 */}
              {selectedBlock.type === 'product_grid' && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    商品展示設置
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>區塊標題</Label>
                      <Input
                        value={selectedBlock.config.title as string || ''}
                        onChange={(e) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, title: e.target.value }
                        })}
                        placeholder="熱門商品推薦"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>顯示數量</Label>
                      <Select
                        value={(selectedBlock.config.count as number || 8).toString()}
                        onValueChange={(v) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, count: parseInt(v) }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4個</SelectItem>
                          <SelectItem value="8">8個</SelectItem>
                          <SelectItem value="12">12個</SelectItem>
                          <SelectItem value="16">16個</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>列數</Label>
                      <Select
                        value={(selectedBlock.config.columns as number || 4).toString()}
                        onValueChange={(v) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, columns: parseInt(v) }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2列</SelectItem>
                          <SelectItem value="3">3列</SelectItem>
                          <SelectItem value="4">4列</SelectItem>
                          <SelectItem value="5">5列</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>顯示「查看更多」</Label>
                      <Switch
                        checked={selectedBlock.config.showMore as boolean}
                        onCheckedChange={(checked) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, showMore: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 分类导航配置 */}
              {selectedBlock.type === 'category' && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    分類導航設置
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>列數</Label>
                      <Select
                        value={(selectedBlock.config.columns as number || 4).toString()}
                        onValueChange={(v) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, columns: parseInt(v) }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3列</SelectItem>
                          <SelectItem value="4">4列</SelectItem>
                          <SelectItem value="5">5列</SelectItem>
                          <SelectItem value="6">6列</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>顯示標題</Label>
                      <Switch
                        checked={selectedBlock.config.showTitle as boolean}
                        onCheckedChange={(checked) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, showTitle: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 富文本配置 */}
              {selectedBlock.type === 'text' && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    富文本設置
                  </h4>
                  <div className="space-y-2">
                    <Label>內容（支持 HTML）</Label>
                    <Textarea
                      value={selectedBlock.config.content as string || ''}
                      onChange={(e) => setSelectedBlock({
                        ...selectedBlock,
                        config: { ...selectedBlock.config, content: e.target.value }
                      })}
                      rows={8}
                      placeholder="<h2>標題</h2><p>段落內容...</p>"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>背景顏色</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedBlock.config.backgroundColor as string || '#ffffff'}
                        onChange={(e) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, backgroundColor: e.target.value }
                        })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={selectedBlock.config.backgroundColor as string || '#ffffff'}
                        onChange={(e) => setSelectedBlock({
                          ...selectedBlock,
                          config: { ...selectedBlock.config, backgroundColor: e.target.value }
                        })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 视频配置 */}
              {selectedBlock.type === 'video' && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    視頻設置
                  </h4>
                  <div className="space-y-2">
                    <Label>視頻URL</Label>
                    <Input
                      value={selectedBlock.config.videoUrl as string || ''}
                      onChange={(e) => setSelectedBlock({
                        ...selectedBlock,
                        config: { ...selectedBlock.config, videoUrl: e.target.value }
                      })}
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>封面圖</Label>
                    <Input
                      value={selectedBlock.config.coverImage as string || ''}
                      onChange={(e) => setSelectedBlock({
                        ...selectedBlock,
                        config: { ...selectedBlock.config, coverImage: e.target.value }
                      })}
                      placeholder="封面圖URL"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>自動播放</Label>
                    <Switch
                      checked={selectedBlock.config.autoplay as boolean}
                      onCheckedChange={(checked) => setSelectedBlock({
                        ...selectedBlock,
                        config: { ...selectedBlock.config, autoplay: checked }
                      })}
                    />
                  </div>
                </div>
              )}

              {/* 推荐区块配置 */}
              {selectedBlock.type === 'featured' && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    推薦區塊設置
                  </h4>
                  <div className="space-y-2">
                    <Label>布局樣式</Label>
                    <Select
                      value={selectedBlock.config.layout as string || 'grid'}
                      onValueChange={(v) => setSelectedBlock({
                        ...selectedBlock,
                        config: { ...selectedBlock.config, layout: v }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">網格布局</SelectItem>
                        <SelectItem value="carousel">輪播布局</SelectItem>
                        <SelectItem value="list">列表布局</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => selectedBlock && handleSaveBlock(selectedBlock)}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
