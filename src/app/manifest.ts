/**
 * @fileoverview PWA Manifest配置
 * @description Progressive Web App清单文件
 * @module app/manifest/route
 */

import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT
    ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT}`
    : 'https://fubao.ltd';

  return {
    name: '符寶網 - 全球玄門文化科普交易平台',
    short_name: '符寶網',
    description: '全球玄門文化科普交易平台，提供符箓法器交易與科普服務',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1A5F3C',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'zh-TW',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-72x72-maskable.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-96x96-maskable.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-128x128-maskable.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-144x144-maskable.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-152x152-maskable.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384-maskable.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'education', 'lifestyle'],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: '首頁',
      },
      {
        src: '/screenshots/mobile.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: '移動端',
      },
    ],
    shortcuts: [
      {
        name: '商品中心',
        short_name: '商品',
        description: '瀏覽符箓法器商品',
        url: '/shop',
        icons: [{ src: '/icons/shop.png', sizes: '96x96' }],
      },
      {
        name: '玄門百科',
        short_name: '百科',
        description: '了解玄門文化知識',
        url: '/wiki',
        icons: [{ src: '/icons/wiki.png', sizes: '96x96' }],
      },
      {
        name: 'AI助手',
        short_name: 'AI',
        description: '智能問答助手',
        url: '/ai-assistant',
        icons: [{ src: '/icons/ai.png', sizes: '96x96' }],
      },
      {
        name: '用戶中心',
        short_name: '我的',
        description: '個人中心',
        url: '/user',
        icons: [{ src: '/icons/user.png', sizes: '96x96' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
