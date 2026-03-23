/**
 * @fileoverview 隐私政策页面
 * @description 网站隐私保护政策
 * @module app/privacy/page
 */

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">隱私政策</h1>
            <p className="text-sm text-muted-foreground">更新日期：2024年1月1日</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <h2>引言</h2>
            <p>
              符寶網（fubao.ltd）非常重視用戶隱私保護。本隱私政策旨在向您說明我們如何收集、
              使用、存儲和保護您的個人信息。請您仔細閱讀本政策，了解我們對您個人信息的處理方式。
            </p>

            <h2>一、我們收集的信息</h2>
            <p>我們可能會收集以下類型的個人信息：</p>
            
            <h3>1.1 註冊信息</h3>
            <ul>
              <li>用戶名、暱稱</li>
              <li>電子郵箱地址</li>
              <li>手機號碼</li>
              <li>密碼（加密存儲）</li>
            </ul>

            <h3>1.2 交易信息</h3>
            <ul>
              <li>訂單信息（商品、金額、時間等）</li>
              <li>收貨地址和聯繫方式</li>
              <li>支付信息（由第三方支付平台處理）</li>
            </ul>

            <h3>1.3 設備信息</h3>
            <ul>
              <li>設備型號、操作系統</li>
              <li>瀏覽器類型和版本</li>
              <li>IP地址</li>
              <li>設備標識符</li>
            </ul>

            <h3>1.4 日誌信息</h3>
            <ul>
              <li>訪問時間、頁面</li>
              <li>搜索記錄</li>
              <li>點擊記錄</li>
            </ul>

            <h2>二、我們如何使用信息</h2>
            <p>我們收集的信息將用於以下目的：</p>
            <ul>
              <li>提供、維護和改進我們的服務</li>
              <li>處理您的訂單和支付</li>
              <li>發送訂單狀態更新和服務通知</li>
              <li>回應您的諮詢和請求</li>
              <li>個性化您的使用體驗</li>
              <li>進行數據分析和研究</li>
              <li>防範欺詐和保障安全</li>
              <li>遵守法律法規要求</li>
            </ul>

            <h2>三、信息共享</h2>
            <p>我們不會向第三方出售您的個人信息。我們可能在以下情況下共享您的信息：</p>
            
            <h3>3.1 獲得您的同意</h3>
            <p>在獲得您明確同意後，我們可能會與第三方共享您的信息。</p>

            <h3>3.2 服務提供商</h3>
            <p>我們可能會與以下類型的服務提供商共享您的信息：</p>
            <ul>
              <li>支付服務提供商（處理支付交易）</li>
              <li>物流服務商（配送商品）</li>
              <li>雲服務提供商（數據存儲和處理）</li>
              <li>分析服務提供商（數據分析）</li>
            </ul>

            <h3>3.3 法律要求</h3>
            <p>如法律法規要求或政府機關依法要求，我們可能會披露您的信息。</p>

            <h2>四、信息安全</h2>
            <p>我們採取多種安全措施保護您的個人信息：</p>
            <ul>
              <li>使用SSL加密傳輸敏感信息</li>
              <li>密碼加密存儲</li>
              <li>限制員工訪問個人信息</li>
              <li>定期安全審計和漏洞修復</li>
              <li>建立應急響應機制</li>
            </ul>

            <h2>五、您的權利</h2>
            <p>您對您的個人信息享有以下權利：</p>
            
            <h3>5.1 訪問權</h3>
            <p>您有權訪問我們持有的您的個人信息。</p>

            <h3>5.2 更正權</h3>
            <p>您有權更正不準確或不完整的個人信息。</p>

            <h3>5.3 刪除權</h3>
            <p>在特定情況下，您有權要求我們刪除您的個人信息。</p>

            <h3>5.4 撤回同意權</h3>
            <p>您可以隨時撤回之前給予的同意。</p>

            <h3>5.5 數據可攜權</h3>
            <p>您有權以結構化、常用格式獲取您的個人信息副本。</p>

            <h2>六、Cookie政策</h2>
            <p>我們使用Cookie和類似技術來：</p>
            <ul>
              <li>記住您的登錄狀態</li>
              <li>保存您的偏好設置</li>
              <li>分析網站流量</li>
              <li>個性化廣告推薦</li>
            </ul>
            <p>您可以通過瀏覽器設置管理Cookie，但這可能影響某些功能的使用。</p>

            <h2>七、兒童隱私保護</h2>
            <p>
              我們的服務不面向18歲以下的未成年人。如果我們發現在未獲得可證實的父母同意的情況下
              收集了未成年人的個人信息，我們會盡快刪除相關信息。
            </p>

            <h2>八、政策更新</h2>
            <p>
              我們可能會不時更新本隱私政策。更新後的政策將在平台公布，建議您定期查看。
              如有重大變更，我們會通過郵件或其他方式通知您。
            </p>

            <h2>九、聯繫我們</h2>
            <p>如果您對本隱私政策有任何疑問或建議，請通過以下方式聯繫我們：</p>
            <ul>
              <li>電子郵箱：privacy@fubao.ltd</li>
              <li>客服熱線：+852 XXXX XXXX</li>
              <li>公司地址：香港九龍XXX大廈XX樓</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/terms">查看用戶協議</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
