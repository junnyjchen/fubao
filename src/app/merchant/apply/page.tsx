/**
 * @fileoverview 商户入驻申请页面
 * @description 商户申请入驻平台
 * @module app/merchant/apply/page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronRight, 
  Store, 
  CheckCircle, 
  Shield, 
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/upload/ImageUpload';

/** 商户类型映射 */
const BUSINESS_TYPE_MAP: Record<string, number> = {
  individual: 1,
  enterprise: 2,
  temple: 3,
};

export default function MerchantApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    province: '',
    city: '',
    address: '',
    description: '',
    qualifications: [] as string[],
    agreeTerms: false,
  });

  const benefits = [
    {
      icon: Store,
      title: '開設店鋪',
      description: '免費開設專屬店鋪，展示您的產品',
    },
    {
      icon: TrendingUp,
      title: '流量扶持',
      description: '平台流量傾斜，快速獲取客戶',
    },
    {
      icon: Shield,
      title: '認證標識',
      description: '獲得平台認證標識，提升信譽',
    },
    {
      icon: Users,
      title: '精準客群',
      description: '精準觸達玄門文化愛好者',
    },
  ];

  const requirements = [
    '具有合法的經營資質（個人或企業均可）',
    '經營範圍符合平台規範（符箓法器、玄門用品等）',
    '能夠提供「一物一證」認證服務（可選）',
    '遵守平台規則，誠信經營',
  ];

  const process = [
    { step: 1, title: '提交申請', description: '填寫商戶信息' },
    { step: 2, title: '資質審核', description: '1-3個工作日' },
    { step: 3, title: '店鋪開通', description: '開始經營' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.name.trim()) {
      toast.error('請填寫店鋪名稱');
      return;
    }
    if (!formData.type) {
      toast.error('請選擇經營類型');
      return;
    }
    if (!formData.contact_name.trim()) {
      toast.error('請填寫聯繫人姓名');
      return;
    }
    if (!formData.contact_phone.trim()) {
      toast.error('請填寫聯繫電話');
      return;
    }
    if (!formData.contact_email.trim()) {
      toast.error('請填寫電子郵箱');
      return;
    }
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      toast.error('請輸入正確的郵箱格式');
      return;
    }
    // 手机号验证
    const phoneRegex = /^[\d\-+]{8,15}$/;
    if (!phoneRegex.test(formData.contact_phone.replace(/\s/g, ''))) {
      toast.error('請輸入正確的電話號碼');
      return;
    }
    if (!formData.agreeTerms) {
      toast.error('請閱讀並同意平台協議');
      return;
    }

    setLoading(true);
    try {
      // 组装地址
      const fullAddress = [formData.province, formData.city, formData.address]
        .filter(Boolean)
        .join(' ');

      const res = await fetch('/api/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: BUSINESS_TYPE_MAP[formData.type] || 1,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          address: fullAddress || null,
          description: formData.description || null,
          qualifications: formData.qualifications.length > 0 ? formData.qualifications : null,
          status: false, // 默认待审核
        }),
      });

      const data = await res.json();

      if (data.data) {
        toast.success('申請已提交成功！');
        // 跳转到成功页面
        router.push('/merchant/apply/success');
      } else {
        toast.error(data.error || '提交失敗，請重試');
      }
    } catch (error) {
      console.error('提交申请失败:', error);
      toast.error('提交失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">首頁</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">商戶入駐</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Store className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">商戶入駐</h1>
          <p className="text-lg opacity-80 mb-8">
            加入符寶網，開啟您的玄門文化事業
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">入駐優勢</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                入駐條件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">入駐流程</h2>
          <div className="flex items-center justify-center gap-4 flex-wrap md:flex-nowrap">
            {process.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    {step.step}
                  </div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < process.length - 1 && (
                  <div className="w-16 h-0.5 bg-border mx-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Application Form */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>填寫申請信息</CardTitle>
              <CardDescription>
                請如實填寫以下信息，我們會在1-3個工作日內完成審核
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 店铺信息 */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    店鋪信息
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        店鋪名稱 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="請輸入店鋪名稱"
                        maxLength={50}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.name.length}/50 字符
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">
                        經營類型 <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇經營類型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">個人商戶</SelectItem>
                          <SelectItem value="enterprise">企業商戶</SelectItem>
                          <SelectItem value="temple">宮觀機構</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">店鋪簡介</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="請簡要介紹您的店鋪和經營特色"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/500 字符
                    </p>
                  </div>
                </div>

                <Separator />

                {/* 联系信息 */}
                <div className="space-y-4">
                  <h3 className="font-semibold">聯繫信息</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">
                        聯繫人 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contact_name"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                        placeholder="請輸入聯繫人姓名"
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">
                        聯繫電話 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="請輸入手機號碼"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:w-1/2">
                    <Label htmlFor="contact_email">
                      電子郵箱 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="請輸入郵箱地址"
                      maxLength={100}
                    />
                  </div>
                </div>

                <Separator />

                {/* 地址信息 */}
                <div className="space-y-4">
                  <h3 className="font-semibold">經營地址</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="province">省份</Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        placeholder="省份"
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">城市</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="城市"
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">詳細地址</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="詳細地址"
                        maxLength={200}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 资质上传 */}
                <div className="space-y-4">
                  <h3 className="font-semibold">資質證明</h3>
                  <p className="text-sm text-muted-foreground">
                    請上傳營業執照、法人身份證等資質證明文件（支持JPG、PNG格式，單個文件不超過5MB）
                  </p>
                  <ImageUpload
                    value={formData.qualifications}
                    onChange={(urls) => setFormData({ ...formData, qualifications: urls })}
                    maxCount={5}
                    folder="merchant/qualifications"
                    maxSize={5}
                    placeholder="點擊或拖拽資質圖片上傳"
                  />
                </div>

                <Separator />

                {/* 同意条款 */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    我已閱讀並同意
                    <Link href="/terms" className="text-primary hover:underline mx-1" target="_blank">
                      《平台服務協議》
                    </Link>
                    和
                    <Link href="/privacy" className="text-primary hover:underline mx-1" target="_blank">
                      《隱私政策》
                    </Link>
                  </Label>
                </div>

                {/* 提交按钮 */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!formData.agreeTerms || loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    '提交申請'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section className="mt-12 text-center">
          <p className="text-muted-foreground mb-2">入駐過程中遇到問題？</p>
          <Button variant="outline" asChild>
            <Link href="/contact">聯繫客服</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
