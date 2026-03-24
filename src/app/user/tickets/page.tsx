/**
 * @fileoverview 用户工单页面
 * @description 提交和查看工单
 * @module app/user/tickets/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  ArrowLeft,
  Image as ImageIcon,
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
  status_text?: string;
  priority: string;
  priority_text?: string;
  content: string;
  images: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
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

/** 工单类型 */
const TICKET_TYPES = ['訂單問題', '商品諮詢', '售後投訴', '賬戶問題', '其他'];

/** 状态颜色 */
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

/**
 * 用户工单页面
 */
export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);

  // 创建表单
  const [formData, setFormData] = useState({
    title: '',
    type: '訂單問題',
    priority: 'normal',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  /**
   * 加载工单列表
   */
  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/tickets?status=${statusFilter}`);
      const data = await res.json();
      setTickets(data.data || []);
    } catch (error) {
      console.error('加载工单失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 提交工单
   */
  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error('請填寫完整信息');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // TODO: 从认证获取
          ...formData,
        }),
      });
      const data = await res.json();
      if (data.message) {
        toast.success('工單已提交');
        setOpenCreate(false);
        setFormData({ title: '', type: '訂單問題', priority: 'normal', content: '' });
        loadTickets();
      } else {
        toast.error(data.error || '提交失敗');
      }
    } catch (error) {
      console.error('提交工单失败:', error);
      toast.error('提交失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 查看工单详情
   */
  const handleViewDetail = async (ticketId: number) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      setSelectedTicket(data.data);
    } catch (error) {
      console.error('加载工单详情失败:', error);
      toast.error('加載失敗');
    }
  };

  /**
   * 回复工单
   */
  const handleReply = async () => {
    if (!selectedTicket || !replyContent.trim()) return;

    setReplying(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          content: replyContent,
        }),
      });
      const data = await res.json();
      if (data.message) {
        toast.success('回覆成功');
        setReplyContent('');
        handleViewDetail(selectedTicket.id);
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

  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  return (
    <UserLayout title="客服工單" description="提交問題，獲取幫助">
      {/* 创建工单按钮 */}
      <div className="flex justify-end mb-4">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              提交工單
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>提交工單</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>問題類型</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>標題</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="請簡要描述您的問題"
                />
              </div>
              <div>
                <Label>優先級</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="normal">普通</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="urgent">緊急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>詳細描述</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="請詳細描述您遇到的問題..."
                  rows={5}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                提交
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 状态筛选 */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="pending">待處理</TabsTrigger>
          <TabsTrigger value="processing">處理中</TabsTrigger>
          <TabsTrigger value="resolved">已解決</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 工单列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">暫無工單</h3>
            <p className="text-muted-foreground mb-4">
              如有問題，請提交工單獲取幫助
            </p>
            <Button onClick={() => setOpenCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              提交工單
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => handleViewDetail(ticket.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {ticket.ticket_no}
                      </span>
                      <Badge className={STATUS_COLORS[ticket.status]}>
                        {ticket.status_text}
                      </Badge>
                      <Badge variant="outline">{ticket.type}</Badge>
                    </div>
                    <h3 className="font-medium">{ticket.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {ticket.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(ticket.created_at), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 工单详情弹窗 */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTicket(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  {selectedTicket.ticket_no}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* 工单信息 */}
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={STATUS_COLORS[selectedTicket.status]}>
                        {selectedTicket.status_text}
                      </Badge>
                      <Badge variant="outline">{selectedTicket.type}</Badge>
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
                    <p className="text-xs text-muted-foreground mt-3">
                      提交時間: {format(new Date(selectedTicket.created_at), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </CardContent>
                </Card>

                {/* 回复列表 */}
                <div className="space-y-3">
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
                            {reply.is_staff ? '客服' : '我'}
                          </span>
                          <span className="text-xs opacity-70">
                            {format(new Date(reply.created_at), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                        {reply.images && reply.images.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {reply.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt=""
                                className="w-16 h-16 rounded object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 回复输入 */}
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div className="flex gap-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="輸入回覆..."
                      rows={2}
                    />
                    <Button onClick={handleReply} disabled={replying}>
                      {replying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
