import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['*.dev.coze.site'],
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'coze-coding-project.tos.coze.site',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.coze.site',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.tos.coze.site',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  /**
   * API 路由策略：
   * - 所有 /api/* 由 Next.js API Routes 处理（支持 MySQL + Mock DB 双模式）
   * - 不再代理到 PHP-FPM，避免 Nginx 分流配置问题
   * - PHP 后端通过 Nginx 独立路径 /php-api/ 提供（如需要）
   */
};

export default nextConfig;
