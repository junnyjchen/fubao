/**
 * @fileoverview VIP会员页面
 * @description 会员等级和权益介绍
 * @module app/vip/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Star,
  Gift,
  Percent,
  Truck,
  Headphones,
  ChevronRight,
  Check,
  Loader2,
  Sparkles,
  Award,
  Shield,
} from 'lucide-react';

/** 会员等级 */
interface MemberLevel {
  id: number;
  name: string;
  level: number;
  min_points: number;
  max_points: number | null;
  discount: number;
  color: string;
  icon: string;
  benefits: string[];
}

/** 用户会员信息 */
interface MemberInfo {
  level: number;
  name: string;
  points: number;
  total_points: number;
  discount: number;
  next_level: MemberLevel | null;
  progress: number;
}

/** 会员权益 */
const memberBenefits = [
  {
    icon: Percent,
    title: '專屬折扣',
    description: '會員等級越高，享受越多折扣優惠',
    tiers: ['99折', '98折', '97折', '95折', '93折'],
  },
  {
    icon: Gift,
    title: '生日禮券',
    description: '生日當月專享優惠券',
    tiers: ['HK$20', 'HK$30', 'HK$50', 'HK$80', 'HK$100'],
  },
  {
    icon: Truck,
    title: '免運費',
    description: '訂單滿額免運費',
    tiers: ['滿$500', '滿$300', '滿$200', '滿$100', '全免'],
  },
  {
    icon: Headphones,
    title: '專屬客服',
    description: '優先響應，專人服務',
    tiers: ['無', '無', '優先響應', '專屬客服', 'VIP管家'],
  },
  {
    icon: Sparkles,
    title: '專屬活動',
    description: '會員專屬優先購買權',
    tiers: ['無', '無', '部分活動', '全部活動', '優先預購'],
  },
  {
    icon: Crown,
    title: '積分加成',
    description: '購物獲得額外積分獎勵',
    tiers: ['無', '1.1倍', '1.2倍', '1.5倍', '2倍'],
  },
];

/** 会员等级数据 */
const memberLevels: MemberLevel[] = [
  {
    id: 1,
    name: '普通會員',
    level: 1,
    min_points: 0,
    max_points: 99,
    discount: 100,
    color: '#9CA3AF',
    icon: '⭐',
    benefits: ['基礎會員權益'],
  },
  {
    id: 2,
    name: '入門信士',
    level: 2,
    min_points: 100,
    max_points: 499,
    discount: 99,
    color: '#60A5FA',
    icon: '✨',
    benefits: ['基礎會員權益', '生日禮券', '專屬折扣99折'],
  },
  {
    id: 3,
    name: '虔誠信士',
    level: 3,
    min_points: 500,
    max_points: 1999,
    discount: 98,
    color: '#34D399',
    icon: '🌟',
    benefits: ['基礎會員權益', '生日禮券', '專屬折扣98折', '優先客服響應'],
  },
  {
    id: 4,
    name: '資深信士',
    level: 4,
    min_points: 2000,
    max_points: 4999,
    discount: 95,
    color: '#F59E0B',
    icon: '👑',
    benefits: ['基礎會員權益', '生日禮券HK$80', '專屬折扣95折', '專屬客服', '會員專屬活動'],
  },
  {
    id: 5,
    name: '至尊會員',
    level: 5,
    min_points: 5000,
    max_points: null,
    discount: 93,
    color: '#EF4444',
    icon: '💎',
    benefits: ['全部權益', '生日禮券HK$100', '專屬折扣93折', 'VIP管家', '優先預購權', '免運費'],
  },
];

/**
 * VIP会员页面组件
 */
