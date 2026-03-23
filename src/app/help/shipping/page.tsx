'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  Truck, 
  Globe, 
  Clock,
  Package,
  MapPin,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function ShippingHelpPage() {
  const shippingZones = [
    {
      region: '港澳地區',
      courier: '順豐速運',
      time: '1-2個工作日',
      fee: '運費到付',
      note: '滿HKD 500免運費',
    },
    {
      region: '中國大陸',
      courier: '順豐速運',
      time: '2-3個工作日',
      fee: '運費到付',
      note: '滿CNY 400免運費',
    },
    {
      region: '台灣地區',
      courier: '順豐速運',
      time: '3-5個工作日',
      fee: '運費到付',
      note: '需提供身份證號碼',
    },
    {
      region: '東南亞',
      courier: 'DHL / 順豐國際',
      time: '5-7個工作日',
      fee: '運費到付',
      note: '具體運費以實際為準',
    },
    {
      region: '歐美地區',
      courier: 'DHL / FedEx',
      time: '7-14個工作日',
      fee: '運費到付',
      note: '可能產生關稅',
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: '訂單確認',
      description: '付款成功後，系統自動確認訂單',
      time: '即時',
    },
    {
      step: 2,
      title: '商品包裝',
      description: '專業包裝，確保商品安全',
      time: '1-2個工作日',
    },
    {
      step: 3,
      title: '發貨配送',
      description: '通知物流公司攬收',
      time: '1個工作日',
    },
    {
      step: 4,
      title: '運輸中',
      description: '實時物流跟蹤',
      time: '視地區而定',
    },
    {
      step: 5,
      title: '簽收確認',
      description: '驗收商品，確認收貨',
      time: '即時',
    },
  ];

  const faqs = [
    {
      question: '如何查詢物流信息？',
      answer: '登錄賬號後，進入「我的訂我的訂單」頁面，點擊訂單詳情即可查看實時物流狀態。我們會通過短信和郵件通知您訂單狀態變化。',
    },
    {
      question: '可以指定配送時間嗎？',
      answer: '目前暫不支持指定具體配送時間。建議您保持電話暢通，快遞員會提前與您聯繫確認配送時間。',
    },
    {
      question: '收貨時需要注意什麼？',
      answer: '請當面驗收商品，確認包裝完好、商品數量無誤後再簽收。如有問題，請當場拒收並聯繫客服處理。',
    },
    {
      question: '國際運輸會產生關稅嗎？',
      answer: '跨境運輸可能產生關稅，具體以目的地國家海關規定為準。關稅由收件人承擔，建議下單前了解當地政策。',
    },
    {
      question: '包裹丟失怎麼辦？',
      answer: '如遇包裹丟失，請及時聯繫客服。我們會與物流公司核實，並協助您進行理賠或補發。',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">首頁</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/help" className="hover:text-foreground">幫助中心</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">配送說明</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">配送說明</h1>
          <p className="text-muted-foreground">全球配送，安全直達</p>
        </div>

        {/* Shipping Process */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            配送流程
          </h2>
          <div className="relative">
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-border hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {processSteps.map((step, index) => (
                <div key={index} className="relative text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3 relative z-10">
                    {step.step}
                  </div>
                  <h4 className="font-medium mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{step.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {step.time}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shipping Zones */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            配送範圍及時效
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">配送地區</th>
                  <th className="text-left py-3 px-4 font-medium">物流公司</th>
                  <th className="text-left py-3 px-4 font-medium">時效</th>
                  <th className="text-left py-3 px-4 font-medium">運費</th>
                  <th className="text-left py-3 px-4 font-medium">備註</th>
                </tr>
              </thead>
              <tbody>
                {shippingZones.map((zone, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {zone.region}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{zone.courier}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {zone.time}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{zone.fee}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{zone.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-12">
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">重要提示</h3>
                  <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                    <li>• 符箓法器為特殊商品，需妥善包裝，請勿暴力拆解</li>
                    <li>• 建議當面驗收，確認商品完好後再簽收</li>
                    <li>• 部分地區可能因宗教政策限制，請提前了解當地法規</li>
                    <li>• 偏遠地區配送時間可能延長，敬請諒解</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            常見問題
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">還有其他問題？</p>
          <Button asChild>
            <Link href="/contact">聯繫客服</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
