/**
 * @fileoverview 用户发票管理页面
 * @description 用户申请和管理发票
 * @module app/user/invoices/page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Download,
  Loader2,
  Building2,
  User,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { UserLayout } from '@/components/user/UserLayout';

interface Invoice {
  id: number;
  invoice_no: string;
  order_id: number;
  invoice_type: string;
  title_type: string;
  title: string;
  tax_no: string | null;
  amount: string;
  status: string;
  email: string | null;
  issue_time: string | null;
  pdf_url: string | null;
  created_at: string;
}

interface Order {
  id: number;
  order_no: string;
  pay_amount: string;
  pay_status: number;
  created_at: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pending: { label: '處理中', variant: 'secondary' },
  issued: { label: '已開具', variant: 'default' },
  cancelled: { label: '已取消', variant: 'destructive' },
};

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 申请表单
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceType, setInvoiceType] = useState('electronic');
  const [titleType, setTitleType] = useState('personal');
  const [title, setTitle] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, ordersRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/orders?status=completed'),
      ]);
      
      const invoicesData = await invoicesRes.json();
      const ordersData = await ordersRes.json();
      
      setInvoices(invoicesData.data || []);
      setOrders(ordersData.data || []);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrder) {
      alert('請選擇訂單');
      return;
    }
    if (!title.trim()) {
      alert('請填寫發票抬頭');
      return;
    }
    if (titleType === 'company' && !taxNo.trim()) {
      alert('企業發票需填寫稅號');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          invoice_type: invoiceType,
          title_type: titleType,
          title,
          tax_no: taxNo || null,
          email: email || null,
        }),
      });

      const data = await res.json();
      if (data.message) {
        alert('發票申請成功');
        setShowApplyDialog(false);
        resetForm();
        fetchData();
      } else {
        alert(data.error || '申請失敗');
      }
    } catch (error) {
      console.error('申请发票失败:', error);
      alert('申請失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedOrder(null);
    setInvoiceType('electronic');
    setTitleType('personal');
    setTitle('');
    setTaxNo('');
    setEmail('');
  };

  const getAvailableOrders = () => {
    const invoicedOrderIds = invoices
      .filter(inv => inv.status === 'issued' || inv.status === 'pending')
      .map(inv => inv.order_id);
    return orders.filter(order => !invoicedOrderIds.includes(order.id));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">發票管理</h1>
          <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowApplyDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                申請發票
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>申請發票</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* 选择订单 */}
                <div>
                  <Label>選擇訂單</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {getAvailableOrders().length > 0 ? (
                      getAvailableOrders().map(order => (
                        <div
                          key={order.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedOrder?.id === order.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex justify-between">
                            <span className="text-sm">{order.order_no}</span>
                            <span className="font-medium">HK${order.pay_amount}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString('zh-TW')}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        暫無可開票訂單
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 发票类型 */}
                <div>
                  <Label>發票類型</Label>
                  <RadioGroup value={invoiceType} onValueChange={setInvoiceType} className="flex gap-4 mt-2">
                    <div className={`flex-1 p-3 border rounded-lg cursor-pointer ${invoiceType === 'electronic' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => setInvoiceType('electronic')}>
                      <RadioGroupItem value="electronic" className="sr-only" />
                      <FileText className="w-5 h-5 mb-1" />
                      <span className="text-sm">電子發票</span>
                    </div>
                    <div className={`flex-1 p-3 border rounded-lg cursor-pointer ${invoiceType === 'paper' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => setInvoiceType('paper')}>
                      <RadioGroupItem value="paper" className="sr-only" />
                      <FileText className="w-5 h-5 mb-1" />
                      <span className="text-sm">紙質發票</span>
                    </div>
                  </RadioGroup>
                </div>

                {/* 抬头类型 */}
                <div>
                  <Label>抬頭類型</Label>
                  <RadioGroup value={titleType} onValueChange={setTitleType} className="flex gap-4 mt-2">
                    <div className={`flex-1 p-3 border rounded-lg cursor-pointer ${titleType === 'personal' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => setTitleType('personal')}>
                      <RadioGroupItem value="personal" className="sr-only" />
                      <User className="w-5 h-5 mb-1" />
                      <span className="text-sm">個人</span>
                    </div>
                    <div className={`flex-1 p-3 border rounded-lg cursor-pointer ${titleType === 'company' ? 'border-primary bg-primary/5' : ''}`}
                         onClick={() => setTitleType('company')}>
                      <RadioGroupItem value="company" className="sr-only" />
                      <Building2 className="w-5 h-5 mb-1" />
                      <span className="text-sm">企業</span>
                    </div>
                  </RadioGroup>
                </div>

                {/* 发票抬头 */}
                <div>
                  <Label>發票抬頭 *</Label>
                  <Input
                    placeholder={titleType === 'personal' ? '請輸入姓名' : '請輸入企業名稱'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* 税号 */}
                {titleType === 'company' && (
                  <div>
                    <Label>稅號 *</Label>
                    <Input
                      placeholder="請輸入企業稅號"
                      value={taxNo}
                      onChange={(e) => setTaxNo(e.target.value)}
                    />
                  </div>
                )}

                {/* 邮箱 */}
                <div>
                  <Label>接收郵箱</Label>
                  <Input
                    type="email"
                    placeholder="用於接收電子發票"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />提交中...</> : '提交申請'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 发票列表 */}
        <Card>
          <CardHeader>
            <CardTitle>發票記錄</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{invoice.invoice_no}</span>
                          <Badge variant={statusLabels[invoice.status]?.variant || 'secondary'}>
                            {statusLabels[invoice.status]?.label || invoice.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          抬頭: {invoice.title}
                          {invoice.tax_no && ` (${invoice.tax_no})`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          金額: HK${invoice.amount}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          申請時間: {new Date(invoice.created_at).toLocaleString('zh-TW')}
                        </div>
                      </div>
                      {invoice.status === 'issued' && invoice.pdf_url && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          下載
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暫無發票記錄</p>
                <p className="text-sm">完成訂單後可申請開具發票</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </UserLayout>
  );
}
