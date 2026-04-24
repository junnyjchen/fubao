/**
 * @fileoverview Open Graph 元标签组件
 * @description 提供社交分享元标签支持
 * @module components/seo/OpenGraph
 */

import { Metadata } from 'next';

interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

interface OpenGraphAudio {
  url: string;
  type?: string;
}

interface OpenGraphVideo {
  url: string;
  width?: number;
  height?: number;
  type?: string;
}

interface OpenGraphMetadata {
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** URL */
  url?: string;
  /** 网站名称 */
  siteName?: string;
  /** 图片 */
  images?: OpenGraphImage[];
  /** 音频 */
  audio?: OpenGraphAudio[];
  /** 视频 */
  videos?: OpenGraphVideo[];
  /** 默认图片 */
  defaultImage?: string;
  /** 地区 */
  locale?: string;
  /** 地区变体 */
  localeAlternate?: string[];
  /** 类型 */
  type?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';
  /** 文章作者 */
  authors?: string[];
  /** 文章出版时间 */
  publishedTime?: string;
  /** 文章修改时间 */
  modifiedTime?: string;
  /** 文章过期时间 */
  expirationTime?: string;
  /** 分类 */
  section?: string;
  /** 标签 */
  tags?: string[];
  /** 书籍作者 */
  bookAuthors?: string[];
  /** 书籍 ISBN */
  isbn?: string;
  /** 书籍发行日期 */
  releaseDate?: string;
  /** 音乐歌曲时长（秒） */
  duration?: number;
  /** 音乐专辑 */
  album?: string;
  /** 音乐曲风 */
  genre?: string | string[];
  /** 个人资料名 */
  profileFirstName?: string;
  /** 个人资料姓 */
  profileLastName?: string;
  /** 个人资料用户名 */
  profileUsername?: string;
  /** 个人资料性别 */
  profileGender?: 'male' | 'female';
  /** 视频上映日期 */
  videoReleaseDate?: string;
  /** 视频剧集 */
  videoEpisode?: number;
  /** 视频季 */
  videoSeason?: number;
  /** 视频节目名称 */
  videoSeries?: string;
  /** 视频演员 */
  videoActor?: Array<{ name: string; role?: string }>;
  /** 视频导演 */
  videoDirector?: Array<{ name: string }>;
  /** 视频作家 */
  videoWriter?: Array<{ name: string }>;
  /** 视频电视台 */
  videoTvStation?: string;
  /** 视频导演 */
  videoDuration?: number;
}

/**
 * Twitter Card 元标签
 */
interface TwitterMetadata {
  /** 卡片类型 */
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  /** 站点用户名 */
  site?: string;
  /** 创作者用户名 */
  creator?: string;
  /** 描述 */
  description?: string;
  /** 标题 */
  title?: string;
  /** 图片 */
  image?: string;
  /** 图片 Alt */
  imageAlt?: string;
  /** 播放器 URL */
  player?: string;
  /** 播放器宽度 */
  playerWidth?: number;
  /** 播放器高度 */
  playerHeight?: number;
  /** 播放器流 URL */
  playerStream?: string;
  /** 应用 iPhone ID */
  appIdIphone?: string;
  /** 应用 iPad ID */
  appIdIpad?: string;
  /** 应用 Google Play ID */
  appIdGoogleplay?: string;
  /** 应用 iPhone 名称 */
  appNameIphone?: string;
  /** 应用 iPad 名称 */
  appNameIpad?: string;
  /** 应用 Google Play 名称 */
  appNameGoogleplay?: string;
  /** 应用 iPhone URL */
  appUrlIphone?: string;
  /** 应用 iPad URL */
  appUrlIpad?: string;
  /** 应用 Google Play URL */
  appUrlGoogleplay?: string;
}

/**
 * 社交分享配置
 */
interface SocialShareConfig {
  /** 平台名称 */
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram' | 'line';
  /** 分享 URL */
  url: string;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 图片 */
  image?: string;
  /** 应用 ID */
  appId?: string;
}

/**
 * 生成 Open Graph 动态元数据
 */
export function generateOpenGraphMetadata(config: OpenGraphMetadata): Metadata {
  const ogMetadata: Record<string, string | undefined> = {
    'og:type': config.type,
    'og:title': config.title,
    'og:description': config.description,
    'og:url': config.url,
    'og:site_name': config.siteName,
    'og:locale': config.locale,
  };

  // 添加图片
  if (config.images && config.images.length > 0) {
    config.images.forEach((image, index) => {
      ogMetadata[`og:image`] = image.url;
      if (image.width) ogMetadata['og:image:width'] = image.width.toString();
      if (image.height) ogMetadata['og:image:height'] = image.height.toString();
      if (image.alt) ogMetadata['og:image:alt'] = image.alt;
      if (image.type) ogMetadata['og:image:type'] = image.type;
    });
  } else if (config.defaultImage) {
    ogMetadata['og:image'] = config.defaultImage;
  }

  // 添加视频
  if (config.videos && config.videos.length > 0) {
    const video = config.videos[0];
    ogMetadata['og:video'] = video.url;
    if (video.width) ogMetadata['og:video:width'] = video.width.toString();
    if (video.height) ogMetadata['og:video:height'] = video.height.toString();
    if (video.type) ogMetadata['og:video:type'] = video.type;
  }

  // 添加音频
  if (config.audio && config.audio.length > 0) {
    const audio = config.audio[0];
    ogMetadata['og:audio'] = audio.url;
    if (audio.type) ogMetadata['og:audio:type'] = audio.type;
  }

  // 添加文章特定元数据
  if (config.type === 'article') {
    if (config.authors) ogMetadata['article:author'] = config.authors.join(',');
    if (config.publishedTime) ogMetadata['article:published_time'] = config.publishedTime;
    if (config.modifiedTime) ogMetadata['article:modified_time'] = config.modifiedTime;
    if (config.expirationTime) ogMetadata['article:expiration_time'] = config.expirationTime;
    if (config.section) ogMetadata['article:section'] = config.section;
    if (config.tags) {
      config.tags.forEach((tag, index) => {
        ogMetadata[`article:tag:${index}`] = tag;
      });
    }
  }

  // 转换格式以适配 Next.js Metadata
  const other: Record<string, string | undefined> = {};
  Object.entries(ogMetadata).forEach(([key, value]) => {
    if (value) {
      other[key] = value;
    }
  });

  return {
    title: config.title,
    description: config.description,
    openGraph: other,
  };
}

