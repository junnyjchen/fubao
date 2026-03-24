/**
 * @fileoverview 分销规则页面
 * @description 展示分销系统规则和佣金计算方式
 * @module app/distribution/rules/page
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Award,
  Users,
  TrendingUp,
  Gift,
  Crown,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

const rules = [
  {
    icon: Users,
    title: '一級分銷',
    rate: '10%',
    description: '您直接邀請的好友購物，您可獲得訂單金額的10%作為佣金獎勵',
    example: '好友購物 HK$1000，您獲得 HK$100',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  {
    icon: Users,
    title: '二級分銷',
    rate: '5%',
    description: '您好友邀請的好友購物，您可獲得訂單金額的5%作為佣金獎勵',
    example: '間接好友購物 HK$1000，您獲得 HK$50',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    icon: Users,
    title: '三級分銷',
    rate: '2%',
    description: '三級好友購物，您可獲得訂單金額的2%作為佣金獎勵',
    example: '三級好友購物 HK$1000，您獲得 HK$20',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
];

const teamLeaderRewards = [
  { level: '一級團隊', rate: '2%', description: '團隊成員一級好友購物額外獎勵' },
  { level: '二級團隊', rate: '1%', description: '團隊成員二級好友購物額外獎勵' },
  { level: '三級團隊', rate: '0.5%', description: '團隊成員三級好友購物額外獎勵' },
];

const faqs = [
  {
    q: '如何成為團隊長？',
    a: '直推人數達到50人且團隊總銷售額達到HK$50,000，即可申請成為團隊長，享受團隊獎勵。',
  },
  {
    q: '佣金何時結算？',
    a: '訂單完成後7天自動結算到可用佣金，可用佣金可隨時申請提現。',
  },
  {
    q: '提現有什麼限制？',
    a: '最低提現金額為HK$100，提現無手續費，1-3個工作日審核，審核通過後1-2個工作日到賬。',
  },
  {
    q: '佣金可以轉贈嗎？',
    a: '目前不支持佣金轉贈功能，佣金僅可用於提現。',
  },
  {
    q: '如何邀請好友？',
    a: '在分銷中心點擊「邀請好友」，複製邀請鏈接或邀請碼分享給好友即可。',
  },
];

export default function DistributionRulesPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部 */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/distribution">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">分銷規則</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 分销层级说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              佣金等級
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full ${rule.bg} flex items-center justify-center flex-shrink-0`}>
                  <rule.icon className={`w-6 h-6 ${rule.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{rule.title}</span>
                    <Badge className={rule.bg.replace('100', '200')}>
                      {rule.rate}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                  <p className="text-xs text-muted-foreground mt-1 bg-muted/50 px-2 py-1 rounded">
                    {rule.example}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 团队长奖励 */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" />
              團隊長獎勵
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              成為團隊長後，除了正常分銷佣金外，還可獲得團隊成員銷售額的額外獎勵：
            </p>
            <div className="space-y-3">
              {teamLeaderRewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/10 rounded-lg">
                  <div>
                    <span className="font-medium">{reward.level}</span>
                    <p className="text-xs text-muted-foreground">{reward.description}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">{reward.rate}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/10 rounded-lg">
              <p className="text-sm font-medium mb-2">如何成為團隊長？</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  直推人數達到 50 人
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  團隊總銷售額達到 HK$50,000
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  申請並通過審核
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 结算规则 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              結算規則
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">訂單完成後計算佣金</p>
                  <p className="text-sm text-muted-foreground">用戶確認收貨後，系統自動計算分銷佣金</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">7天凍結期</p>
                  <p className="text-sm text-muted-foreground">佣金在凍結期內不可提現，防止退貨糾紛</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium">自動結算</p>
                  <p className="text-sm text-muted-foreground">凍結期滿後自動轉入可用佣金</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium">隨時提現</p>
                  <p className="text-sm text-muted-foreground">可用佣金滿HK$100即可申請提現</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提现规则 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              提現規則
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">HK$100</p>
                <p className="text-xs text-muted-foreground mt-1">最低提現金額</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">0%</p>
                <p className="text-xs text-muted-foreground mt-1">提現手續費</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">1-3天</p>
                <p className="text-xs text-muted-foreground mt-1">審核時間</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">1-2天</p>
                <p className="text-xs text-muted-foreground mt-1">到賬時間</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 常见问题 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              常見問題
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index}>
                <p className="font-medium flex items-center gap-2">
                  <span className="text-primary">Q:</span>
                  {faq.q}
                </p>
                <p className="text-sm text-muted-foreground mt-1 pl-5">
                  {faq.a}
                </p>
                {index < faqs.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 注意事项 */}
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200">注意事項</p>
                <ul className="text-red-600 dark:text-red-300 mt-2 space-y-1">
                  <li>· 禁止刷單、虛假交易等違規行為，一經發現將取消分銷資格</li>
                  <li>· 佣金僅可用於提現，不支持轉贈或消費</li>
                  <li>· 如有疑問請聯繫客服咨詢</li>
                  <li>· 最終解釋權歸符寶網所有</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部按钮 */}
        <div className="pb-6">
          <Link href="/distribution">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="font-medium">立即開始推廣</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
