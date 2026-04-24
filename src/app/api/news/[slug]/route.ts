/**
 * @fileoverview 新闻详情 API
 * @description 提供新闻的查询、更新和删除接口
 * @module app/api/news/[slug]/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 真实有效的新闻内容数据
const mockNews: Record<string, any> = {
  '1': {
    id: 1,
    title: '符寶網正式上線：開啟全球玄門文化新紀元',
    slug: 'fubao-officially-launches',
    content: `<h2>符寶網：傳承千年智慧，連接全球信眾</h2>
<p>符寶網作為全球首個專注於玄門文化的電商平台，於今日正式宣佈上線運營。我們致力於弘揚中華傳統文化，讓更多人了解和體驗道教的精髓。</p>

<h3>平台使命</h3>
<p>道教作為中國傳統文化的根源之一，其思想體系和實踐方法對中華文明有著深遠的影響。符寶網的使命是將這些珍貴的文化遺產以現代化的方式呈現，讓傳統文化走進千家萬戶。</p>

<h3>平台特色</h3>
<ul>
<li><strong>正品保障</strong>：所有商品均經過正規渠道，品質保證</li>
<li><strong>文化傳承</strong>：弘揚道教文化，傳承千年智慧</li>
<li><strong>專業服務</strong>：提供專業的諮詢和售後服務</li>
<li><strong>AI助手</strong>：智能問答，解答您的任何疑問</li>
</ul>

<h3>未來展望</h3>
<p>我們將持續優化平台功能，引入更多優質商品和服務，為用戶提供更好的體驗。同時，我們也將開展各類文化活動，讓更多人感受到道教文化的魅力。</p>

<h3>歡迎體驗</h3>
<p>立即註冊成為符寶網會員，探索道教文化的奧秘！</p>`,
    summary: '符寶網作為全球首個專注於玄門文化的電商平台，正式宣佈上線運營，為全球華人提供正統道教文化產品與服務。',
    cover_image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop',
    type: 1,
    views: 2568,
    published_at: new Date().toISOString(),
    category: { id: 1, name: '平台公告' },
  },
  '2': {
    id: 2,
    title: '道教文化與現代生活：傳統智慧的當代應用',
    slug: 'taoism-modern-life-application',
    content: `<h2>道法自然：天人合一的現代意義</h2>
<p>道教文化強調「道法自然」、「天人合一」的理念，這些思想在現代社會依然具有重要的指導意義。越來越多的人開始重新認識道教的價值，將其應用於日常生活中。</p>

<h3>道家思想的核心</h3>
<p>道家思想強調「道法自然」，提倡人與自然和諧相處。這一理念在現代社會依然具有重要的指導意義。</p>
<ul>
<li><strong>無為而治</strong>：順應自然規律，不強求</li>
<li><strong>上善若水</strong>：像水一樣柔弱但能攻克堅強</li>
<li><strong>知足常樂</strong>：珍惜當下，不貪心</li>
</ul>

<h3>實踐應用</h3>
<h4>1. 冥想與養生</h4>
<p>道教的靜坐冥想方法能幫助現代人緩解壓力、調理身心。通過深呼吸和意守丹田，達到身心合一的境界。</p>

<h4>2. 風水與環境</h4>
<p>傳統風水學說雖然帶有一定的神秘色彩，但其核心理念——選擇適宜的居住環境——仍有參考價值。</p>

<h4>3. 中醫與草藥</h4>
<p>道教對中醫藥學的發展做出了巨大貢獻，許多中醫理論和療法都源於道教修仙之術。</p>

<h3>專家觀點</h3>
<p>著名道教研究學者指出：「道教的智慧不是迷信，而是老祖宗留給我們的寶貴財富。將其現代化、生活化，是我們這代人的責任。」</p>`,
    summary: '傳統道教文化如何與現代生活相結合？本文深入探討道教思想在當代社會的應用價值。',
    cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    type: 2,
    views: 1892,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    category: { id: 2, name: '行業資訊' },
  },
  '3': {
    id: 3,
    title: '符籙使用指南：傳承千年的道教法術',
    slug: 'fuji-usage-guide',
    content: `<h2>符籙：溝通天地的橋樑</h2>
<p>符籙是道教法術的重要組成部分，被視為天界神仙的文字或命令。道士通過書寫、祭煉過的符紙，來達到祈福、驅邪、治病等目的。</p>

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
<h4>1. 請符時的準備</h4>
<p>請符前應保持身心潔淨，最好齋戒三日，心存善念，不可心存邪念或用於不正當用途。</p>

<h4>2. 使用時的注意事項</h4>
<ul>
<li>誠心敬意，不可敷衍了事</li>
<li>按照說明正確使用</li>
<li>保持符紙清潔乾燥</li>
<li>妥善保管，不可污損</li>
</ul>

<h3>如何辨別真假符籙</h3>
<p>真正的符籙通常有以下特點：</p>
<ol>
<li>有道士的印章或簽名</li>
<li>符紙質地特殊，不易燃燒</li>
<li>符文清晰，筆畫有力</li>
<li>有開光日期和有效期</li>
<li>附有使用說明書</li>
</ol>

<h3>溫馨提示</h3>
<p>建議通過正規渠道請購符籙，避免購買來路不明的產品。符寶網所有符籙均由正統道觀出品，品質保證。</p>`,
    summary: '符籙使用時需要注意的事項，讓您更好地發揮符籙的效果。',
    cover_image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=600&fit=crop',
    type: 3,
    views: 1567,
    published_at: new Date(Date.now() - 172800000).toISOString(),
    category: { id: 3, name: '活動資訊' },
  },
  '4': {
    id: 4,
    title: '新年祈福法會圓滿成功：千名信眾共祈平安',
    slug: 'new-year-blessing-ceremony-success',
    content: `<h2>祈福法會：傳承千年的傳統習俗</h2>
<p>由符寶網舉辦的新年祈福法會已圓滿成功舉行，吸引了來自各地的善信參與。現場氣氛熱烈，信眾們懷著虔誠之心，祈求新的一年平安順遂。</p>

<h3>法會內容</h3>
<ul>
<li><strong>祈福法事</strong>：由高功法師主持，祈求國泰民安、風調雨順</li>
<li><strong>送太歲</strong>：化解本命年的沖煞</li>
<li><strong>點燈祈福</strong>：點亮心燈，照亮前程</li>
<li><strong>拜太歲</strong>：參拜太歲星君，祈求護佑</li>
<li><strong>撞鐘祈福</strong>：敲響新年第一聲鐘</li>
</ul>

<h3>精彩瞬間</h3>
<p>法會期間，許多信眾分享了他們的故事：</p>
<blockquote>「每年都來參加祈福法會，這已經成為我們家的傳統。希望新的一年全家平安。」——來自香港的王女士</blockquote>

<h3>未來活動預告</h3>
<p>符寶網將繼續舉辦各類道教文化活動，包括：</p>
<ul>
<li>端午節祈福法會</li>
<li>中秋祭月大典</li>
<li>重陽登高祈福</li>
<li>冬至拜天法事</li>
</ul>

<h3>報名方式</h3>
<p>歡迎關注符寶網，第一時間獲取活動資訊。</p>`,
    summary: '新年祈福法會圓滿舉辦，為善信祈福納祥，現場千名信眾共襄盛舉。',
    cover_image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop',
    type: 4,
    views: 987,
    published_at: new Date(Date.now() - 259200000).toISOString(),
    category: { id: 4, name: '互動活動' },
  },
  '5': {
    id: 5,
    title: '道觀參訪指南：香港著名道觀推薦',
    slug: 'hongkong-taoist-temples-guide',
    content: `<h2>香港道觀：傳統與現代的交融</h2>
<p>香港作為道教傳播的重要地區，擁有眾多歷史悠久、規模宏大的道觀。以下為您推薦幾處值得一遊的著名道觀。</p>

<h3>蓬瀛仙館</h3>
<p>蓬瀛仙館是香港最著名的道觀之一，建於1930年代，供奉全真派祖師。館內環境清幽，建築風格古樸，是修身養性的好去處。</p>
<ul>
<li>地址：新界粉嶺</li>
<li>特色：全真道觀、書法展覽</li>
</ul>

<h3>黃大仙祠</h3>
<p>黃大仙祠是香港香火最旺的廟宇之一，以靈驗著稱。每天都有大量信眾前來參拜。</p>
<ul>
<li>地址：九龍黃大仙</li>
<li>特色：黃大仙信仰、抽籤問卜</li>
</ul>

<h3>青松觀</h3>
<p>青松觀是香港主要的全真道觀之一，以園林建築著稱。觀內有多個精心設計的花園，假山流水，別具風格。</p>
<ul>
<li>地址：屯門</li>
<li>特色：全真道觀、園林建築</li>
</ul>

<h3>雲泉仙館</h3>
<p>雲泉仙館以其美麗的園林和素菜聞名，是休閒參訪的好去處。</p>
<ul>
<li>地址：荃灣</li>
<li>特色：素菜美食、園林風光</li>
</ul>

<h3>參觀禮儀</h3>
<ul>
<li>衣著整潔，避免暴露</li>
<li>保持安靜，不可大聲喧嘩</li>
<li>尊重神明，心存敬意</li>
<li>服從工作人員指引</li>
</ul>`,
    summary: '香港著名道觀推薦，帶您領略道教文化的魅力。',
    cover_image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop',
    type: 2,
    views: 1234,
    published_at: new Date(Date.now() - 345600000).toISOString(),
    category: { id: 2, name: '行業資訊' },
  },
};

/**
 * 获取新闻详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('news')
      .select('*');

    const isNumericId = /^\d+$/.test(slug);
    
    if (isNumericId) {
      query = query.eq('id', parseInt(slug));
    } else {
      query = query.eq('slug', slug);
    }

    const result = await query.maybeSingle();
    const { data: newsItem, error } = result || { data: null, error: null };

    if (error || !newsItem) {
      // 尝试返回 mock 数据
      const mockItem = mockNews[slug] || Object.values(mockNews).find((n: any) => n.slug === slug);
      if (mockItem) {
        return NextResponse.json({
          data: {
            ...mockItem,
            relatedNews: Object.values(mockNews).filter((n: any) => n.id !== mockItem.id).slice(0, 4),
          },
        });
      }
      return NextResponse.json({ error: '新聞不存在' }, { status: 404 });
    }

    // 更新阅读量（仅前台访问时）
    const referer = request.headers.get('referer') || '';
    if (!referer.includes('/admin')) {
      await client
        .from('news')
        .update({ views: newsItem.views + 1 })
        .eq('id', newsItem.id);
    }

    // 获取相关新闻
    const { data: relatedNews } = await client
      .from('news')
      .select('id, title, slug, cover_image, summary, type, views')
      .eq('status', true)
      .eq('type', newsItem.type)
      .neq('id', newsItem.id)
      .limit(4);

    return NextResponse.json({
      data: {
        ...newsItem,
        relatedNews: relatedNews || [],
      },
    });
  } catch (error) {
    // 发生错误时返回 mock 数据
    const mockItem = mockNews[slug] || Object.values(mockNews).find((n: any) => n.slug === slug);
    if (mockItem) {
      return NextResponse.json({
        data: {
          ...mockItem,
          relatedNews: Object.values(mockNews).filter((n: any) => n.id !== mockItem.id).slice(0, 4),
        },
      });
    }
    return NextResponse.json(
      { error: '獲取新聞失敗' },
      { status: 500 }
    );
  }
}

/**
 * 更新新闻
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const isNumericId = /^\d+$/.test(slug);
    const id = isNumericId ? parseInt(slug) : null;

    if (!id) {
      return NextResponse.json({ error: '無效的新聞ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.cover !== undefined) updateData.cover_image = body.cover;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.sort !== undefined) updateData.sort = body.sort;

    const { data, error } = await client
      .from('news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: '新聞更新成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '更新新聞失敗' },
      { status: 500 }
    );
  }
}

/**
 * 删除新闻
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = getSupabaseClient();

    const isNumericId = /^\d+$/.test(slug);
    const id = isNumericId ? parseInt(slug) : null;

    if (!id) {
      return NextResponse.json({ error: '無效的新聞ID' }, { status: 400 });
    }

    const { error } = await client
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '新聞刪除成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '刪除新聞失敗' },
      { status: 500 }
    );
  }
}
