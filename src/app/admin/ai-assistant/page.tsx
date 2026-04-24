'use client';

import { useState } from 'react';
import { AIChat } from '@/components/ai/AIChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import {
  Bot,
  Sparkles,
  BookOpen,
  Shield,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  HelpCircle,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

// 管理员预设问题
const ADMIN_PRESETS = [
  {
    category: '運營幫助',
    icon: Sparkles,
    color: 'text-purple-600',
    items: [
      { q: '如何創建促銷活動？', a: '前往 優惠券管理 > 創建優惠券，設置優惠碼、折扣力度、使用期限等參數。' },
      { q: '如何分析銷售數據？', a: '在 財務管理 > 銷售統計 中查看訂單趨勢、暢銷商品榜單。' },
      { q: '如何管理商品分類？', a: '前往 分類管理 添加/編輯分類，支持多級分類結構。' },
    ],
  },
  {
    category: '訂單處理',
    icon: ShoppingCart,
    color: 'text-blue-600',
    items: [
      { q: '如何處理退款申請？', a: '在 訂單管理 中找到目標訂單，點擊「退款處理」按鈕，審核通過後款項將原路退回。' },
      { q: '如何查看物流信息？', a: '訂單詳情頁展示物流軌跡，也可使用物流查詢工具追蹤包裹。' },
      { q: '如何批量導出訂單？', a: '訂單列表支持按時間範圍篩選，點擊「導出」按鈕下載CSV文件。' },
    ],
  },
  {
    category: '用戶管理',
    icon: Users,
    color: 'text-green-600',
    items: [
      { q: '如何查看用戶列表？', a: '前往 用戶管理 查看所有註冊用戶，支持按手機/郵箱搜索。' },
      { q: '如何禁用問題用戶？', a: '在用戶詳情頁可設置賬號狀態為「禁用」，該用戶將無法登錄。' },
      { q: '如何查看用戶消費記錄？', a: '用戶詳情頁展示該用戶的所有訂單、優惠券使用情況。' },
    ],
  },
  {
    category: '內容管理',
    icon: FileText,
    color: 'text-orange-600',
    items: [
      { q: '如何發布公告？', a: '前往 公告管理 > 創建公告，編輯標題、內容、置頂狀態。' },
      { q: '如何管理Banner？', a: '在 輪播圖管理 添加圖片，設置跳轉鏈接、展示順序、上下線時間。' },
      { q: '如何使用AI生成內容？', a: '前往 AI內容生成，輸入關鍵詞或描述，AI將為您生成商品描述、文章等內容。' },
    ],
  },
  {
    category: '安全合規',
    icon: Shield,
    color: 'text-red-600',
    items: [
      { q: '如何設置管理員權限？', a: '超級管理員可在 系統設置 > 角色管理 中配置不同角色的權限。' },
      { q: '如何審核商家入駐？', a: '在 商戶審核 查看入駐申請，審核資質證書、營業執照等信息。' },
      { q: '如何處理舉報投訴？', a: '在 反饋管理 查看用戶舉報，根據實際情況進行處理並回覆。' },
    ],
  },
  {
    category: '系統設置',
    icon: Settings,
    color: 'text-gray-600',
    items: [
      { q: '如何修改網站Logo？', a: '前往 系統設置 > 基本設置 上傳新的Logo圖片。' },
      { q: '如何配置支付方式？', a: '在 系統設置 > 支付設置 開啟/關閉支付渠道，配置API密鑰。' },
      { q: '如何備份數據庫？', a: '在 數據管理 > 備份還原 中手動備份或設置自動備份計劃。' },
    ],
  },
];

export default function AdminAIAssistantPage() {
  const [quickHelp, setQuickHelp] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<{ q: string; a: string } | null>(null);

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4">
      {/* 左侧快捷帮助面板 */}
      {quickHelp && (
        <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                快速幫助
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuickHelp(false)}
              >
                隱藏
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="space-y-4 p-4">
              {ADMIN_PRESETS.map((section) => (
                <div key={section.category}>
                  <div className={`flex items-center gap-2 mb-2 text-sm font-medium ${section.color}`}>
                    <section.icon className="w-4 h-4" />
                    {section.category}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPreset(item)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-colors"
                      >
                        {item.q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-4 border-t bg-muted/30">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/ai-assistant" target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                用戶端AI助手
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* 主聊天區域 */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* 頂部工具欄 */}
        <CardHeader className="flex-shrink-0 border-b py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  管理員AI助手
                  <Badge variant="secondary" className="text-xs">後台專用</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  快速解答後台操作問題
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!quickHelp && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickHelp(true)}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  顯示幫助
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/ai-training">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI訓練
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* 選擇的預設答案 */}
        {selectedPreset && (
          <div className="flex-shrink-0 px-4 py-3 bg-muted/30 border-b">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">您選擇的問題：{selectedPreset.q}</p>
                <p className="text-sm text-muted-foreground">{selectedPreset.a}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPreset(null)}
              >
                知道了
              </Button>
            </div>
          </div>
        )}

        {/* AI聊天組件 */}
        <CardContent className="flex-1 p-0">
          <AIChat adminMode={true} />
        </CardContent>
      </Card>
    </div>
  );
}
