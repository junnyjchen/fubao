/**
 * WebSocket 客户端工具
 * 标准：所有 WebSocket 连接必须通过此模块
 * 
 * 重要：当前项目未部署 WebSocket 服务端，所有 WS 连接会静默失败。
 * 通知功能通过 HTTP 轮询降级处理。
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
 * 构造 WebSocket URL
 * 开发环境：ws://localhost:5000/ws
 * 生产环境：wss://{domain}/ws（使用当前页面的协议和主机，不硬编码端口）
 */
function buildWsUrl(path?: string): string {
  if (typeof window === 'undefined') return '';
  
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host; // 生产环境不含端口，开发环境含 :5000
  const wsPath = path || '/ws';
  
  return `${protocol}://${host}${wsPath}`;
}

/**
 * 创建 WebSocket 连接
 * 标准复用方法，禁止各组件自行 new WebSocket()
 * 
 * 当服务端不支持 WebSocket 时，连接会失败并静默降级（不阻塞页面）。
 */
export function createWsConnection(options: WsConnectionOptions): WsConnection {
  const {
    url,
    path,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = false, // 默认关闭自动重连，避免无 WS 服务端时不断重试
  } = options;

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let shouldReconnect = reconnect;
  let connected = false;
  let hasConnected = false; // 是否曾经成功连接过

  const wsUrl = url || buildWsUrl(path);

  function connect() {
    if (!wsUrl) return;
    
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        connected = true;
        hasConnected = true;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          onMessage(msg);
        } catch {
          // 非 JSON 消息忽略
        }
      };

      ws.onclose = () => {
        connected = false;
        onClose?.();
        
        // 只在曾经成功连接过的情况下自动重连
        // 避免服务端不支持 WS 时不断重试
        if (shouldReconnect && hasConnected) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };

      ws.onerror = (error) => {
        onError?.(error);
      };
    } catch {
      // WebSocket 构造失败（如无效 URL），静默处理
    }
  }

  connect();

  return {
    send: (msg: WsMessage) => {
      if (ws && connected) {
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
