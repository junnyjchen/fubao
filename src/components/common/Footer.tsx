'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from 'lucide-react';

export function Footer() {
  const { t } = useI18n();

  const footerLinks = {
    platform: [
      { href: '/about', label: t.nav.about },
      { href: '/contact', label: t.nav.contact },
      { href: '/help', label: t.nav.help },
      { href: '/merchant/apply', label: t.home.features.join },
    ],
    help: [
      { href: '/help/shopping', label: t.help.categories.shopping },
      { href: '/help/payment', label: t.help.categories.payment },
      { href: '/help/shipping', label: t.help.categories.shipping },
      { href: '/help/after-sales', label: t.help.categories.afterSales },
    ],
    legal: [
      { href: '/terms', label: t.legal.terms },
      { href: '/privacy', label: t.legal.privacy },
      { href: '/refund', label: t.legal.refund },
      { href: '/copyright', label: t.legal.copyright },
    ],
    categories: [
      { href: '/shop?type=1', label: t.categories.fu },
      { href: '/shop?type=2', label: t.categories.qi },
      { href: '/shop?type=3', label: t.categories.offering },
      { href: '/shop?type=4', label: t.categories.books },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand & Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                符
              </div>
              <span className="text-xl font-semibold tracking-tight">符寶網</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t.footer.slogan}
            </p>
            
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.footer.newsletter}</p>
              <div className="flex gap-2">
                <Input 
                  placeholder={t.footer.emailPlaceholder}
                  className="h-9 text-sm"
                />
                <Button size="sm">{t.footer.subscribe}</Button>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.platform}</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
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

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.help}</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
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

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.categories}</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
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

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>support@fubao.ltd</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>+852 XXXX XXXX</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>香港九龍XXX大廈XX樓</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator />

        {/* Bottom */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-sm text-muted-foreground text-center md:text-left">
            {t.footer.copyright}
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {t.footer.features.certified}
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {t.footer.features.escrow}
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              {t.footer.features.shipping}
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <Icon className="w-4 h-4" />
                  </a>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Legal Links - Mobile */}
        <div className="pb-6 md:hidden flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          {footerLinks.legal.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