/**
 * 生成 Twitter Card 动态元数据
 */
export function generateTwitterMetadata(config: TwitterMetadata): Metadata {
  const twitter: Record<string, string | undefined> = {};

  if (config.card) twitter['twitter:card'] = config.card;
  if (config.site) twitter['twitter:site'] = config.site;
  if (config.creator) twitter['twitter:creator'] = config.creator;
  if (config.description) twitter['twitter:description'] = config.description;
  if (config.title) twitter['twitter:title'] = config.title;
  if (config.image) twitter['twitter:image'] = config.image;
  if (config.imageAlt) twitter['twitter:image:alt'] = config.imageAlt;
  if (config.player) twitter['twitter:player'] = config.player;
  if (config.playerWidth) twitter['twitter:player:width'] = config.playerWidth.toString();
  if (config.playerHeight) twitter['twitter:player:height'] = config.playerHeight.toString();
  if (config.playerStream) twitter['twitter:player:stream'] = config.playerStream;

  return { twitter };
}

/**
 * 生成完整社交元数据
 */
export function generateSocialMetadata(config: {
  openGraph: OpenGraphMetadata;
  twitter?: TwitterMetadata;
  canonical?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
    googleBot?: {
      index?: boolean;
      follow?: boolean;
      'max-video-preview'?: number | string;
      'max-image-preview'?: 'none' | 'large' | 'standard';
      'max-snippet'?: number;
    };
  };
}): Metadata {
  const metadata: Metadata = {
    title: config.openGraph.title,
    description: config.openGraph.description,
    alternates: config.canonical ? { canonical: config.canonical } : undefined,
    robots: config.robots,
  };

  // 添加 Open Graph
  const og: Record<string, string | undefined> = {
    'og:type': config.openGraph.type,
    'og:title': config.openGraph.title,
    'og:description': config.openGraph.description,
    'og:url': config.openGraph.url,
    'og:site_name': config.openGraph.siteName,
    'og:locale': config.openGraph.locale,
  };

  // 图片
  if (config.openGraph.images && config.openGraph.images.length > 0) {
    const img = config.openGraph.images[0];
    og['og:image'] = img.url;
    if (img.width) og['og:image:width'] = img.width.toString();
    if (img.height) og['og:image:height'] = img.height.toString();
    if (img.alt) og['og:image:alt'] = img.alt;
  } else if (config.openGraph.defaultImage) {
    og['og:image'] = config.openGraph.defaultImage;
  }

  metadata.openGraph = og;

  // 添加 Twitter
  if (config.twitter) {
    metadata.twitter = config.twitter;
  }

  return metadata;
}

/**
 * 分享 URL 生成器
 */
export function generateShareUrl(config: SocialShareConfig): string {
  const encodedUrl = encodeURIComponent(config.url);
  const encodedTitle = config.title ? encodeURIComponent(config.title) : '';
  const encodedDescription = config.description ? encodeURIComponent(config.description) : '';
  const encodedImage = config.image ? encodeURIComponent(config.image) : '';

  switch (config.platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}${config.appId ? `&app_id=${config.appId}` : ''}`;
    
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
    
    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    
    case 'line':
      return `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedTitle}`;
    
    default:
      return config.url;
  }
}

/**
 * 分享按钮组件属性
 */
interface ShareButtonProps {
  /** 分享 URL */
  url: string;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 图片 */
  image?: string;
}

/**
 * 获取所有分享链接
 */
export function getShareLinks(config: ShareButtonProps) {
  return {
    facebook: generateShareUrl({ ...config, platform: 'facebook' }),
    twitter: generateShareUrl({ ...config, platform: 'twitter' }),
    linkedin: generateShareUrl({ ...config, platform: 'linkedin' }),
    whatsapp: generateShareUrl({ ...config, platform: 'whatsapp' }),
    telegram: generateShareUrl({ ...config, platform: 'telegram' }),
    line: generateShareUrl({ ...config, platform: 'line' }),
  };
}

/**
 * 默认 Open Graph 图片配置
 */
export const DEFAULT_OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: '符寶網 - 全球玄門文化科普交易平台',
};

/**
 * 默认网站配置
 */
export const DEFAULT_SITE_CONFIG = {
  name: '符寶網',
  description: '全球玄門文化科普交易平台，提供符箓、法器等玄門文化产品的交易与科普服务',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fubao.example.com',
  locale: 'zh_TW',
  defaultImage: DEFAULT_OG_IMAGE.url,
};
