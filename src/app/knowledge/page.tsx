'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Search,
  BookOpen,
  MessageSquare,
  Sparkles,
  Shield,
  Heart,
  Star,
  ChevronRight,
  Filter,
  MessageCircle,
} from 'lucide-react';

// 知识库分类
const CATEGORIES = [
  { id: 'all', label: '全部', icon: BookOpen, color: 'bg-gray-500/10 text-gray-600' },
  { id: 'culture', label: '文化科普', icon: BookOpen, color: 'bg-amber-500/10 text-amber-600' },
  { id: 'product', label: '商品咨询', icon: Shield, color: 'bg-blue-500/10 text-blue-600' },
  { id: 'usage', label: '使用指导', icon: Heart, color: 'bg-green-500/10 text-green-600' },
  { id: 'fortune', label: '命理咨询', icon: Sparkles, color: 'bg-purple-500/10 text-purple-600' },
];

// 模拟知识库数据
const KNOWLEDGE_DATA = [
  {
    id: 1,
    title: '符籙的基本概念',
    excerpt: '符籙是道教法術的重要組成部分，是書寫在紙張、布帛或木板上的圖形或符號...',
    content: `符籙是道教法術的重要組成部分，是書寫在紙張、布帛或木板上的圖形或符號，被認為具有神秘的力量。

符籙的種類繁多，包括：
1. 護身符：用於保護人身安全
2. 鎮宅符：用於驅邪避凶
3. 招財符：用於招攬財運
4. 姻緣符：用於增進感情姻緣
5. 平安符：用於保佑平安順遂

符籙通常由道士書寫，使用特殊的墨水（常用朱砂），配合特定的咒語和儀式。`,
    category: 'culture',
    views: 1250,
    likes: 89,
    tags: ['符籙', '道教', '法術'],
  },
  {
    id: 2,
    title: '符水的使用方法',
    excerpt: '符水是道教法事中常用的法物，將符籙焚化後溶於水中而成...',
    content: `符水是道教法事中常用的法物，將符籙焚化後溶於水中而成。

使用方法：
1. 將符籙對著太陽方向豎立，口中默唸咒語
2. 用火（最好用蠟燭或檀香）將符籙從上往下燃燒
3. 燃燒後的符灰放入乾淨的杯中
4. 加入適量清水（最好是礦泉水或陰陽水）
5. 用筷子或樹枝順時針攪拌三次
6. 讓求符者飲用或用於擦拭身體

注意事項：
- 符水最好在24小時內使用
- 孕婦及小孩使用前應諮詢專業人士`,
    category: 'usage',
    views: 980,
    likes: 67,
    tags: ['符水', '使用方法'],
  },
  {
    id: 3,
    title: '一物一證制度',
    excerpt: '符寶網的「一物一證」制度是確保商品真偽的重要認證機制...',
    content: `符寶網的「一物一證」制度是確保商品真偽的重要認證機制。

認證內容：
1. 每件商品都有獨立的認證編號
2. 商品配有專業機構的檢測證書
3. 可通過二維碼或編號查詢驗證
4. 證書包含商品的詳細信息及師傅資料

驗證方式：
1. 掃描商品上的二維碼
2. 在符寶網輸入認證編號
3. 查看商品詳細資訊及認證記錄`,
    category: 'product',
    views: 1560,
    likes: 112,
    tags: ['一物一證', '認證', '正品'],
  },
  {
    id: 4,
    title: '如何選擇適合的護身符',
    excerpt: '選擇護身符時應考慮需求類型、個人八字、佩戴方式等因素...',
    content: `選擇護身符時應考慮以下因素：

1. 需求類型
   - 事業：選擇文昌符、官運符
   - 財運：選擇招財符、五路財神符
   - 健康：選擇平安符、壽星符
   - 感情：選擇姻緣符、和合符

2. 個人八字
   - 應配合個人八字五行選擇
   - 避免與命格相沖的符籙

3. 佩戴方式
   - 随身佩戴：小型符卡或符袋
   - 居家擺放：大型符畫或符帖
   - 車用：車掛符或擋風玻璃符`,
    category: 'product',
    views: 2100,
    likes: 145,
    tags: ['護身符', '選擇', '選購指南'],
  },
  {
    id: 5,
    title: '風水命理基礎概念',
    excerpt: '風水是我國傳統文化的重要組成部分，主要研究環境與人的關係...',
    content: `風水是我國傳統文化的重要組成部分，主要研究環境與人的關係。

基本概念：
1. 氣：風水中最核心的概念，指環境中的能量
2. 龍脈：地勢的走向，代表能量的流動
3. 穴位：氣聚集的關鍵位置
4. 陰陽：一切事物的兩個相對面
5. 五行：金、木、水、火、土

常用方位：
- 東：代表事業與成長
- 南：代表名聲與地位
- 西：代表財運與子孫
- 北：代表事業與智慧`,
    category: 'fortune',
    views: 3200,
    likes: 234,
    tags: ['風水', '命理', '五行'],
  },
  {
    id: 6,
    title: '符籙的歷史演變',
    excerpt: '符籙的歷史可追溯至遠古時期，經歷了漫長的發展歷程...',
    content: `符籙的歷史可追溯至遠古時期，經歷了漫長的發展歷程。

遠古時期：以圖騰和符號為主，與巫術緊密結合

先秦時期：開始形成系統化的符號體系，與道家思想融合

漢代：道教正式形成，符籙成為道教法術的核心

魏晉南北朝：符籙種類大幅增加，形成不同派系的符法

唐宋時期：符籙文化達到鼎盛，官方與民間廣泛使用

明清時期：符籙趨於民間化，傳承方式以師徒為主`,
    category: 'culture',
    views: 890,
    likes: 78,
    tags: ['歷史', '符籙演變'],
  },
  {
    id: 7,
    title: '八字命盤基礎解讀',
    excerpt: '八字命盤是根據一個人的出生年月日時推算出來的命運分析工具...',
    content: `八字命盤是根據一個人的出生年月日時推算出來的命運分析工具。

構成要素：
1. 年柱：祖上及少年時期
2. 月柱：青年時期及手足
3. 日柱：中年時期及配偶
4. 時柱：晚年時期及子女

五行分析：了解命格五行屬性，分析五行旺衰，判斷喜用神

十神含義：
- 比肩、劫財：兄弟姐妹、同事
- 食神、傷官：才華、子女
- 正財、偏財：財運、金錢
- 正官、七殺：事業、官非
- 正印、偏印：學業、母親`,
    category: 'fortune',
    views: 2800,
    likes: 198,
    tags: ['八字', '命盤', '命理'],
  },
  {
    id: 8,
    title: '常見的驅邪鎮宅符',
    excerpt: '驅邪鎮宅類符籙是道教法器中最常見的類別之一...',
    content: `驅邪鎮宅類符籙是道教法器中最常見的類別之一。

太上鎮宅符：用於驅除家中邪祟，宜貼於大門或客廳，需配合儀式開光

五雷驅邪符：專門驅趕不良氣場，適用於煞氣較重的場所

安宅符：用於穩定家宅氣場，促進家庭和睦，適合新居入伙使用

土地符：供奉土地公使用的符，祈求土地保佑

使用注意：符籙應保持乾燥，避免沾染污穢，定期更換以保持效力`,
    category: 'culture',
    views: 1100,
    likes: 92,
    tags: ['驅邪符', '鎮宅符'],
  },
];

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<typeof KNOWLEDGE_DATA[0] | null>(null);
  const [loading, setLoading] = useState(false);

  // 过滤知识库
  const filteredKnowledge = KNOWLEDGE_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // 获取热门知识
  const hotKnowledge = [...KNOWLEDGE_DATA].sort((a, b) => b.views - a.views).slice(0, 5);

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm mb-4">
            <BookOpen className="w-4 h-4" />
            <span>知識寶庫</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            玄門文化百科
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            探索道教文化、符籙法器、風水命理的奧秘，
            了解符寶網商品的正確使用方法。
          </p>

          {/* 搜索框 */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="搜索知識庫..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 分类标签 */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="gap-1"
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* 知识列表 */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredKnowledge.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">沒有找到相關內容</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="mt-2"
                  >
                    清除篩選
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredKnowledge.map((item) => {
                  const catInfo = getCategoryInfo(item.category);
                  return (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedArticle(item)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center shrink-0', catInfo.color)}>
                            <catInfo.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {catInfo.label}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                              {item.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {item.views.toLocaleString()} 閱讀
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {item.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                問問AI
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* AI助手入口 */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">有更多問題？</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  問問我們的AI助手，獲得即時解答
                </p>
                <Button asChild className="w-full">
                  <a href="/ai-assistant">
                    <Sparkles className="w-4 h-4 mr-2" />
                    進入AI助手
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* 热门文章 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  熱門閱讀
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hotKnowledge.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    onClick={() => setSelectedArticle(item)}
                  >
                    <span className={cn(
                      'w-6 h-6 rounded flex items-center justify-center text-xs font-bold',
                      index < 3 ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'
                    )}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.views.toLocaleString()} 閱讀
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 分类统计 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  分類瀏覽
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                  const count = KNOWLEDGE_DATA.filter((k) => k.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
                        activeCategory === cat.id ? 'bg-primary/10' : 'hover:bg-muted'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded flex items-center justify-center', cat.color)}>
                        <cat.icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm">{cat.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* FAQ常见问答 */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  常見問題
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { q: '符籙多久需要更換？', a: '一般建議1-2年更換一次，視使用情況而定' },
                  { q: '符可以沾水嗎？', a: '建議避免沾水，保持乾燥以維持效力' },
                  { q: '一物一證如何驗證？', a: '掃描商品上的二維碼或輸入認證編號查詢' },
                  { q: '符可以送人嗎？', a: '一般不建議，符籙最好由本人請領' },
                ].map((faq, index) => (
                  <div key={index} className="p-3 rounded-lg bg-background/50">
                    <p className="text-sm font-medium mb-1">{faq.q}</p>
                    <p className="text-xs text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
                <Button variant="link" asChild className="w-full mt-2">
                  <a href="/ai-assistant">查看更多答案 →</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 详情弹窗 */}
      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-background rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    getCategoryInfo(selectedArticle.category).color
                  )}>
                    {getCategoryInfo(selectedArticle.category).icon &&
                      <getCategoryInfo(selectedArticle.category).icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{selectedArticle.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{getCategoryInfo(selectedArticle.category).label}</span>
                      <span>|</span>
                      <span>{selectedArticle.views.toLocaleString()} 閱讀</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedArticle(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm max-w-none">
                {selectedArticle.content.split('\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return <br key={index} />;
                  if (paragraph.match(/^\d+\./)) {
                    return <p key={index} className="ml-4">{paragraph}</p>;
                  }
                  if (paragraph.startsWith('-')) {
                    return <p key={index} className="ml-4">{paragraph}</p>;
                  }
                  return <p key={index}>{paragraph}</p>;
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                {selectedArticle.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-4 border-t bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {selectedArticle.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {selectedArticle.likes}
                  </span>
                </div>
                <Button asChild>
                  <a href="/ai-assistant">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    問問AI
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
