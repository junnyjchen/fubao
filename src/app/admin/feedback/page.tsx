/**
 * @fileoverview 后台反馈管理页面
 * @description 查看和处理用户反馈
 * @module app/admin/feedback/page
 */

'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Send,
  User,
  Mail,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { toast } from 'sonner';

/** 反馈数据类型 */
interface Feedback {
  id: number;
  user_id: number | null;
  type: string;
  content: string;
  contact: string | null;
  images: string[] | null;
  status: string;
  reply: string | null;
  reply_time: string | null;
  created_at: string;
}

/** 状态配置 */
const statusConfig = {
  pending: { label: '待處理', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: '處理中', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
  resolved: { label: '已解決', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  closed: { label: '已關閉', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

/** 类型配置 */
const typeConfig = {
  suggestion: { label: '建議', color: 'bg-blue-100 text-blue-800' },
  complaint: { label: '投訴', color: 'bg-red-100 text-red-800' },
  bug: { label: '問題反饋', color: 'bg-orange-100 text-orange-800' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-800' },
};

/**
 * 后台反馈管理页面
 */
export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 15;

  // 弹窗状态
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, [activeTab, currentPage]);

  /**
   * 加载反馈列表
   */
  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const res = await fetch(`/api/feedback?page=${currentPage}&limit=${pageSize}${status}`);
      const data = await res.json();
      setFeedbacks(data.data || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch (error) {
      console.error('加载反馈失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  // Tab切换时重置页码
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  /**
   * 打开回复弹窗
   */
  const openReplyDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setReplyContent(feedback.reply || '');
    setReplyDialogOpen(true);
  };

  /**
   * 提交回复
   */
  const handleSubmitReply = async () => {
    if (!selectedFeedback) return;

    if (!replyContent.trim()) {
      toast.error('請填寫回復內容');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${selectedFeedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          reply: replyContent.trim(),
        }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('回復成功');
        setReplyDialogOpen(false);
        loadFeedbacks();
      } else {
        toast.error(data.error || '回復失敗');
      }
    } catch (error) {
      console.error('提交回复失败:', error);
      toast.error('提交失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 更新状态
   */
  const updateStatus = async (feedback: Feedback, status: string) => {
    try {
      const res = await fetch(`/api/feedback/${feedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('狀態已更新');
        loadFeedbacks();
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新失敗');
    }
  };

  // 筛选
  const filteredFeedbacks = feedbacks.filter(
    (f) =>
      f.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      f.contact?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 统计
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter((f) => f.status === 'pending').length,
    processing: feedbacks.filter((f) => f.status === 'processing').length,
    resolved: feedbacks.filter((f) => f.status === 'resolved').length,
  };

  return (
    <AdminLayout title="反饋管理" description="查看和處理用戶反饋">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">總反饋數</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">待處理</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.processing}</p>
                <p className="text-sm text-muted-foreground">處理中</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">已解決</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索反饋內容..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 反馈列表 */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="pending">待處理</TabsTrigger>
              <TabsTrigger value="processing">處理中</TabsTrigger>
              <TabsTrigger value="resolved">已解決</TabsTrigger>
              <TabsTrigger value="closed">已關閉</TabsTrigger>
              <TabsTrigger value="all">全部</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">暫無反饋</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => {
                const statusInfo = statusConfig[feedback.status as keyof typeof statusConfig];
                const typeInfo = typeConfig[feedback.type as keyof typeof typeConfig];

                return (
                  <div
                    key={feedback.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* 标签 */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={typeInfo?.color || 'bg-gray-100'}>
                            {typeInfo?.label || feedback.type}
                          </Badge>
                          <Badge className={statusInfo?.color || 'bg-gray-100'}>
                            {statusInfo?.label || feedback.status}
                          </Badge>
                        </div>

                        {/* 内容 */}
                        <p className="text-sm mb-2">{feedback.content}</p>

                        {/* 联系方式 */}
                        {feedback.contact && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {feedback.contact}
                            </span>
                          </div>
                        )}

                        {/* 时间 */}
                        <p className="text-xs text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleString()}
                        </p>

                        {/* 回复 */}
                        {feedback.reply && (
                          <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                              <Send className="w-4 h-4" />
                              回復
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {feedback.reply}
                            </p>
                            {feedback.reply_time && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(feedback.reply_time).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2">
                        {feedback.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(feedback, 'processing')}
                          >
                            開始處理
                          </Button>
                        )}
                        <Button size="sm" onClick={() => openReplyDialog(feedback)}>
                          {feedback.reply ? '查看回復' : '回復'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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

      {/* 回复弹窗 */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>回復反饋</DialogTitle>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* 反馈内容 */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={typeConfig[selectedFeedback.type as keyof typeof typeConfig]?.color}>
                    {typeConfig[selectedFeedback.type as keyof typeof typeConfig]?.label}
                  </Badge>
                </div>
                <p className="text-sm">{selectedFeedback.content}</p>
                {selectedFeedback.contact && (
                  <p className="text-xs text-muted-foreground mt-2">
                    聯繫方式：{selectedFeedback.contact}
                  </p>
                )}
              </div>

              {/* 回复内容 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  回復內容
                </label>
                <Textarea
                  placeholder="請輸入回復內容..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitReply} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              提交回復
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
