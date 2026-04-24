/**
 * @fileoverview 管理员工单管理页面
 * @description 处理用户工单
 * @module app/admin/tickets/page
 */

'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MessageSquare,
  Eye,
  Send,
  CheckCircle,
  Loader2,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

/** 工单 */
interface Ticket {
  id: number;
  ticket_no: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  content: string;
  images: string[];
  created_at: string;
  user?: {
    name: string;
    avatar?: string;
    email?: string;
  };
}

/** 回复 */
interface Reply {
  id: number;
  ticket_id: number;
  user_id: number | null;
  is_staff: boolean;
  content: string;
  images: string[];
  created_at: string;
}

/** 工单详情 */
interface TicketDetail extends Ticket {
  replies: Reply[];
}

/** 状态颜色 */
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

/** 状态文本 */
const STATUS_TEXT: Record<string, string> = {
  pending: '待處理',
  processing: '處理中',
  resolved: '已解決',
  closed: '已關閉',
};

/** 优先级颜色 */
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

/**
 * 管理员工单管理页面
 */
export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [resolveOnReply, setResolveOnReply] = useState(false);
  const pageSize = 15;

  useEffect(() => {
    loadTickets();
  }, [statusFilter, typeFilter, currentPage]);

  /**
   * 加载工单列表
   */
  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const res = await fetch(`/api/admin/tickets?${params}`);
      const data = await res.json();
      setTickets(data.data || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch (error) {
      console.error('加载工单失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  // 筛选变化时重置页码
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  /**
   * 查看工单详情
   */
  const handleViewDetail = async (ticketId: number) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      setSelectedTicket(data.data);
      setReplyContent('');
    } catch (error) {
      console.error('加载工单详情失败:', error);
      toast.error('加載失敗');
    }
  };

  /**
   * 客服回复
   */
  const handleReply = async () => {
    if (!selectedTicket || !replyContent.trim()) return;

    setReplying(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          resolve: resolveOnReply,
        }),
      });
      const data = await res.json();
      if (data.message) {
        toast.success(resolveOnReply ? '已回覆並解決' : '回覆成功');
        setReplyContent('');
        handleViewDetail(selectedTicket.id);
        loadTickets();
      } else {
        toast.error(data.error || '回覆失敗');
      }
    } catch (error) {
      console.error('回复失败:', error);
      toast.error('回覆失敗');
    } finally {
      setReplying(false);
    }
  };

  return (
    <AdminLayout title="客服工單" description="處理用戶工單">
      {/* 筛选 */}
      <Card className="mb-4">
        <CardContent className="py-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">狀態:</span>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="pending">待處理</SelectItem>
                  <SelectItem value="processing">處理中</SelectItem>
                  <SelectItem value="resolved">已解決</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">類型:</span>
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="訂單問題">訂單問題</SelectItem>
                  <SelectItem value="商品諮詢">商品諮詢</SelectItem>
                  <SelectItem value="售後投訴">售後投訴</SelectItem>
                  <SelectItem value="賬戶問題">賬戶問題</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {tickets.filter((t) => t.status === 'pending').length}
            </p>
            <p className="text-sm text-muted-foreground">待處理</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {tickets.filter((t) => t.status === 'processing').length}
            </p>
            <p className="text-sm text-muted-foreground">處理中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {tickets.filter((t) => t.status === 'resolved').length}
            </p>
            <p className="text-sm text-muted-foreground">已解決</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold">{tickets.length}</p>
            <p className="text-sm text-muted-foreground">總計</p>
          </CardContent>
        </Card>
      </div>

      {/* 工单表格 */}
      <Card>
        <CardHeader>
          <CardTitle>工單列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              暫無工單
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工單號</TableHead>
                  <TableHead>用戶</TableHead>
                  <TableHead>標題</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>優先級</TableHead>
                  <TableHead>時間</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs">
                      {ticket.ticket_no}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-3 h-3" />
                        </div>
                        <span className="text-sm">{ticket.user?.name || '用戶'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1">{ticket.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[ticket.status]}>
                        {STATUS_TEXT[ticket.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={PRIORITY_COLORS[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(ticket.created_at), 'MM-dd HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(ticket.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
                第 {currentPage} / {totalPages} 頁，共 {totalItems} 條
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 工单详情弹窗 */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTicket.ticket_no}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* 工单信息 */}
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={STATUS_COLORS[selectedTicket.status]}>
                        {STATUS_TEXT[selectedTicket.status]}
                      </Badge>
                      <Badge variant="outline">{selectedTicket.type}</Badge>
                      <Badge className={PRIORITY_COLORS[selectedTicket.priority]}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedTicket.title}
                    </h3>
                    <p className="text-sm">{selectedTicket.content}</p>
                    {selectedTicket.images && selectedTicket.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {selectedTicket.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-20 h-20 rounded object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>用戶: {selectedTicket.user?.name || '未知'}</span>
                      <span>
                        提交: {format(new Date(selectedTicket.created_at), 'yyyy-MM-dd HH:mm:ss')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* 回复列表 */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedTicket.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`flex gap-3 ${reply.is_staff ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          reply.is_staff
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {reply.is_staff ? '客服' : '用戶'}
                          </span>
                          <span className="text-xs opacity-70">
                            {format(new Date(reply.created_at), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 客服回复 */}
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div className="space-y-3">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="輸入回覆內容..."
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={resolveOnReply}
                          onChange={(e) => setResolveOnReply(e.target.checked)}
                          className="rounded"
                        />
                        同時標記為已解決
                      </label>
                      <Button onClick={handleReply} disabled={replying}>
                        {replying ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        發送回覆
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
