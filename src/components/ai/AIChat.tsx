'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/format';
import {
  Bot,
  User,
  Send,
  Trash2,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Share2,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Settings,
  History,
  MessageSquare,
  Search,
  MoreHorizontal,
  Download,
  ChevronDown,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Pin,
  X,
  AlertCircle,
  BookOpen,
  ShoppingBag,
  Sparkle,
  CopyPlus,
  MessageCircle,
  FileText,
  Wand2,
} from 'lucide-react';

// 消息类型
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'streaming' | 'done' | 'error';
  feedback?: 'like' | 'dislike' | null;
  attachments?: { type: string; url: string }[];
}

// 会话类型
export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
}

// 预设问题分类
const PRESET_CATEGORIES = [
  {
    id: 'culture',
    name: '文化科普',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'bg-amber-500/10 text-amber-500',
    questions: [
      '什麼是符籙？',
      '道教的起源與發展',
      '風水命理的基礎概念',
      '常見的護身符有哪些？',
      '符籙的歷史演變',
    ],
  },
  {
    id: 'product',
    name: '商品諮詢',
    icon: <ShoppingBag className="w-4 h-4" />,
    color: 'bg-blue-500/10 text-blue-500',
    questions: [
      '如何選擇適合自己的符？',
      '一物一證是什麼意思？',
      '符寶網的商品如何保證真實性？',
      '符籙的有效期限是多久？',
      '哪些符可以放在車上？',
    ],
  },
  {
    id: 'usage',
    name: '使用指導',
    icon: <Wand2 className="w-4 h-4" />,
    color: 'bg-green-500/10 text-green-500',
    questions: [
      '如何正確佩戴護身符？',
      '符籙使用時有哪些禁忌？',
      '符水如何使用？',
      '符籙需要開光嗎？',
      '多個符可以一起佩戴嗎？',
    ],
  },
  {
    id: 'fortune',
    name: '命理諮詢',
    icon: <Sparkle className="w-4 h-4" />,
    color: 'bg-purple-500/10 text-purple-500',
    questions: [
      '八字命盤怎麼看？',
      '五行缺什麼如何補？',
      '流年運勢如何計算？',
      '如何選擇吉日？',
    ],
  },
];

// 快速动作
const QUICK_ACTIONS = [
  { id: 'explain', label: '解釋這個概念', icon: <FileText className="w-4 h-4" /> },
  { id: 'compare', label: '比較一下', icon: <MessageCircle className="w-4 h-4" /> },
  { id: 'recommend', label: '推薦合適的', icon: <Sparkle className="w-4 h-4" /> },
];

// 本地存储键名
const STORAGE_KEY_CONVERSATIONS = 'fubao_ai_conversations';
const STORAGE_KEY_CURRENT_ID = 'fubao_ai_current_conversation_id';
const STORAGE_KEY_THEME = 'fubao_ai_theme';

// 生成唯一ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// 格式化时间
const formatMessageTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return '剛剛';
  if (minutes < 60) return `${minutes}分鐘前`;
  if (hours < 24) return `${hours}小時前`;
  return date.toLocaleDateString('zh-TW');
};

// Markdown简化渲染
const renderMarkdown = (text: string): string => {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg overflow-x-auto my-2 text-sm"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n/g, '<br />');

  return html;
};

