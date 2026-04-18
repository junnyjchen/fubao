/**
 * @fileoverview 愿望清单功能
 * @description 提供愿望清单管理、分享、导入导出功能
 * @module components/wishlist/Wishlist
 */

'use client';

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Share2, Download, Upload, Trash2, Plus, Check, Copy, Link2, Mail, ShoppingCart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/**
 * 愿望清单项
 */
interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  addedAt: string;
  priceAlert?: boolean;
  alertPrice?: number;
}

/**
 * 愿望清单上下文
 */
interface WishlistContextValue {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: number) => void;
  updateItem: (id: number, updates: Partial<WishlistItem>) => void;
  clearAll: () => void;
  isInWishlist: (productId: number) => boolean;
  getShareCode: () => string;
  importFromCode: (code: string) => Promise<boolean>;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/**
 * 愿望清单提供者
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // 从 localStorage 恢复
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // 忽略错误
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(items));
    } catch {
      // 忽略错误
    }
  }, [items]);

  const addItem = useCallback((item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    const newItem: WishlistItem = {
      ...item,
      id: Date.now(),
      addedAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
    toast.success('已添加到愿望清单');
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('已从愿望清单移除');
  }, []);

  const updateItem = useCallback((id: number, updates: Partial<WishlistItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    toast.success('愿望清单已清空');
  }, []);

  const isInWishlist = useCallback((productId: number) => {
    return items.some(item => item.productId === productId);
  }, [items]);

  // 生成分享码
  const getShareCode = useCallback(() => {
    try {
      const data = items.map(item => ({
        p: item.productId,
        n: item.name,
        i: item.image,
        r: item.price,
        o: item.originalPrice,
      }));
      const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
      return encoded;
    } catch {
      return '';
    }
  }, [items]);

  // 从分享码导入
  const importFromCode = useCallback(async (code: string): Promise<boolean> => {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(code)));
      if (!Array.isArray(decoded)) return false;

      const importedItems: WishlistItem[] = decoded.map((item: any) => ({
        id: Date.now() + Math.random(),
        productId: item.p,
        name: item.n,
        image: item.i,
        price: item.r,
        originalPrice: item.o,
        addedAt: new Date().toISOString(),
      }));

      setItems(prev => {
        const existingIds = new Set(prev.map(i => i.productId));
        const newItems = importedItems.filter(i => !existingIds.has(i.productId));
        return [...prev, ...newItems];
      });

      toast.success(`成功导入 ${importedItems.length} 件商品`);
      return true;
    } catch {
      toast.error('分享码无效');
      return false;
    }
  }, []);

  return (
    <WishlistContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateItem,
      clearAll,
      isInWishlist,
      getShareCode,
      importFromCode,
      itemCount: items.length,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

/**
 * 使用愿望清单上下文
 */
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}

/**
 * 愿望清单按钮
 */
interface WishlistButtonProps {
  productId: number;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function WishlistButton({
  productId,
  name,
  image,
  price,
  originalPrice,
  size = 'md',
  showLabel = false,
  className,
}: WishlistButtonProps) {
  const { isInWishlist, addItem, removeItem, items } = useWishlist();
  const isInList = isInWishlist(productId);
  const item = items.find(i => i.productId === productId);

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  // Map 'md' to undefined (default), keep 'sm' and 'lg' as-is
  const buttonSize = size === 'md' ? undefined : size;

  const handleClick = () => {
    if (isInList) {
      if (item) removeItem(item.id);
    } else {
      addItem({ productId, name, image, price, originalPrice });
    }
  };

  return (
    <Button
      variant={isInList ? 'default' : 'outline'}
      size={buttonSize}
      onClick={handleClick}
      className={cn(
        'gap-1.5 transition-all',
        isInList && 'bg-pink-500 hover:bg-pink-600 border-pink-500',
        sizeClasses[size],
        className
      )}
    >
      <Heart
        className={cn('w-4 h-4', isInList && 'fill-current')}
      />
      {showLabel && (isInList ? '已收藏' : '收藏')}
    </Button>
  );
}

/**
 * 分享对话框
 */
interface ShareWishlistDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ShareWishlistDialog({ open, onClose }: ShareWishlistDialogProps) {
  const { getShareCode, items } = useWishlist();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const shareCode = getShareCode();
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/wishlist/import?code=${shareCode}`
    : '';

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(shareCode);
    setCopied(true);
    toast.success('分享码已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('分享链接已复制');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('我在符寶網的愿望清单');
    const body = encodeURIComponent(`来看看我的愿望清单（${items.length}件商品）：\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          分享愿望清单
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          共 {items.length} 件商品
        </p>

