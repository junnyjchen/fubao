/**
 * @fileoverview 商品分享海报组件
 * @description 生成商品分享海报，支持Canvas绘制和下载
 * @module components/share/SharePoster
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Share2,
  Download,
  Copy,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

/** 海报模板 */
const POSTER_TEMPLATES = [
  { id: 'classic', name: '經典風格', bg: '#ffffff' },
  { id: 'dark', name: '深色風格', bg: '#1a1a2e' },
  { id: 'gradient', name: '漸變風格', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'minimal', name: '極簡風格', bg: '#f5f5f5' },
];

/** 商品信息 - 用于海报展示 */
interface PosterGoods {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  shop_name?: string;
}

/** 组件属性 */
interface SharePosterProps {
  /** 商品信息 */
  goods: PosterGoods;
  /** 用户ID（用于分销链接） */
  userId?: string;
  /** 触发按钮 */
  trigger?: React.ReactNode;
  /** 受控：是否打开 */
  open?: boolean;
  /** 受控：打开状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 类型（保留兼容） */
  type?: 'goods';
}

/**
 * 商品分享海报组件
 */
export function SharePoster({
  goods,
  userId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: SharePosterProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState('classic');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成海报
  const generatePoster = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setLoading(false);
      return;
    }

    const templateConfig = POSTER_TEMPLATES.find((t) => t.id === template)!;
    const isDark = template === 'dark';
    const isGradient = template === 'gradient';

    try {
      // 设置画布尺寸
      canvas.width = 375;
      canvas.height = 600;

      // 绘制背景
      if (isGradient) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = templateConfig.bg;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制商品图片
      try {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = goods.image;
        });

        // 绘制商品图片区域
        const imgSize = 320;
        const imgX = (canvas.width - imgSize) / 2;
        const imgY = 40;
        
        // 圆角矩形裁剪
        ctx.save();
        ctx.beginPath();
        const radius = 12;
        ctx.moveTo(imgX + radius, imgY);
        ctx.lineTo(imgX + imgSize - radius, imgY);
        ctx.quadraticCurveTo(imgX + imgSize, imgY, imgX + imgSize, imgY + radius);
        ctx.lineTo(imgX + imgSize, imgY + imgSize - radius);
        ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - radius, imgY + imgSize);
        ctx.lineTo(imgX + radius, imgY + imgSize);
        ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - radius);
        ctx.lineTo(imgX, imgY + radius);
        ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();
      } catch {
        // 绘制占位符
        ctx.fillStyle = '#e5e5e5';
        ctx.fillRect(27, 40, 320, 320);
      }

      // 绘制商品名称
      const textColor = isDark || isGradient ? '#ffffff' : '#1a1a1a';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 18px system-ui';
      const name = goods.name.length > 20 ? goods.name.slice(0, 20) + '...' : goods.name;
      ctx.fillText(name, 27, 400);

      // 绘制价格
      ctx.fillStyle = '#e53935';
      ctx.font = 'bold 28px system-ui';
      ctx.fillText(`HK$${goods.price.toFixed(2)}`, 27, 440);

      // 绘制商家信息
      if (goods.shop_name) {
        ctx.fillStyle = isDark ? '#cccccc' : '#333333';
        ctx.font = '12px system-ui';
        ctx.fillText(goods.shop_name, 27, 470);
      }

      // 绘制品牌信息
      ctx.fillStyle = isDark ? '#666666' : '#cccccc';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('符寶網 · 全球玄門文化平台', canvas.width / 2, 550);
      ctx.textAlign = 'left';

      // 绘制二维码提示
      ctx.fillStyle = isDark ? '#888888' : '#999999';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('掃碼查看商品詳情', canvas.width / 2, 570);
      ctx.textAlign = 'left';

      toast.success('海報已生成');
    } catch (error) {
      console.error('生成海报失败:', error);
      toast.error('生成失敗');
    } finally {
      setLoading(false);
    }
  }, [goods, template]);

  // 对话框打开时自动生成海报
  useEffect(() => {
    if (open) {
      generatePoster();
    }
  }, [open, generatePoster]);

  /**
   * 下载海报
   */
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `符寶網_${goods.name.slice(0, 10)}_海報.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('已保存到本地');
  };

  /**
   * 复制链接
   */
  const handleCopyLink = () => {
    const url = `${window.location.origin}/shop/${goods.id}${userId ? `?ref=${userId}` : ''}`;
    navigator.clipboard.writeText(url);
    toast.success('鏈接已複製');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>分享商品</DialogTitle>
        </DialogHeader>

        {/* 模板选择 */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">選擇風格</label>
          <Select value={template} onValueChange={(v) => { setTemplate(v); generatePoster(); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSTER_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 画布 */}
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            className="border rounded-lg shadow-sm max-w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={generatePoster}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            重新生成
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>

        {/* 其他分享方式 */}
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" className="flex-1" onClick={handleCopyLink}>
            <Copy className="w-4 h-4 mr-2" />
            複製鏈接
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
