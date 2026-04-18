/**
 * @fileoverview 邀请好友组件
 * @description 邀请好友获取更多领取机会
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Users,
  Gift,
  Link2,
  Copy,
  Share2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Clock,
  Star,
  BadgePercent,
} from 'lucide-react';

interface Invitation {
  id: string;
  inviteeName: string;
  status: 'pending' | 'completed';
  reward: string;
  createdAt: string;
}

interface InviteFriendProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  inviteCode?: string;
  inviteLink?: string;
  totalInvites?: number;
  successInvites?: number;
  invitations?: Invitation[];
  onCopyLink?: () => void;
  onShare?: (platform: string) => void;
  maxPerDay?: number;
  remainingToday?: number;
}

const defaultInvitations: Invitation[] = [
  { id: '1', inviteeName: '張**', status: 'completed', reward: '+1次', createdAt: '2024-01-15' },
  { id: '2', inviteeName: '李**', status: 'completed', reward: '+1次', createdAt: '2024-01-14' },
  { id: '3', inviteeName: '王**', status: 'pending', reward: '待確認', createdAt: '2024-01-13' },
];

const sharePlatforms = [
  { name: '微信', icon: '💬', key: 'wechat' },
  { name: '微博', icon: '📱', key: 'weibo' },
  { name: 'QQ', icon: '🔷', key: 'qq' },
  { name: '複製鏈接', icon: '🔗', key: 'copy' },
];

export function InviteFriend({
  open,
  onOpenChange,
  inviteCode = 'FU12345',
  inviteLink = 'https://fubao.com/invite/FU12345',
  totalInvites = 12,
  successInvites = 10,
  invitations = defaultInvitations,
  onCopyLink,
  onShare,
  maxPerDay = 5,
  remainingToday = 3,
}: InviteFriendProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopyLink?.();
  };

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      handleCopy();
    } else {
      onShare?.(platform);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            邀請好友
          </DialogTitle>
          <DialogDescription>
            邀請好友一起領好禮，雙方都能獲得額外獎勵
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 统计 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{totalInvites}</p>
              <p className="text-xs text-muted-foreground">邀請總數</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{successInvites}</p>
              <p className="text-xs text-muted-foreground">成功邀請</p>
            </div>
          </div>

          {/* 今日剩余 */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">今日可邀請</span>
            </div>
            <span className="font-medium">{remainingToday}/{maxPerDay}次</span>
          </div>

          {/* 邀请码 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">專屬邀請碼</label>
            <div className="flex gap-2">
              <Input value={inviteCode} readOnly className="text-center font-mono text-lg" />
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* 邀请链接 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">邀請鏈接</label>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="text-xs" />
              <Button variant="outline" onClick={handleCopy}>
                {copied ? '已複製' : '複製'}
              </Button>
            </div>
          </div>

          {/* 分享按钮 */}
          <div className="flex gap-2">
            {sharePlatforms.map((platform) => (
              <Button
                key={platform.key}
                variant="outline"
                className="flex-1"
                onClick={() => handleShare(platform.key)}
              >
                <span className="mr-1">{platform.icon}</span>
                {platform.name}
              </Button>
            ))}
          </div>

          {/* 邀请记录 */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">邀請記錄</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{inv.inviteeName}</p>
                      <p className="text-xs text-muted-foreground">{inv.createdAt}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      inv.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {inv.reward}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 规则说明 */}
          <div className="text-xs text-muted-foreground">
            <p>* 每成功邀請1位好友，雙方各獲得1次額外領取機會</p>
            <p>* 每日最多邀請{maxPerDay}位好友</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 邀请入口卡片
 */
export function InviteCard({
  onClick,
  inviteCount,
  rewardText,
}: {
  onClick: () => void;
  inviteCount?: number;
  rewardText?: string;
}) {
  return (
    <Card
      className="bg-gradient-to-r from-red-500 to-orange-500 text-white cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">邀請好友</p>
              <p className="text-xs text-white/80">
                {rewardText || '邀請好友領好禮'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {inviteCount !== undefined && (
              <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                {inviteCount}次
              </span>
            )}
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 简洁邀请横幅
 */
export function InviteBanner({
  onClick,
  dismissible,
  onDismiss,
}: {
  onClick: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
}) {
  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        <span className="text-sm">邀請好友一起領好禮</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-xs bg-white text-red-600 hover:bg-white/90"
          onClick={onClick}
        >
          立即邀請
        </Button>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="text-white/70 hover:text-white p-1"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 邀请成功弹窗
 */
export function InviteSuccessDialog({
  open,
  onOpenChange,
  rewardType,
  rewardValue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rewardType: 'chance' | 'coupon';
  rewardValue: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <div className="py-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl">邀請成功！</DialogTitle>
            <DialogDescription className="text-base mt-2">
              {rewardType === 'chance' ? (
                <span>您獲得了 <strong className="text-primary">{rewardValue}</strong> 領取機會</span>
              ) : (
                <span>您獲得了 <strong className="text-primary">{rewardValue}</strong> 優惠券</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <Button className="mt-4" onClick={() => onOpenChange(false)}>
            太棒了
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 邀请进度条
 */
export function InviteProgress({
  current,
  target,
  reward,
}: {
  current: number;
  target: number;
  reward: string;
}) {
  const progress = Math.min((current / target) * 100, 100);
  const isCompleted = current >= target;

  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">邀請進度</span>
        <span className="text-xs text-muted-foreground">
          {current}/{target}人
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isCompleted ? 'bg-green-500' : 'bg-primary'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">
          {isCompleted ? '已完成' : `再邀請${target - current}人`}
        </span>
        <span className="text-xs font-medium text-primary">
          {isCompleted ? '已獲得' : '可獲得'}：{reward}
        </span>
      </div>
    </div>
  );
}
