/**
 * @fileoverview 可视化页面编辑器
 * @description 拖拽式页面装修工具，编辑首页模块
 * @module app/admin/page-builder/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from 'lucide-react';

interface PageBlock {
  id: string;
  type: 'banner' | 'product_grid' | 'category' | 'text' | 'video' | 'featured';
  title: string;
  order: number;
  visible: boolean;
  config: Record<string, unknown>;
}

const blockTypes = [
  { type: 'banner', label: '輪播圖', icon: ImageIcon, color: 'text-blue-600' },
  { type: 'product_grid', label: '商品展示', icon: ShoppingBag, color: 'text-green-600' },
  { type: 'category', label: '分類導航', icon: Layout, color: 'text-purple-600' },
  { type: 'text', label: '富文本', icon: Type, color: 'text-orange-600' },
  { type: 'video', label: '視頻區塊', icon: Video, color: 'text-red-600' },
  { type: 'featured', label: '推薦區塊', icon: Star, color: 'text-yellow-600' },
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

  useEffect(() => {
    loadPageBlocks();
  }, []);

  const loadPageBlocks = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockBlocks: PageBlock[] = [
        {
          id: 'block-1',
          type: 'banner',
          title: '首頁輪播圖',
          order: 1,
          visible: true,
          config: {
            images: [
              { url: '/banner-1.jpg', link: '/shop', alt: '新品上市' },
              { url: '/banner-2.jpg', link: '/wiki', alt: '玄門百科' },
            ],
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
        {
          id: 'block-4',
          type: 'featured',
          title: '精選推薦',
          order: 4,
          visible: true,
          config: {
            layout: 'grid',
            items: [
              { type: 'product', id: 1 },
              { type: 'article', id: 1 },
            ],
          },
        },
        {
          id: 'block-5',
          type: 'text',
          title: '品牌故事',
          order: 5,
          visible: false,
          config: {
            content: '<h2>關於符寶網</h2><p>全球玄門文化科普交易平台...</p>',
            backgroundColor: '#f5f5f5',
          },
        },
      ];
      setBlocks(mockBlocks);
      setHistory([mockBlocks]);
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

  const handleDeleteBlock = (id: string) => {
    if (!confirm('確定要刪除此區塊嗎？')) return;
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    saveHistory(newBlocks);
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
      // TODO: 调用API保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失敗，請重試');
    } finally {
      setSaving(false);
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
        <div className="w-72 bg-background border-r overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h2 className="font-semibold mb-4">頁面區塊</h2>
            
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">載入中...</div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block, index) => {
                  const Icon = getBlockTypeIcon(block.type);
                  return (
                    <div
                      key={block.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBlock?.id === block.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      } ${!block.visible ? 'opacity-50' : ''}`}
                      onClick={() => {
                        setSelectedBlock(block);
                        setEditDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <Icon className={`w-5 h-5 ${getBlockTypeColor(block.type)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{block.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {blockTypes.find(b => b.type === block.type)?.label}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(block.id, 'up');
                            }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(block.id, 'down');
                            }}
                            disabled={index === blocks.length - 1}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 添加区块 */}
          <div className="p-4 border-t">
            <h3 className="font-semibold mb-3 text-sm">添加區塊</h3>
            <div className="grid grid-cols-2 gap-2">
              {blockTypes.map((bt) => {
                const Icon = bt.icon;
                return (
                  <Button
                    key={bt.type}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 flex flex-col"
                    onClick={() => handleAddBlock(bt.type)}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${bt.color}`} />
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
            className="mx-auto bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300"
            style={{ width: previewWidth[previewMode] }}
          >
            {/* 模拟页面预览 */}
            {blocks.filter(b => b.visible).map((block) => {
              const Icon = getBlockTypeIcon(block.type);
              return (
                <div
                  key={block.id}
                  className={`border-2 border-dashed border-transparent hover:border-primary/30 p-4 cursor-pointer transition-colors ${
                    selectedBlock?.id === block.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    setSelectedBlock(block);
                    setEditDialogOpen(true);
                  }}
                >
                  {block.type === 'banner' && (
                    <div className="aspect-[3/1] bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">{block.title}</p>
                        <p className="text-xs">輪播圖區塊</p>
                      </div>
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
                        {[1, 2, 3, 4].map(i => (
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
            })}
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>編輯區塊</DialogTitle>
          </DialogHeader>
          {selectedBlock && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>區塊標題</Label>
                <Input
                  value={selectedBlock.title}
                  onChange={(e) => setSelectedBlock({ ...selectedBlock, title: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={selectedBlock.visible}
                  onChange={(e) => setSelectedBlock({ ...selectedBlock, visible: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="visible">顯示此區塊</Label>
              </div>

              {selectedBlock.type === 'banner' && (
                <>
                  <div className="space-y-2">
                    <Label>自動播放</Label>
                    <Select
                      value={selectedBlock.config.autoplay ? 'true' : 'false'}
                      onValueChange={(v) => setSelectedBlock({
                        ...selectedBlock,
                        config: { ...selectedBlock.config, autoplay: v === 'true' }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">開啟</SelectItem>
                        <SelectItem value="false">關閉</SelectItem>
                      </SelectContent>
                    </Select>
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
                </>
              )}

              {selectedBlock.type === 'product_grid' && (
                <>
                  <div className="space-y-2">
                    <Label>顯示數量</Label>
                    <Input
                      type="number"
                      value={selectedBlock.config.count as number || 8}
                      onChange={(e) => setSelectedBlock({
                        ...selectedBlock,
                        config: { ...selectedBlock.config, count: parseInt(e.target.value) }
                      })}
                    />
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
                </>
              )}

              {selectedBlock.type === 'text' && (
                <div className="space-y-2">
                  <Label>內容</Label>
                  <Textarea
                    value={selectedBlock.config.content as string || ''}
                    onChange={(e) => setSelectedBlock({
                      ...selectedBlock,
                      config: { ...selectedBlock.config, content: e.target.value }
                    })}
                    rows={6}
                    placeholder="支持 HTML 格式"
                  />
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
