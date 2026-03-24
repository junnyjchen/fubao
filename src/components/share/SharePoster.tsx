/**
 * @fileoverview 分享海报组件
 * @description 生成商品分享海报和邀请海报
 * @module components/share/SharePoster
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Share2,
  Copy,
  Download,
  Loader2,
  MessageCircle,
  QrCode,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface SharePosterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'goods' | 'invite';
  goods?: {
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
    shop_name?: string;
  };
  inviteCode?: string;
}

export function SharePoster({
  open,
  onOpenChange,
  type,
  goods,
  inviteCode,
}: SharePosterProps) {
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [posterDataUrl, setPosterDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open) {
      loadShareInfo();
    }
  }, [open]);

  const loadShareInfo = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        ...(type === 'goods' && goods ? { target_id: goods.id } : {}),
      });
      const res = await fetch(`/api/share?${params}`);
      const result = await res.json();
      if (result.success) {
        setShareUrl(result.data.share_url);
      }
    } catch (error) {
      console.error('获取分享信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && open && canvasRef.current) {
      generatePoster();
    }
  }, [loading, open, goods, inviteCode]);

  const generatePoster = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 375;
    const height = 667;
    canvas.width = width;
    canvas.height = height;

    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 顶部装饰
    const gradient = ctx.createLinearGradient(0, 0, width, 120);
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(1, '#d97706');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 120);

    // Logo/标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('符寶網', width / 2, 50);
    ctx.font = '14px system-ui';
    ctx.fillText('全球玄門文化科普交易平台', width / 2, 75);

    if (type === 'goods' && goods) {
      // 商品图片占位
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(20, 140, width - 40, 300);

      // 尝试加载商品图片
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 20, 140, width - 40, 300);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = goods.image;
        });
      } catch (e) {
        // 使用占位
      }

      // 商品名称
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'left';
      const name = goods.name.length > 20 ? goods.name.slice(0, 20) + '...' : goods.name;
      ctx.fillText(name, 20, 480);

      // 价格
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 24px system-ui';
      ctx.fillText(`HK$${goods.price.toFixed(2)}`, 20, 515);

      // 店铺
      if (goods.shop_name) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px system-ui';
        ctx.fillText(goods.shop_name, 20, 540);
      }
    } else {
      // 邀请海报内容
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('邀請好友', width / 2, 200);
      ctx.fillText('共享佣金獎勵', width / 2, 240);

      // 邀请码
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(50, 280, width - 100, 60);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(inviteCode || 'DEMO00', width / 2, 322);

      // 说明
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px system-ui';
      ctx.fillText('掃碼註冊 或 輸入邀請碼', width / 2, 380);
      ctx.fillText('好友購物 您賺佣金', width / 2, 410);
    }

    // 二维码占位区域
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(width / 2 - 60, height - 150, 120, 120);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(width / 2 - 60, height - 150, 120, 120);

    // 二维码提示
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('掃碼查看詳情', width / 2, height - 20);

    const dataUrl = canvas.toDataURL('image/png');
    setPosterDataUrl(dataUrl);
  }, [type, goods, inviteCode]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('鏈接已複製');
  };

  const downloadPoster = () => {
    if (!posterDataUrl) return;
    const link = document.createElement('a');
    link.href = posterDataUrl;
    link.download = type === 'goods' ? `goods-${goods?.id}.png` : 'invite.png';
    link.click();
    toast.success('海報已保存');
  };

  const handleShare = async (channel: string) => {
    // 记录分享行为
    await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        share_type: type,
        target_id: goods?.id,
        channel,
      }),
    });

    toast.success('分享成功');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {type === 'goods' ? '分享商品' : '邀請好友'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* 海报预览 */}
              <div className="relative rounded-lg overflow-hidden border">
                <canvas ref={canvasRef} className="w-full" />
              </div>

              {/* 分享按钮 */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handleShare('wechat')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs">微信</span>
                </button>
                <button
                  onClick={() => handleShare('moments')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">朋</span>
                  </div>
                  <span className="text-xs">朋友圈</span>
                </button>
                <button
                  onClick={copyLink}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs">複製</span>
                </button>
                <button
                  onClick={downloadPoster}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs">保存</span>
                </button>
              </div>

              {/* 链接 */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">分享鏈接</p>
                <p className="text-sm break-all">{shareUrl}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
