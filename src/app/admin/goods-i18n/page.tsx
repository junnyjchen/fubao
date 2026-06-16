/**
 * @fileoverview 商品多语言管理页面
 * @description 管理商品的国际化翻译
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Globe, Plus, Edit2, Trash2, Save, Search, Loader2, Check, X, Languages } from 'lucide-react';
import { toast } from 'sonner';

const LOCALE_LABELS: Record<string, string> = {
  'zh-TW': '繁體中文',
  'zh-CN': '簡體中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
};

const LOCALE_FLAGS: Record<string, string> = {
  'zh-TW': '🇹🇼',
  'zh-CN': '🇨🇳',
  'en': '🇺🇸',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
};

interface Goods {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  main_image: string;
  price: number;
  category_id: number;
  status: number;
}

interface Translation {
  id?: number;
  goods_id: number;
  locale: string;
  name: string;
  subtitle: string;
  description: string;
}

export default function GoodsI18nPage() {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [selectedGoods, setSelectedGoods] = useState<Goods | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [editTranslations, setEditTranslations] = useState<Record<string, { name: string; subtitle: string; description: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addLocale, setAddLocale] = useState('');
  const [addName, setAddName] = useState('');
  const [addSubtitle, setAddSubtitle] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    loadGoods();
  }, []);

  const loadGoods = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goods?pageSize=100');
      const data = await res.json();
      setGoods(data.data || []);
    } catch (error) {
      toast.error('加載商品失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadTranslations = useCallback(async (goodsId: number) => {
    try {
      const res = await fetch(`/api/goods/i18n?goods_id=${goodsId}`);
      const data = await res.json();
      const trans: Translation[] = data.data || (data.data === null ? [] : []);
      setTranslations(Array.isArray(trans) ? trans : []);

      // 初始化编辑状态
      const editState: Record<string, { name: string; subtitle: string; description: string }> = {};
      for (const t of trans) {
        editState[t.locale] = { name: t.name, subtitle: t.subtitle || '', description: t.description || '' };
      }
      setEditTranslations(editState);
    } catch (error) {
      toast.error('加載翻譯失敗');
    }
  }, []);

  const handleSelectGoods = (g: Goods) => {
    setSelectedGoods(g);
    loadTranslations(g.id);
  };

  const handleSaveTranslation = async (locale: string) => {
    if (!selectedGoods || !editTranslations[locale]) return;

    setSaving(true);
    try {
      const res = await fetch('/api/goods/i18n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goods_id: selectedGoods.id,
          locale,
          ...editTranslations[locale],
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${LOCALE_LABELS[locale] || locale} 翻譯已保存`);
        loadTranslations(selectedGoods.id);
      } else {
        toast.error(data.error || '保存失敗');
      }
    } catch (error) {
      toast.error('保存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTranslation = async () => {
    if (!selectedGoods || !addLocale || !addName.trim()) {
      toast.error('請選擇語言並填寫名稱');
      return;
    }

    setAddSaving(true);
    try {
      const res = await fetch('/api/goods/i18n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goods_id: selectedGoods.id,
          locale: addLocale,
          name: addName,
          subtitle: addSubtitle,
          description: addDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${LOCALE_LABELS[addLocale]} 翻譯已添加`);
        setDialogOpen(false);
        setAddLocale('');
        setAddName('');
        setAddSubtitle('');
        setAddDescription('');
        loadTranslations(selectedGoods.id);
      } else {
        toast.error(data.error || '添加失敗');
      }
    } catch (error) {
      toast.error('添加失敗');
    } finally {
      setAddSaving(false);
    }
  };

  const handleDeleteTranslation = async (transId: number, locale: string) => {
    if (!selectedGoods) return;

    try {
      const res = await fetch(`/api/goods/i18n?id=${transId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`${LOCALE_LABELS[locale]} 翻譯已刪除`);
        loadTranslations(selectedGoods.id);
      } else {
        toast.error(data.error || '刪除失敗');
      }
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  // 已翻译的语言
  const translatedLocales = translations.map(t => t.locale);
  // 可添加的语言
  const availableLocales = Object.keys(LOCALE_LABELS).filter(l => !translatedLocales.includes(l));

  // 过滤商品
  const filteredGoods = searchKeyword
    ? goods.filter(g => g.name.toLowerCase().includes(searchKeyword.toLowerCase()))
    : goods;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Languages className="w-6 h-6" />
              商品多語言管理
            </h1>
            <p className="text-muted-foreground mt-1">管理商品的國際化翻譯，支持繁/簡中文、英文、日文、韓文</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：商品列表 */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">商品列表</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索商品..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredGoods.map(g => (
                    <div
                      key={g.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedGoods?.id === g.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectGoods(g)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs overflow-hidden">
                          {g.main_image ? (
                            <img src={g.main_image} alt={g.name} className="w-full h-full object-cover" />
                          ) : (
                            '📦'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{g.name}</p>
                          <p className="text-xs text-muted-foreground">${g.price}</p>
                        </div>
                        <div className="flex gap-1">
                          {translatedLocales.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {translatedLocales.length}語
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredGoods.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">暫無商品</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 右侧：翻译编辑 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {selectedGoods ? `翻譯管理 - ${selectedGoods.name}` : '請選擇商品'}
              </CardTitle>
              {selectedGoods && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>原文 (繁體中文):</span>
                  <span className="font-medium text-foreground">{selectedGoods.name}</span>
                  {selectedGoods.subtitle && (
                    <span className="text-muted-foreground">/ {selectedGoods.subtitle}</span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedGoods ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Languages className="w-12 h-12 mb-4" />
                  <p>請從左側選擇一個商品開始管理翻譯</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 添加翻译按钮 */}
                  {availableLocales.length > 0 && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          添加語言翻譯
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>添加語言翻譯 - {selectedGoods.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>語言</Label>
                            <Select value={addLocale} onValueChange={setAddLocale}>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇語言" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableLocales.map(locale => (
                                  <SelectItem key={locale} value={locale}>
                                    {LOCALE_FLAGS[locale]} {LOCALE_LABELS[locale]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>商品名稱</Label>
                            <Input
                              value={addName}
                              onChange={e => setAddName(e.target.value)}
                              placeholder="輸入翻譯後的商品名稱"
                            />
                          </div>
                          <div>
                            <Label>副標題</Label>
                            <Input
                              value={addSubtitle}
                              onChange={e => setAddSubtitle(e.target.value)}
                              placeholder="輸入翻譯後的副標題（可選）"
                            />
                          </div>
                          <div>
                            <Label>商品描述</Label>
                            <Textarea
                              value={addDescription}
                              onChange={e => setAddDescription(e.target.value)}
                              placeholder="輸入翻譯後的商品描述（可選）"
                              rows={4}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                            <Button onClick={handleAddTranslation} disabled={addSaving}>
                              {addSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                              保存
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* 翻译列表 */}
                  {translations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>暫無翻譯，點擊上方按鈕添加</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {translations.map(t => (
                        <Card key={t.locale} className="border">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{LOCALE_FLAGS[t.locale]}</span>
                                <span className="font-medium">{LOCALE_LABELS[t.locale] || t.locale}</span>
                                <Badge variant="outline" className="text-xs">{t.locale}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSaveTranslation(t.locale)}
                                  disabled={saving}
                                >
                                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                  <span className="ml-1">保存</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => t.id && handleDeleteTranslation(t.id, t.locale)}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">商品名稱</Label>
                                <Input
                                  value={editTranslations[t.locale]?.name ?? t.name}
                                  onChange={e =>
                                    setEditTranslations(prev => ({
                                      ...prev,
                                      [t.locale]: { ...prev[t.locale] || { subtitle: '', description: '' }, name: e.target.value }
                                    }))
                                  }
                                  placeholder="翻譯名稱"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">副標題</Label>
                                <Input
                                  value={editTranslations[t.locale]?.subtitle ?? t.subtitle ?? ''}
                                  onChange={e =>
                                    setEditTranslations(prev => ({
                                      ...prev,
                                      [t.locale]: { ...prev[t.locale] || { name: '', description: '' }, subtitle: e.target.value }
                                    }))
                                  }
                                  placeholder="翻譯副標題"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">商品描述</Label>
                              <Textarea
                                value={editTranslations[t.locale]?.description ?? t.description ?? ''}
                                onChange={e =>
                                  setEditTranslations(prev => ({
                                    ...prev,
                                    [t.locale]: { ...prev[t.locale] || { name: '', subtitle: '' }, description: e.target.value }
                                  }))
                                }
                                placeholder="翻譯描述"
                                rows={3}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* 原文参考 */}
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium mb-2">原文參考 (繁體中文)</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-24">字段</TableHead>
                            <TableHead>內容</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">名稱</TableCell>
                            <TableCell>{selectedGoods.name}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">副標題</TableCell>
                            <TableCell>{selectedGoods.subtitle || '-'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">描述</TableCell>
                            <TableCell>{selectedGoods.description || '-'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
