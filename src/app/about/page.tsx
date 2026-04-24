'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
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

export default function AboutPage() {
  const { t } = useI18n();

  const platformFeatures = [
    {
      icon: Globe,
      title: t.about.features.global.title,
      description: t.about.features.global.desc,
    },
    {
      icon: Shield,
      title: t.about.features.quality.title,
      description: t.about.features.quality.desc,
    },
    {
      icon: Users,
      title: t.about.features.team.title,
      description: t.about.features.team.desc,
    },
    {
      icon: Award,
      title: t.about.features.reputation.title,
      description: t.about.features.reputation.desc,
    },
  ];

  const stats = [
    { label: t.about.stats.users, value: '10,000+' },
    { label: t.about.stats.merchants, value: '500+' },
    { label: t.about.stats.products, value: '5,000+' },
    { label: t.about.stats.regions, value: '50+' },
  ];

  const timeline = [
    { year: '2023', title: t.about.timeline.founded.title, description: t.about.timeline.founded.desc },
    { year: '2023', title: t.about.timeline.certificate.title, description: t.about.timeline.certificate.desc },
    { year: '2024', title: t.about.timeline.global.title, description: t.about.timeline.global.desc },
    { year: '2024', title: t.about.timeline.content.title, description: t.about.timeline.content.desc },
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: t.help.email,
      content: 'support@fubao.ltd',
      description: '24小時內回覆',
    },
    {
      icon: Phone,
      title: t.help.phone,
      content: '+852 XXXX XXXX',
      description: '週一至週五 9:00-18:00',
    },
    {
      icon: MapPin,
      title: t.footer.contact,
      content: '香港九龍XXX大廈XX樓',
      description: '歡迎來訪洽談合作',
    },
    {
      icon: Clock,
      title: t.help.serviceHours,
      content: '週一至週五 9:00-18:00',
      description: '節假日另行通知',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t.about.title}</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            {t.about.subtitle}<br />
            {t.about.tagline}
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* 平台介绍 */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.about.mission}</h2>
            <p className="text-lg text-muted-foreground">
              {t.about.missionDesc}
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
          <h2 className="text-3xl font-bold mb-8 text-center">{t.about.history}</h2>
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
          <h2 className="text-3xl font-bold mb-8 text-center">{t.help.contactUs}</h2>
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
                  <h3 className="text-2xl font-bold mb-2">{t.about.merchantInvite.title}</h3>
                  <p className="text-muted-foreground">
                    {t.about.merchantInvite.desc}<br />
                    {t.about.merchantInvite.desc2}
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href="/merchant/apply">
                    {t.about.merchantInvite.cta}
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
          <h3 className="text-2xl font-bold mb-4">{t.about.questions}</h3>
          <p className="text-muted-foreground mb-6">
            {t.about.questionsHint}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/help">
                {t.about.helpCenter}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/help">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t.about.onlineService}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
