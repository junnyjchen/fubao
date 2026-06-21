import type { NextConfig } from 'next';

const isProd = process.env.COZE_PROJECT_ENV === 'PROD';
const phpApiUrl = process.env.PHP_API_URL || 'http://127.0.0.1:8080';

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
   * - 开发环境：/api/* 由 Next.js API Routes 处理（无需 PHP）
   * - 生产环境：Nginx 按路由前缀分流（PHP 已实现的走 PHP-FPM，其余走 Next.js）
   * 
   * 前端代码统一 fetch('/api/xxx')，环境切换由 Nginx 自动处理。
   * 不再使用 rewrites 代理，避免与 Nginx 分流策略冲突。
   */
  async rewrites() {
    return [];
  },
};

export default nextConfig;
