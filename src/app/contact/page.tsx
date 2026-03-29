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
import { useI18n } from '@/lib/i18n';
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

export default function ContactPage() {
  const { t } = useI18n();
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

  const contactMethods = [
    {
      icon: Mail,
      title: t.contact.methods.email.title,
      content: t.contact.methods.email.value,
      description: t.contact.methods.email.desc,
      action: t.contact.methods.email.action,
      href: 'mailto:support@fubao.ltd',
    },
    {
      icon: Phone,
      title: t.contact.methods.phone.title,
      content: t.contact.methods.phone.value,
      description: t.contact.methods.phone.desc,
      action: t.contact.methods.phone.action,
      href: 'tel:+852XXXXXXXX',
    },
    {
      icon: MessageCircle,
      title: t.contact.methods.chat.title,
      content: t.contact.methods.chat.value,
      description: t.contact.methods.chat.desc,
      action: t.contact.methods.chat.action,
      href: '#chat',
    },
  ];

  const inquiryTypes = [
    { value: 'general', label: t.contact.inquiryTypes.general },
    { value: 'order', label: t.contact.inquiryTypes.order },
    { value: 'payment', label: t.contact.inquiryTypes.payment },
    { value: 'shipping', label: t.contact.inquiryTypes.shipping },
    { value: 'refund', label: t.contact.inquiryTypes.refund },
    { value: 'merchant', label: t.contact.inquiryTypes.merchant },
    { value: 'other', label: t.contact.inquiryTypes.other },
  ];

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error(t.contact.validation.nameRequired);
      return;
    }
    if (!form.email.trim()) {
      toast.error(t.contact.validation.emailRequired);
      return;
    }
    if (!form.message.trim()) {
      toast.error(t.contact.validation.messageRequired);
      return;
    }

    setSubmitting(true);
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
    toast.success(t.contact.success.message);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t.contact.success.title}</h2>
            <p className="text-muted-foreground mb-6">
              {t.contact.success.message}
            </p>
            <Button onClick={() => setSubmitted(false)}>
              {t.contact.success.continue}
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
            <h1 className="text-xl font-bold">{t.contact.title}</h1>
            <p className="text-sm text-muted-foreground">{t.contact.subtitle}</p>
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
                    <h3 className="font-medium mb-1">{t.contact.address.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.contact.address.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">{t.contact.workingHours.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.contact.workingHours.value}<br />
                      {t.contact.workingHours.value2}
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
                <CardTitle>{t.contact.header}</CardTitle>
                <CardDescription>
                  {t.contact.headerDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.contact.form.name} {t.contact.form.required}</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t.contact.form.namePlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.contact.form.email} {t.contact.form.required}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t.contact.form.emailPlaceholder}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.contact.form.phone}</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder={t.contact.form.phonePlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">{t.contact.form.type}</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm(prev => ({ ...prev, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.contact.form.typePlaceholder} />
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
                  <Label htmlFor="subject">{t.contact.form.subject}</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder={t.contact.form.subjectPlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t.contact.form.message} {t.contact.form.required}</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={t.contact.form.messagePlaceholder}
                    rows={6}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmit} disabled={submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? t.contact.form.submitting : t.contact.form.submit}
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
