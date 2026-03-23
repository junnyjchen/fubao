/**
 * @fileoverview 证书详情组件
 * @description 展示证书验证结果
 * @module components/certificate/CertificateDetailPage
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
  User,
  Award,
  ExternalLink,
} from 'lucide-react';

/** 证书数据类型 */
interface CertificateData {
  certificate_no: string;
  status: 'valid' | 'expired' | 'invalid';
  goods: {
    id: number;
    name: string;
    image: string | null;
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
    material?: string;
    origin?: string;
    craftsmanship?: string;
    blessing?: string;
    master?: string;
  };
}

interface CertificateDetailPageProps {
  certificateNo: string;
}

/**
 * 证书详情页面组件
 * @returns 证书详情页面
 */
export function CertificateDetailPage({ certificateNo }: CertificateDetailPageProps) {
  const router = useRouter();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCertificate();
  }, [certificateNo]);

  /**
   * 加载证书信息
   */
  const loadCertificate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/certificates/${certificateNo}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.data) {
        setCertificate(data.data);
      } else {
        setError('未找到該證書信息');
      }
    } catch (error) {
      console.error('驗證失敗:', error);
      setError('驗證失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取状态显示
   */
  const getStatusDisplay = () => {
    if (!certificate) return null;

    switch (certificate.status) {
      case 'valid':
        return {
          icon: <CheckCircle className="w-8 h-8" />,
          label: '認證有效',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'expired':
        return {
          icon: <Clock className="w-8 h-8" />,
          label: '認證已過期',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        };
      default:
        return {
          icon: <XCircle className="w-8 h-8" />,
          label: '認證無效',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground/50 animate-pulse" />
          <p className="mt-4 text-muted-foreground">正在驗證證書...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <header className="bg-primary text-primary-foreground py-4">
          <div className="max-w-2xl mx-auto px-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => router.push('/verify')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回查詢
            </Button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">驗證失敗</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => router.push('/verify')}>
                  重新查詢
                </Button>
                <Button asChild>
                  <Link href="/shop">瀏覽商品</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => router.push('/verify')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回查詢
          </Button>
          <Badge className="bg-primary-foreground/20 text-primary-foreground">
            <Eye className="w-3 h-3 mr-1" />
            已驗證 {certificate.verification_count} 次
          </Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 状态卡片 */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full ${statusDisplay?.bgColor} flex items-center justify-center ${statusDisplay?.color}`}
            >
              {statusDisplay?.icon}
            </div>
            <h2 className="text-2xl font-bold mb-2">{statusDisplay?.label}</h2>
            <p className="text-lg font-mono text-muted-foreground">
              {certificate.certificate_no}
            </p>
          </CardContent>
        </Card>

        {/* 商品信息 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              認證商品
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
                {certificate.goods.image ? '圖片' : '商品'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-lg">{certificate.goods.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  分類：{certificate.goods.category}
                </p>
                <Button variant="link" className="px-0 mt-2" asChild>
                  <Link href={`/shop/${certificate.goods.id}`}>
                    查看商品詳情
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 认证信息 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              認證信息
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">頒發機構</p>
                  <p className="font-medium">{certificate.issued_by}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">商戶名稱</p>
                  <p className="font-medium">{certificate.merchant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    頒發日期
                  </p>
                  <p className="font-medium">
                    {new Date(certificate.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    有效期至
                  </p>
                  <p className="font-medium">
                    {certificate.valid_until
                      ? new Date(certificate.valid_until).toLocaleDateString()
                      : '永久有效'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* 认证详情 */}
              <div className="space-y-3">
                {certificate.details.material && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">材質</p>
                      <p className="font-medium">{certificate.details.material}</p>
                    </div>
                  </div>
                )}
                {certificate.details.origin && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">產地</p>
                      <p className="font-medium">{certificate.details.origin}</p>
                    </div>
                  </div>
                )}
                {certificate.details.craftsmanship && (
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">工藝</p>
                      <p className="font-medium">{certificate.details.craftsmanship}</p>
                    </div>
                  </div>
                )}
                {certificate.details.master && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">開光法師</p>
                      <p className="font-medium">{certificate.details.master}</p>
                    </div>
                  </div>
                )}
                {certificate.details.blessing && (
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">加持信息</p>
                      <p className="font-medium">{certificate.details.blessing}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 验证记录 */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              驗證記錄
            </h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">累計驗證次數</span>
              <span className="font-semibold">{certificate.verification_count} 次</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">最近驗證時間</span>
              <span>
                {new Date(certificate.last_verification).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 底部操作 */}
        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={() => router.push('/verify')}>
            查詢其他證書
          </Button>
          <Button asChild>
            <Link href={`/shop/${certificate.goods.id}`}>
              查看商品
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
