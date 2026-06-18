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
    root: __dirname,
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
   * - 生产环境：/api/* 代理到 PHP-FPM 后端
   * 
   * 前端代码统一 fetch('/api/xxx')，环境切换由此处自动处理。
   */
  async rewrites() {
    if (isProd) {
      return [
        {
          source: '/api/:path*',
          destination: `${phpApiUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
