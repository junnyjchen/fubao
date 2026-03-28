import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { FloatingAIButton } from '@/components/ai/FloatingAIButton';
import { MobileNav } from '@/components/MobileNav';
import { Providers } from '@/components/providers/Providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8B4513' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.COZE_PROJECT_DOMAIN_DEFAULT 
      ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT.replace(/^https?:\/\//, '')}`
      : 'https://fubao.ltd'
  ),
  title: {
    default: '符寶網 | 全球玄門文化科普交易平台',
    template: '%s | 符寶網',
  },
  description:
    '符寶網是全球玄門文化科普交易平台，提供符箓、法器等玄門文化產品的交易與科普服務。科普先行、交易放心、一物一證。',
  keywords: [
    '符寶網',
    'fubao.ltd',
    '符箓',
    '法器',
    '玄門',
    '道教',
    '開光',
    '一物一證',
    '道觀',
    '寺廟',
    '玄學',
    'Talismans',
    'Spiritual Items',
    '道家',
    '法事',
    '護身符',
    '鎮宅',
    '祈福',
  ],
  authors: [{ name: '符寶網', url: 'https://fubao.ltd' }],
  creator: '符寶網',
  publisher: '符寶網',
  generator: 'Next.js',
  applicationName: '符寶網',
  referrer: 'origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#8B4513' },
    ],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: '符寶網 | 全球玄門文化科普交易平台',
    description:
      '科普先行 · 交易放心 · 一物一證。探索符箓法器的奧秘，全球修行者信賴的靈性資產交易平台。',
    url: 'https://fubao.ltd',
    siteName: '符寶網',
    locale: 'zh_TW',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '符寶網 - 全球玄門文化科普交易平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '符寶網 | 全球玄門文化科普交易平台',
    description: '科普先行 · 交易放心 · 一物一證',
    images: ['/og-image.png'],
    creator: '@fubaoweb',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://fubao.ltd',
    languages: {
      'zh-TW': 'https://fubao.ltd',
      'zh-CN': 'https://fubao.ltd',
      'en-US': 'https://fubao.ltd/en',
    },
  },
  category: 'ecommerce',
  classification: '玄門文化交易平台',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': '符寶網',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#8B4513',
    'msapplication-tap-highlight': 'no',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 检测是否是管理后台路径
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/merchant') || pathname.startsWith('/user');

  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '符寶網',
              url: 'https://fubao.ltd',
              description: '全球玄門文化科普交易平台',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://fubao.ltd/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: '符寶網',
              url: 'https://fubao.ltd',
              logo: 'https://fubao.ltd/logo.png',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Chinese', 'English'],
              },
            }),
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>
          {!isAdmin && <Header />}
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          {!isAdmin && <Footer />}
          {!isAdmin && <FloatingAIButton />}
          {!isAdmin && <MobileNav />}
        </Providers>
      </body>
    </html>
  );
}
