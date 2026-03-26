'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n, languages } from '@/lib/i18n';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { NotificationBell } from '@/components/notification/NotificationBell';
import { 
  Search, 
  Menu, 
  X, 
  User, 
  Globe,
  ShoppingCart,
  Heart,
  Package,
  Settings,
  LogOut,
  Sparkles,
  Loader2,
  Camera,
  TrendingUp,
  Ticket,
  Bell,
  Crown,
} from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { lang, setLang, t } = useI18n();
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [cartCount] = useState(0);

  const navItems = [
    { href: '/', label: t.nav.home },
    { href: '/wiki', label: t.nav.baike || '玄門百科' },
    { href: '/shop', label: t.nav.shop },
    { href: '/video', label: t.nav.video || '視頻學堂' },
    { href: '/shares', label: '如願', icon: Camera, highlight: true },
    { href: '/points-mall', label: '積分商城', icon: Ticket },
    { href: '/vip', label: 'VIP會員', icon: Crown },
    { href: '/news', label: t.nav.news },
    { href: '/verify', label: '證書驗證' },
    { href: '/ai-assistant', label: 'AI助手', icon: Sparkles },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.email?.split('@')[0] || '用戶';
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                符
              </div>
              <span className="text-xl font-semibold tracking-tight hidden sm:block">
                符寶網
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    item.highlight 
                      ? 'text-amber-600 hover:text-amber-700' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-xs">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t.common.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 h-9 bg-muted/50"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">切換語言</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((language) => (
                    <DropdownMenuItem
                      key={language.code}
                      onClick={() => setLang(language.code)}
                      className={lang === language.code ? 'bg-muted' : ''}
                    >
                      {language.nativeName}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Favorites */}
              <Link href="/user/favorites" className="hidden sm:block">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">收藏</span>
                </Button>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </Badge>
                  )}
                  <span className="sr-only">{t.nav.cart}</span>
                </Button>
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              {loading ? (
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {getUserDisplayName()}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/user" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        我的訂單
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/user/favorites" className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        我的收藏
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/user/notifications" className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        消息通知
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/user/coupons" className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        我的優惠券
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/user/addresses" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        收貨地址
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/distribution" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        分銷中心
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/user/settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        賬號設置
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center gap-2 text-muted-foreground cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      退出登錄
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAuthDialog(true)}
                >
                  <User className="h-4 w-4 mr-1" />
                  登錄
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border/40 py-4">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t.common.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 h-10 bg-muted/50"
                />
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-medium transition-colors py-2 px-2 rounded-lg hover:bg-muted flex items-center gap-2 ${
                      item.highlight 
                        ? 'text-amber-600 hover:text-amber-700' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Quick Links */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingCart className="w-4 w-4 mr-2" />
                    購物車
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/user/favorites" onClick={() => setIsMenuOpen(false)}>
                    <Heart className="w-4 h-4 mr-2" />
                    收藏
                  </Link>
                </Button>
              </div>

              {/* Mobile Language Switcher */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                {languages.map((language) => (
                  <Button
                    key={language.code}
                    variant={lang === language.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLang(language.code)}
                    className="flex-1"
                  >
                    {language.nativeName}
                  </Button>
                ))}
              </div>

              {/* Mobile Auth */}
              {!user && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setShowAuthDialog(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    登錄
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setShowAuthDialog(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    註冊
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </>
  );
}
