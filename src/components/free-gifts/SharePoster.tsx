/**
 * @fileoverview 分享海报生成组件
 * @description 生成商品分享海报
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Image as ImageIcon,
  Download,
  Share2,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface SharePosterProps {
  gift: {
    id: number;
    name: string;
    description: string;
    original_price: string;
    shipping_fee: string;
    image?: string | null;
    merchant?: {
      name: string;
      address: string;
    };
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function SharePoster({
  gift,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: SharePosterProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (open && !posterUrl) {
      generatePoster();
    }
  }, [open]);

  const generatePoster = async () => {
    setGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置画布尺寸
      const width = 375;
      const height = 600;
      canvas.width = width;
      canvas.height = height;

      // 背景
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#fff5f5');
      gradient.addColorStop(1, '#fff7ed');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 顶部装饰
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, 120);
      ctx.lineTo(0, 80);
      ctx.closePath();
      ctx.fill();

      // 标题
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('免費領好禮', width / 2, 50);

      // 副标题
      ctx.font = '14px sans-serif';
      ctx.fillText('精選好物 · 免費領取', width / 2, 75);

      // 商品卡片背景
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 20, 100, width - 40, 180, 12);
      ctx.fill();
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10;

      // 商品图片区域
      ctx.fillStyle = '#fee2e2';
      roundRect(ctx, 35, 115, 140, 150, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 商品图标
      ctx.fillStyle = '#f87171';
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎁', 105, 200);

      // 商品名称
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      const name = gift.name.length > 10 ? gift.name.slice(0, 10) + '...' : gift.name;
      ctx.fillText(name, 190, 140);

      // 原价
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.fillText(`原價 HK$${gift.original_price}`, 190, 165);

      // 免费标签
      ctx.fillStyle = '#ef4444';
      roundRect(ctx, 190, 180, 60, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('免費', 220, 196);

      // 描述
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      const desc = gift.description.length > 30 ? gift.description.slice(0, 30) + '...' : gift.description;
      ctx.fillText(desc, 35, 290);

      // 领取方式
      ctx.fillStyle = '#f3f4f6';
      roundRect(ctx, 20, 320, (width - 50) / 2, 60, 8);
      ctx.fill();
      roundRect(ctx, (width + 10) / 2, 320, (width - 50) / 2, 60, 8);
      ctx.fill();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('郵寄到家', 35, 345);
      ctx.fillText('到店自取', (width + 25) / 2, 345);

      ctx.fillStyle = '#f97316';
      ctx.font = '12px sans-serif';
      ctx.fillText(`運費 HK$${gift.shipping_fee}`, 35, 365);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('完全免費', (width + 25) / 2, 365);

      // 底部信息
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('掃碼立即領取', width / 2, 430);

      // 二维码区域
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, (width - 100) / 2, 450, 100, 100, 8);
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      roundRect(ctx, (width - 100) / 2, 450, 100, 100, 8);
      ctx.stroke();

      // 二维码占位
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect((width - 80) / 2, 460, 80, 80);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px sans-serif';
      ctx.fillText('掃碼領取', width / 2, 505);

      // 转换为图片
      const url = canvas.toDataURL('image/png');
      setPosterUrl(url);
    } catch (error) {
      console.error('生成海报失败:', error);
      toast.error('生成海報失敗');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!posterUrl) return;

    try {
      const link = document.createElement('a');
      link.href = posterUrl;
      link.download = `免費領-${gift.name}.png`;
      link.click();
      toast.success('海報已下載');
    } catch {
      toast.error('下載失敗');
    }
  };

  const handleShare = async () => {
    if (!posterUrl) return;

    try {
      const blob = await (await fetch(posterUrl)).blob();
      const file = new File([blob], 'poster.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `免費領 - ${gift.name}`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  // 绘制圆角矩形
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  return (
    <>
      {trigger && (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              分享海報
            </DialogTitle>
            <DialogDescription>
              生成商品分享海報，分享給好友
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* 隐藏的画布 */}
            <canvas ref={canvasRef} className="hidden" />

            {/* 海报预览 */}
            <div className="bg-muted rounded-lg p-4 mb-4 flex justify-center">
              {generating ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : posterUrl ? (
                <img
                  src={posterUrl}
                  alt="分享海報"
                  className="max-h-[400px] rounded shadow-lg"
                />
              ) : null}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
                disabled={!posterUrl || generating}
              >
                <Download className="w-4 h-4 mr-2" />
                保存圖片
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500"
                onClick={handleShare}
                disabled={!posterUrl || generating}
              >
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * 快速生成海报按钮
 */
export function SharePosterButton({ gift }: { gift: SharePosterProps['gift'] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ImageIcon className="w-4 h-4 mr-1" />
        海報
      </Button>
      <SharePoster gift={gift} open={open} onOpenChange={setOpen} />
    </>
  );
}
