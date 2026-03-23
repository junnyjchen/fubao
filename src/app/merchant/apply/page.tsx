'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronRight, 
  Store, 
  CheckCircle, 
  Clock, 
  Shield, 
  TrendingUp,
  Users,
  Upload,
  Plus,
  X,
} from 'lucide-react';

export default function MerchantApplyPage() {
  const [formData, setFormData] = useState({
    storeName: '',
    contactName: '',
    phone: '',
    email: '',
    businessType: '',
    province: '',
    city: '',
    address: '',
    description: '',
    qualifications: [] as File[],
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
    // TODO: 提交商戶入駐申請
    console.log('提交申請:', formData);
    alert('申請已提交，我們將在1-3個工作日內審核');
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
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">入駐流程</h2>
          <div className="flex items-center justify-center gap-4">
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 店铺信息 */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    店鋪信息
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">店鋪名稱 *</Label>
                      <Input
                        id="storeName"
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                        placeholder="請輸入店鋪名稱"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">經營類型 *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => setFormData({ ...formData, businessType: value })}
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
                    />
                  </div>
                </div>

                {/* 联系信息 */}
                <div className="space-y-4">
                  <h3 className="font-semibold">聯繫信息</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">聯繫人 *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="請輸入聯繫人姓名"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">聯繫電話 *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="請輸入手機號碼"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">電子郵箱 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="請輸入郵箱地址"
                      required
                    />
                  </div>
                </div>

                {/* 地址信息 */}
                <div className="space-y-4">
                  <h3 className="font-semibold">經營地址</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="province">省份 *</Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        placeholder="省份"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">城市 *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="城市"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">詳細地址 *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="詳細地址"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 资质上传 */}
                <div className="space-y-4">
                  <h3 className="font-semibold">資質證明</h3>
                  <p className="text-sm text-muted-foreground">
                    請上傳營業執照、法人身份證等資質證明文件（支持JPG、PNG格式，單個文件不超過5MB）
                  </p>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      點擊或拖拽文件到此處上傳
                    </p>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      選擇文件
                    </Button>
                  </div>
                </div>

                {/* 同意条款 */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    我已閱讀並同意
                    <Link href="/terms" className="text-primary hover:underline">《平台服務協議》</Link>
                    和
                    <Link href="/privacy" className="text-primary hover:underline">《隱私政策》</Link>
                  </Label>
                </div>

                {/* 提交按钮 */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!formData.agreeTerms}
                >
                  提交申請
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
