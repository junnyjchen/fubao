/**
 * @fileoverview 商户商品管理页面
 * @description 商户管理自己的商品
 * @module app/merchant/dashboard/goods/page
 */

'use client';

import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';

interface Goods {
  id: number;
  name: string;
  main_image: string | null;
  price: string;
  original_price: string | null;
  stock: number;
  sales: number;
  status: boolean;
  category_id: number;
  category_name?: string;
  created_at: string;
}

export default function MerchantGoodsPage() {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGoods, setEditingGoods] = useState<Goods | null>(null);
  const limit = 15;

  useEffect(() => {
    loadGoods();
  }, [statusFilter, page]);

  const loadGoods = async () => {
    setLoading(true);
    try {
      // TODO: 调用真实API
      const mockGoods: Goods[] = [
        {
          id: 1,
          name: '開光平安符',
          main_image: null,
          price: '288',
          original_price: '388',
          stock: 156,
          sales: 1250,
          status: true,
          category_id: 1,
          category_name: '符籙',
          created_at: '2026-03-01',
        },
        {
          id: 2,
          name: '桃木劍',
          main_image: null,
          price: '680',
          original_price: null,
          stock: 45,
          sales: 320,
          status: true,
          category_id: 2,
          category_name: '法器',
          created_at: '2026-03-05',
        },
        {
          id: 3,
          name: '八卦鏡',
          main_image: null,
          price: '168',
          original_price: '198',
          stock: 8,
          sales: 580,
          status: true,
          category_id: 2,
          category_name: '法器',
          created_at: '2026-03-10',
        },
        {
          id: 4,
          name: '太歲符',
          main_image: null,
          price: '368',
          original_price: null,
          stock: 200,
          sales: 890,
          status: false,
          category_id: 1,
          category_name: '符籙',
          created_at: '2026-03-15',
        },
      ];

      let filtered = mockGoods;
      if (statusFilter === 'active') {
        filtered = mockGoods.filter(g => g.status);
      } else if (statusFilter === 'inactive') {
        filtered = mockGoods.filter(g => !g.status);
      } else if (statusFilter === 'low_stock') {
        filtered = mockGoods.filter(g => g.stock < 20);
      }

      setGoods(filtered);
      setTotal(filtered.length);
    } catch (error) {
      console.error('加载商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    // TODO: 调用API
    setGoods(goods.map(g => g.id === id ? { ...g, status: !currentStatus } : g));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此商品嗎？')) return;
    // TODO: 调用API
    setGoods(goods.filter(g => g.id !== id));
  };

  const filteredGoods = goods.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
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
              <SelectItem value="low_stock">庫存預警</SelectItem>
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
            <div className="text-center py-12 text-muted-foreground">載入中...</div>
          ) : filteredGoods.length === 0 ? (
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
                  {filteredGoods.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-muted rounded flex items-center justify-center text-muted-foreground">
                            {item.main_image ? (
                              <img src={item.main_image} alt={item.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              <ImageIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.category_name && (
                              <Badge variant="outline" className="text-xs">{item.category_name}</Badge>
                            )}
                            {item.stock < 20 && (
                              <Badge variant="destructive" className="text-xs ml-1">庫存不足</Badge>
                            )}
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
                          checked={item.status}
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
