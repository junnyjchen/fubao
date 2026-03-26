/**
 * @fileoverview 新手引导组件
 * @description 首次访问时展示引导提示
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Gift,
  Truck,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const defaultSteps: OnboardingStep[] = [
  {
    title: '歡迎來到免費領',
    description: '精選玄門好物，全部免費領取！只需支付運費或到店自取。',
    icon: <Gift className="w-12 h-12 text-red-500" />,
    highlight: '免費',
  },
  {
    title: '選擇領取方式',
    description: '支持郵寄到家（付運費）或到店自取（完全免費），任您選擇。',
    icon: <Truck className="w-12 h-12 text-orange-500" />,
    highlight: '靈活',
  },
  {
    title: '輕鬆領取好禮',
    description: '填寫信息後獲取領取碼，到店出示即可領取，或等待快遞送達。',
    icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
    highlight: '便捷',
  },
];

interface OnboardingGuideProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  steps?: OnboardingStep[];
  storageKey?: string;
  onComplete?: () => void;
}

export function OnboardingGuide({
  open: controlledOpen,
  onOpenChange,
  steps = defaultSteps,
  storageKey = 'freeGifts_onboarding_completed',
  onComplete,
}: OnboardingGuideProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    // 检查是否已完成引导
    const completed = localStorage.getItem(storageKey);
    if (!completed && controlledOpen === undefined) {
      setTimeout(() => setOpen(true), 1000);
    }
  }, [storageKey, controlledOpen, setOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setOpen(false);
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="py-6 text-center">
          {/* 图标 */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              {step.icon}
              <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          {/* 标题 */}
          <DialogHeader>
            <DialogTitle className="text-xl mb-2">{step.title}</DialogTitle>
            <DialogDescription className="text-base">
              {step.description}
            </DialogDescription>
          </DialogHeader>

          {/* 高亮标签 */}
          {step.highlight && (
            <div className="mt-4">
              <span className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-sm font-medium">
                {step.highlight}
              </span>
            </div>
          )}

          {/* 步骤指示器 */}
          <div className="flex justify-center gap-2 mt-6 mb-4">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'w-6 bg-primary' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 justify-center">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一步
              </Button>
            )}
            <Button onClick={handleNext} className="bg-gradient-to-r from-red-500 to-orange-500">
              {currentStep === steps.length - 1 ? '開始領取' : '下一步'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>

          {/* 跳过 */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground"
            >
              跳過引導
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 简单提示气泡
 */
export function TooltipBubble({
  content,
  position = 'top',
  show,
  onClose,
  children,
}: {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!show) return <>{children}</>;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      {children}
      <div className={`absolute ${positionClasses[position]} z-50`}>
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
          {content}
          <button
            onClick={onClose}
            className="ml-2 text-white/70 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 功能引导点
 */
export function FeatureHighlight({
  children,
  highlightKey,
  title,
  description,
}: {
  children: React.ReactNode;
  highlightKey: string;
  title: string;
  description?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const viewed = localStorage.getItem(`highlight_${highlightKey}`);
    if (!viewed) {
      setTimeout(() => setShow(true), 500);
    }
  }, [highlightKey]);

  const handleClose = () => {
    localStorage.setItem(`highlight_${highlightKey}`, 'true');
    setShow(false);
  };

  return (
    <div className="relative">
      {children}
      {show && (
        <div className="absolute -top-1 -right-1 z-50">
          <button
            onClick={handleClose}
            className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse"
          >
            <span className="text-xs">!</span>
          </button>
          <div className="absolute top-full right-0 mt-1 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-lg whitespace-nowrap z-50">
            <p className="font-medium">{title}</p>
            {description && <p className="text-white/70 mt-0.5">{description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 引导卡片
 */
export function GuideCard({
  title,
  steps,
  onClose,
}: {
  title: string;
  steps: { icon: React.ReactNode; text: string }[];
  onClose?: () => void;
}) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50">
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-medium text-sm mb-2">{title}</p>
            <div className="space-y-1.5">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                  {step.icon}
                  {step.text}
                </div>
              ))}
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
