'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const { t } = useI18n();

  const footerLinks = {
    baike: [
      { href: '/baike?category=intro', label: t.baike.categories.intro },
      { href: '/baike?category=fu', label: t.baike.categories.fu },
      { href: '/baike?category=qi', label: t.baike.categories.qi },
      { href: '/baike?category=knowledge', label: t.baike.categories.knowledge },
    ],
    shop: [
      { href: '/shop?type=fu', label: t.shop.filter.fu },
      { href: '/shop?type=qi', label: t.shop.filter.qi },
      { href: '/shop?type=offering', label: t.shop.filter.offering },
      { href: '/shop?type=practice', label: t.shop.filter.practice },
    ],
    about: [
      { href: '/about', label: '關於我們' },
      { href: '/contact', label: '聯繫我們' },
      { href: '/terms', label: '服務條款' },
      { href: '/privacy', label: '隱私政策' },
    ],
  };

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                符
              </div>
              <span className="text-xl font-semibold tracking-tight">符寶網</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t.home.banner.subtitle}
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 fubao.ltd All rights reserved.
            </p>
          </div>

          {/* 百科链接 */}
          <div>
            <h3 className="font-semibold mb-4">{t.nav.baike}</h3>
            <ul className="space-y-2">
              {footerLinks.baike.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 商城链接 */}
          <div>
            <h3 className="font-semibold mb-4">{t.nav.shop}</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 关于我们 */}
          <div>
            <h3 className="font-semibold mb-4">關於我們</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>一物一證</span>
            <span>·</span>
            <span>平台擔保</span>
            <span>·</span>
            <span>全球配送</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help" className="hover:text-foreground transition-colors">
              幫助中心
            </Link>
            <Link href="/merchant" className="hover:text-foreground transition-colors">
              商戶入駐
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
