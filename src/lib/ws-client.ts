/**
 * @fileoverview WebSocket 客户端工具
 * @description 提供WebSocket连接管理功能
 * @module lib/ws-client
 */

export interface WsMessage<T = unknown> {
  type: string;
  payload: T;
}

interface WsOptions {
  path: string; // 例如 '/ws/notifications'
  onMessage: (msg: WsMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean; // 默认: true
  heartbeatMs?: number; // 默认: 30000
}

export function createWsConnection(opts: WsOptions): {
  send: (msg: WsMessage) => void;
  close: () => void;
  isConnected: () => boolean;
} {
  const {
    path,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    heartbeatMs = 30000,
  } = opts;
  let ws: WebSocket;
  let heartbeatTimer: ReturnType<typeof setInterval>;
  let closed = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  function connect() {
    if (typeof window === 'undefined') return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${location.host}${path}`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`[WS] Connected to ${path}`);
        reconnectAttempts = 0;
        // 发送心跳
        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', payload: null }));
          }
        }, heartbeatMs);
        onOpen?.();
      };

      ws.onmessage = (e) => {
        try {
          const msg: WsMessage = JSON.parse(e.data);
          if (msg.type === 'pong') return;
          onMessage(msg);
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error(`[WS] Error on ${path}:`, error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log(`[WS] Disconnected from ${path}`);
        clearInterval(heartbeatTimer);
        onClose?.();

        // 自动重连
        if (reconnect && !closed && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(
            `[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`
          );
          setTimeout(connect, delay);
        }
      };
    } catch (error) {
      console.error('[WS] Failed to create connection:', error);
    }
  }

  connect();

  return {
    send: (msg) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      } else {
        console.warn('[WS] Cannot send message, connection not open');
      }
    },
    close: () => {
      closed = true;
      clearInterval(heartbeatTimer);
      if (ws) {
        ws.close();
      }
    },
    isConnected: () => ws && ws.readyState === WebSocket.OPEN,
  };
}
