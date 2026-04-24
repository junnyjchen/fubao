'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sparkles, X, MessageCircle } from 'lucide-react';
import { AIChat } from '@/components/ai/AIChat';

export function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const pathname = usePathname();

  // 在AI助手页面不显示浮动按钮
  const isAIPage = pathname === '/ai-assistant';

  // 首次访问显示提示
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('ai-tooltip-seen');
    if (!hasSeenTooltip) {
      // 延迟3秒显示提示
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('ai-tooltip-seen', 'true');
  };

  // AI助手页面不显示
  if (isAIPage) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 提示气泡 */}
      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-background border rounded-lg shadow-lg p-3 w-48 animate-in fade-in-0 zoom-in-95 duration-200">
          <button
            onClick={handleCloseTooltip}
            className="absolute -top-2 -right-2 w-5 h-5 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="text-sm font-medium mb-1">需要幫助？</p>
          <p className="text-xs text-muted-foreground">
            點擊與AI助手對話，了解更多玄門文化知識
          </p>
        </div>
      )}

      {/* 浮动按钮/窗口 */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            onClick={() => {
              handleCloseTooltip();
              setIsOpen(true);
            }}
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="sr-only">AI助手</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>AI助手</SheetTitle>
          </SheetHeader>
          <AIChat />
        </SheetContent>
      </Sheet>
    </div>
  );
}
