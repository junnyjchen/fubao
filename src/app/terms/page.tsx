/**
 * @fileoverview 用户协议页面
 * @description 网站用户服务协议
 * @module app/terms/page
 */

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            <h1 className="text-xl font-bold">用戶服務協議</h1>
            <p className="text-sm text-muted-foreground">更新日期：2024年1月1日</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <h2>一、總則</h2>
            <p>
              歡迎您使用符寶網（fubao.ltd）平台服務。為使用符寶網平台服務（以下簡稱「本服務」），
              您應當閱讀並遵守《用戶服務協議》（以下簡稱「本協議」）。請您務必審慎閱讀、
              充分理解各條款內容，特別是免除或限制責任的相應條款。
            </p>
            <p>
              除非您已閱讀並接受本協議所有條款，否則您無權使用本服務。您使用本服務即視為您已閱讀並同意上述協議的約束。
            </p>

            <h2>二、賬號註冊與使用</h2>
            <p>2.1 用戶在註冊賬號時，應按照頁面提示提供真實、準確、完整的個人資料。</p>
            <p>2.2 用戶應妥善保管賬號及密碼，因賬號密碼泄露造成的損失由用戶自行承擔。</p>
            <p>2.3 用戶不得將賬號轉讓、出借給他人使用，否則承擔由此產生的全部責任。</p>
            <p>2.4 若發現賬號被他人非法使用，應立即通知平台客服。</p>

            <h2>三、用戶行為規範</h2>
            <p>3.1 用戶在使用本服務時，應遵守相關法律法規及本協議的規定。</p>
            <p>3.2 用戶不得利用本服務從事以下活動：</p>
            <ul>
              <li>發布、傳播違法、有害、淫穢、暴力等信息</li>
              <li>侵犯他人知識產權、肖像權、隱私權等合法權益</li>
              <li>從事詐騙、傳銷等違法活動</li>
              <li>惡意攻擊、破壞平台系統或數據</li>
              <li>其他違反法律法規或本協議的行為</li>
            </ul>

            <h2>四、交易規則</h2>
            <p>4.1 用戶在平台下單購買商品，即表示認可商品的描述、價格等信息。</p>
            <p>4.2 訂單支付成功後，商戶應在約定時間內發貨。</p>
            <p>4.3 用戶收到商品後，應及時驗收。如發現商品存在質量問題或與描述不符，可在收貨後7日內申請退換貨。</p>
            <p>4.4 認證商品需保持原包裝和證書完整方可退換。</p>

            <h2>五、知識產權</h2>
            <p>5.1 平台所有內容（包括但不限於文字、圖片、音頻、視頻、軟件等）的知識產權歸平台或相關權利人所有。</p>
            <p>5.2 未經授權，用戶不得複製、傳播、修改上述內容。</p>
            <p>5.3 用戶在平台發布的內容，應保證擁有合法權利，不侵犯他人權益。</p>

            <h2>六、隱私保護</h2>
            <p>6.1 平台重視用戶隱私保護，具體內容詳見《隱私政策》。</p>
            <p>6.2 平台會採取合理措施保護用戶個人信息安全。</p>

            <h2>七、免責聲明</h2>
            <p>7.1 因不可抗力、網絡故障、系統維護等原因導致服務中斷或延遲，平台不承擔責任。</p>
            <p>7.2 用戶因自身原因（如賬號密碼泄露、操作失誤等）造成的損失，平台不承擔責任。</p>
            <p>7.3 平台對第三方鏈接的內容不承擔責任。</p>

            <h2>八、協議修改</h2>
            <p>8.1 平台有權在必要時修改本協議，修改後的協議將在平台公布。</p>
            <p>8.2 如用戶繼續使用本服務，即視為同意修改後的協議。</p>

            <h2>九、爭議解決</h2>
            <p>9.1 本協議適用中華人民共和國法律（不包括衝突法規則）。</p>
            <p>9.2 如發生爭議，雙方應友好協商解決；協商不成的，可向平台所在地人民法院提起訴訟。</p>

            <h2>十、聯繫我們</h2>
            <p>
              如您對本協議有任何疑問，可通過以下方式聯繫我們：
            </p>
            <ul>
              <li>電子郵箱：support@fubao.ltd</li>
              <li>客服熱線：+852 XXXX XXXX</li>
              <li>工作時間：週一至週五 9:00-18:00</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/privacy">查看隱私政策</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