export default function VIPPage() {
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberInfo();
  }, []);

  const loadMemberInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/level');
      const data = await res.json();
      
      if (data.data) {
        // 找到当前等级
        const currentLevel = memberLevels.find(l => l.level === (data.level || 1));
        const nextLevel = memberLevels.find(l => l.level === (data.level || 1) + 1);
        
        setMemberInfo({
          level: data.level || 1,
          name: currentLevel?.name || '普通會員',
          points: data.points || 0,
          total_points: data.total_points || 0,
          discount: currentLevel?.discount || 100,
          next_level: nextLevel || null,
          progress: data.progress || 0,
        });
      } else {
        // 默认数据
        setMemberInfo({
          level: 2,
          name: '入門信士',
          points: 206,
          total_points: 206,
          discount: 99,
          next_level: memberLevels[2],
          progress: 27,
        });
      }
    } catch (error) {
      console.error('加载会员信息失败:', error);
      setMemberInfo({
        level: 2,
        name: '入門信士',
        points: 206,
        total_points: 206,
        discount: 99,
        next_level: memberLevels[2],
        progress: 27,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">VIP會員中心</h1>
          </div>
          <p className="text-center text-white/80 mb-8">
            等級越高，權益越多
          </p>

          {/* 当前会员信息 */}
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : memberInfo && (
            <Card className="max-w-md mx-auto bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: memberLevels[memberInfo.level - 1]?.color || '#9CA3AF' }}
                    >
                      {memberLevels[memberInfo.level - 1]?.icon || '⭐'}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{memberInfo.name}</div>
                      <div className="text-sm text-white/70">
                        累計 {memberInfo.total_points.toLocaleString()} 積分
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white">
                    {memberInfo.discount}折
                  </Badge>
                </div>

                {memberInfo.next_level && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>距離 {memberInfo.next_level.name}</span>
                      <span>{memberInfo.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${memberInfo.progress}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-white/70 mt-2">
                      再獲得 {memberInfo.next_level.min_points - memberInfo.points} 積分升級
                    </div>
                  </div>
                )}

                <Link href="/user/points">
                  <Button className="w-full mt-4 bg-white text-orange-600 hover:bg-white/90">
                    查看積分明細
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 等级介绍 */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          會員等級
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {memberLevels.map((level) => (
            <Card 
              key={level.id}
              className={`overflow-hidden ${
                memberInfo?.level === level.level 
                  ? 'ring-2 ring-amber-500 shadow-lg' 
                  : ''
              }`}
            >
              <div 
                className="h-2"
                style={{ backgroundColor: level.color }}
              />
              <CardContent className="p-4 text-center">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                  style={{ backgroundColor: level.color + '20' }}
                >
                  {level.icon}
                </div>
                <h3 className="font-bold mb-1">{level.name}</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  {level.max_points 
                    ? `${level.min_points}-${level.max_points}積分`
                    : `${level.min_points}+積分`}
                </div>
                <Badge variant="outline" style={{ color: level.color, borderColor: level.color }}>
                  {level.discount}折
                </Badge>
                {memberInfo?.level === level.level && (
                  <div className="mt-2 text-xs text-amber-600 font-medium">
                    當前等級
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 会员权益 */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" />
          會員權益
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberBenefits.map((benefit, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {benefit.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {benefit.tiers.map((tier, tierIndex) => (
                        <Badge 
                          key={tierIndex}
                          variant="outline" 
                          className="text-xs"
                        >
                          LV{tierIndex + 1}: {tier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 如何升级 */}
      <div className="container mx-auto px-4 py-8 pb-16">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              如何升級
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-amber-700">1</span>
                </div>
                <div>
                  <p className="font-medium">購物獲得積分</p>
                  <p className="text-muted-foreground">消費HK$1獲得1積分</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-amber-700">2</span>
                </div>
                <div>
                  <p className="font-medium">每日簽到</p>
                  <p className="text-muted-foreground">每日簽到得5積分</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-amber-700">3</span>
                </div>
                <div>
                  <p className="font-medium">評價商品</p>
                  <p className="text-muted-foreground">評價得10積分</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-amber-700">4</span>
                </div>
                <div>
                  <p className="font-medium">分享商品</p>
                  <p className="text-muted-foreground">分享得5積分</p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/points-mall">
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <Gift className="w-4 h-4 mr-2" />
                  前往積分商城
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
