'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useI18n } from '@/lib/i18n';
import {
  Search,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  User,
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

/** FAQ分类 */
interface FAQCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  faqs: FAQ[];
}

/** FAQ项 */
interface FAQ {
  id: number;
  question: string;
  answer: string;
}

/**
 * 帮助中心页面
 */
export default function HelpPage() {
  const { t } = useI18n();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState<{ category: FAQCategory; faqs: FAQ[] }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // 反馈表单状态
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'suggestion',
    content: '',
    contact: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // FAQ数据 - 使用翻译
  const faqCategories: FAQCategory[] = [
    {
      id: 'account',
      name: t.help.categories.account,
      icon: User,
      faqs: [
        { id: 1, question: '如何註冊賬號？', answer: '點擊頁面右上角的「登錄/註冊」按鈕，選擇註冊方式（手機號或郵箱），填寫相關信息並完成驗證即可註冊成功。' },
        { id: 2, question: '忘記密碼怎麼辦？', answer: '在登錄頁面點擊「忘記密碼」，通過註冊手機號或郵箱接收驗證驗證接收驗證驗證碼，驗證後即可重置密碼。' },
        { id: 3, question: '如何修改個人信息？', answer: '登錄後進入「用戶中心」>「賬戶設置」，即可修改昵稱、頭像、聯繫方式等個人信息。' },
        { id: 4, question: '如何註銷賬號？', answer: '請聯繫客服申請賬號註銷。註銷前請確保賬戶內無未完成訂單、無餘額或優惠券。註銷後數據將無法恢復。' },
      ],
    },
    {
      id: 'order',
      name: t.help.categories.shopping,
      icon: ShoppingBag,
      faqs: [
        { id: 5, question: '如何查看訂單狀態？', answer: '登錄後進入「用戶中心」>「我的訂單」，可查看所有訂單的詳細狀態和物流信息。' },
        { id: 6, question: '訂單可以取消嗎？', answer: '未付款訂單可直接取消。已付款但未發貨的訂單可申請退款。已發貨的訂單需在收到商品後申請退貨退款。' },
        { id: 7, question: '如何申請退款？', answer: '進入訂單詳情頁，點擊「申請退款」，選擇退款原因並提交。商家會在3個工作日內處理。' },
        { id: 8, question: '訂單長時間未發貨怎麼辦？', answer: '一般情況下商家會在1-3個工作日內發貨。如超過3個工作日未發貨，可聯繫商家或平台客服咨詢。' },
      ],
    },
    {
      id: 'payment',
      name: t.help.categories.payment,
      icon: CreditCard,
      faqs: [
        { id: 9, question: '支持哪些支付方式？', answer: '我們支持支付寶、微信支付、PayPal等多種支付方式，海外用戶可使用PayPal支付。' },
        { id: 10, question: '支付失敗怎麼辦？', answer: '請檢查網絡連接、支付賬戶餘額是否充足。如多次失敗，請更換支付方式或聯繫客服處理。' },
        { id: 11, question: '如何獲取發票？', answer: '下單時備註發票信息，或訂單完成後聯繫商家開具電子發票。' },
      ],
    },
    {
      id: 'shipping',
      name: t.help.categories.shipping,
      icon: Truck,
      faqs: [
        { id: 12, question: '配送範圍有哪些？', answer: '我們支持中國大陸、香港、澳門、台灣及部分海外地區配送。偏遠地區可能需要額外運費。' },
        { id: 13, question: '如何查詢物流信息？', answer: '訂單發貨後，可在訂單詳情頁查看物流單號和配送進度，也可通過快遞公司官網查詢。' },
        { id: 14, question: '收到商品損壞怎麼辦？', answer: '請當場驗收，如發現損壞請拒收並聯繫客服。如已簽收，請拍照留存並在24小時內申請售後。' },
      ],
    },
    {
      id: 'product',
      name: t.help.categories.afterSales,
      icon: FileText,
      faqs: [
        { id: 15, question: '商品都是正品嗎？', answer: '平台所有商品均為正規渠道採購，符箓法器類商品均有法師加持證書，確保品質與效力。' },
        { id: 16, question: '什麼是「一物一證」？', answer: '「一物一證」指每件符箓法器都有唯一的認證編號和證書，可通過掃碼或編號查詢真偽。' },
        { id: 17, question: '如何選擇適合自己的符箓？', answer: '可根據自身需求（如平安、招財、桃花等）選擇對應功效的符箓，也可咨詢商家或法師獲得專業建議。' },
      ],
    },
    {
      id: 'distribution',
      name: t.distribution.title,
      icon: Shield,
      faqs: [
        { id: 18, question: '如何成為分銷商？', answer: '進入「用戶中心」>「分銷中心」，申請成為分銷商。成功後可推廣商品賺取佣金。' },
        { id: 19, question: '佣金如何結算？', answer: '訂單完成後佣金會進入凍結期（7天），之後可申請提現。提現將在3個工作日內到賬。' },
        { id: 20, question: '如何推廣商品？', answer: '分享商品鏈接或邀請碼給好友，好友通過您的鏈接下單，您即可獲得相應佣金獎勵。' },
      ],
    },
  ];

  useEffect(() => {
    filterFaqs();
  }, [searchKeyword, activeCategory]);

  /**
   * 筛选FAQ
   */
  const filterFaqs = () => {
    if (!searchKeyword && activeCategory === 'all') {
      setFilteredFaqs(
        faqCategories.map((cat) => ({
          category: cat,
          faqs: cat.faqs,
        }))
      );
      return;
    }

    const result: { category: FAQCategory; faqs: FAQ[] }[] = [];

    faqCategories.forEach((cat) => {
      if (activeCategory !== 'all' && cat.id !== activeCategory) {
        return;
      }

      const filteredFaqs = cat.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchKeyword.toLowerCase())
      );

      if (filteredFaqs.length > 0) {
        result.push({ category: cat, faqs: filteredFaqs });
      }
    });

    setFilteredFaqs(result);
  };

  /**
   * 提交反馈
   */
  const handleSubmitFeedback = async () => {
    if (!feedbackForm.content.trim()) {
      toast.error(t.help.feedback.content);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm),
      });

      const data = await res.json();
      if (data.message) {
        toast.success(t.help.feedback.success);
        setFeedbackForm({ type: 'suggestion', content: '', contact: '' });
      } else {
        toast.error(data.error || t.common.error);
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      toast.error(t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'suggestion', label: t.help.feedback.suggestion },
    { value: 'complaint', label: t.help.feedback.complaint },
    { value: 'bug', label: t.help.feedback.bug },
    { value: 'other', label: t.help.feedback.other },
  ];

  const contactItems = [
    {
      icon: Phone,
      title: t.help.phone,
      value: '400-888-8888',
      subtitle: '客服電話',
    },
    {
      icon: Mail,
      title: t.help.email,
      value: 'support@fubao.ltd',
      subtitle: t.help.email,
    },
    {
      icon: MessageCircle,
      title: t.help.onlineService,
      value: '9:00 - 21:00',
      subtitle: t.help.serviceHours,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 头部 */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">{t.help.title}</h1>
          <p className="text-primary-foreground/80 mb-8">
            {t.help.subtitle}
          </p>

          {/* 搜索框 */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t.help.searchPlaceholder}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-background text-foreground rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* 左侧分类导航 */}
          <aside className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base">{t.help.faq}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>{t.help.allQuestions}</span>
                </button>
                {faqCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          {/* 右侧FAQ列表 */}
          <main className="md:col-span-3 space-y-6">
            {/* FAQ列表 */}
            {filteredFaqs.map(({ category, faqs }) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <category.icon className="w-5 h-5 text-primary" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq) => (
                      <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}

            {/* 无结果 */}
            {filteredFaqs.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t.help.noResults}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t.help.noResultsHint}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 意见反馈 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  {t.help.feedback.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t.help.feedback.type}
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {feedbackTypes.map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="feedbackType"
                            value={item.value}
                            checked={feedbackForm.type === item.value}
                            onChange={(e) =>
                              setFeedbackForm({
                                ...feedbackForm,
                                type: e.target.value,
                              })
                            }
                            className="w-4 h-4 text-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t.help.feedback.content} *
                    </label>
                    <Textarea
                      placeholder={t.help.feedback.contentPlaceholder}
                      value={feedbackForm.content}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          content: e.target.value,
                        })
                      }
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t.help.feedback.contact}
                    </label>
                    <Input
                      placeholder={t.help.feedback.contactPlaceholder}
                      value={feedbackForm.contact}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          contact: e.target.value,
                        })
                      }
                    />
                  </div>

                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={submitting}
                    className="w-full"
                  >
                    {t.help.feedback.submit}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 联系方式 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  {t.help.contactUs}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {contactItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                          <p className="font-medium">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
