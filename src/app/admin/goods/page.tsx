/**
 * @fileoverview 商品管理页面
 * @description 后台商品列表和管理
 * @module app/admin/goods/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';

interface Goods {
  id: number;
  name: string;
  price: string;
  original_price: string | null;
  stock: number;
  sales: number;
  status: boolean;
  is_certified: boolean;
  category_id: number | null;
  merchant_id: number;
  created_at: string;
  merchants: {
    id: number;
    name: string;
  };
}

export default function GoodsManagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [goods, setGoods] = useState<Goods[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const limit = 20;

  useEffect(() => {
    loadGoods();
  }, [page, statusFilter]);

  const loadGoods = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (keyword) {
        params.set('keyword', keyword);
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/admin/goods?${params}`);
      const data = await res.json();

      setGoods(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('加载商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadGoods();
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/goods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus ? 'inactive' : 'active' }),
      });

      const data = await res.json();
      if (data.message || data.data) {
        setGoods(goods.map(g => 
          g.id === id ? { ...g, status: !currentStatus } : g
        ));
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此商品嗎？')) return;

    try {
      const res = await fetch(`/api/admin/goods/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.message) {
        setGoods(goods.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('删除商品失败:', error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">商品管理</h1>
                <p className="text-sm text-muted-foreground">共 {total} 件商品</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/goods/new">
                <Plus className="w-4 h-4 mr-2" />
                添加商品
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜索 */}
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="搜索商品名稱..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {/* 筛选 */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="狀態篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="active">已上架</SelectItem>
                  <SelectItem value="inactive">已下架</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                載入中...
              </div>
            ) : goods.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暫無商品數據</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>商品名稱</TableHead>
                    <TableHead>價格</TableHead>
                    <TableHead className="text-center">庫存</TableHead>
                    <TableHead className="text-center">銷量</TableHead>
                    <TableHead className="text-center">狀態</TableHead>
                    <TableHead className="text-center">認證</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goods.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            圖片
                          </div>
                          <div>
                            <p className="font-medium truncate max-w-[200px]">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.merchants?.name || '-'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold text-primary">HK${item.price}</span>
                          {item.original_price && (
                            <span className="text-xs text-muted-foreground line-through ml-1">
                              ${item.original_price}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={item.stock < 10 ? 'text-red-600 font-semibold' : ''}>
                          {item.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{item.sales}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.status ? 'default' : 'secondary'}>
                          {item.status ? '上架' : '下架'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.is_certified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            已認證
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/goods/${item.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                編輯
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(item.id, item.status)}>
                              {item.status ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  下架
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  上架
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              刪除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  第 {page} / {totalPages} 頁
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
      </main>
    </div>
  );
}
