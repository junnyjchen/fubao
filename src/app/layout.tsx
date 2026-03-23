import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { I18nProvider } from '@/lib/i18n';

export const metadata: Metadata = {
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
  ],
  authors: [{ name: '符寶網', url: 'https://fubao.ltd' }],
  generator: 'Next.js',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '符寶網 | 全球玄門文化科普交易平台',
    description:
      '科普先行 · 交易放心 · 一物一證。探索符箓法器的奧秘，全球修行者信賴的靈性資產交易平台。',
    url: 'https://fubao.ltd',
    siteName: '符寶網',
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '符寶網 | 全球玄門文化科普交易平台',
    description:
      '科普先行 · 交易放心 · 一物一證',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-TW">
      <body className={`antialiased min-h-screen flex flex-col`}>
        {isDev && <Inspector />}
        <I18nProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
