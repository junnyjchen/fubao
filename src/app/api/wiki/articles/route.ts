/**
 * @fileoverview 百科文章API
 * @description 百科文章列表和新增功能
 * @module app/api/wiki/articles/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface ArticleRecord {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  summary: string | null;
  content: string | null;
  cover_image: string | null;
  author: string;
  views: number;
  is_featured: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
  category?: { id: number; name: string; slug: string } | null;
}

/**
 * 获取文章列表
 * GET /api/wiki/articles
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('category_id');
    const isFeatured = searchParams.get('is_featured');
    const slug = searchParams.get('slug');

    let query = client
      .from('wiki_articles')
      .select(`
        id,
        title,
        slug,
        category_id,
        summary,
        content,
        cover_image,
        author,
        views,
        is_featured,
        status,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('status', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }
    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true');
    }
    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('查询文章列表失败:', error);
      // 如果表不存在或查询失败，返回 mock 数据
      const mockArticles = [
        {
          id: 1,
          title: '道教基礎：什麼是符籙',
          slug: 'what-is-fuji',
          summary: '符籙是道教法術的重要組成部分，被視為天界神仙的文字或命令。',
          content: `<h2>什麼是符籙？</h2>
<p>符籙是道教法術的重要組成部分，被視為天界神仙的文字或命令。道士通過書寫、祭煉過的符紙，來達到祈福、驅邪、治病等目的。</p>

<h3>符籙的歷史</h3>
<p>符籙起源於遠古時期的巫術，在漢代道教形成後逐漸系統化。符籙被認為是溝通神人的媒介，道士通過特定的儀式將神力封印在符紙上。</p>

<h3>符籙的種類</h3>
<ul>
<li><strong>鎮宅符</strong>：用於保護住宅平安，驅除邪祟</li>
<li><strong>治病符</strong>：用於醫治疾病，緩解症狀</li>
<li><strong>招財符</strong>：用於招攬財運，廣開財源</li>
<li><strong>平安符</strong>：用於保佑平安，逢凶化吉</li>
<li><strong>太歲符</strong>：用於化解太歲沖煞</li>
<li><strong>文昌符</strong>：用於助學業、考試</li>
</ul>

<h3>符籙的使用方法</h3>
<p>符籙通常需要由有道行的道士開光加持後才能使用。使用時需心存善念，不可心存邪念或用於不正當用途。</p>

<h3>如何辨別真假符籙</h3>
<p>真正的符籙通常有以下特點：</p>
<ol>
<li>有道士的印章或簽名</li>
<li>符紙質地特殊，不易燃燒</li>
<li>符文清晰，筆畫有力</li>
<li>有開光日期和有效期</li>
</ol>

<h3>保存方法</h3>
<ul>
<li>避免受潮</li>
<li>避免陽光直射</li>
<li>放置於清潔處</li>
<li>不可污損或踩踏</li>
</ul>`,
          cover_image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=600&fit=crop',
          author: '符寶網',
          views: 3567,
          is_featured: true,
          status: true,
          created_at: new Date().toISOString(),
          category: { id: 1, name: '符籙文化', slug: 'fuji' },
        },
        {
          id: 2,
          title: '道教法器大全：種類與作用',
          slug: 'types-of-faqi',
          summary: '法器是道士進行法事活動的重要工具，每種法器都有其獨特的功能和象徵意義。',
          content: `<h2>法器的種類與作用</h2>
<p>法器是道士進行法事活動的重要工具，每種法器都有其獨特的功能和象徵意義。</p>

<h3>令牌</h3>
<p>令牌是道士法器之首，用於號令天兵天將，具有至高無上的權威。令牌通常由木頭或玉石製成，上面刻有北斗七星或雷部將軍的名號。</p>

<h3>七星劍</h3>
<p>七星劍是驅邪制煞的利器，象徵北斗七星之力。劍身刻有七星紋飾，劍柄纏有七星紅繩。使用時配合咒語，可發揮強大的驅邪效果。</p>

<h3>鈴鐺</h3>
<p>鈴鐺用於招魂引魄，通靈感應。搖動鈴鐺可以召喚神明、降臨法壇。道教科儀中，鈴鐺聲被視為神明的回應。</p>

<h3>如意</h3>
<p>如意象徵心想事成，萬事如意。在法事中用於給神明請安問好，也可用於施展法術。</p>

<h3>令旗</h3>
<p>令旗用於調動天兵天將，是道士施法的指揮工具。旗幟上通常寫有「令」字或道教神將的名號。</p>

<h3>法尺</h3>
<p>法尺用於丈量法壇、驅趕邪祟。尺上刻有北斗七星和二十八宿的名稱。</p>

<h3>法器的開光</h3>
<p>法器需要經過正式的道教科儀開光後，才能發揮其靈力。開光過程包括淨身、請神、誦經、持咒等多個步驟。</p>`,
          cover_image: 'https://images.unsplash.com/photo-1549921296-3b0f9a35af35?w=800&h=600&fit=crop',
          author: '符寶網',
          views: 2890,
          is_featured: true,
          status: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          category: { id: 2, name: '法器介紹', slug: 'faqi' },
        },
        {
          id: 3,
          title: '開光儀式：傳承千年的道教傳統',
          slug: 'kaiguang-ritual',
          summary: '開光是道教傳統儀式，旨在賦予物品靈性，使其具有神聖力量。',
          content: `<h2>開光儀式的由來與意義</h2>
<p>開光是道教傳統儀式，源於古代祭祀文化。道教認為，普通物品經過開光後，可以承載神靈之力，成為人與神溝通的媒介。</p>

<h3>開光的歷史</h3>
<p>開光術起源於遠古祭祀活動，在道教形成後逐漸系統化。早期的開光主要用於神像，後來擴展到各種法器和風水物品。</p>

<h3>開光的種類</h3>
<ul>
<li><strong>神像開光</strong>：為神像開光，使其具有靈性，能接受供奉</li>
<li><strong>法器開光</strong>：為法器開光，增強其靈力</li>
<li><strong>風水開光</strong>：為風水物品開光，調整氣場</li>
<li><strong>吉祥物開光</strong>：為各種吉祥物品開光，增加靈效</li>
</ul>

<h3>開光儀式的流程</h3>
<ol>
<li><strong>淨壇</strong>：清潔法壇，驅除邪氣</li>
<li><strong>請神</strong>：恭請神明降臨</li>
<li><strong>誦經</strong>：朗誦道教經典</li>
<li><strong>持咒</strong>：持誦開光咒語</li>
<li><strong>點睛</strong>：以朱砂為神像開眼光</li>
<li><strong>安神</strong>：請神明安住</li>
</ol>

<h3>開光後的注意事項</h3>
<ul>
<li>妥善供奉，不可褻瀆</li>
<li>保持清潔，定期上香</li>
<li>心誠則靈，不可半信半疑</li>
</ul>`,
          cover_image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop',
          author: '符寶網',
          views: 2156,
          is_featured: false,
          status: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          category: { id: 3, name: '道教科儀', slug: 'yiyuan' },
        },
        {
          id: 4,
          title: '風水基礎：如何看風水',
          slug: 'fengshui-basics',
          summary: '風水是中華傳統文化的重要組成部分，學習基礎知識可以改善家居環境。',
          content: `<h2>風水基礎知識</h2>
<p>風水學說是中華傳統文化的瑰寶，雖然帶有一定的神秘色彩，但其核心理念——選擇適宜的居住環境——仍有重要的參考價值。</p>

<h3>風水的基本概念</h3>
<p>風水，又稱堪輿學，研究人與居住環境關係的學問。其核心思想是「天人合一」，追求人與自然的和諧相處。</p>

<h3>風水的基本原則</h3>
<ol>
<li><strong>藏風聚氣</strong>：選址時應選擇避風、有屏障的地方</li>
<li><strong>依山傍水</strong>：理想的生活環境應該有山有水</li>
<li><strong>坐北朝南</strong>：房屋朝向以坐北朝南為最佳</li>
<li><strong>前朱後玄武</strong>：前方開闊，後方有靠</li>
</ol>

<h3>家居風水禁忌</h3>
<ul>
<li>大門正對電梯或樓梯</li>
<li>鏡子正對床鋪</li>
<li>橫樑壓頂</li>
<li>廁所位於房屋中央</li>
</ul>

<h3>如何改善風水</h3>
<ul>
<li>擺放風水植物</li>
<li>懸掛風水畫</li>
<li>使用風水吉祥物</li>
<li>保持環境整潔</li>
</ul>`,
          cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          author: '符寶網',
          views: 1987,
          is_featured: true,
          status: true,
          created_at: new Date(Date.now() - 259200000).toISOString(),
          category: { id: 4, name: '風水命理', slug: 'fengshui' },
        },
        {
          id: 5,
          title: '道教神仙譜系：主要神明介紹',
          slug: 'taoist-gods-introduction',
          summary: '道教是多神宗教，擁有龐大的神仙體系。了解主要神明有助於更好地理解道教文化。',
          content: `<h2>道教神仙譜系</h2>
<p>道教是多神宗教，擁有龐大的神仙體系。神仙是道教的信仰核心，信徒通過供奉神仙祈求護佑。</p>

<h3>道教最高神：三清</h3>
<p>三清是道教的最高神，分別是：</p>
<ul>
<li><strong>元始天尊</strong>：象徵宇宙的本源</li>
<li><strong>靈寶天尊</strong>：象徵陰陽兩儀</li>
<li><strong>道德天尊</strong>（太上老君）：即老子，道家思想的創始人</li>
</ul>

<h3>玉皇大帝</h3>
<p>玉皇大帝是天界的最高統治者，俗稱「老天爺」。在道教神話中，玉皇大帝統管三界十方，是人間的最高神。</p>

<h3>太上老君</h3>
<p>太上老君即老子，是道教的道祖。其著作《道德經》是道家的核心經典。</p>

<h3>天后娘娘</h3>
<p>天后娘娘即媽祖，是海上守護神。華南沿海地區的信徒廣泛供奉。</p>

<h3>關帝爺</h3>
<p>關帝爺即關羽，因其忠義而被神化。在商業界尤為流行，被視為武財神。</p>

<h3>供奉注意事項</h3>
<ul>
<li>神位要選擇適當位置</li>
<li>保持神位清潔</li>
<li>定期上香供奉</li>
<li>心存敬意，不可敷衍</li>
</ul>`,
          cover_image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop',
          author: '符寶網',
          views: 1876,
          is_featured: false,
          status: true,
          created_at: new Date(Date.now() - 345600000).toISOString(),
          category: { id: 5, name: '歷史傳承', slug: 'history' },
        },
        {
          id: 6,
          title: '道教科儀：常用法事詳解',
          slug: 'taoist-rituals-details',
          summary: '道教科儀是道教修煉和法事活動的規範，了解這些有助於更好地參與道教文化。',
          content: `<h2>道教科儀詳解</h2>
<p>道教科儀是道教法事活動的規範和程式，是道士與神明溝通的方式。</p>

<h3>祈福法事</h3>
<p>祈福法事是最常見的道教科儀，用於祈求平安、健康、財運等。常見的祈福法事包括：</p>
<ul>
<li>新年祈福</li>
<li>生日祈福</li>
<li>升學祈福</li>
<li>生意興隆祈福</li>
</ul>

<h3>超度法事</h3>
<p>超度法事用於幫助亡魂離苦得樂，早日投胎轉世。道教認為，通過超度可以使亡魂得到安息。</p>

<h3>驅邪法事</h3>
<p>驅邪法事用於驅除邪祟、化解煞氣。當住宅或個人遇到不順時，可通過驅邪法事改善。</p>

<h3>還陰債</h3>
<p>道教認為每個人出生時都向天曹地府借了債，還陰債法事可以幫助還清這些債務，讓人生更加順遂。</p>

<h3>拜太歲</h3>
<p>犯太歲的年份運勢不佳，通過拜太歲法事可以化解太歲沖煞，保佑全年平安。</p>

<h3>如何參加法事</h3>
<ul>
<li>提前預約</li>
<li>保持身心潔淨</li>
<li>衣著整潔端莊</li>
<li>心存敬意</li>
</ul>`,
          cover_image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop',
          author: '符寶網',
          views: 1567,
          is_featured: false,
          status: true,
          created_at: new Date(Date.now() - 432000000).toISOString(),
          category: { id: 3, name: '道教科儀', slug: 'yiyuan' },
        },
      ];
      return NextResponse.json({ 
        data: mockArticles.slice(0, limit), 
        total: mockArticles.length,
        page: 1,
        limit,
        total_pages: 1,
      });
    }

    // 获取分类信息
    if (data && data.length > 0) {
      const categoryIds = [...new Set(data.map((a: ArticleRecord) => a.category_id).filter(Boolean))];
      if (categoryIds.length > 0) {
        const { data: categories } = await client
          .from('wiki_categories')
          .select('id, name, slug');
        
        const categoryMap = new Map(categories?.map((c: { id: number }) => [c.id, c]) || []);
        data.forEach((article: ArticleRecord) => {
          article.category = categoryMap.get(article.category_id) || null;
        });
      }
    }

    // 如果查询的是单篇文章且缺少 content，从 mock 数据补充
    const mockContentMap: Record<string, string> = {
      'what-is-fuji': `<h2>什麼是符籙？</h2>
<p>符籙是道教法術的重要組成部分，被視為天界神仙的文字或命令。道士通過書寫、祭煉過的符紙，來達到祈福、驅邪、治病等目的。</p>
<h3>符籙的種類</h3>
<ul>
<li><strong>鎮宅符</strong>：用於保護住宅平安，驅除邪祟</li>
<li><strong>治病符</strong>：用於醫治疾病，緩解症狀</li>
<li><strong>招財符</strong>：用於招攬財運，廣開財源</li>
<li><strong>平安符</strong>：用於保佑平安，逢凶化吉</li>
</ul>
<h3>符籙的使用方法</h3>
<p>符籙通常需要由有道行的道士開光加持後才能使用。使用時需心存善念，不可心存邪念或用於不正當用途。</p>`,
      'types-of-faqi': `<h2>法器的種類與作用</h2>
<p>法器是道士進行法事活動的重要工具，每種法器都有其獨特的功能和象徵意義。</p>
<h3>常見法器</h3>
<ul>
<li><strong>令牌</strong>：用於號令天兵天將，具有至高無上的權威</li>
<li><strong>七星劍</strong>：驅邪制煞的利器，象徵北斗七星之力</li>
<li><strong>鈴鐺</strong>：招魂引魄，通靈感應</li>
<li><strong>如意</strong>：象徵心想事成，萬事如意</li>
</ul>
<h3>法器的開光</h3>
<p>法器需要經過正式的道教科儀開光後，才能發揮其靈力。</p>`,
      'kaiguang-ritual': `<h2>開光儀式的由來與意義</h2>
<p>開光是道教傳統儀式，源於古代祭祀文化。道教認為，普通物品經過開光後，可以承載神靈之力，成為人與神溝通的媒介。</p>
<h3>開光的種類</h3>
<ul>
<li><strong>神像開光</strong>：為神像開光，使其具有靈性</li>
<li><strong>法器開光</strong>：為法器開光，增強其靈力</li>
<li><strong>風水開光</strong>：為風水物品開光，調整氣場</li>
</ul>`,
      'fengshui-basics': `<h2>風水基礎知識</h2>
<p>風水學說是中華傳統文化的瑰寶，研究人與居住環境關係的學問。</p>
<h3>風水的基本原則</h3>
<ol>
<li><strong>藏風聚氣</strong>：選址時應選擇避風、有屏障的地方</li>
<li><strong>依山傍水</strong>：理想的生活環境應該有山有水</li>
<li><strong>坐北朝南</strong>：房屋朝向以坐北朝南為最佳</li>
</ol>`,
      'taoist-gods-introduction': `<h2>道教神仙譜系</h2>
<p>道教是多神宗教，擁有龐大的神仙體系。</p>
<h3>三清</h3>
<ul>
<li><strong>元始天尊</strong>：象徵宇宙的本源</li>
<li><strong>靈寶天尊</strong>：象徵陰陽兩儀</li>
<li><strong>道德天尊</strong>：即太上老君</li>
</ul>`,
      'taoist-rituals-details': `<h2>道教科儀詳解</h2>
<p>道教科儀是道教法事活動的規範和程式。</p>
<h3>祈福法事</h3>
<p>祈福法事是最常見的道教科儀，用於祈求平安、健康、財運等。</p>
<h3>超度法事</h3>
<p>超度法事用於幫助亡魂離苦得樂。</p>`,
    };

    // 当查询单篇文章且缺少 content 时，补充 content
    if (slug && data && data.length > 0) {
      const articleSlug = data[0].slug;
      const currentContent = data[0].content;
      const needsContent = !currentContent || currentContent.trim() === '';
      if (needsContent && mockContentMap[articleSlug]) {
        data[0].content = mockContentMap[articleSlug];
      }
    }

    // 如果没有数据，使用 mock 数据
    const finalData = (!data || data.length === 0) ? [
      {
        id: 1,
        title: '道教基礎知識：什麼是符籙',
        slug: 'what-is-fuji',
        summary: '符籙是道教法術的重要組成部分，具有祈福驅邪的神奇力量...',
        cover_image: 'https://picsum.photos/400/300?random=20',
        author: '符寶網',
        views: 2345,
        is_featured: true,
        status: true,
        created_at: new Date().toISOString(),
        category: { id: 1, name: '符籙文化', slug: 'fuji' },
      },
      {
        id: 2,
        title: '法器的種類與作用',
        slug: 'types-of-faqi',
        summary: '法器是道士進行法事活動的重要工具，不同的法器有不同的作用...',
        cover_image: 'https://picsum.photos/400/300?random=21',
        author: '符寶網',
        views: 1890,
        is_featured: true,
        status: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        category: { id: 2, name: '法器知識', slug: 'faqi' },
      },
      {
        id: 3,
        title: '開光儀式的由來與意義',
        slug: 'kaiguang-ritual',
        summary: '開光是道教傳統儀式，旨在賦予物品靈性，使其具有神聖力量...',
        cover_image: 'https://picsum.photos/400/300?random=22',
        author: '符寶網',
        views: 1567,
        is_featured: false,
        status: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        category: { id: 3, name: '儀式知識', slug: 'ritual' },
      },
      {
        id: 4,
        title: '如何辨別真假符籙',
        slug: 'identify-real-fuji',
        summary: '市面上充斥著各種符籙，如何辨別真假是每位信眾需要了解的...',
        cover_image: 'https://picsum.photos/400/300?random=23',
        author: '符寶網',
        views: 1234,
        is_featured: false,
        status: true,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        category: { id: 1, name: '符籙文化', slug: 'fuji' },
      },
    ] : data;

    // 当查询单个slug时，只返回匹配的那一条，并补充缺少的 content
    if (slug && finalData && Array.isArray(finalData)) {
      const matchedArticle = finalData.find((a: ArticleRecord) => a.slug === slug);
      if (matchedArticle) {
        // 补充缺少的 content
        const currentContent = matchedArticle.content;
        const needsContent = !currentContent || currentContent.trim() === '';
        if (needsContent && mockContentMap[matchedArticle.slug]) {
          matchedArticle.content = mockContentMap[matchedArticle.slug];
        }
        return NextResponse.json({
          data: [matchedArticle],
          total: 1,
          page: 1,
          limit: 1,
          total_pages: 1,
        });
      }
    }

    return NextResponse.json({
      data: finalData.slice(0, limit),
      total: count || finalData.length,
      page: Math.floor(offset / limit) + 1,
      limit,
      total_pages: count ? Math.ceil(count / limit) : 1,
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    // 返回 mock 数据作为兜底
    const mockArticles = [
      {
        id: 1,
        title: '道教基礎知識：什麼是符籙',
        slug: 'what-is-fuji',
        summary: '符籙是道教法術的重要組成部分...',
        cover_image: 'https://picsum.photos/400/300?random=20',
        author: '符寶網',
        views: 2345,
        is_featured: true,
        status: true,
        created_at: new Date().toISOString(),
        category: { id: 1, name: '符籙文化', slug: 'fuji' },
      },
    ];
    return NextResponse.json({
      data: mockArticles,
      total: 1,
      page: 1,
      limit: 4,
      total_pages: 1,
    });
  }
}

/**
 * 创建新文章
 * POST /api/wiki/articles
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const {
      title,
      slug,
      category_id,
      summary,
      content,
      cover_image,
      author,
      is_published,
      is_featured,
      tags,
    } = body;

    // 验证必填字段
    if (!title || !category_id) {
      return NextResponse.json(
        { error: '請填寫完整信息' },
        { status: 400 }
      );
    }

    // 生成唯一slug
    let articleSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');

    // 检查slug是否已存在
    const { data: existing } = await client
      .from('wiki_articles')
      .select('id')
      .eq('slug', articleSlug)
      .single();

    if (existing) {
      articleSlug = `${articleSlug}-${Date.now()}`;
    }

    // 插入文章
    const { data, error } = await client
      .from('wiki_articles')
      .insert({
        title,
        slug: articleSlug,
        category_id,
        summary: summary || null,
        content: content || '',
        cover_image: cover_image || null,
        author: author || '符寶網編輯部',
        is_published: is_published ?? false,
        is_featured: is_featured ?? false,
        tags: tags || [],
        view_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建文章失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '文章創建成功',
      data,
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
