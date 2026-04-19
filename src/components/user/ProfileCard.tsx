'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/image';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  User, 
  Edit2, 
  Camera, 
  Shield, 
  Mail, 
  Phone,
  Calendar,
  Male,
  Female,
  Save,
  Loader2,
} from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  bio?: string;
  level?: number;
  points?: number;
  balance?: number;
}

interface ProfileHeaderProps {
  user: UserProfile;
  isOwn?: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
  followersCount?: number;
  followingCount?: number;
}

export function ProfileHeader({
  user,
  isOwn = false,
  onEdit,
  onFollow,
  isFollowing = false,
  followersCount = 0,
  followingCount = 0,
}: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar
              src={user.avatar}
              alt={user.nickname || user.username}
              size="xl"
              className="w-24 h-24"
            />
            {isOwn && onEdit && (
              <button
                onClick={onEdit}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-muted border flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                {user.nickname || user.username}
              </h2>
              {user.level && user.level > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                  LV{user.level}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              @{user.username}
            </p>

            {user.bio && (
              <p className="text-sm mt-3">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <p className="text-lg font-semibold">{followersCount}</p>
                <p className="text-xs text-muted-foreground">粉丝</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{followingCount}</p>
                <p className="text-xs text-muted-foreground">关注</p>
              </div>
              {user.points !== undefined && (
                <div className="text-center">
                  <p className="text-lg font-semibold">{user.points}</p>
                  <p className="text-xs text-muted-foreground">积分</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isOwn && onFollow && (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              onClick={onFollow}
            >
              {isFollowing ? '已关注' : '关注'}
            </Button>
          )}
          {isOwn && onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-1" />
              编辑资料
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Profile Info Card
interface ProfileInfoCardProps {
  user: UserProfile;
}

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const genderIcon = {
    male: <Male className="w-4 h-4 text-blue-500" />,
    female: <Female className="w-4 h-4 text-pink-500" />,
    unknown: null,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          基本信息
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.email && (
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
        )}
        {user.phone && (
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{user.phone}</span>
          </div>
        )}
        {user.gender && (
          <div className="flex items-center gap-3">
            {genderIcon[user.gender]}
            <span className="text-sm">
              {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '未设置'}
            </span>
          </div>
        )}
        {user.birthday && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{user.birthday}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Profile Stats Card
interface ProfileStatsCardProps {
  user: UserProfile;
  stats?: {
    orders: number;
    favorites: number;
    reviews: number;
  };
}

export function ProfileStatsCard({ user, stats }: ProfileStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="font-medium flex items-center gap-2">
          <Shield className="w-4 h-4" />
          账户信息
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {user.balance !== undefined && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">余额</p>
              <p className="text-lg font-semibold text-primary">
                ¥{user.balance.toFixed(2)}
              </p>
            </div>
          )}
          {user.points !== undefined && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">积分</p>
              <p className="text-lg font-semibold">{user.points}</p>
            </div>
          )}
          {user.level !== undefined && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">等级</p>
              <p className="text-lg font-semibold">LV{user.level}</p>
            </div>
          )}
          {stats && (
            <>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">订单</p>
                <p className="text-lg font-semibold">{stats.orders}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">收藏</p>
                <p className="text-lg font-semibold">{stats.favorites}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Edit Profile Modal
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  initialData: Partial<UserProfile>;
  loading?: boolean;
}

export interface ProfileFormData {
  nickname: string;
  gender: 'male' | 'female' | 'unknown';
  birthday: string;
  bio: string;
}

export function EditProfileModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    nickname: initialData.nickname || '',
    gender: initialData.gender || 'unknown',
    birthday: initialData.birthday || '',
    bio: initialData.bio || '',
  });

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="编辑资料" size="md">
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar
              src={initialData.avatar}
              alt={formData.nickname || '头像'}
              size="xl"
              className="w-24 h-24"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nickname */}
        <div>
          <label className="text-sm font-medium mb-1 block">昵称</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => handleChange('nickname', e.target.value)}
            placeholder="请输入昵称"
            maxLength={20}
            className="w-full px-3 py-2 border border-input rounded-lg"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="text-sm font-medium mb-2 block">性别</label>
          <div className="flex gap-4">
            {[
              { value: 'male', label: '男', icon: Male },
              { value: 'female', label: '女', icon: Female },
              { value: 'unknown', label: '保密', icon: User },
            ].map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors',
                  formData.gender === option.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted'
                )}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="sr-only"
                />
                <option.icon className="w-4 h-4" />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Birthday */}
        <div>
          <label className="text-sm font-medium mb-1 block">生日</label>
          <input
            type="date"
            value={formData.birthday}
            onChange={(e) => handleChange('birthday', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm font-medium mb-1 block">个人简介</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="介绍一下自己..."
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 border border-input rounded-lg resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {formData.bio.length}/200
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
}
