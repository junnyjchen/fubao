'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Calendar,
  MapPin,
  User,
  Package,
  FileText,
  Loader2,
  QrCode,
} from 'lucide-react';

interface CertificateInfo {
  certificate_no: string;
  status: 'valid' | 'invalid' | 'expired';
  goods: {
    id: number;
    name: string;
    image: string;
    category: string;
  };
  merchant: {
    id: number;
    name: string;
    level: number;
  };
  issue_date: string;
  issued_by: string;
  valid_until: string | null;
  verification_count: number;
  last_verification: string;
  details: {
    material: string;
    origin: string;
    craftsmanship: string;
    blessing: string | null;
    master: string | null;
  };
}

export default function CertificateQueryPage() {
  const [certificateNo, setCertificateNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!certificateNo.trim()) {
      setError('請輸入證書編號');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/certificates/${certificateNo.trim()}`);
      const data = await res.json();

      if (data.data) {
        setResult(data.data);
      } else {
        setError(data.error || '未找到該證書信息');
      }
    } catch (err) {
      setError('查詢失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            有效
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            已過期
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            無效
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">一物一證查詢</h1>
          <p className="text-lg opacity-80 mb-8">
            輸入證書編號，驗證商品真偽
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={certificateNo}
                onChange={(e) => setCertificateNo(e.target.value)}
                placeholder="請輸入證書編號，如：FB-2024-XXXXXX"
                className="pl-12 h-12 bg-background text-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              size="lg"
              className="h-12 px-8"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '查詢'
              )}
            </Button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-300 flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Query Result */}
        {result && (
          <div className="mb-12">
            <Card className="overflow-hidden">
              {/* Status Header */}
              <div className={`py-6 px-8 ${
                result.status === 'valid' 
                  ? 'bg-green-50 dark:bg-green-950/30' 
                  : result.status === 'expired'
                  ? 'bg-yellow-50 dark:bg-yellow-950/30'
                  : 'bg-red-50 dark:bg-red-950/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className={`w-8 h-8 ${
                      result.status === 'valid' 
                        ? 'text-green-600' 
                        : result.status === 'expired'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`} />
                    <div>
                      <p className="text-sm text-muted-foreground">證書編號</p>
                      <p className="text-xl font-mono font-bold">{result.certificate_no}</p>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              </div>

              <CardContent className="p-8">
                {/* Goods Info */}
                <div className="flex gap-6 mb-8">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {result.goods.image ? (
                      <img
                        src={result.goods.image}
                        alt={result.goods.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">{result.goods.category}</Badge>
                    <h3 className="text-xl font-semibold mb-2">{result.goods.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {result.merchant.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-yellow-600" />
                        {result.merchant.level}星認證商戶
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Certificate Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      證書信息
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">頒發機構</span>
                        <span>{result.issued_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">頒發日期</span>
                        <span>{new Date(result.issue_date).toLocaleDateString()}</span>
                      </div>
                      {result.valid_until && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">有效期至</span>
                          <span>{new Date(result.valid_until).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">驗證次數</span>
                        <span>{result.verification_count} 次</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最近驗證</span>
                        <span>{new Date(result.last_verification).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      商品詳情
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">材質</span>
                        <span>{result.details.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">產地</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {result.details.origin}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">工藝</span>
                        <span>{result.details.craftsmanship}</span>
                      </div>
                      {result.details.blessing && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">加持</span>
                          <span>{result.details.blessing}</span>
                        </div>
                      )}
                      {result.details.master && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">法師</span>
                          <span>{result.details.master}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <Link href={`/shop/${result.goods.id}`}>查看商品</Link>
                  </Button>
                  <Button variant="outline">
                    <QrCode className="w-4 h-4 mr-2" />
                    下載證書
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">關於一物一證</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">正品保障</h3>
                <p className="text-sm text-muted-foreground">
                  每件認證商品都有唯一證書，確保商品真實可靠
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">便捷查詢</h3>
                <p className="text-sm text-muted-foreground">
                  輸入證書編號即可查驗商品信息，辨別真偽
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">價值認證</h3>
                <p className="text-sm text-muted-foreground">
                  詳細記錄商品來源、材質、工藝等信息，提升收藏價值
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>常見問題</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">如何找到證書編號？</h4>
                <p className="text-sm text-muted-foreground">
                  證書編號位於商品附帶的認證證書上，格式為「FB-年份-編號」，如FB-2024-000001。
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">證書驗證次數異常怎麼辦？</h4>
                <p className="text-sm text-muted-foreground">
                  如發現證書驗證次數異常增多，可能存在證書被複製風險。請立即聯繫客服，我們會協助核實處理。
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">證書遺失可以補發嗎？</h4>
                <p className="text-sm text-muted-foreground">
                  可以。請憑訂單號申請補發，補發證書需支付工本費（郵寄費另計）。具體請聯繫客服辦理。
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-1">所有商品都有證書嗎？</h4>
                <p className="text-sm text-muted-foreground">
                  不是所有商品都有證書。「一物一證」為可選認證服務，詳情請查看商品頁面說明。
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
