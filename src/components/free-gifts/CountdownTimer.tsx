/**
 * @fileoverview 倒计时组件
 * @description 用于显示活动剩余时间
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;
  onExpire?: () => void;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function CountdownTimer({ 
  endTime, 
  onExpire,
  showIcon = true,
  size = 'md' 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        onExpire?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-muted-foreground text-sm">活動已結束</span>
    );
  }

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  };

  const boxClasses = {
    sm: 'px-1.5 py-0.5 min-w-[24px]',
    md: 'px-2 py-1 min-w-[32px]',
    lg: 'px-2.5 py-1.5 min-w-[40px]',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      {showIcon && <Clock className="w-4 h-4 text-orange-500" />}
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <>
            <TimeBox value={timeLeft.days} size={boxClasses[size]} />
            <span className="text-muted-foreground">天</span>
          </>
        )}
        <TimeBox value={timeLeft.hours} size={boxClasses[size]} />
        <span className="text-muted-foreground">:</span>
        <TimeBox value={timeLeft.minutes} size={boxClasses[size]} />
        <span className="text-muted-foreground">:</span>
        <TimeBox value={timeLeft.seconds} size={boxClasses[size]} />
      </div>
    </div>
  );
}

function TimeBox({ value, size }: { value: number; size: string }) {
  return (
    <span className={`bg-red-500 text-white rounded font-mono font-medium text-center ${size}`}>
      {value.toString().padStart(2, '0')}
    </span>
  );
}

/**
 * 简化版倒计时（用于卡片）
 */
export function SimpleCountdown({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculate = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('已結束');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setTimeLeft(`剩餘${days}天${hours}小時`);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`剩餘${hours}時${minutes}分`);
      }
    };

    calculate();
    const timer = setInterval(calculate, 60000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <span className="text-xs text-orange-600 flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {timeLeft}
    </span>
  );
}
