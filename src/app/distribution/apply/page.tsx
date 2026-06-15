/**
 * @fileoverview 分销员申请页面
 * @description 会员申请成为分销员，填写个人信息和社交资料
 * @module app/distribution/apply/page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Send,
  ArrowLeft,
  Users,
  DollarSign,
  Gift,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ApplicationStatus {
  has_applied: boolean;
  status: number; // 0=pending, 1=approved, 2=rejected
  real_name?: string;
  phone?: string;
  reject_reason?: string;
  created_at?: string;
}

export default function DistributionApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appStatus, setAppStatus] = useState<ApplicationStatus | null>(null);

  // 表单字段
  const [realName, setRealName] = useState('');
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialFollowers, setSocialFollowers] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    checkApplicationStatus();
  }, []);

  const checkApplicationStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login?redirect=/distribution/apply');
        return;
      }
      const res = await fetch('/api/distribution/apply', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setAppStatus(result.data);
      }
    } catch (error) {
      console.error('查询申请状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!realName.trim()) {
      toast.error('請填寫真實姓名');
      return;
    }
    if (!phone.trim()) {
      toast.error('請填寫手機號碼');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/distribution/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          real_name: realName,
          phone,
          wechat,
          social_platform: socialPlatform,
          social_followers: socialFollowers ? parseInt(socialFollowers) : 0,
          reason,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('申請已提交，請等待審核');
        setAppStatus({
          has_applied: true,
          status: 0,
          real_name: realName,
          phone,
          created_at: new Date().toISOString(),
        });
      } else {
        toast.error(result.error || '提交失敗');
      }
    } catch {
      toast.error('提交失敗，請稍後重試');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 已提交申请的状态展示
  if (appStatus?.has_applied) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/distribution" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">分銷員申請</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              {appStatus.status === 0 && (
                <>
                  <Clock className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                  <h2 className="text-xl font-bold mb-2">申請審核中</h2>
                  <p className="text-muted-foreground mb-4">
                    您的分銷員申請已提交，我們將盡快審核，請耐心等待
                  </p>
                  <div className="bg-muted p-4 rounded-lg text-left max-w-sm mx-auto space-y-2 text-sm">
                    <p><strong>姓名:</strong> {appStatus.real_name}</p>
                    <p><strong>手機:</strong> {appStatus.phone}</p>
                    <p><strong>申請時間:</strong> {appStatus.created_at ? new Date(appStatus.created_at).toLocaleString() : '-'}</p>
                  </div>
                  <Badge className="mt-4 bg-amber-100 text-amber-700">
                    <Clock className="w-3 h-3 mr-1" />
                    審核中
                  </Badge>
                </>
              )}
              {appStatus.status === 1 && (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h2 className="text-xl font-bold mb-2">恭喜！申請已通過</h2>
                  <p className="text-muted-foreground mb-4">
                    您已成為符寶網分銷員，可以開始推廣賺取佣金
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/distribution">
                      <Button>進入分銷中心</Button>
                    </Link>
                  </div>
                  <Badge className="mt-4 bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    已通過
                  </Badge>
                </>
              )}
              {appStatus.status === 2 && (
                <>
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <h2 className="text-xl font-bold mb-2">申請未通過</h2>
                  <p className="text-muted-foreground mb-4">
                    很遺憾，您的申請暫未通過審核
                  </p>
                  {appStatus.reject_reason && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg max-w-sm mx-auto text-sm text-red-700">
                      <p className="font-medium mb-1">拒絕原因：</p>
                      <p>{appStatus.reject_reason}</p>
                    </div>
                  )}
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => setAppStatus(null)}
                  >
                    重新申請
                  </Button>
                  <Badge className="mt-4 bg-red-100 text-red-700">
                    <XCircle className="w-3 h-3 mr-1" />
                    未通過
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 申请表单
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/distribution" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">申請成為分銷員</h1>
      </div>

      {/* 权益介绍 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">分銷員權益</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium">高額佣金</p>
              <p className="text-xs text-muted-foreground">最高30%返佣</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium">團隊獎勵</p>
              <p className="text-xs text-muted-foreground">帶隊額外獎勵</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium">專屬優惠</p>
              <p className="text-xs text-muted-foreground">分銷商專享折扣</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-sm font-medium">實時結算</p>
              <p className="text-xs text-muted-foreground">佣金快速提現</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 申请表单 */}
      <Card>
        <CardHeader>
          <CardTitle>填寫申請信息</CardTitle>
          <CardDescription>請如實填寫以下信息，我們將在1-3個工作日內完成審核</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="realName">
                  真實姓名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="realName"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="請填寫真實姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  手機號碼 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="請填寫手機號碼"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wechat">微信號（選填）</Label>
              <Input
                id="wechat"
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                placeholder="方便聯繫您的微信號"
              />
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-3">社交媒體信息（選填，有助於審核通過）</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>社交平台</Label>
                  <Select value={socialPlatform} onValueChange={setSocialPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wechat">微信公眾號</SelectItem>
                      <SelectItem value="xiaohongshu">小紅書</SelectItem>
                      <SelectItem value="douyin">抖音</SelectItem>
                      <SelectItem value="weibo">微博</SelectItem>
                      <SelectItem value="bilibili">B站</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>粉絲數量</Label>
                  <Input
                    type="number"
                    value={socialFollowers}
                    onChange={(e) => setSocialFollowers(e.target.value)}
                    placeholder="粉絲數量"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="reason">申請理由（選填）</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="簡述您為什麼想成為符寶網分銷員，以及您的推廣計劃..."
                rows={4}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
              <p className="font-medium">申請須知：</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>申請審核通常需要1-3個工作日</li>
                <li>成為分銷員後，可通過分享商品鏈接賺取佣金</li>
                <li>分銷員需遵守平台規則，禁止虛假宣傳</li>
                <li>佣金按月結算，可申請提現</li>
              </ul>
            </div>

            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  提交申請
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
