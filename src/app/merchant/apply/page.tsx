/**
 * @fileoverview 商户入驻申请页面
 * @description 新商户申请入驻平台
 * @module app/merchant/apply/page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Store,
  User,
  Phone,
  Mail,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/upload/ImageUpload';

export default function MerchantApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    // 店铺信息
    shop_name: '',
    shop_type: '',
    shop_desc: '',
    logo: [] as string[],
    // 联系人信息
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    // 资质信息
    business_license: [] as string[],
    id_card_front: [] as string[],
    id_card_back: [] as string[],
    // 经营类目
    categories: [] as string[],
    // 其他
    remark: '',
  });

  const steps = [
    { title: '店鋪信息', description: '填寫店鋪基本信息' },
    { title: '聯繫方式', description: '填寫聯繫人信息' },
    { title: '資質證明', description: '上傳相關證件' },
    { title: '經營類目', description: '選擇經營類目' },
  ];

  const shopTypes = [
    { value: 'individual', label: '個人商戶' },
    { value: 'company', label: '企業商戶' },
    { value: 'temple', label: '宗教場所' },
  ];

  const categoryOptions = [
    { value: 'fulei', label: '符箓類' },
    { value: 'faqqi', label: '法器類' },
    { value: 'shuji', label: '書籍類' },
    { value: 'fushi', label: '服飾類' },
    { value: 'collectibles', label: '收藏品' },
    { value: 'other', label: '其他' },
  ];

  const handleNext = () => {
    // 验证当前步骤
    if (currentStep === 0) {
      if (!form.shop_name.trim()) {
        toast.error('請填寫店鋪名稱');
        return;
      }
      if (!form.shop_type) {
        toast.error('請選擇店鋪類型');
        return;
      }
    } else if (currentStep === 1) {
      if (!form.contact_name.trim()) {
        toast.error('請填寫聯繫人姓名');
        return;
      }
      if (!form.contact_phone.trim()) {
        toast.error('請填寫聯繫電話');
        return;
      }
    } else if (currentStep === 2) {
      if (form.business_license.length === 0 && form.shop_type !== 'individual') {
        toast.error('請上傳營業執照');
        return;
      }
      if (form.id_card_front.length === 0 || form.id_card_back.length === 0) {
        toast.error('請上傳身份證正反面');
        return;
      }
    } else if (currentStep === 3) {
      if (form.categories.length === 0) {
        toast.error('請至少選擇一個經營類目');
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error('請閱讀並同意入駐協議');
      return;
    }

    setLoading(true);
    try {
      // 调用API提交申请
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('申請已提交，我們將在1-3個工作日內審核');
      router.push('/merchant/apply/success');
    } catch (error) {
      console.error('提交申请失败:', error);
      toast.error('提交失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (value: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter(c => c !== value)
        : [...prev.categories, value],
    }));
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              符
            </div>
            <div className="text-left">
              <span className="text-xl font-semibold">符寶網</span>
              <p className="text-sm text-muted-foreground">商戶入駐</p>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">商戶入駐申請</CardTitle>
            <CardDescription className="text-center">
              加入符寶網，開啟您的玄門文化事業
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 步骤指示器 */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={index} className="flex-1">
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index < currentStep
                            ? 'bg-primary text-primary-foreground'
                            : index === currentStep
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 ${
                            index < currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>
                    <div className="mt-2 text-left">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* 步骤内容 */}
            <div className="space-y-6">
              {/* 步骤1：店铺信息 */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>店鋪名稱 <span className="text-destructive">*</span></Label>
                    <Input
                      value={form.shop_name}
                      onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                      placeholder="請輸入店鋪名稱"
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>店鋪類型 <span className="text-destructive">*</span></Label>
                    <div className="grid grid-cols-3 gap-3">
                      {shopTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setForm({ ...form, shop_type: type.value })}
                          className={`p-4 rounded-lg border-2 text-center transition-colors ${
                            form.shop_type === type.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Store className="w-6 h-6 mx-auto mb-2" />
                          <span className="text-sm">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>店鋪簡介</Label>
                    <Textarea
                      value={form.shop_desc}
                      onChange={(e) => setForm({ ...form, shop_desc: e.target.value })}
                      placeholder="請輸入店鋪簡介，展示您的特色"
                      rows={4}
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>店鋪Logo</Label>
                    <ImageUpload
                      value={form.logo}
                      onChange={(urls) => setForm({ ...form, logo: urls })}
                      maxCount={1}
                      folder="merchant/apply"
                    />
                  </div>
                </div>
              )}

              {/* 步骤2：联系方式 */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>聯繫人姓名 <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={form.contact_name}
                        onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                        placeholder="請輸入聯繫人姓名"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>聯繫電話 <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={form.contact_phone}
                        onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                        placeholder="請輸入手機號碼"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>電子郵箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={form.contact_email}
                        onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                        placeholder="請輸入電子郵箱"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 步骤3：资质证明 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {form.shop_type !== 'individual' && (
                    <div className="space-y-2">
                      <Label>營業執照 <span className="text-destructive">*</span></Label>
                      <ImageUpload
                        value={form.business_license}
                        onChange={(urls) => setForm({ ...form, business_license: urls })}
                        maxCount={1}
                        folder="merchant/apply"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>身份證正面 <span className="text-destructive">*</span></Label>
                    <ImageUpload
                      value={form.id_card_front}
                      onChange={(urls) => setForm({ ...form, id_card_front: urls })}
                      maxCount={1}
                      folder="merchant/apply"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>身份證反面 <span className="text-destructive">*</span></Label>
                    <ImageUpload
                      value={form.id_card_back}
                      onChange={(urls) => setForm({ ...form, id_card_back: urls })}
                      maxCount={1}
                      folder="merchant/apply"
                    />
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium mb-1">溫馨提示</p>
                        <p>證件信息僅用於資質審核，我們會嚴格保密您的個人信息。</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 步骤4：经营类目 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>經營類目 <span className="text-destructive">*</span></Label>
                    <p className="text-sm text-muted-foreground">請選擇您主要經營的商品類目（可多選）</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categoryOptions.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => toggleCategory(cat.value)}
                          className={`p-4 rounded-lg border-2 text-center transition-colors ${
                            form.categories.includes(cat.value)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>補充說明</Label>
                    <Textarea
                      value={form.remark}
                      onChange={(e) => setForm({ ...form, remark: e.target.value })}
                      placeholder="其他需要說明的情況（可選）"
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {/* 协议 */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="agreement"
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      />
                      <Label htmlFor="agreement" className="text-sm cursor-pointer">
                        我已閱讀並同意
                        <Link href="/merchant/agreement" className="text-primary hover:underline ml-1">
                          《符寶網商戶入駐協議》
                        </Link>
                        和
                        <Link href="/merchant/rules" className="text-primary hover:underline ml-1">
                          《平台規則》
                        </Link>
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* 操作按钮 */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  下一步
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      提交申請
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 底部链接 */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          已有賬號？
          <Link href="/merchant/login" className="text-primary hover:underline ml-1">
            立即登錄
          </Link>
        </div>
      </div>
    </div>
  );
}
