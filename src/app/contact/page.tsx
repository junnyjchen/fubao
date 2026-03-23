/**
 * @fileoverview 联系我们页面
 * @description 提供多种联系方式
 * @module app/contact/page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const contactMethods = [
  {
    icon: Mail,
    title: '電子郵箱',
    content: 'support@fubao.ltd',
    description: '工作日24小時內回覆',
    action: '發送郵件',
    href: 'mailto:support@fubao.ltd',
  },
  {
    icon: Phone,
    title: '客服熱線',
    content: '+852 XXXX XXXX',
    description: '週一至週五 9:00-18:00',
    action: '撥打電話',
    href: 'tel:+852XXXXXXXX',
  },
  {
    icon: MessageCircle,
    title: '在線客服',
    content: '即時通訊',
    description: '即時解答您的問題',
    action: '開始對話',
    href: '#chat',
  },
];

const inquiryTypes = [
  { value: 'general', label: '一般諮詢' },
  { value: 'order', label: '訂單問題' },
  { value: 'payment', label: '支付問題' },
  { value: 'shipping', label: '配送問題' },
  { value: 'refund', label: '退款售後' },
  { value: 'merchant', label: '商戶合作' },
  { value: 'other', label: '其他問題' },
];

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('請輸入您的姓名');
      return;
    }
    if (!form.email.trim()) {
      toast.error('請輸入電子郵箱');
      return;
    }
    if (!form.message.trim()) {
      toast.error('請輸入留言內容');
      return;
    }

    setSubmitting(true);
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('提交成功，我們會盡快回覆您');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">提交成功</h2>
            <p className="text-muted-foreground mb-6">
              感謝您的留言，我們會在工作日24小時內回覆您。
            </p>
            <Button onClick={() => setSubmitted(false)}>
              繼續留言
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">聯繫我們</h1>
            <p className="text-sm text-muted-foreground">我們隨時為您服務</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：联系方式 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 快速联系 */}
            <div className="space-y-4">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card key={method.title}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{method.title}</h3>
                          <p className="text-primary font-semibold">{method.content}</p>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 办公信息 */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">公司地址</h3>
                    <p className="text-sm text-muted-foreground">
                      香港九龍XXX大廈XX樓
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">工作時間</h3>
                    <p className="text-sm text-muted-foreground">
                      週一至週五 9:00-18:00<br />
                      週六日及公眾假期休息
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：留言表单 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>在線留言</CardTitle>
                <CardDescription>
                  填寫以下表單，我們會盡快回覆您
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名 *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="請輸入您的姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">電子郵箱 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="請輸入電子郵箱"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">聯繫電話</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="請輸入聯繫電話"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">諮詢類型</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm(prev => ({ ...prev, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="請選擇諮詢類型" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">主題</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="請輸入留言主題"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">留言內容 *</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="請輸入您的留言內容..."
                    rows={6}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmit} disabled={submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? '提交中...' : '提交留言'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
