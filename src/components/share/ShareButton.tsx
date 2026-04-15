'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { 
  Share2, 
  Copy, 
  Check, 
  Loader2,
  QrCode,
  X,
} from 'lucide-react';

// Share providers
type ShareProvider = 'wechat' | 'weibo' | 'qq' | 'qzone' | 'link';

interface ShareData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

interface ShareButtonProps {
  data: ShareData;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function ShareButton({
  data,
  size = 'md',
  showIcon = true,
  variant = 'outline',
  className,
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className={className}
      >
        {showIcon && <Share2 className="w-4 h-4 mr-1" />}
        分享
      </Button>

      <ShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={data}
      />
    </>
  );
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareData;
}

export function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState<ShareProvider | null>(null);
  const { success, error } = useToast();

  const providers: { id: ShareProvider; name: string; icon: string }[] = [
    { id: 'wechat', name: '微信', icon: 'M224.1,128L224,128l-96.1,0L136,80l87.9,0l0-48L224.1,32l0,96.1l0,0L224.1,128z M144,176c-8.8,0-16,7.2-16,16s7.2,16,16,16s16-7.2,16-16S152.8,176,144,176z M224,288c-8.8,0-16,7.2-16,16s7.2,16,16,16s16-7.2,16-16S232.8,288,224,288z' },
    { id: 'weibo', name: '微博', icon: 'M195.8,179.5c-8.8-1.2-14.2-6.5-17.1-13.4c-0.4,3.8-0.8,7.6-1.2,11.4c-3.2,0.8-6.4,1.2-9.8,1.2c-21.4,0-38.8-17.4-38.8-38.8s17.4-38.8,38.8-38.8c21.4,0,38.8,17.4,38.8,38.8c0,5.6-1.2,10.8-3.2,15.8c4.2-3.8,8.2-8,12-12.4c-3.6-2.2-7.6-4-11.8-5.2c0.2,0.8,0.4,1.6,0.4,2.4c0,6.4-5.2,11.6-11.6,11.6c-6.4,0-11.6-5.2-11.6-11.6c0-6.4,5.2-11.6,11.6-11.6c1.4,0,2.6,0.2,3.8,0.6c12.2,2.6,21.4,13.2,21.4,26c0,2.8-0.4,5.4-1.2,8c2.6-2.4,4.6-5.2,6-8.4c2.8,4.6,4.4,10,4.4,15.8C230,168.4,218.4,179.5,195.8,179.5z M100,152c-13.2,0-24-10.8-24-24s10.8-24,24-24s24,10.8,24,24S113.2,152,100,152z M200,240c-17.6,0-32-14.4-32-32c0-17.6,14.4-32,32-32s32,14.4,32,32C232,225.6,217.6,240,200,240z M232,96c-8.8,0-16-7.2-16-16c0-8.8,7.2-16,16-16s16,7.2,16,16C248,88.8,240.8,96,232,96z' },
    { id: 'qq', name: 'QQ', icon: 'M122,208c13.1,0,24-10.9,24-24s-10.9-24-24-24c-0.5,0-1,0-1.5,0c0,0,0,0,0,0c-3.7,0.1-7.3,0.5-10.8,1.3C76.3,165.2,62.5,181.1,58,200c0.6,2.8,1.7,5.4,3.2,7.8c0.5,0.8,1.2,1.4,2,2c6.6,4.6,14.6,7,23,7C100.5,216.8,110.9,212.4,122,208z M180,168c0-12.7-8.1-23.6-19.5-26.9C158.9,135.4,150.7,132,142,132c-7.3,0-14,3.2-18.6,8.3C102.9,144.4,88,160.7,88,180c0,2.9,0.3,5.7,1,8.5c-6.2,2.8-10.8,8.6-11.5,15.5c7.1,5.7,15.8,9,25.1,9c0.5,0,1-0.1,1.5-0.1c-0.2-1.7-0.1-3.4,0.3-5.1c1.5-0.4,2.9-1,4.2-1.8c0.4,0,0.7,0,1.1,0c17.6,0,32-14.4,32-32V168z M201.9,213.8c-3.5,2.4-7.7,4.2-12.3,5.2c0.3,1.2,0.5,2.4,0.5,3.6c0,8.8-7.2,16-16,16c-2.4,0-4.6-0.5-6.6-1.4c0.4,0.1,0.9,0.1,1.3,0.1c17.6,0,32-14.4,32-32C201.4,213.8,201.9,213.8,201.9,213.8z M236,188c-3.5,0-6.8,0.8-9.7,2.3c-0.7-7.6-4.2-14.6-9.8-19.6c0.1,0.4,0.2,0.8,0.2,1.3c0,12.7-10.3,23-23,23c-0.4,0-0.8,0-1.2-0.1c0.4,2.1,0.9,4.1,1.7,6c4.2-1.5,7.8-4.2,10.5-7.8c1.7-2.3,3.1-4.8,4.1-7.5c7.1,2.8,12.2,9.7,12.5,17.9C228.6,200.2,232,194.5,236,188z' },
    { id: 'qzone', name: 'QQ空间', icon: 'M132,240c-0.3,0-0.6-0.1-0.8-0.3c-0.3-0.2-0.5-0.6-0.5-0.9c0.1-3.3,0.6-6.6,1.5-9.8c0.2-0.6,0.3-1.2,0.3-1.8c0-1.5-0.7-2.9-1.8-3.8c-0.5-0.4-1.1-0.7-1.7-0.8c-3.6-0.7-7.2-1.1-10.9-1.1c-5.3,0-10.6,0.6-15.7,1.7c-0.7,0.2-1.4,0.5-2,0.9c-1.1,0.8-1.8,2-1.9,3.3c-0.1,1.1,0.4,2.1,1.2,2.8c0.7,0.6,1.6,1,2.6,1c1.4,0.1,2.8,0.1,4.2,0.1c1.5,0,2.9,0,4.4-0.1c0.9-0.1,1.7-0.5,2.4-1.1c1-0.8,1.5-2.1,1.5-3.4c0-1.5-0.6-2.8-1.7-3.7c-0.9-0.7-2-1.1-3.2-1.1c-4.3-0.8-8.7-1.2-13.2-1.2c-3.4,0-6.8,0.2-10.1,0.7c-1.7,0.2-3.2,1-4.3,2.2c-1.4,1.5-2.2,3.5-2.1,5.6c0.1,1.7,0.8,3.3,1.8,4.6c0.8,1,1.8,1.8,3,2.2c-5.6,2.5-10.7,5.7-15.1,9.7c-0.6,0.5-1.2,1.2-1.4,2c-0.4,1.3-0.2,2.7,0.6,3.9c1.1,1.5,2.9,2.3,4.7,2.2c9.3-0.4,17.7-3.7,24.1-9.4c4.7,3.3,10.5,5.3,16.7,5.4c7.8,0,15-3.3,20.1-8.9c0.6,0.4,1.2,0.8,1.9,1.1C132.6,239.9,132.3,240,132,240z' },
  ];

