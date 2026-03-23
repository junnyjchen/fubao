/**
 * @fileoverview 关于我们页面
 * @description 介绍符宝网平台和联系方式
 * @module app/about/page
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Globe,
  Shield,
  Users,
  Award,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

const platformFeatures = [
  {
    icon: Globe,
    title: '全球平台',
    description: '連接全球玄門文化愛好者，提供多語言支持（繁體/簡體/英文），服務遍及全球各地。',
  },
  {
    icon: Shield,
    title: '品質保證',
    description: '嚴格審核入駐商戶，「一物一證」認證體系確保商品真實性，為每一件商品保駕護航。',
  },
  {
    icon: Users,
    title: '專業團隊',
    description: '匯聚玄門文化專家顧問團隊，為商品鑑定、文化傳播提供專業支持。',
  },
  {
    icon: Award,
    title: '信譽認證',
    description: '多級商戶認證體系，透明評價機制，讓您購買更放心。',
  },
];

const stats = [
  { label: '註冊用戶', value: '10,000+' },
  { label: '入駐商戶', value: '500+' },
  { label: '認證商品', value: '5,000+' },
  { label: '服務地區', value: '50+' },
];

const timeline = [
  {
    year: '2023',
    title: '平台創立',
    description: '符寶網正式上線，致力於打造全球玄門文化科普交易平台。',
  },
  {
    year: '2023',
    title: '一物一證',
    description: '推出「一物一證」認證體系，為商品真實性提供保障。',
  },
  {
    year: '2024',
    title: '全球拓展',
    description: '開通多語言支持，服務範圍擴展至全球50+國家和地區。',
  },
  {
    year: '2024',
    title: '內容生態',
    description: '建立玄門百科、視頻學堂等內容板塊，推廣玄門文化。',
  },
];

const contactInfo = [
  {
    icon: Mail,
    title: '電子郵箱',
    content: 'support@fubao.ltd',
    description: '工作日24小時內回覆',
  },
  {
    icon: Phone,
    title: '客服熱線',
    content: '+852 XXXX XXXX',
    description: '週一至週五 9:00-18:00',
  },
  {
    icon: MapPin,
    title: '公司地址',
    content: '香港九龍XXX大廈XX樓',
    description: '歡迎來訪洽談合作',
  },
  {
    icon: Clock,
    title: '工作時間',
    content: '週一至週五 9:00-18:00',
    description: '節假日另行通知',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">關於符寶網</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            全球玄門文化科普交易平台<br />
            傳承玄門文化，服務全球信眾
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* 平台介绍 */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">我們的使命</h2>
            <p className="text-lg text-muted-foreground">
              符寶網致力於打造全球領先的玄門文化科普交易平台，為全球玄門文化愛好者提供
              正宗、優質的符箓法器，同時通過百科內容和視頻學堂推廣玄門文化知識，
              讓更多人了解和傳承這一珍貴的文化遺產。
            </p>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 平台特色 */}
          <div className="grid md:grid-cols-2 gap-6">
            {platformFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 发展历程 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">發展歷程</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative border-l-2 border-primary/20 pl-8 space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-10 w-4 h-4 rounded-full bg-primary" />
                  <div className="mb-1">
                    <span className="text-sm font-semibold text-primary">{item.year}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 联系我们 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">聯繫我們</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-primary font-medium mb-1">{item.content}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 商户入驻 */}
        <section>
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">誠邀商戶入駐</h3>
                  <p className="text-muted-foreground">
                    加入符寶網，與全球玄門文化愛好者建立連接<br />
                    我們提供專業的平台支持和流量扶持
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href="/merchant/apply">
                    申請入駐
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer CTA */}
      <section className="bg-muted py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">還有疑問？</h3>
          <p className="text-muted-foreground mb-6">
            瀏覽幫助中心或聯繫我們的客服團隊
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/help">
                幫助中心
              </Link>
            </Button>
            <Button asChild>
              <Link href="/help">
                <MessageCircle className="w-4 h-4 mr-2" />
                在線客服
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
