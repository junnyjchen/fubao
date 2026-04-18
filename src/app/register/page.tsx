'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Gift,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/** OAuth提供商 */
interface OAuthProvider {
  provider: string;
  display_name: string;
  icon_url: string | null;
}

/** 提供商图标和样式 */
const PROVIDER_ICONS: Record<string, { icon: React.ReactNode; bgColor: string }> = {
  google: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    bgColor: 'bg-white hover:bg-gray-50 border border-gray-200',
  },
  facebook: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    bgColor: 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
  },
  wechat: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1 .176-.553C23.087 18.615 24 16.893 24 14.929c0-3.367-3.056-6.01-7.062-6.071zM13.567 13.02c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.969-.983zm4.844 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.969-.983z"/>
      </svg>
    ),
    bgColor: 'bg-[#07C160] hover:bg-[#06AD56] text-white',
  },
  x: {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    bgColor: 'bg-black hover:bg-gray-800 text-white',
  },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useI18n();
  
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: 填写信息, 2: 验证邮箱, 3: 注册成功
  const [oauthProviders, setOauthProviders] = useState<OAuthProvider[]>([]);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // 从URL获取邀请码
  useEffect(() => {
    setMounted(true);
    
    const ref = searchParams.get('ref');
    if (ref) {
      setInviteCode(ref);
    }
    
    // 加载OAuth提供商
    loadOAuthProviders();
  }, [searchParams]);

  const loadOAuthProviders = async () => {
    try {
      const res = await fetch('/api/oauth/providers');
      const data = await res.json();
      if (data.providers) {
        setOauthProviders(data.providers);
      }
    } catch (err) {
      console.error('加载OAuth提供商失败:', err);
    }
  };

  const handleOAuthRegister = async (provider: string) => {
    setOauthLoading(provider);
    try {
      const res = await fetch(`/api/oauth/authorize?provider=${provider}&redirect=${encodeURIComponent('/register')}&action=register`);
      const data = await res.json();

      if (data.authorizeUrl) {
        window.location.href = data.authorizeUrl;
      } else {
        setError(data.error || t.register.getAuthFailed);
        setOauthLoading(null);
      }
    } catch (err) {
      console.error('OAuth注册失败:', err);
      setError(t.register.registerFailed);
      setOauthLoading(null);
    }
  };

  const validateForm = () => {
    if (!nickname.trim()) {
      setError(t.register.nicknameRequired);
      return false;
    }
    if (!email.trim()) {
      setError(t.register.emailRequired);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.register.emailInvalid);
      return false;
    }
    if (password.length < 6) {
      setError(t.register.passwordMinLength);
      return false;
    }
    if (password !== confirmPassword) {
      setError(t.register.passwordMismatch);
      return false;
    }
    if (!agreeTerms) {
      setError(t.register.agreeRequired);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          email,
          phone: phone || undefined,
          password,
          invite_code: inviteCode || undefined,
        }),
      });

      const data = await res.json();

      if (data.user || data.message) {
        // 注册成功
        setStep(3);
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || t.register.registerFailed);
      }
    } catch (err) {
      console.error('注册失败:', err);
      setError(t.register.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  // RTL 辅助变量
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;
  const IconPosition = isRTL ? 'right-3' : 'left-3';
  const IconPositionReverse = isRTL ? 'left-3' : 'right-3';
  const InputPadding = isRTL ? 'pr-10' : 'pl-10';
  const InputPaddingReverse = isRTL ? 'pl-10 pr-10' : 'pl-10 pr-10';

  // 动画样式
  const animationClass = mounted ? 'animate-in fade-in-0 slide-in-from-bottom-4 duration-500' : 'opacity-0';

  // 注册成功页面
  if (step === 3) {
    return (
      <div 
        className="min-h-screen bg-muted/20 flex items-center justify-center py-12 px-4"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Card className={`w-full max-w-md text-center ${animationClass}`}>
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">{t.register.registerSuccess}</h2>
            <p className="text-muted-foreground mb-6">
              {t.register.registerSuccessDesc}
            </p>
            <Button asChild>
              <Link href="/login">{t.register.loginNowButton}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-muted/20 flex items-center justify-center py-12 px-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={`w-full max-w-md ${animationClass}`}>
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <BackIcon className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            {t.register.backToHome}
          </Link>
        </Button>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground font-bold text-xl">
              符
            </div>
            <span className="text-2xl font-semibold">符寶網</span>
          </Link>
          <p className="text-muted-foreground mt-2">{t.register.platformSlogan}</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t.register.title}</CardTitle>
            <CardDescription>
              {t.register.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Message */}
            {error && (
              <div 
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4 animate-in fade-in-0 slide-in-from-top-2 duration-200"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">
                  {t.register.nickname} <span className="text-destructive">{t.common.required}</span>
                </Label>
                <div className="relative">
                  <User className={`absolute ${IconPosition} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t.register.nicknamePlaceholder}
                    className={InputPadding}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t.register.email} <span className="text-destructive">{t.common.required}</span>
                </Label>
                <div className="relative">
                  <Mail className={`absolute ${IconPosition} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.register.emailPlaceholder}
                    className={InputPadding}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t.register.phone}</Label>
                <div className="flex gap-2">
                  <select 
                    className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                    aria-label="Country code"
                  >
                    <option value="+852">+852</option>
                    <option value="+86">+86</option>
                    <option value="+886">+886</option>
                  </select>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.register.phonePlaceholder}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {t.register.password} <span className="text-destructive">{t.common.required}</span>
                </Label>
                <div className="relative">
                  <Lock className={`absolute ${IconPosition} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.register.passwordPlaceholder}
                    className={InputPaddingReverse}
                    required
                    aria-required="true"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute ${IconPositionReverse} top-0 h-10 w-10`}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t.register.confirmPassword} <span className="text-destructive">{t.common.required}</span>
                </Label>
                <div className="relative">
                  <Lock className={`absolute ${IconPosition} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.register.confirmPasswordPlaceholder}
                    className={InputPadding}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteCode">{t.register.inviteCode}</Label>
                <div className="relative">
                  <Gift className={`absolute ${IconPosition} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder={t.register.inviteCodePlaceholder}
                    className={`${InputPadding} font-mono uppercase`}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.register.inviteCodeHint}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(v) => setAgreeTerms(v as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                  {t.register.agreeTerms}
                  <Link href="/terms" className="text-primary hover:underline">{t.register.userAgreement}</Link>
                  {' '}{t.register.and}{' '}
                  <Link href="/privacy" className="text-primary hover:underline">{t.register.privacyPolicy}</Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !agreeTerms}>
                {loading ? (
                  <>
                    <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                    {t.register.registering}
                  </>
                ) : (
                  t.register.registerButton
                )}
              </Button>
            </form>

            {/* OAuth Register */}
            {oauthProviders.length > 0 && (
              <>
                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs text-muted-foreground">
                    {t.register.orRegisterWith}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {oauthProviders.map((provider) => {
                    const style = PROVIDER_ICONS[provider.provider] || {
                      icon: <span className="font-bold">{provider.display_name[0]}</span>,
                      bgColor: 'bg-gray-500 hover:bg-gray-600',
                    };

                    return (
                      <Button
                        key={provider.provider}
                        type="button"
                        variant="outline"
                        className={`${style.bgColor} text-white border-0 h-11`}
                        onClick={() => handleOAuthRegister(provider.provider)}
                        disabled={oauthLoading === provider.provider}
                      >
                        {oauthLoading === provider.provider ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span className={`w-5 h-5 flex items-center justify-center ${isRTL ? 'ml-2' : 'mr-2'}`}>
                              {style.icon}
                            </span>
                            {provider.display_name}
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </>
            )}

            <Separator className="my-6" />

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              {t.register.hasAccount}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t.register.loginNow}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
