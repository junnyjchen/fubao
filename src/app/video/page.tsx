/**
 * @fileoverview 视频学堂页面
 * @description 玄门文化视频内容展示
 * @module app/video/page
 */

import { Metadata } from 'next';
import { VideoPage } from '@/components/video/VideoPage';

export const metadata: Metadata = {
  title: '視頻學堂 - 符寶網',
  description: '道長說符、法器開箱、宮觀巡禮等玄門文化視頻內容',
};

export default function Video() {
  return <VideoPage />;
}