        {/* 分享链接 */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">分享链接</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 h-10 px-3 rounded-md border bg-muted text-sm"
              />
              <Button onClick={handleCopyUrl} size="sm">
                <Copy className="w-4 h-4 mr-1" />
                复制
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">分享码</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareCode}
                readOnly
                className="flex-1 h-10 px-3 rounded-md border bg-muted text-sm font-mono"
              />
              <Button onClick={handleCopyCode} size="sm">
                <Copy className="w-4 h-4 mr-1" />
                {copied ? '已复制' : '复制'}
              </Button>
            </div>
          </div>
        </div>

        {/* 分享到社交媒体 */}
        <div className="mt-6">
          <label className="text-sm font-medium mb-2 block">分享到</label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEmailShare}>
              <Mail className="w-4 h-4 mr-1" />
              邮件
            </Button>
          </div>
        </div>

        <Button variant="ghost" className="mt-4 w-full" onClick={onClose}>
          关闭
        </Button>
      </div>
    </div>
  );
}

/**
 * 导入愿望清单对话框
 */
interface ImportWishlistDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (code: string) => Promise<void>;
}

export function ImportWishlistDialog({ open, onClose, onImport }: ImportWishlistDialogProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleImport = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      await onImport(code);
      setCode('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          导入愿望清单
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          输入分享码或粘贴分享链接导入愿望清单
        </p>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="粘贴分享码或分享链接..."
          className="w-full h-24 px-3 py-2 rounded-md border bg-background resize-none text-sm"
        />

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button className="flex-1" onClick={handleImport} disabled={!code.trim() || loading}>
            {loading ? '导入中...' : '导入'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * 愿望清单页面
 */
interface WishlistPageProps {
  className?: string;
}

export function WishlistPage({ className }: WishlistPageProps) {
  const { items, removeItem, updateItem, clearAll, getShareCode } = useWishlist();
  const [showShare, setShowShare] = useState(false);
  const [showImport, setShowImport] = useState(false);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">愿望清单是空的</h3>
        <p className="text-muted-foreground mb-4">快去收藏喜欢的商品吧</p>
        <Button asChild>
          <a href="/shop">去选购</a>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">我的愿望清单</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-1" />
            导入
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowShare(true)}>
            <Share2 className="w-4 h-4 mr-1" />
            分享
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 className="w-4 h-4 mr-1" />
            清空
          </Button>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            {/* 图片 */}
            {item.image && (
              <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}

            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium line-clamp-1">{item.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-primary">¥{item.price}</span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ¥{item.originalPrice}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                添加于 {new Date(item.addedAt).toLocaleDateString('zh-CN')}
              </p>
            </div>

            {/* 操作 */}
            <div className="flex flex-col gap-2">
              <Button size="sm">
                <ShoppingCart className="w-4 h-4 mr-1" />
                加入购物车
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 分享对话框 */}
      <ShareWishlistDialog open={showShare} onClose={() => setShowShare(false)} />
    </div>
  );
}

/**
 * 价格提醒设置
 */
export function PriceAlertBadge({ item, onUpdate }: { item: WishlistItem; onUpdate: (updates: Partial<WishlistItem>) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [alertPrice, setAlertPrice] = useState(item.alertPrice || Math.floor(item.price * 0.9));

  if (!item.priceAlert && !showForm) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
        <Bell className="w-4 h-4 mr-1" />
        价格提醒
      </Button>
    );
  }

  if (showForm) {
    return (
      <div className="flex items-center gap-2">
      <input
        type="number"
        value={alertPrice}
        onChange={(e) => setAlertPrice(Number(e.target.value))}
        className="w-20 h-8 px-2 text-sm border rounded"
        placeholder="期望价"
      />
      <Button
        size="sm"
        variant="default"
        onClick={() => {
          onUpdate({ priceAlert: true, alertPrice });
          setShowForm(false);
          toast.success('价格提醒已设置');
        }}
      >
        设置
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          if (item.priceAlert) {
            onUpdate({ priceAlert: false });
          }
          setShowForm(false);
        }}
      >
        取消
      </Button>
    </div>
  );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <Bell className="w-3 h-3" />
      ¥{item.alertPrice} 以下提醒
    </Badge>
  );
}
