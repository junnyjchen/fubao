/**
 * @fileoverview 视频播放详情页
 * @description 视频播放页面
 * @module app/video/[id]/page
 */

import { Metadata } from 'next';
import { VideoDetailPage } from '@/components/video/VideoDetailPage';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: '視頻播放 - 符寶網',
  description: '觀看玄門文化視頻內容',
};

export default async function VideoDetailRoute({ params }: Props) {
  const { id } = await params;
  return <VideoDetailPage videoId={id} />;
}
