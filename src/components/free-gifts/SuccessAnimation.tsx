/**
 * @fileoverview 领取成功动画组件
 * @description 展示领取成功的动画效果
 */

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, PartyPopper, Sparkles, Gift } from 'lucide-react';

interface SuccessAnimationProps {
  onAnimationEnd?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function SuccessAnimation({ 
  onAnimationEnd, 
  autoHide = true,
  duration = 2000 
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 200);
    const timer2 = setTimeout(() => setPhase(2), 600);
    const timer3 = setTimeout(() => setPhase(3), 1000);
    
    let hideTimer: NodeJS.Timeout;
    if (autoHide) {
      hideTimer = setTimeout(() => {
        setVisible(false);
        onAnimationEnd?.();
      }, duration);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [autoHide, duration, onAnimationEnd]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative">
        {/* 背景粒子效果 */}
        <div className="absolute inset-0 -m-20">
          {phase >= 1 && (
            <>
              <Particle className="top-0 left-1/4" delay={0} />
              <Particle className="top-1/3 left-0" delay={100} />
              <Particle className="top-1/3 right-0" delay={200} />
              <Particle className="bottom-0 left-1/3" delay={300} />
              <Particle className="bottom-1/4 right-1/4" delay={400} />
            </>
          )}
        </div>
        
        {/* 主图标 */}
        <div className={`
          transition-all duration-500 transform
          ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
        `}>
          <div className="relative">
            <CheckCircle2 className="w-24 h-24 text-green-500 animate-bounce" />
            <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-ping" />
            <Gift className="w-6 h-6 text-red-500 absolute -bottom-1 -left-1 animate-pulse" />
          </div>
        </div>
        
        {/* 文字 */}
        <div className={`
          mt-6 text-center transition-all duration-500
          ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <h3 className="text-2xl font-bold text-white mb-2">領取成功！</h3>
          <p className="text-white/80">恭喜您獲得好禮</p>
        </div>
      </div>
    </div>
  );
}

function Particle({ className, delay }: { className?: string; delay: number }) {
  return (
    <div 
      className={`absolute animate-ping ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <PartyPopper className="w-6 h-6 text-yellow-400" />
    </div>
  );
}

/**
 * 成功页面全屏动画
 */
export function SuccessPage({ 
  claimNo,
  onClose 
}: { 
  claimNo: string;
  onClose?: () => void;
}) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-green-500 to-emerald-600 flex flex-col items-center justify-center p-6">
      {/* 装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl" />
      </div>
      
      {/* 主内容 */}
      <div className={`relative transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* 成功图标 */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
            <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
          </div>
        </div>
        
        {/* 标题 */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          領取成功！
        </h1>
        <p className="text-white/80 text-center mb-8">
          恭喜您成功領取好禮
        </p>
        
        {/* 领取码 */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
          <p className="text-sm text-muted-foreground text-center mb-2">領取碼</p>
          <p className="text-3xl font-mono font-bold text-center text-primary">
            {claimNo}
          </p>
        </div>
        
        {/* 按钮 */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-white text-green-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          查看詳情
        </button>
      </div>
    </div>
  );
}
