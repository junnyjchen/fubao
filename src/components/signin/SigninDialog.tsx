/**
 * @fileoverview 签到弹窗组件
 * @description 每日签到功能
 * @module components/signin/SigninDialog
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  Calendar,
  Flame,
  CheckCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface SigninConfig {
  day: number;
  points: number;
  bonus_points: number;
}

interface SigninData {
  hasSignedToday: boolean;
  continuousDays: number;
  monthSignins: string[];
  config: SigninConfig[];
}

interface SigninDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SigninDialog({ open, onOpenChange }: SigninDialogProps) {
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [data, setData] = useState<SigninData | null>(null);
  const [signinResult, setSigninResult] = useState<{
    points: number;
    continuousDays: number;
    isWeekBonus: boolean;
  } | null>(null);

  useEffect(() => {
    if (open) {
      loadSigninData();
    }
  }, [open]);

  const loadSigninData = async () => {
    setLoading(true);
    setSigninResult(null);
    try {
      const res = await fetch('/api/user/signin');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('加载签到数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async () => {
    setSigning(true);
    try {
      const res = await fetch('/api/user/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const json = await res.json();
      if (json.message) {
        setSigninResult(json.data);
        toast.success(`簽到成功！獲得 ${json.data.points} 積分`);
        // 更新本地数据
        if (data) {
          setData({
            ...data,
            hasSignedToday: true,
            continuousDays: json.data.continuousDays,
            monthSignins: [...data.monthSignins, new Date().toISOString().split('T')[0]],
          });
        }
      } else {
        toast.error(json.error || '簽到失敗');
      }
    } catch (error) {
      console.error('签到失败:', error);
      toast.error('簽到失敗');
    } finally {
      setSigning(false);
    }
  };

  // 获取当月天数
  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  // 渲染日历
  const renderCalendar = () => {
    const now = new Date();
    const today = now.getDate();
    const daysInMonth = getDaysInMonth();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    
    const days = [];
    
    // 填充月初空白
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }
    
    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSigned = data?.monthSignins.includes(dateStr);
      const isToday = day === today;
      const isFuture = day > today;
      
      days.push(
        <div
          key={day}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm relative ${
            isSigned
              ? 'bg-primary text-primary-foreground'
              : isToday
              ? 'bg-primary/20 text-primary font-bold ring-2 ring-primary'
              : isFuture
              ? 'text-muted-foreground/50'
              : 'text-muted-foreground'
          }`}
        >
          {day}
          {isSigned && (
            <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500 bg-background rounded-full" />
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            每日簽到
          </DialogTitle>
          <DialogDescription>
            每日簽到領取積分，連續簽到7天可獲額外獎勵
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 签到结果 */}
            {signinResult && (
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-primary mb-2" />
                  <p className="text-lg font-bold text-primary">
                    +{signinResult.points} 積分
                  </p>
                  {signinResult.isWeekBonus && (
                    <Badge className="mt-2 bg-yellow-500">
                      連續簽到7天獎勵！
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 连续签到天数 */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm">連續簽到</span>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {data?.continuousDays || 0} 天
              </Badge>
            </div>

            {/* 签到奖励配置 */}
            <div className="grid grid-cols-7 gap-1">
              {data?.config.map((item) => {
                const isCurrentDay = ((data.continuousDays) % 7) + 1 === item.day;
                const isCompleted = data.continuousDays >= item.day;
                
                return (
                  <div
                    key={item.day}
                    className={`text-center p-2 rounded-lg text-xs ${
                      isCurrentDay
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="font-medium">第{item.day}天</p>
                    <p className="mt-1">+{item.points}</p>
                    {item.bonus_points > 0 && (
                      <p className="text-[10px] opacity-80">+{item.bonus_points}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 本月日历 */}
            <div>
              <p className="text-sm font-medium mb-3">本月簽到記錄</p>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <div key={day} className="text-xs text-muted-foreground">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            {/* 签到按钮 */}
            <Button
              className="w-full"
              size="lg"
              disabled={data?.hasSignedToday || signing}
              onClick={handleSignin}
            >
              {signing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  簽到中...
                </>
              ) : data?.hasSignedToday ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  今日已簽到
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  立即簽到
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
