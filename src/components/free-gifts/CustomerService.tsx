/**
 * @fileoverview 客服咨询入口组件
 * @description 提供在线客服入口
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Send,
  HelpCircle,
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomerServiceProps {
  variant?: 'button' | 'fab' | 'card';
  showPhone?: boolean;
  showEmail?: boolean;
}

const faqList = [
  {
    q: '如何領取免費商品？',
    a: '選擇商品後，填寫領取信息即可。支持郵寄（付運費）或到店自取（免費）。',
  },
  {
    q: '郵費是多少？',
    a: '郵費根據商品不同而異，一般在HK$15-25之間。具體費用在商品詳情頁顯示。',
  },
  {
    q: '領取碼有效期多久？',
    a: '領取碼有效期為7天，請在有效期內完成領取，逾期將自動取消。',
  },
  {
    q: '可以取消領取嗎？',
    a: '在未支付運費前可以取消。已支付的訂單需要聯繫客服處理退款。',
  },
];

export function CustomerService({
  variant = 'fab',
  showPhone = true,
  showEmail = true,
}: CustomerServiceProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { role: 'bot', content: '您好！我是符寶網客服助手，有什麼可以幫您的嗎？' },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    setMessages([...messages, { role: 'user', content: message }]);
    setMessage('');

    // 模拟自动回复
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: '感謝您的留言！我們的客服人員將在1-2個工作日內回覆您。如需緊急協助，請致電：+852 1234 5678',
        },
      ]);
    }, 1000);
  };

  const handleCall = () => {
    toast.success('正在撥打客服熱線...');
    // window.location.href = 'tel:+85212345678';
  };

  if (variant === 'button') {
    return (
      <>
        <Button variant="outline" onClick={() => setShowDialog(true)}>
          <MessageCircle className="w-4 h-4 mr-2" />
          聯繫客服
        </Button>
        <CustomerServiceDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          showPhone={showPhone}
          showEmail={showEmail}
          showChat={showChat}
          onShowChat={() => setShowChat(true)}
          messages={messages}
          message={message}
          onMessageChange={setMessage}
          onSendMessage={handleSendMessage}
          onCall={handleCall}
        />
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowDialog(true)}
        >
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">在線客服</p>
                  <p className="text-sm text-muted-foreground">工作時間 9:00-21:00</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <CustomerServiceDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          showPhone={showPhone}
          showEmail={showEmail}
          showChat={showChat}
          onShowChat={() => setShowChat(true)}
          messages={messages}
          message={message}
          onMessageChange={setMessage}
          onSendMessage={handleSendMessage}
          onCall={handleCall}
        />
      </>
    );
  }

  // FAB (Floating Action Button)
  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      <CustomerServiceDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        showPhone={showPhone}
        showEmail={showEmail}
        showChat={showChat}
        onShowChat={() => setShowChat(true)}
        messages={messages}
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        onCall={handleCall}
      />
    </>
  );
}

/**
 * 客服对话框
 */
function CustomerServiceDialog({
  open,
  onOpenChange,
  showPhone,
  showEmail,
  showChat,
  onShowChat,
  messages,
  message,
  onMessageChange,
  onSendMessage,
  onCall,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showPhone: boolean;
  showEmail: boolean;
  showChat: boolean;
  onShowChat: () => void;
  messages: { role: 'user' | 'bot'; content: string }[];
  message: string;
  onMessageChange: (msg: string) => void;
  onSendMessage: () => void;
  onCall: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            客服中心
          </DialogTitle>
          <DialogDescription>
            我們隨時為您服務
          </DialogDescription>
        </DialogHeader>

        {showChat ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 输入框 */}
            <div className="flex gap-2 pt-3 border-t">
              <Input
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="輸入您的問題..."
                onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                className="flex-1"
              />
              <Button onClick={onSendMessage} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {/* 快速入口 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onShowChat}
                className="p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-left"
              >
                <MessageCircle className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium text-sm">在線諮詢</p>
                <p className="text-xs text-muted-foreground">即時回覆</p>
              </button>
              
              {showPhone && (
                <button
                  onClick={onCall}
                  className="p-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors text-left"
                >
                  <Phone className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-medium text-sm">電話客服</p>
                  <p className="text-xs text-muted-foreground">+852 1234 5678</p>
                </button>
              )}
            </div>

            {/* 工作时间 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>服務時間：週一至週日 9:00-21:00</span>
            </div>

            {/* 常见问题 */}
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                常見問題
              </p>
              <div className="space-y-2">
                {faqList.slice(0, 3).map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onMessageChange(faq.q);
                      onShowChat();
                    }}
                    className="w-full p-3 bg-muted/50 rounded-lg text-left text-sm hover:bg-muted transition-colors"
                  >
                    {faq.q}
                  </button>
                ))}
              </div>
            </div>

            {/* 邮箱 */}
            {showEmail && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>service@fubaowang.com</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * 帮助提示卡片
 */
export function HelpTipCard({
  title,
  content,
  onHelpClick,
}: {
  title: string;
  content: string;
  onHelpClick?: () => void;
}) {
  return (
    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200/50">
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm text-blue-800 dark:text-blue-200">{title}</p>
            <p className="text-sm text-blue-600/80 dark:text-blue-300/80 mt-0.5">{content}</p>
          </div>
          {onHelpClick && (
            <Button variant="ghost" size="sm" onClick={onHelpClick}>
              幫助
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
