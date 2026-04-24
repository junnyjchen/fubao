/**
 * @fileoverview VIP会员页面
 * @description VIP会员等级、权益、升级说明
 * @module app/vip/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Crown,
  Star,
  Gift,
  Truck,
  Shield,
  HeadphonesIcon,
  Percent,
  Coins,
  Check,
  ChevronRight,
  Loader2,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { VIPSkeleton } from '@/components/common/PageSkeletons';

interface VIPInfo {
  level: number;
  levelName: string;
  points: number;
  totalSpent: number;
  nextLevelPoints: number;
  nextLevelName: string;
  progress: number;
  memberSince: string;
  expiryDate: string;
}

interface VIPPrivilege {
  id: number;
  name: string;
  description: string;
  icon: typeof Crown;
  levels: number[]; // 可用等级
}

// VIP等级配置
const vipLevels = [
  {
    level: 1,
    name: '普通會員',
    minPoints: 0,
    minSpent: 0,
    discount: 1.0,
    color: 'from-gray-400 to-gray-500',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: Star,
    privileges: ['基礎權益', '積分獲取'],
  },
  {
    level: 2,
    name: '銅牌會員',
    minPoints: 100,
    minSpent: 1000,
    discount: 0.98,
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: Award,
    privileges: ['98折優惠', '優先發貨', '生日禮券'],
  },
  {
    level: 3,
    name: '銀牌會員',
    minPoints: 500,
    minSpent: 5000,
    discount: 0.95,
    color: 'from-gray-300 to-gray-400',
    textColor: 'text-gray-500',
    bgColor: 'bg-gray-50',
    icon: Shield,
    privileges: ['95折優惠', '專屬客服', '免運費券', '新品優先'],
  },
  {
    level: 4,
    name: '金牌會員',
    minPoints: 2000,
    minSpent: 20000,
    discount: 0.92,
    color: 'from-yellow-400 to-yellow-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    icon: Crown,
    privileges: ['92折優惠', '專屬顧問', '每月禮包', '專享活動', '免息分期'],
  },
  {
    level: 5,
    name: '鑽石會員',
    minPoints: 5000,
    minSpent: 50000,
    discount: 0.88,
    color: 'from-blue-500 to-purple-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Sparkles,
    privileges: ['88折優惠', '一對一服務', '生日驚喜', '限量預購', '尊享定制', '年度禮遇'],
  },
];

// 特权列表
const privileges: VIPPrivilege[] = [
  {
    id: 1,
    name: '專屬折扣',
    description: '根據會員等級享受不同折扣優惠',
    icon: Percent,
    levels: [2, 3, 4, 5],
  },
  {
    id: 2,
    name: '免運費',
    description: '每月獲得免運費券',
    icon: Truck,
    levels: [3, 4, 5],
  },
  {
    id: 3,
    name: '專屬客服',
    description: '優先接入專屬客服通道',
    icon: HeadphonesIcon,
    levels: [3, 4, 5],
  },
  {
    id: 4,
    name: '生日禮遇',
    description: '生日當月專享禮品和優惠',
    icon: Gift,
    levels: [2, 3, 4, 5],
  },
  {
    id: 5,
    name: '積分加倍',
    description: '購物積分獲取倍率提升',
    icon: Coins,
    levels: [3, 4, 5],
  },
  {
    id: 6,
    name: '新品優先',
    description: '優先購買限量新品',
    icon: Zap,
    levels: [3, 4, 5],
  },
  {
    id: 7,
    name: '專屬顧問',
    description: '一對一玄學顧問服務',
    icon: Crown,
    levels: [4, 5],
  },
  {
    id: 8,
    name: '尊享定制',
    description: '專屬定制符箓服務',
    icon: Sparkles,
    levels: [5],
  },
];

export default function VIPPage() {
  const [loading, setLoading] = useState(true);
  const [vipInfo, setVipInfo] = useState<VIPInfo | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadVIPInfo();
  }, []);

  const loadVIPInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/level');
      const data = await res.json();
      
      if (data.success || data.data || data.level) {
        const levelData = data.data || data;
        const currentLevel = vipLevels.find(l => l.level === (levelData.level || 1)) || vipLevels[0];
        const nextLevel = vipLevels.find(l => l.level === currentLevel.level + 1);
        
        setVipInfo({
          level: levelData.level || 1,
          levelName: levelData.name || currentLevel.name,
          points: levelData.points || 0,
          totalSpent: levelData.total_spent || 0,
          nextLevelPoints: nextLevel?.minPoints || 0,
          nextLevelName: nextLevel?.name || '',
          progress: levelData.progress || (nextLevel 
            ? Math.min(((levelData.total_points || 0) / nextLevel.minPoints) * 100, 100) 
            : 100),
          memberSince: levelData.member_since || '2024-01-01',
          expiryDate: levelData.expiry_date || '2025-12-31',
        });
      } else {
        // 使用默认数据
        setVipInfo({
          level: 1,
          levelName: '普通會員',
          points: 50,
          totalSpent: 500,
          nextLevelPoints: 100,
          nextLevelName: '銅牌會員',
          progress: 50,
          memberSince: '2024-01-01',
          expiryDate: '2025-12-31',
        });
      }
    } catch (error) {
      console.error('加载VIP信息失败:', error);
      setVipInfo({
        level: 1,
        levelName: '普通會員',
        points: 50,
        totalSpent: 500,
        nextLevelPoints: 100,
        nextLevelName: '銅牌會員',
        progress: 50,
        memberSince: '2024-01-01',
        expiryDate: '2025-12-31',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedLevel) return;
    
    setUpgrading(true);
    try {
      // 模拟升级请求
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('升級成功！');
      setShowUpgradeDialog(false);
      loadVIPInfo();
    } catch (error) {
      toast.error('升級失敗，請稍後重試');
    } finally {
      setUpgrading(false);
    }
  };

  const currentLevelConfig = vipLevels.find(l => l.level === (vipInfo?.level || 1));
  const CurrentIcon = currentLevelConfig?.icon || Star;

  if (loading) {
    return <VIPSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部横幅 */}
      <div className={`bg-gradient-to-br ${currentLevelConfig?.color || 'from-gray-400 to-gray-500'} text-white`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* 当前等级 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <CurrentIcon className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{vipInfo?.levelName}</h1>
                  <Badge className="bg-white/20 text-white">
                    LV.{vipInfo?.level}
                  </Badge>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  會員有效期至 {vipInfo?.expiryDate}
                </p>
              </div>
            </div>

            {/* 升级进度 */}
            {vipInfo && vipInfo.level < 5 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="py-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>距離 {vipInfo.nextLevelName} 還需 {vipInfo.nextLevelPoints - vipInfo.points} 積分</span>
                    <span>{vipInfo.points} / {vipInfo.nextLevelPoints}</span>
                  </div>
                  <Progress value={vipInfo.progress} className="h-2 bg-white/20" />
                  <div className="flex justify-between mt-3 text-xs text-white/70">
                    <span>累計消費：HK${vipInfo.totalSpent.toLocaleString()}</span>
                    <span>入會時間：{vipInfo.memberSince}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 已是最高等级 */}
            {vipInfo?.level === 5 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="py-4 text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">您已是最高等級會員</p>
                  <p className="text-sm text-white/70 mt-1">享受尊享定制服務和專屬權益</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 等级展示 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                會員等級
              </CardTitle>
              <CardDescription>
                消費獲取積分，積分升級享更多權益
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {vipLevels.map((level) => {
                  const LevelIcon = level.icon;
                  const isActive = vipInfo?.level === level.level;
                  const isUnlocked = (vipInfo?.level || 0) >= level.level;
                  
                  return (
                    <div
                      key={level.level}
                      className={`relative p-3 rounded-lg text-center cursor-pointer transition-all ${
                        isActive 
                          ? `${level.bgColor} ring-2 ring-primary` 
                          : isUnlocked
                            ? 'bg-muted/50 hover:bg-muted'
                            : 'bg-muted/30 opacity-60'
                      }`}
                      onClick={() => {
                        setSelectedLevel(level.level);
                        setShowUpgradeDialog(true);
                      }}
                    >
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center mb-2`}>
                        <LevelIcon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs font-medium">{level.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {level.discount < 1 ? `${(level.discount * 100).toFixed(0)}折` : '-'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 会员权益 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                會員權益
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {privileges.map((privilege) => {
                  const PrivilegeIcon = privilege.icon;
                  const isAvailable = privilege.levels.includes(vipInfo?.level || 1);
                  
                  return (
                    <div
                      key={privilege.id}
                      className={`p-4 rounded-lg border ${
                        isAvailable 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-muted/30 border-muted opacity-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${
                        isAvailable ? 'bg-primary/10' : 'bg-muted'
                      } flex items-center justify-center mb-2`}>
                        <PrivilegeIcon className={`w-5 h-5 ${
                          isAvailable ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <p className="font-medium text-sm">{privilege.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{privilege.description}</p>
                      {!isAvailable && (
                        <p className="text-xs text-primary mt-2">
                          需升級至 LV.{Math.min(...privilege.levels)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 升级攻略 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                升級攻略
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">購物獲積分</p>
                  <p className="text-sm text-muted-foreground">
                    消費 HK$1 = 1 積分，VIP會員享倍數加成
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">活動獎勵</p>
                  <p className="text-sm text-muted-foreground">
                    參與平台活動、簽到、評價可獲額外積分
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">邀請好友</p>
                  <p className="text-sm text-muted-foreground">
                    邀請好友註冊購物，雙方都可獲得積分獎勵
                  </p>
                </div>
              </div>

              <Separator />
              
              <div className="text-center">
                <Link href="/distribution">
                  <Button variant="outline">
                    前往分銷中心
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 等级对比 */}
          <Card>
            <CardHeader>
              <CardTitle>等級權益對比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">權益</th>
                      {vipLevels.map(level => (
                        <th key={level.level} className="text-center py-3 px-2">
                          <div className="flex flex-col items-center gap-1">
                            <level.icon className={`w-4 h-4 ${level.textColor}`} />
                            <span className="text-xs">{level.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-2">折扣優惠</td>
                      {vipLevels.map(level => (
                        <td key={level.level} className="text-center py-3 px-2">
                          {level.discount < 1 ? `${(level.discount * 100).toFixed(0)}折` : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">積分倍率</td>
                      {vipLevels.map(level => (
                        <td key={level.level} className="text-center py-3 px-2">
                          {level.level}x
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">生日禮券</td>
                      {vipLevels.map(level => (
                        <td key={level.level} className="text-center py-3 px-2">
                          {level.level >= 2 ? <Check className="w-4 h-4 mx-auto text-green-600" /> : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">免運費券</td>
                      {vipLevels.map(level => (
                        <td key={level.level} className="text-center py-3 px-2">
                          {level.level >= 3 ? `${level.level - 1}張/月` : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2">專屬客服</td>
                      {vipLevels.map(level => (
                        <td key={level.level} className="text-center py-3 px-2">
                          {level.level >= 3 ? <Check className="w-4 h-4 mx-auto text-green-600" /> : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-2">專屬顧問</td>
                      {vipLevels.map(level => (
                        <td key={level.level} className="text-center py-3 px-2">
                          {level.level >= 4 ? <Check className="w-4 h-4 mx-auto text-green-600" /> : '-'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 升级弹窗 */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedLevel && vipLevels.find(l => l.level === selectedLevel)?.name}
            </DialogTitle>
            <DialogDescription>
              查看會員等級詳情和升級條件
            </DialogDescription>
          </DialogHeader>
          
          {selectedLevel && (() => {
            const level = vipLevels.find(l => l.level === selectedLevel)!;
            const LevelIcon = level.icon;
            const canUpgrade = (vipInfo?.points || 0) >= level.minPoints;
            
            return (
              <div className="space-y-4 py-4">
                <div className={`p-6 rounded-lg bg-gradient-to-br ${level.color} text-white text-center`}>
                  <LevelIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold text-lg">{level.name}</p>
                  <p className="text-sm opacity-80">
                    {level.discount < 1 ? `享${(level.discount * 100).toFixed(0)}折優惠` : '基礎會員'}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="font-medium">升級條件：</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 累計積分 ≥ {level.minPoints}</li>
                    <li>• 累計消費 ≥ HK${level.minSpent.toLocaleString()}</li>
                  </ul>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="font-medium">專屬權益：</p>
                  <ul className="space-y-1">
                    {level.privileges.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4 text-green-600" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                    關閉
                  </Button>
                  {canUpgrade && selectedLevel > (vipInfo?.level || 1) && (
                    <Button onClick={handleUpgrade} disabled={upgrading}>
                      {upgrading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          升級中...
                        </>
                      ) : (
                        '立即升級'
                      )}
                    </Button>
                  )}
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
