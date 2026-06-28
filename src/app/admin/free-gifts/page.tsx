/**
 * @fileoverview 免费领管理页面
 * @description 后台免费送活动管理 + 领取记录
 * @module app/admin/free-gifts/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Gift,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Users,
  CheckCircle2,
  Truck,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { SingleImageUpload } from '@/components/upload/ImageUpload';

interface FreeGift {
  id: number;
  title: string;
  name: string;
  description: string | null;
  image: string;
  cover_image: string;
  original_price: number;
  total_count: number;
  remain_count: number;
  claimed: number;
  limit_per_user: number;
  shipping_fee: number;
  points_required: number;
  merchant_id: number | null;
  category: string;
  is_new_user_only: number;
  is_active: number;
  start_time: string | null;
  end_time: string | null;
  status: number;
  created_at: string;
}

interface Claim {
  id: number;
  gift_id: number;
  user_id: number;
  receive_type: 'shipping' | 'pickup';
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  claim_no: string;
  pay_amount: number;
  status: number;
  claimed_at: string;
  gift_name: string;
  gift_title: string;
  gift_image: string;
}

const CLAIM_STATUS_MAP: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  0: { label: '待處理', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> },
  1: { label: '已確認', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle2 className="w-3 h-3" /> },
  2: { label: '已發貨', color: 'bg-purple-100 text-purple-800', icon: <Truck className="w-3 h-3" /> },
  3: { label: '已完成', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> },
  4: { label: '已取消', color: 'bg-gray-100 text-gray-800', icon: <XCircle className="w-3 h-3" /> },
};

const CATEGORIES = ['符箓', '飾品', '香薰', '掛件', '其他'];

const emptyGift: Partial<FreeGift> = {
  title: '',
  name: '',
  description: '',
  image: '',
  cover_image: '',
  original_price: 0,
  total_count: 100,
  limit_per_user: 1,
  shipping_fee: 0,
  points_required: 0,
  category: '',
  is_new_user_only: 0,
  start_time: '',
  end_time: '',
  status: 1,
};

export default function FreeGiftsAdminPage() {
  const [gifts, setGifts] = useState<FreeGift[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('gifts');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const pageSize = 20;

  // 弹窗状态
  const [showDialog, setShowDialog] = useState(false);
  const [editingGift, setEditingGift] = useState<Partial<FreeGift>>(emptyGift);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // 领取记录分页
  const [claimsPage, setClaimsPage] = useState(1);
  const [claimsTotal, setClaimsTotal] = useState(0);

  // 领取详情弹窗
  const [showClaimDetail, setShowClaimDetail] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const loadGifts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        admin: '1',
        page: page.toString(),
        limit: pageSize.toString(),
      });
      if (keyword) params.set('keyword', keyword);

      const res = await fetch(`/api/free-gifts?${params}`);
      const data = await res.json();
      if (data.success) {
        setGifts(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  const loadClaims = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: claimsPage.toString(),
        limit: pageSize.toString(),
      });
      const res = await fetch(`/api/admin/free-gifts/claims?${params}`);
      const data = await res.json();
      if (data.success) {
        setClaims(data.data || []);
        setClaimsTotal(data.total || 0);
      }
    } catch (error) {
      console.error('加载领取记录失败:', error);
    }
  }, [claimsPage]);

  useEffect(() => {
    if (tab === 'gifts') {
      loadGifts();
    } else {
      loadClaims();
    }
  }, [tab, loadGifts, loadClaims]);

  const handleSave = async () => {
    if (!editingGift.title && !editingGift.name) {
      toast.error('請填寫商品名稱');
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...editingGift,
        name: editingGift.name || editingGift.title,
        title: editingGift.title || editingGift.name,
        image: editingGift.image || editingGift.cover_image,
        cover_image: editingGift.cover_image || editingGift.image,
        remain_count: isEdit ? undefined : editingGift.total_count,
      };

      const url = '/api/free-gifts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? '更新成功' : '創建成功');
        setShowDialog(false);
        loadGifts();
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此活動嗎？')) return;

    try {
      const res = await fetch(`/api/free-gifts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('刪除成功');
        loadGifts();
      } else {
        toast.error(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('刪除失敗');
    }
  };

  const handleToggleStatus = async (gift: FreeGift) => {
    const newStatus = gift.status === 1 ? 0 : 1;
    try {
      const res = await fetch('/api/free-gifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gift.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newStatus === 1 ? '已上架' : '已下架');
        loadGifts();
      }
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const handleUpdateClaimStatus = async (claimId: number, newStatus: number) => {
    try {
      const res = await fetch('/api/admin/free-gifts/claims', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: claimId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('狀態更新成功');
        loadClaims();
        setShowClaimDetail(false);
      } else {
        toast.error(data.error || '更新失敗');
      }
    } catch (error) {
      toast.error('更新失敗');
    }
  };

  const openEditDialog = (gift: FreeGift) => {
    setEditingGift({ ...gift });
    setIsEdit(true);
    setShowDialog(true);
  };

  const openCreateDialog = () => {
    setEditingGift({ ...emptyGift });
    setIsEdit(false);
    setShowDialog(true);
  };

  const totalPages = Math.ceil(total / pageSize);
  const claimsTotalPages = Math.ceil(claimsTotal / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-7 h-7" />
          免費領管理
        </h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-1" />
          新建活動
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="gifts">
            <Package className="w-4 h-4 mr-1" />
            活動管理
          </TabsTrigger>
          <TabsTrigger value="claims">
            <Users className="w-4 h-4 mr-1" />
            領取記錄
          </TabsTrigger>
        </TabsList>

        {/* ===== 活動管理 ===== */}
        <TabsContent value="gifts" className="mt-4">
          {/* 搜索栏 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索活動名稱..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>商品</TableHead>
                    <TableHead className="w-20">原價</TableHead>
                    <TableHead className="w-24">庫存/總量</TableHead>
                    <TableHead className="w-16">已領</TableHead>
                    <TableHead className="w-16">運費</TableHead>
                    <TableHead className="w-20">分類</TableHead>
                    <TableHead className="w-20">狀態</TableHead>
                    <TableHead className="w-32">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        加載中...
                      </TableCell>
                    </TableRow>
                  ) : gifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        暫無數據
                      </TableCell>
                    </TableRow>
                  ) : (
                    gifts.map((gift) => (
                      <TableRow key={gift.id}>
                        <TableCell>{gift.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {gift.image || gift.cover_image ? (
                              <img
                                src={gift.image || gift.cover_image}
                                alt={gift.name || gift.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <Gift className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium line-clamp-1">{gift.name || gift.title}</p>
                              {gift.is_new_user_only ? (
                                <Badge className="text-[10px] px-1 py-0 bg-pink-100 text-pink-700">新人</Badge>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>HK${gift.original_price}</TableCell>
                        <TableCell>
                          <span className={gift.remain_count < 10 ? 'text-orange-600 font-medium' : ''}>
                            {gift.remain_count}
                          </span>
                          /{gift.total_count}
                        </TableCell>
                        <TableCell>{gift.claimed}</TableCell>
                        <TableCell>HK${gift.shipping_fee}</TableCell>
                        <TableCell>
                          {gift.category ? (
                            <Badge variant="secondary">{gift.category}</Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`cursor-pointer ${gift.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                            onClick={() => handleToggleStatus(gift)}
                          >
                            {gift.status === 1 ? '上架' : '下架'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(gift)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(gift.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">共 {total} 條記錄</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ===== 领取记录 ===== */}
        <TabsContent value="claims" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">領取編號</TableHead>
                    <TableHead>商品</TableHead>
                    <TableHead className="w-16">用戶ID</TableHead>
                    <TableHead className="w-20">方式</TableHead>
                    <TableHead className="w-20">收貨人</TableHead>
                    <TableHead className="w-16">金額</TableHead>
                    <TableHead className="w-20">狀態</TableHead>
                    <TableHead className="w-28">時間</TableHead>
                    <TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        暫無領取記錄
                      </TableCell>
                    </TableRow>
                  ) : (
                    claims.map((claim) => {
                      const statusInfo = CLAIM_STATUS_MAP[claim.status] || CLAIM_STATUS_MAP[0];
                      return (
                        <TableRow key={claim.id}>
                          <TableCell className="font-mono text-xs">{claim.claim_no}</TableCell>
                          <TableCell>{claim.gift_name || claim.gift_title}</TableCell>
                          <TableCell>{claim.user_id}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {claim.receive_type === 'shipping' ? (
                                <><Truck className="w-3 h-3 mr-1" />郵寄</>
                              ) : (
                                <><Package className="w-3 h-3 mr-1" />自取</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{claim.shipping_name || '-'}</TableCell>
                          <TableCell>HK${claim.pay_amount}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${statusInfo.color}`}>
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(claim.claimed_at).toLocaleDateString('zh-TW')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedClaim(claim); setShowClaimDetail(true); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {claim.status === 0 && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateClaimStatus(claim.id, 1)}>
                                  確認
                                </Button>
                              )}
                              {claim.status === 1 && claim.receive_type === 'shipping' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateClaimStatus(claim.id, 2)}>
                                  發貨
                                </Button>
                              )}
                              {claim.status === 2 && (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateClaimStatus(claim.id, 3)}>
                                  完成
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {claimsTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">共 {claimsTotal} 條記錄</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={claimsPage <= 1} onClick={() => setClaimsPage(claimsPage - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">{claimsPage} / {claimsTotalPages}</span>
                <Button variant="outline" size="sm" disabled={claimsPage >= claimsTotalPages} onClick={() => setClaimsPage(claimsPage + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== 编辑/新建弹窗 ===== */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? '編輯活動' : '新建活動'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>商品名稱 *</Label>
              <Input
                value={editingGift.name || ''}
                onChange={(e) => setEditingGift({ ...editingGift, name: e.target.value, title: e.target.value })}
                placeholder="請輸入商品名稱"
              />
            </div>

            <div className="space-y-2">
              <Label>商品描述</Label>
              <Textarea
                value={editingGift.description || ''}
                onChange={(e) => setEditingGift({ ...editingGift, description: e.target.value })}
                placeholder="請輸入商品描述"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>商品圖片</Label>
              <SingleImageUpload
                value={editingGift.image || ''}
                onChange={(url: string) => setEditingGift({ ...editingGift, image: url, cover_image: url })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>原價 (HK$)</Label>
                <Input
                  type="number"
                  value={editingGift.original_price || 0}
                  onChange={(e) => setEditingGift({ ...editingGift, original_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>總數量</Label>
                <Input
                  type="number"
                  value={editingGift.total_count || 0}
                  onChange={(e) => setEditingGift({ ...editingGift, total_count: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>每人限領</Label>
                <Input
                  type="number"
                  min={1}
                  value={editingGift.limit_per_user || 1}
                  onChange={(e) => setEditingGift({ ...editingGift, limit_per_user: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>郵寄運費 (HK$)</Label>
                <Input
                  type="number"
                  value={editingGift.shipping_fee || 0}
                  onChange={(e) => setEditingGift({ ...editingGift, shipping_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>所需積分</Label>
                <Input
                  type="number"
                  value={editingGift.points_required || 0}
                  onChange={(e) => setEditingGift({ ...editingGift, points_required: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>分類</Label>
                <Select
                  value={editingGift.category || ''}
                  onValueChange={(v) => setEditingGift({ ...editingGift, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇分類" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isEdit && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>剩餘數量</Label>
                  <Input
                    type="number"
                    value={editingGift.remain_count || 0}
                    onChange={(e) => setEditingGift({ ...editingGift, remain_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>已領取數量</Label>
                  <Input
                    type="number"
                    value={editingGift.claimed || 0}
                    onChange={(e) => setEditingGift({ ...editingGift, claimed: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>開始時間</Label>
                <Input
                  type="datetime-local"
                  value={editingGift.start_time ? editingGift.start_time.toString().slice(0, 16) : ''}
                  onChange={(e) => setEditingGift({ ...editingGift, start_time: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label>結束時間</Label>
                <Input
                  type="datetime-local"
                  value={editingGift.end_time ? editingGift.end_time.toString().slice(0, 16) : ''}
                  onChange={(e) => setEditingGift({ ...editingGift, end_time: e.target.value || null })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!editingGift.is_new_user_only}
                  onCheckedChange={(v) => setEditingGift({ ...editingGift, is_new_user_only: v ? 1 : 0 })}
                />
                <Label>僅限新用戶</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingGift.status !== 0}
                  onCheckedChange={(v) => setEditingGift({ ...editingGift, status: v ? 1 : 0 })}
                />
                <Label>上架</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== 领取详情弹窗 ===== */}
      <Dialog open={showClaimDetail} onOpenChange={setShowClaimDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>領取詳情</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">領取編號</p>
                  <p className="font-mono">{selectedClaim.claim_no}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">狀態</p>
                  <Badge className={CLAIM_STATUS_MAP[selectedClaim.status]?.color}>
                    {CLAIM_STATUS_MAP[selectedClaim.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">商品名稱</p>
                  <p>{selectedClaim.gift_name || selectedClaim.gift_title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">領取方式</p>
                  <p>{selectedClaim.receive_type === 'shipping' ? '郵寄' : '到店自取'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">用戶ID</p>
                  <p>{selectedClaim.user_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">支付金額</p>
                  <p>HK${selectedClaim.pay_amount}</p>
                </div>
                {selectedClaim.receive_type === 'shipping' && (
                  <>
                    <div>
                      <p className="text-muted-foreground">收貨人</p>
                      <p>{selectedClaim.shipping_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">手機號碼</p>
                      <p>{selectedClaim.shipping_phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">收貨地址</p>
                      <p>{selectedClaim.shipping_address}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-muted-foreground">領取時間</p>
                  <p>{new Date(selectedClaim.claimed_at).toLocaleString('zh-TW')}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedClaim.status === 0 && (
                  <>
                    <Button onClick={() => handleUpdateClaimStatus(selectedClaim.id, 1)} className="flex-1">
                      <CheckCircle2 className="w-4 h-4 mr-1" />確認
                    </Button>
                    <Button variant="outline" onClick={() => handleUpdateClaimStatus(selectedClaim.id, 4)} className="text-destructive">
                      <XCircle className="w-4 h-4 mr-1" />取消
                    </Button>
                  </>
                )}
                {selectedClaim.status === 1 && selectedClaim.receive_type === 'shipping' && (
                  <Button onClick={() => handleUpdateClaimStatus(selectedClaim.id, 2)} className="flex-1">
                    <Truck className="w-4 h-4 mr-1" />發貨
                  </Button>
                )}
                {selectedClaim.status === 2 && (
                  <Button onClick={() => handleUpdateClaimStatus(selectedClaim.id, 3)} className="flex-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />確認完成
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
