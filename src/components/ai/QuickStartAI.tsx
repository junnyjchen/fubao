'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Bot,
  Sparkles,
  MessageSquare,
  BookOpen,
  ShoppingBag,
  Wand2,
  Sparkle,
  ArrowRight,
  Loader2,
  Send,
  X,
} from 'lucide-react';

// 快速提问选项
const QUICK_OPTIONS = [
  {
    id: 'culture',
    icon: BookOpen,
    label: '文化科普',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    questions: ['什麼是符籙？', '道教的起源', '風水命理基礎'],
  },
  {
    id: 'product',
    icon: ShoppingBag,
    label: '商品諮詢',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    questions: ['如何選擇符？', '一物一證是什麼？', '符的有效期限'],
  },
  {
    id: 'usage',
    icon: Wand2,
    label: '使用指導',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    questions: ['如何佩戴護身符？', '符籙禁忌', '符水使用'],
  },
  {
    id: 'fortune',
    icon: Sparkle,
    label: '命理諮詢',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    questions: ['八字命盤', '五行缺失', '流年運勢'],
  },
];

interface QuickStartAIProps {
  variant?: 'card' | 'inline' | 'minimal';
  onQuestionClick?: (question: string) => void;
  className?: string;
}

export function QuickStartAI({
  variant = 'card',
  onQuestionClick,
  className,
}: QuickStartAIProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const currentOption = QUICK_OPTIONS.find((opt) => opt.id === selectedOption);

  const handleQuestionClick = async (question: string) => {
    if (onQuestionClick) {
      onQuestionClick(question);
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: question }],
        }),
      });

      if (!res.ok) throw new Error('請求失敗');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('無法讀取響應');

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
                setResponse(accumulatedContent);
              }
            } catch {
              // 忽略解析錯誤
            }
          }
        }
      }

      if (!accumulatedContent) {
        setResponse('抱歉，暫時無法回答這個問題，請稍後再試。');
      }
    } catch (err) {
      console.error('請求失敗:', err);
      setResponse('網絡發生錯誤，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      handleQuestionClick(input.trim());
    }
  };

  // Card variant
  if (variant === 'card') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">AI 智能助手</CardTitle>
                <p className="text-sm text-muted-foreground">快速解答您的疑問</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              在線
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* 选项网格 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {QUICK_OPTIONS.map((opt) => (
              <Button
                key={opt.id}
                variant="outline"
                className={cn(
                  'h-auto py-3 px-3 flex-col gap-1 justify-start items-start',
                  selectedOption === opt.id && 'border-primary bg-primary/5'
                )}
                onClick={() => {
                  setSelectedOption(selectedOption === opt.id ? null : opt.id);
                  setResponse(null);
                }}
              >
                <opt.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{opt.label}</span>
              </Button>
            ))}
          </div>

          {/* 问题列表 */}
          {currentOption && (
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <currentOption.icon className="w-4 h-4" />
                {currentOption.label}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {currentOption.questions.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto py-2 px-3 text-left text-xs"
                    onClick={() => handleQuestionClick(q)}
                  >
                    <MessageSquare className="w-3 h-3 mr-2 shrink-0 text-muted-foreground" />
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 响应显示 */}
          {response && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1 flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                AI 回覆
              </p>
              <p className="text-muted-foreground whitespace-pre-wrap">{response}</p>
            </div>
          )}

          {/* 输入框 */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="輸入您的問題..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border bg-background"
              disabled={isLoading}
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">有疑問？問問 AI</h3>
            <p className="text-sm text-muted-foreground">快速獲取專業解答</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_OPTIONS.slice(0, 3).map((opt) => (
            <Button
              key={opt.id}
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => handleQuestionClick(opt.questions[0])}
            >
              <opt.icon className="w-3 h-3" />
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Minimal variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {QUICK_OPTIONS.slice(0, 4).map((opt) => (
        <button
          key={opt.id}
          onClick={() => handleQuestionClick(opt.questions[0])}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            opt.color,
            'hover:opacity-80'
          )}
        >
          <opt.icon className="w-3 h-3" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// AI 功能介绍卡片
export function AIAbilityCard() {
  const abilities = [
    {
      icon: BookOpen,
      title: '文化科普',
      description: '解答符籙、法器、風水等傳統文化知識',
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      icon: ShoppingBag,
      title: '商品顧問',
      description: '根據您的需求推薦合適的符籙和法器',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      icon: Wand2,
      title: '使用指導',
      description: '提供正確的佩戴方式和使用禁忌',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      icon: Sparkle,
      title: '命理諮詢',
      description: '分析八字命盤、五行屬性、流年運勢',
      color: 'bg-purple-500/10 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {abilities.map((ability, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-3', ability.color)}>
            <ability.icon className="w-6 h-6" />
          </div>
          <h4 className="font-medium mb-1">{ability.title}</h4>
          <p className="text-xs text-muted-foreground">{ability.description}</p>
        </div>
      ))}
    </div>
  );
}
