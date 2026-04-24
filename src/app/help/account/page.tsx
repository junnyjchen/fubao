'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronRight, 
  ChevronLeft,
  User, 
  Lock,
  Shield,
  Key,
  Smartphone,
  Mail,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function AccountHelpPage() {
  const { t, isRTL } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const accountFeatures = [
    {
      icon: User,
      title: t.helpPages.account.features.profile.title,
      description: t.helpPages.account.features.profile.desc,
      path: '/user/settings',
    },
    {
      icon: Lock,
      title: t.helpPages.account.features.password.title,
      description: t.helpPages.account.features.password.desc,
      path: '/user/settings',
    },
    {
      icon: Mail,
      title: t.helpPages.account.features.email.title,
      description: t.helpPages.account.features.email.desc,
      path: '/user/settings',
    },
    {
      icon: Smartphone,
      title: t.helpPages.account.features.phone.title,
      description: t.helpPages.account.features.phone.desc,
      path: '/user/settings',
    },
    {
      icon: Key,
      title: t.helpPages.account.features.payment.title,
      description: t.helpPages.account.features.payment.desc,
      path: '/user/settings',
    },
    {
      icon: Shield,
      title: t.helpPages.account.features.security.title,
      description: t.helpPages.account.features.security.desc,
      path: '/user/settings',
    },
  ];

  const faqs = t.helpPages.account.faq.items;

  const securityTips = t.helpPages.account.securityTips.tips;

  // RTL 辅助变量
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // 动画样式
  const animationClass = mounted ? 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500' : 'opacity-0';

  return (
    <div 
      className="container mx-auto px-4 py-8"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Breadcrumb */}
      <nav 
        className={`flex items-center gap-2 text-sm text-muted-foreground mb-8 ${animationClass}`}
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-foreground">{t.nav.home}</Link>
        <ChevronIcon className="w-4 h-4" />
        <Link href="/help" className="hover:text-foreground">{t.nav.help}</Link>
        <ChevronIcon className="w-4 h-4" />
        <span className="text-foreground">{t.helpPages.account.title}</span>
      </nav>

      <div className={`max-w-4xl mx-auto ${animationClass}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t.helpPages.account.title}</h1>
          <p className="text-muted-foreground">{t.helpPages.account.subtitle}</p>
        </div>

        {/* Account Features */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">{t.helpPages.account.features.profile.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} href={feature.path}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-medium">{feature.title}</h3>
                      </div>
                      <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Security Tips */}
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="font-semibold mb-3">{t.helpPages.account.securityTips.title}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {securityTips.map((tip, index) => (
                      <li key={index} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <HelpCircle className="w-5 h-5 text-primary" />
            {t.helpPages.account.faq.title}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <h4 className={`font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>{faq.q}</h4>
                  <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">{t.helpPages.account.contactSupport}</p>
          <Button asChild>
            <Link href="/contact">{t.helpPages.account.contactButton}</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
