/**
 * @fileoverview PWA Manifest
 * @description Progressive Web App配置
 * @module app/manifest
 */

import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT 
    ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT.replace(/^https?:\/\//, '')}`
    : 'https://fubao.ltd';

  return {
    name: '符寶網 - 玄門文化交易平台',
    short_name: '符寶網',
    description: '全球玄門文化科普交易平台，科普先行、交易放心、一物一證',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#8B4513',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'zh-TW',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'lifestyle', 'education'],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: '符寶網首頁',
      },
      {
        src: '/screenshots/shop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: '商品瀏覽',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: '瀏覽商品',
        short_name: '商品',
        url: '/shop',
      },
      {
        name: '驗證證書',
        short_name: '驗證',
        url: '/verify',
      },
      {
        name: 'AI助手',
        short_name: 'AI',
        url: '/ai-assistant',
      },
    ],
  };
}