  const handleShare = useCallback(async (provider: ShareProvider) => {
    setLoading(provider);
    
    try {
      const shareUrls: Record<ShareProvider, string> = {
        wechat: `https://qrcode.qq.com/parseqr?text=${encodeURIComponent(data.url)}`,
        weibo: `http://service.weibo.com/share/share.php?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title || '')}&pic=${encodeURIComponent(data.image || '')}`,
        qq: `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title || '')}&desc=${encodeURIComponent(data.description || '')}&pics=${encodeURIComponent(data.image || '')}`,
        qzone: `http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title || '')}&desc=${encodeURIComponent(data.description || '')}&pics=${encodeURIComponent(data.image || '')}`,
        link: '',
      };

      if (provider === 'link') {
        await navigator.clipboard.writeText(data.url);
        success('链接已复制');
      } else {
        window.open(shareUrls[provider], '_blank', 'width=600,height=500');
      }
    } catch (err) {
      error('分享失败');
    } finally {
      setLoading(null);
    }
  }, [data, success, error]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success('链接已复制');
    } catch (err) {
      error('复制失败');
    }
  }, [data.url, success, error]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="分享到" size="sm">
      <div className="space-y-6">
        {/* Providers */}
        <div className="flex justify-center gap-6">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleShare(provider.id)}
              disabled={loading !== null}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                {loading === provider.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={provider.icon} />
                  </svg>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{provider.name}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">或复制链接</span>
          </div>
        </div>

        {/* Copy Link */}
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm text-muted-foreground truncate">
            {data.url}
          </div>
          <Button onClick={handleCopy} variant="default">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Mini Share Button (for inline use)
interface MiniShareButtonProps {
  url: string;
  title?: string;
}

export function MiniShareButton({ url, title }: MiniShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { success } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      success('链接已复制');
    } catch (err) {
      // Ignore
    }
  }, [url, success]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        title="复制链接"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        title="分享"
      >
        <Share2 className="w-4 h-4" />
      </button>

      <ShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={{ url, title }}
      />
    </div>
  );
}
