/**
 * @fileoverview 百科首页
 * @description 玄门文化百科知识展示页面
 * @module app/wiki/page
 */

import { Metadata } from 'next';
import { WikiHomePage } from '@/components/wiki/WikiHomePage';

export const metadata: Metadata = {
  title: '玄門百科 - 符寶網',
  description: '玄門文化百科知識，符籙、法器、道教文化等專業知識介紹',
};

export default function WikiPage() {
  return <WikiHomePage />;
}
