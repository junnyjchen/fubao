/**
 * @fileoverview WebSocket 通知处理器
 * @description 处理实时消息推送
 * @module ws-handlers/notifications
 */

import { WebSocket, type WebSocketServer } from 'ws';
import type { WsMessage } from '../lib/ws-client';

// 存储用户ID与WebSocket连接的映射
const userConnections = new Map<number, Set<WebSocket>>();

export function setupNotificationsHandler(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req) => {
    // 从URL参数中获取用户ID（如果有）
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (userId) {
      const uid = parseInt(userId, 10);
      if (!userConnections.has(uid)) {
        userConnections.set(uid, new Set());
      }
      userConnections.get(uid)!.add(ws);

      // 连接关闭时移除
      ws.on('close', () => {
        const conns = userConnections.get(uid);
        if (conns) {
          conns.delete(ws);
          if (conns.size === 0) {
            userConnections.delete(uid);
          }
        }
      });
    }

    ws.on('message', (raw) => {
      try {
        const msg: WsMessage = JSON.parse(raw.toString());

        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', payload: null }));
          return;
        }

        // 处理其他消息类型
        switch (msg.type) {
          case 'subscribe':
            // 订阅特定类型的消息
            break;
          case 'unsubscribe':
            // 取消订阅
            break;
          default:
            console.log('[WS] Unknown message type:', msg.type);
        }
      } catch (error) {
        console.error('[WS] Failed to handle message:', error);
      }
    });

    // 发送欢迎消息
    ws.send(
      JSON.stringify({
        type: 'connected',
        payload: { message: 'WebSocket连接成功' },
      })
    );
  });
}

/**
 * 向特定用户发送通知
 */
export function sendNotificationToUser(userId: number, notification: unknown) {
  const conns = userConnections.get(userId);
  if (conns) {
    const message = JSON.stringify({
      type: 'notification',
      payload: notification,
    });
    conns.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}

/**
 * 向所有连接的用户广播消息
 */
export function broadcastNotification(notification: unknown) {
  const message = JSON.stringify({
    type: 'broadcast',
    payload: notification,
  });
  userConnections.forEach((conns) => {
    conns.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  });
}
