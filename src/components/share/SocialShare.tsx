/**
 * @fileoverview 社交分享组件
 * @description 支持 Facebook / X (Twitter) / Google (Gmail) / 复制链接 / 系统分享
 * @module components/share/SocialShare
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Share2, Facebook, Link2, Check, Mail } from 'lucide-react';
import { toast } from 'sonner';

/** 组件属性 */
interface SocialShareProps {
  /** 分享标题 */
  title: string;
  /** 分享描述 */
  description?: string;
  /** 分享 URL（默认当前页面） */
  url?: string;
  /** 触发按钮自定义 */
  trigger?: React.ReactNode;
  /** 按钮大小 */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** 按钮样式 */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

/** X (Twitter) SVG 图标 */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Google/Gmail SVG 图标 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/**
 * 社交分享组件
 */
export function SocialShare({
  title,
  description = '',
  url,
  trigger,
  size = 'sm',
  variant = 'outline',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  /** 复制链接 */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('連結已複製');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('複製失敗，請手動複製');
    }
  }, [shareUrl]);

  /** Facebook 分享 */
  const handleFacebook = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      'facebook-share-dialog',
      'width=600,height=400'
    );
  }, [encodedUrl]);

  /** X (Twitter) 分享 */
  const handleX = useCallback(() => {
    const text = description ? `${encodedTitle}%20-%20${encodedDesc}` : encodedTitle;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
      'x-share-dialog',
      'width=600,height=400'
    );
  }, [encodedUrl, encodedTitle, encodedDesc]);

  /** Google (Gmail) 分享 */
  const handleGoogle = useCallback(() => {
    const subject = encodedTitle;
    const body = encodeURIComponent(`${title}\n\n${description}\n\n${shareUrl}`);
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
      'gmail-share-dialog',
      'width=600,height=500'
    );
  }, [encodedTitle, title, description, shareUrl]);

  /** 系统原生分享 */
  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch {
        // 用户取消分享
      }
    }
  }, [title, description, shareUrl]);

  const shareButtons = (
    <div className="flex flex-col gap-1 p-1 min-w-[180px]">
      {/* Facebook */}
      <button
        onClick={handleFacebook}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
      >
        <Facebook className="w-4 h-4 shrink-0 text-[#1877F2]" />
        <span>Facebook</span>
      </button>

      {/* X (Twitter) */}
      <button
        onClick={handleX}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
      >
        <XIcon className="w-4 h-4 shrink-0" />
        <span>X (Twitter)</span>
      </button>

      {/* Google (Gmail) */}
      <button
        onClick={handleGoogle}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
      >
        <GoogleIcon className="w-4 h-4 shrink-0 text-[#EA4335]" />
        <span>Gmail</span>
      </button>

      {/* 复制链接 */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
      >
        {copied ? (
          <Check className="w-4 h-4 shrink-0 text-green-500" />
        ) : (
          <Link2 className="w-4 h-4 shrink-0" />
        )}
        <span>{copied ? '已複製' : '複製連結'}</span>
      </button>

      {/* 系统原生分享（移动端） */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>更多分享</span>
        </button>
      )}
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant={variant} size={size}>
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-auto p-0 rounded-lg shadow-lg border"
      >
        {shareButtons}
      </PopoverContent>
    </Popover>
  );
}
