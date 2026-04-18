/**
 * @fileoverview 分享按钮组件
 * @description 支持复制链接、分享到社交平台
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Share2,
  Link2,
  MessageCircle,
  Copy,
  Check,
  Facebook,
  Twitter,
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function ShareButton({
  url,
  title,
  description,
  variant = 'outline',
  size = 'default',
  showText = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('鏈接已複製');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('複製失敗，請手動複製');
    }
  };

  const handleShare = async (platform: 'wechat' | 'facebook' | 'twitter') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'wechat':
        toast.info('請截圖分享給微信好友');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch {
        // 用户取消分享
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="w-4 h-4" />
          {showText && <span className="ml-2">分享</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? '已複製' : '複製鏈接'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleShare('wechat')}>
          <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
          分享到微信
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="w-4 h-4 mr-2 text-blue-500" />
          分享到 Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="w-4 h-4 mr-2 text-sky-500" />
          分享到 Twitter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 简易复制按钮
 */
export function CopyButton({ 
  text, 
  label = '複製' 
}: { 
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('已複製到剪貼板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('複製失敗');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleCopy}
      className="h-8"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 mr-1 text-green-500" />
          已複製
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1" />
          {label}
        </>
      )}
    </Button>
  );
}

/**
 * 复制领取码组件
 */
export function CopyClaimCode({ claimNo }: { claimNo: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(claimNo);
      setCopied(true);
      toast.success('領取碼已複製');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('複製失敗');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
    >
      <span className="font-mono font-bold text-xl text-primary">{claimNo}</span>
      {copied ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <Copy className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      )}
    </button>
  );
}
