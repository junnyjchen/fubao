/**
 * @fileoverview WebSocket Hook
 * @description React Hook for WebSocket connections
 * @module hooks/useWebSocket
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createWsConnection, type WsMessage } from '@/lib/ws-client';

interface UseWebSocketOptions {
  path: string;
  onMessage: (msg: WsMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

export function useWebSocket({
  path,
  onMessage,
  onOpen,
  onClose,
  onError,
  enabled = true,
}: UseWebSocketOptions) {
  const connRef = useRef<ReturnType<typeof createWsConnection> | null>(null);
  const onMessageRef = useRef(onMessage);

  // 保持回调引用最新
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    connRef.current = createWsConnection({
      path,
      onMessage: (msg) => onMessageRef.current(msg),
      onOpen,
      onClose,
      onError,
    });

    return () => {
      connRef.current?.close();
    };
  }, [path, enabled, onOpen, onClose, onError]);

  const send = useCallback((msg: WsMessage) => {
    connRef.current?.send(msg);
  }, []);

  const isConnected = useCallback(() => {
    return connRef.current?.isConnected() ?? false;
  }, []);

  return { send, isConnected };
}

/**
 * 使用实时通知的Hook
 */
export function useNotifications(userId: number | null) {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: string;
      title: string;
      content: string;
      createdAt: string;
      read: boolean;
    }>
  >([]);

  const { send, isConnected } = useWebSocket({
    path: userId ? `/ws/notifications?userId=${userId}` : '/ws/notifications',
    onMessage: (msg) => {
      if (msg.type === 'notification' || msg.type === 'broadcast') {
        const notification = msg.payload as {
          id: string;
          type: string;
          title: string;
          content: string;
          createdAt: string;
        };
        setNotifications((prev) => [
          {
            ...notification,
            read: false,
          },
          ...prev,
        ]);
      }
    },
    enabled: !!userId,
  });

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    send,
    isConnected,
    markAsRead,
    clearAll,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}
