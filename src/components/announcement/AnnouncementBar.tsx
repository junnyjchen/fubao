/**
 * @fileoverview 公告滚动条组件
 * @description 在页面顶部显示滚动公告
 * @module components/announcement/AnnouncementBar
 */

'use client';

import { useState, useEffect } from 'react';
import { Megaphone, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 公告数据类型 */
interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'notice' | 'activity' | 'update' | 'warning';
  is_pinned: boolean;
}

/** 公告类型样式 */
const typeStyles = {
  notice: 'bg-blue-500',
  activity: 'bg-green-500',
  update: 'bg-purple-500',
  warning: 'bg-red-500',
};

interface AnnouncementBarProps {
  className?: string;
}

/**
 * 公告滚动条组件
 */
export function AnnouncementBar({ className }: AnnouncementBarProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // 自动轮播
  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [announcements.length]);

  /**
   * 加载公告
   */
  const loadAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements?limit=5');
      const data = await res.json();
      setAnnouncements(data.data || []);
    } catch (error) {
      console.error('加载公告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 不显示的情况
  if (loading || !visible || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex];

  return (
    <div
      className={cn(
        'relative bg-primary/5 border-b overflow-hidden',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 py-2">
          {/* 图标 */}
          <div
            className={cn(
              'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white',
              typeStyles[current.type]
            )}
          >
            <Megaphone className="w-3 h-3" />
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 animate-marquee">
              <span className="font-medium text-sm whitespace-nowrap">
                {current.title}
              </span>
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {current.content}
              </span>
            </div>
          </div>

          {/* 指示器 */}
          {announcements.length > 1 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {announcements.map((_, idx) => (
                <button
                  key={idx}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    idx === currentIndex
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={() => setVisible(false)}
            className="flex-shrink-0 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 公告弹窗组件
 */
export function AnnouncementDialog() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // 检查是否需要显示公告弹窗（首次访问时）
    const hasShownAnnouncement = localStorage.getItem('hasShownAnnouncement');
    if (!hasShownAnnouncement) {
      loadAnnouncements();
    }
  }, []);

  /**
   * 加载公告
   */
  const loadAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements?limit=3');
      const data = await res.json();
      
      if (data.data && data.data.length > 0) {
        setAnnouncements(data.data);
        setShowDialog(true);
        localStorage.setItem('hasShownAnnouncement', 'true');
      }
    } catch (error) {
      console.error('加载公告失败:', error);
    }
  };

  /**
   * 关闭弹窗
   */
  const handleClose = () => {
    setShowDialog(false);
  };

  if (!showDialog || announcements.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* 头部 */}
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            <h3 className="font-semibold">平台公告</h3>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white mt-0.5',
                    typeStyles[announcement.type]
                  )}
                >
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {announcement.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