// 打字动画
const TypingIndicator = () => (
  <div className="flex items-center gap-1">
    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

export function AIChat() {
  // 状态
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { success, error } = useToast();

  // 获取当前会话
  const currentConversation = useMemo(() => {
    return conversations.find((c) => c.id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  // 加载会话历史
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      const currentId = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);

      if (stored) {
        const parsed = JSON.parse(stored);
        setConversations(
          parsed.map((c: AIConversation) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
            messages: c.messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          }))
        );

        if (currentId && parsed.find((c: AIConversation) => c.id === currentId)) {
          setCurrentConversationId(currentId);
        } else if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id);
        }
      }

      if (savedTheme) {
        setTheme(savedTheme as 'light' | 'dark');
      }
    } catch (e) {
      console.error('加载会话历史失败:', e);
    }
  }, []);

  // 保存会话历史
  const saveConversations = useCallback((newConversations: AIConversation[]) => {
    setConversations(newConversations);
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(newConversations));
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (currentConversation?.messages.length) {
      scrollToBottom();
    }
  }, [currentConversation?.messages.length, scrollToBottom]);

  // 检测滚动位置
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  }, []);

  // 创建新会话
  const createNewConversation = useCallback(() => {
    const newConversation: AIConversation = {
      id: generateId(),
      title: '新對話',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    saveConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    localStorage.setItem(STORAGE_KEY_CURRENT_ID, newConversation.id);
    setShowHistory(false);
    setShowPresets(true);
    setShowSearch(false);
  }, [conversations, saveConversations]);

  // 切换会话
  const switchConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
    localStorage.setItem(STORAGE_KEY_CURRENT_ID, id);
    setShowHistory(false);
    setShowPresets(currentConversation?.messages.length === 0);
    setShowSearch(false);
  }, [currentConversation]);

  // 删除会话
  const deleteConversation = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newConversations = conversations.filter((c) => c.id !== id);
    saveConversations(newConversations);

    if (currentConversationId === id) {
      const nextConversation = newConversations[0] || null;
      setCurrentConversationId(nextConversation?.id || null);
      if (nextConversation) {
        localStorage.setItem(STORAGE_KEY_CURRENT_ID, nextConversation.id);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_ID);
      }
    }
    success('已刪除對話');
  }, [conversations, currentConversationId, saveConversations, success]);

  // 发送消息
  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    let conversation = currentConversation;

    if (!conversation) {
      conversation = {
        id: generateId(),
        title: text.slice(0, 20) + (text.length > 20 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      saveConversations([conversation, ...conversations]);
      setCurrentConversationId(conversation.id);
      localStorage.setItem(STORAGE_KEY_CURRENT_ID, conversation.id);
    }

    const userMessage: AIMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      status: 'done',
    };

    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: new Date(),
      title: conversation.messages.length === 0 ? text.slice(0, 20) + (text.length > 20 ? '...' : '') : conversation.title,
    };

    const newConversations = conversations.map((c) =>
      c.id === conversation!.id ? updatedConversation : c
    );
    saveConversations(newConversations);
    setCurrentConversationId(updatedConversation.id);

    setInput('');
    setIsLoading(true);
    setShowPresets(false);

    const aiMessageId = generateId();
    const aiMessage: AIMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'streaming',
    };

    const finalMessages = [...updatedMessages, aiMessage];
    const finalConversation = {
      ...updatedConversation,
      messages: finalMessages,
    };

    const finalConversations = newConversations.map((c) =>
      c.id === updatedConversation.id ? finalConversation : c
    );
    saveConversations(finalConversations);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('網絡請求失敗');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('無法讀取響應');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedContent += parsed.content;

                const streamConversations = finalConversations.map((c) =>
                  c.id === finalConversation.id
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === aiMessageId
                            ? { ...m, content: accumulatedContent, status: 'streaming' as const }
                            : m
                        ),
                      }
                    : c
                );
                saveConversations(streamConversations);
              }
              if (parsed.error) {
                accumulatedContent = `抱歉，${parsed.error}`;
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      const doneConversations = finalConversations.map((c) =>
        c.id === finalConversation.id
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === aiMessageId
                  ? { ...m, content: accumulatedContent || '抱歉，我暫時無法回答這個問題，請稍後再試。', status: 'done' as const }
                  : m
              ),
            }
          : c
      );
      saveConversations(doneConversations);

      if (!isMuted) {
        // 播放提示音
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleUMhWYiuz9J3WjA1jLz06qJwOTmVwPL5yXxwZoGtz+jPtGVyYoq42+y2nYpbWbK43+u5qJdYV7K74Oy6qZlXWbC64uy7qZpZVrG74uy7qZpZVrG74uy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7qZpZV7K74Oy7');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      const errorConversations = finalConversations.map((c) =>
        c.id === finalConversation.id
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === aiMessageId
                  ? { ...m, content: '抱歉，網絡發生錯誤，請稍後再試。', status: 'error' as const }
                  : m
              ),
            }
          : c
      );
      saveConversations(errorConversations);
      error('網絡發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 清空当前对话
  const clearCurrentConversation = () => {
    if (!currentConversation) return;
    const updated = {
      ...currentConversation,
      messages: [],
      updatedAt: new Date(),
    };
    const newConversations = conversations.map((c) =>
      c.id === currentConversation.id ? updated : c
    );
    saveConversations(newConversations);
    setShowPresets(true);
    success('已清空對話');
  };

  // 复制消息
  const copyMessage = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    success('已複製到剪貼簿');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 反馈
  const giveFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    if (!currentConversation) return;

    const updated = currentConversation.messages.map((m) =>
      m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m
    );

    const newConversations = conversations.map((c) =>
      c.id === currentConversation.id ? { ...c, messages: updated } : c
    );
    saveConversations(newConversations);
    success(feedback === 'like' ? '感謝您的肯定' : '感謝您的反饋');
  };

  // 导出对话
  const exportConversation = () => {
    if (!currentConversation) return;
    const text = currentConversation.messages
      .map((m) => `${m.role === 'user' ? '用戶' : 'AI'}: ${m.content}`)
      .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `對話_${new Date().toLocaleDateString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    success('對話已導出');
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 搜索消息
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim() || !currentConversation) return null;
    return currentConversation.messages.filter((m) =>
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, currentConversation]);

  return (
    <div className="flex flex-col h-[600px] md:h-[700px]">
      {/* Header */}
      <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">符寶AI助手</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {isLoading ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    思考中...
                  </>
                ) : currentConversation?.messages.length ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    在線
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                    就緒
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              title="搜索"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              title="對話記錄"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              title="設置"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={createNewConversation}
              title="新建對話"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 搜索栏 */}
        {showSearch && (
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索對話內容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollRef} onScroll={handleScroll}>
          {showPresets && (!currentConversation || currentConversation.messages.length === 0) ? (
            <WelcomeScreen onSelectQuestion={sendMessage} />
          ) : filteredMessages !== null && filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">沒有找到匹配的內容</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(filteredMessages || currentConversation?.messages || []).map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onCopy={() => copyMessage(message.content, message.id)}
                  onFeedback={(fb) => giveFeedback(message.id, fb)}
                  isCopied={copiedId === message.id}
                  onContextMenu={(x, y) => setContextMenu({ x, y, messageId: message.id })}
                />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* 滚动到底部按钮 */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 w-10 h-10 rounded-full bg-background border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </CardContent>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t bg-background/80 backdrop-blur">
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入您的問題..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="h-[44px] w-[44px]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            按 Enter 發送，Shift + Enter 換行
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? '開啟提示音' : '靜音'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="對話記錄">
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">暫無對話記錄</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => switchConversation(conv.id)}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                  conv.id === currentConversationId
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {conv.messages.length} 條消息 · {formatMessageTime(conv.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentConversationId(conv.id);
                      exportConversation();
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="設置">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">提示音</p>
              <p className="text-sm text-muted-foreground">收到回覆時播放提示音</p>
            </div>
            <Button
              variant={isMuted ? 'outline' : 'default'}
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? '靜音' : '開啟'}
            </Button>
          </div>
          <div className="border-t pt-4">
            <Button variant="outline" className="w-full" onClick={clearCurrentConversation}>
              <Trash2 className="w-4 h-4 mr-2" />
              清空當前對話
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// 欢迎界面
function WelcomeScreen({ onSelectQuestion }: { onSelectQuestion: (q: string) => void }) {
  const [activeCategory, setActiveCategory] = useState(PRESET_CATEGORIES[0].id);
  const currentCategory = PRESET_CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">歡迎使用符寶AI助手</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        我可以為您解答玄門文化、符籙法器、風水命理等問題，也可以幫您了解符寶網的商品和服務。
      </p>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESET_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
            className="gap-1"
          >
            {cat.icon}
            {cat.name}
          </Button>
        ))}
      </div>

      {/* 问题列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
        {currentCategory.questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start h-auto py-3 px-4 text-left"
            onClick={() => onSelectQuestion(question)}
          >
            <MessageSquare className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm">{question}</span>
          </Button>
        ))}
      </div>

      {/* 快捷提示 */}
      <p className="text-xs text-muted-foreground mt-6">
        嘗試描述您的問題，我會尽力為您解答
      </p>
    </div>
  );
}

// 消息气泡
interface MessageBubbleProps {
  message: AIMessage;
  onCopy: () => void;
  onFeedback: (fb: 'like' | 'dislike') => void;
  isCopied: boolean;
  onContextMenu?: (x: number, y: number) => void;
}

function MessageBubble({ message, onCopy, onFeedback, isCopied, onContextMenu }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';

  return (
    <div
      className={cn('flex gap-3 group', isUser && 'flex-row-reverse')}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.(e.clientX, e.clientY);
      }}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          isUser ? 'bg-primary' : 'bg-gradient-to-br from-primary/20 to-primary/5'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className={cn('max-w-[85%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm'
              : 'bg-muted rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          ) : (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
            />
          )}
          {isStreaming && (
            <span className="inline-block ml-1 animate-pulse">▍</span>
          )}
        </div>

        {/* Actions */}
        {!isUser && message.status === 'done' && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onCopy}
              title="複製"
            >
              {isCopied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-7 w-7', message.feedback === 'like' && 'text-green-500 bg-green-500/10')}
              onClick={() => onFeedback('like')}
              title="贊"
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-7 w-7', message.feedback === 'dislike' && 'text-red-500 bg-red-500/10')}
              onClick={() => onFeedback('dislike')}
              title="踩"
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Time & Status */}
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </p>
          {message.status === 'error' && (
            <Badge variant="destructive" className="text-xs">
              發送失敗
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
