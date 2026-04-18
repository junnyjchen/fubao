/**
 * @fileoverview 视频布局
 * @description 视频页面的布局和元数据配置
 * @module app/videos/layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '視頻學堂',
  description: '道家智慧視頻課程，匯集名家講座、儀式教學、經典解讀等優質內容。從入門到進階，開啟修行之門。',
  openGraph: {
    title: '視頻學堂 | 符寶網',
    description: '道家智慧視頻課程，匯集名家講座、儀式教學、經典解讀等優質內容。',
    images: ['/og-videos.png'],
  },
  twitter: {
    title: '視頻學堂 | 符寶網',
    description: '道家智慧視頻課程，開啟修行之門',
  },
};

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
