/**
 * @fileoverview 商户商品管理页面
 * @description 商户管理自己的商品（真实API版）
 * @module app/merchant/dashboard/goods/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface Goods {
  id: number;
  name: string;
  main_image: string | null;
  images: string[];
  price: string | number;
  original_price: string | number | null;
  stock: number;
  sales: number;
  status: number;
  category_id: number;
  description: string;
  created_at: string;
}

const CATEGORY_MAP: Record<number, string> = {
  1: '符籙',
  2: '法器',
  3: '書籍',
  4: '服飾',
  5: '其他',
};

export default function MerchantGoodsPage() {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const loadGoods = useCallback(async () => {
    setLoading(true);
    try {
      const merchantToken = localStorage.getItem('merchant_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (statusFilter !== 'all') {
        params.set('status', statusFilter === 'active' ? '1' : statusFilter === 'inactive' ? '0' : '');
      }
      if (searchTerm.trim()) {
        params.set('keyword', searchTerm.trim());
      }

      const res = await fetch(`/api/merchant/goods?${params}`, {
        headers: merchantToken ? { 'Authorization': `Bearer ${merchantToken}` } : {},
      });
      const data = await res.json();

      if (data.success && data.data) {
        setGoods(data.data);
        setTotal(data.total || 0);
      } else {
        setGoods([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('加载商品失败:', error);
      setGoods([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    loadGoods();
  }, [loadGoods]);

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      const merchantToken = localStorage.getItem('merchant_token');
      const res = await fetch('/api/merchant/goods', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(merchantToken ? { 'Authorization': `Bearer ${merchantToken}` } : {}),
        },
        body: JSON.stringify({ id, status: currentStatus === 1 ? 0 : 1 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(currentStatus === 1 ? '商品已下架' : '商品已上架');
        loadGoods();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此商品嗎？')) return;
    try {
      const merchantToken = localStorage.getItem('merchant_token');
      const res = await fetch(`/api/merchant/goods?id=${id}`, {
        method: 'DELETE',
        headers: merchantToken ? { 'Authorization': `Bearer ${merchantToken}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        toast.success('商品已刪除');
        loadGoods();
      } else {
        toast.error(data.error || '刪除失敗');
      }
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <MerchantLayout title="商品管理" description="管理店鋪商品">
      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索商品名稱..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10"
              onKeyDown={(e) => { if (e.key === 'Enter') loadGoods(); }}
            />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部商品</SelectItem>
              <SelectItem value="active">銷售中</SelectItem>
              <SelectItem value="inactive">已下架</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/merchant/dashboard/goods/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            發布商品
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : goods.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">暫無商品</p>
              <Link href="/merchant/dashboard/goods/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  發布商品
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品信息</TableHead>
                    <TableHead>價格</TableHead>
                    <TableHead>庫存</TableHead>
                    <TableHead>銷量</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>創建時間</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goods.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-muted rounded flex items-center justify-center text-muted-foreground overflow-hidden">
                            {item.main_image ? (
                              <img src={item.main_image} alt={item.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              <ImageIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <div className="flex gap-1 mt-1">
                              {item.category_id && (
                                <Badge variant="outline" className="text-xs">{CATEGORY_MAP[item.category_id] || '其他'}</Badge>
                              )}
                              {item.stock < 20 && (
                                <Badge variant="destructive" className="text-xs">庫存不足</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-primary">HK${item.price}</p>
                          {item.original_price && (
                            <p className="text-xs text-muted-foreground line-through">
                              HK${item.original_price}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={item.stock < 20 ? 'text-red-600 font-medium' : ''}>
                          {item.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.sales}</TableCell>
                      <TableCell>
                        <Switch
                          checked={item.status === 1}
                          onCheckedChange={() => handleToggleStatus(item.id, item.status)}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/shop/${item.id}`} target="_blank">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/merchant/dashboard/goods/${item.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(item.id)}
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

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 頁，共 {total} 條
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </MerchantLayout>
  );
}
