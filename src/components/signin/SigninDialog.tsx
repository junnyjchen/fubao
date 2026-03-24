/**
 * @fileoverview 签到弹窗组件
 * @description 每日签到弹窗
 * @module components/signin/SigninDialog
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Gift,
  Check,
  Loader2,
  Sparkles,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

/** 签到配置 */
interface SigninConfig {
  day: number;
  points: number;
  bonus_points: number;
}

interface SigninDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 签到弹窗组件
 */
export function SigninDialog({ open, onOpenChange }: SigninDialogProps) {
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [hasSignedToday, setHasSignedToday] = useState(false);
  const [continuousDays, setContinuousDays] = useState(0);
  const [monthSignins, setMonthSignins] = useState<string[]>([]);
  const [config, setConfig] = useState<SigninConfig[]>([]);
  const [signResult, setSignResult] = useState<{
    points: number;
    continuousDays: number;
    isWeekBonus: boolean;
  } | null>(null);

  useEffect(() => {
    if (open) {
      loadSigninInfo();
    }
  }, [open]);

  /**
   * 加载签到信息
   */
  const loadSigninInfo = async () => {
    setLoading(true);
    setSignResult(null);
    try {
      const res = await fetch('/api/user/signin');
      const data = await res.json();
      setHasSignedToday(data.hasSignedToday);
      setContinuousDays(data.continuousDays);
      setMonthSignins(data.monthSignins);
      setConfig(data.config);
    } catch (error) {
      console.error('加载签到信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 执行签到
   */
  const handleSignin = async () => {
    setSigning(true);
    try {
      const res = await fetch('/api/user/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.message) {
        setSignResult(data.data);
        setHasSignedToday(true);
        setContinuousDays(data.data.continuousDays);
        toast.success(`簽到成功！獲得 ${data.data.points} 積分`);
      } else {
        toast.error(data.error || '簽到失敗');
      }
    } catch (error) {
      console.error('签到失败:', error);
      toast.error('簽到失敗');
    } finally {
      setSigning(false);
    }
  };

  /**
   * 获取当天应得的积分
   */
  const getTodayPoints = () => {
    const day = ((continuousDays) % 7) + 1;
    const dayConfig = config.find((c) => c.day === day);
    return dayConfig?.points || 5;
  };

  /**
   * 获取本周进度
   */
  const getWeekProgress = () => {
    const currentDay = continuousDays % 7 || 7;
    return currentDay;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
            每日簽到
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 签到成功结果 */}
            {signResult && (
              <div className="text-center py-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-1">簽到成功！</h3>
                <p className="text-2xl font-bold text-primary mb-2">
                  +{signResult.points} 積分
                </p>
                {signResult.isWeekBonus && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                    🎉 連續7天額外獎勵！
                  </Badge>
                )}
              </div>
            )}

            {/* 连续签到天数 */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-bold">{continuousDays}</span>
                <span className="text-muted-foreground">天連續簽到</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {hasSignedToday ? '今日已簽到' : `今日簽到可獲得 ${getTodayPoints()} 積分`}
              </p>
            </div>

            {/* 7天签到进度 */}
            <div className="grid grid-cols-7 gap-2">
              {config.map((day) => {
                const currentDay = getWeekProgress();
                const isCompleted = day.day <= currentDay && hasSignedToday;
                const isToday = day.day === currentDay && !hasSignedToday;
                const isBonus = day.day === 7;

                return (
                  <div
                    key={day.day}
                    className={`relative flex flex-col items-center p-2 rounded-lg border-2 transition-colors ${
                      isCompleted
                        ? 'border-primary bg-primary/10'
                        : isToday
                        ? 'border-primary/50 border-dashed'
                        : 'border-muted'
                    } ${isBonus ? 'col-span-1' : ''}`}
                  >
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <span className={`text-xs font-medium ${
                      isCompleted ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {isBonus ? '週' : day.day}
                    </span>
                    <span className={`text-sm font-bold ${
                      isCompleted ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      +{day.points}
                    </span>
                    {day.bonus_points > 0 && (
                      <span className="text-xs text-orange-500">
                        +{day.bonus_points}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 本月签到日历 */}
            <div>
              <h4 className="text-sm font-medium mb-2">本月簽到記錄</h4>
              <div className="flex flex-wrap gap-1">
                {monthSignins.map((date) => (
                  <div
                    key={date}
                    className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center"
                    title={date}
                  >
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                ))}
                {monthSignins.length === 0 && (
                  <p className="text-sm text-muted-foreground">本月暫無簽到記錄</p>
                )}
              </div>
            </div>

            {/* 签到按钮 */}
            {!signResult && (
              <Button
                className="w-full"
                size="lg"
                onClick={handleSignin}
                disabled={hasSignedToday || signing}
              >
                {signing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : hasSignedToday ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Gift className="w-4 h-4 mr-2" />
                )}
                {hasSignedToday ? '今日已簽到' : '立即簽到'}
              </Button>
            )}

            {/* 说明 */}
            <p className="text-xs text-muted-foreground text-center">
              連續簽到7天可獲得額外20積分獎勵
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
