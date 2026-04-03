/**
 * @fileoverview 证书验证组件
 * @description 证书查询验证入口页面
 * @module components/certificate/CertificateVerifyPage
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Search,
  Award,
  CheckCircle,
  AlertCircle,
  QrCode,
  HelpCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * 证书验证页面组件
 * @returns 证书验证页面
 */
export function CertificateVerifyPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const cert = t.certificatePage;
  
  const [certificateNo, setCertificateNo] = useState('');
  const [error, setError] = useState('');

  /**
   * 验证证书
   */
  const handleVerify = () => {
    if (!certificateNo.trim()) {
      setError(cert.search.error);
      return;
    }

    // 清理证书编号（去除空格，转大写）
    const cleanNo = certificateNo.trim().toUpperCase();
    
    // 跳转到验证结果页
    router.push(`/verify/${cleanNo}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {cert.title}
          </h1>
          <p className="text-primary-foreground/80">
            {cert.subtitle}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* 查询卡片 */}
        <Card className="max-w-xl mx-auto shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Search className="w-5 h-5" />
              {cert.search.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificateNo">{cert.search.label}</Label>
                <Input
                  id="certificateNo"
                  placeholder={cert.search.placeholder}
                  value={certificateNo}
                  onChange={(e) => {
                    setCertificateNo(e.target.value);
                    setError('');
                  }}
                  className="h-12 text-lg"
                />
                {error && (
                  <p className={`text-sm text-destructive flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <Button
                className="w-full h-12 text-lg"
                onClick={handleVerify}
              >
                <Search className={`w-5 h-5 ${isRTL ? 'ms-2' : 'me-2'}`} />
                {cert.search.button}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {cert.search.hint}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 功能介绍 */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">{cert.features.auth.title}</h3>
              <p className="text-sm text-muted-foreground">
                {cert.features.auth.desc}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">{cert.features.info.title}</h3>
              <p className="text-sm text-muted-foreground">
                {cert.features.info.desc}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{cert.features.guarantee.title}</h3>
              <p className="text-sm text-muted-foreground">
                {cert.features.guarantee.desc}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 常见问题 */}
        <Card className="mt-12 max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <HelpCircle className="w-5 h-5" />
              {t.common.faq}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-1">{t.common.faqItems?.certificateWhere || '證書編號在哪裡？'}</p>
              <p className="text-sm text-muted-foreground">
                {t.common.faqItems?.certificateWhereDesc || '證書編號通常位於商品包裝上的認證標籤，或隨商品附帶的證書卡片上。'}
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">{t.common.faqItems?.certificateFailed || '證書驗證失敗怎麼辦？'}</p>
              <p className="text-sm text-muted-foreground">
                {t.common.faqItems?.certificateFailedDesc || '請確認證書編號輸入正確。如仍無法驗證，請聯繫客服或商品商戶。'}
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">{t.common.faqItems?.certificateExpired || '證書過期還有效嗎？'}</p>
              <p className="text-sm text-muted-foreground">
                {t.common.faqItems?.certificateExpiredDesc || '證書過期表示認證期限已到，但不影響商品本身的真實性。可聯繫商戶申請續期。'}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
