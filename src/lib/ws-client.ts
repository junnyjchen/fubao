/**
 * WebSocket 客户端工具
 * 标准：所有 WebSocket 连接必须通过此模块
 */

export interface WsMessage {
  type: string;
  data?: unknown;
  payload?: unknown;
}

export interface WsConnection {
  send: (msg: WsMessage) => void;
  close: () => void;
  isConnected: boolean;
}

interface WsConnectionOptions {
  url?: string;
  path?: string;
  onMessage: (msg: WsMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
}

/**
 * 创建 WebSocket 连接
 * 标准复用方法，禁止各组件自行 new WebSocket()
 */
export function createWsConnection(options: WsConnectionOptions): WsConnection {
  const {
    url = `${typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws'}://${typeof window !== 'undefined' ? window.location.host : 'localhost'}:5000/ws`,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
  } = options;

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let shouldReconnect = reconnect;
  let connected = false;

  function connect() {
    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        connected = true;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          onMessage(msg);
        } catch {
          // 非JSON消息忽略
        }
      };

      ws.onclose = () => {
        connected = false;
        onClose?.();
        if (shouldReconnect) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => {
        onError?.(error);
      };
    } catch {
      if (shouldReconnect) {
        reconnectTimer = setTimeout(connect, 5000);
      }
    }
  }

  connect();

  return {
    send: (msg: WsMessage) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      }
    },
    close: () => {
      shouldReconnect = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    },
    get isConnected() {
      return connected;
    },
  };
}
