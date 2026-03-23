'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Heart,
  Award,
  Bell,
  Settings,
  Globe,
  ChevronRight,
  User,
} from 'lucide-react';

export function UserPage() {
  const { t, lang, setLang } = useI18n();

  const menuItems = [
    { icon: Package, label: t.user.orders, href: '/user/orders', count: 0 },
    { icon: Heart, label: t.user.favorites, href: '/user/favorites', count: 0 },
    { icon: Award, label: t.user.certificates, href: '/user/certificates', count: 0 },
    { icon: Bell, label: t.user.messages, href: '/user/messages', count: 0 },
    { icon: Settings, label: t.user.settings, href: '/user/settings' },
    { icon: Globe, label: t.user.language, href: '#', action: 'language' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* User Profile Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold mb-1">歡迎您</h1>
              <p className="text-muted-foreground">請登入以享受完整服務</p>
            </div>
          </div>
        </div>
      </section>

      {/* Login/Register Buttons */}
      <section className="container mx-auto px-4 py-6 -mt-4">
        <Card>
          <CardContent className="p-6 flex gap-4">
            <Button className="flex-1" size="lg">
              {t.nav.login}
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              {t.nav.register}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">待付款</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">待發貨</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">待收貨</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">待評價</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Menu List */}
      <section className="container mx-auto px-4 py-4">
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={item.href + item.label}>
                {item.action === 'language' ? (
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setLang(lang === 'zh-TW' ? 'zh-CN' : lang === 'zh-CN' ? 'en' : 'zh-TW')}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Badge variant="outline">
                        {lang === 'zh-TW' ? '繁體中文' : lang === 'zh-CN' ? '简体中文' : 'English'}
                      </Badge>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <Link href={item.href}>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {item.count !== undefined && item.count > 0 && (
                          <Badge>{item.count}</Badge>
                        )}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                )}
                {index < menuItems.length - 1 && (
                  <div className="h-px bg-border ml-12" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Help Section */}
      <section className="container mx-auto px-4 py-4 pb-12">
        <Card>
          <CardContent className="p-0">
            <Link href="/help">
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <span>幫助中心</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <div className="h-px bg-border" />
            <Link href="/about">
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <span>關於我們</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
