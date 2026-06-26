/**
 * @fileoverview 知识库检索API
 * @description 基于关键词和文本相似度的知识库检索，从 MySQL ai_knowledge 表读取
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 简单的关键词匹配
function keywordMatchScore(searchQuery: string, text: string): number {
  const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const textLower = text.toLowerCase();

  if (queryWords.length === 0) return 0;

  let matches = 0;
  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matches++;
    }
  }

  return matches / queryWords.length;
}

// 兜底知识库数据（数据库为空时使用）
const fallbackKnowledge = [
  {
    title: '符籙的基本概念',
    content: '符籙是道教法術的重要組成部分，是書寫在紙張、布帛或木板上的圖形或符號，被認為具有神秘的力量。符籙通常由道士書寫，使用特殊的墨水（常用朱砂），配合特定的咒語和儀式。符籙的種類繁多，包括護身符、鎮宅符、招財符、姻緣符、平安符等。',
    category: 'culture',
  },
  {
    title: '符水的使用方法',
    content: '符水是道教法事中常用的法物，將符籙焚化後溶於水中而成。使用方法：1.將符籙對著太陽方向豎立，口中默唸咒語 2.用火將符籙從上往下燃燒 3.燃燒後的符灰放入乾淨的杯中 4.加入適量清水 5.用筷子順時針攪拌三次 6.讓求符者飲用或用於擦拭身體。符水最好在24小時內使用。',
    category: 'usage',
  },
  {
    title: '一物一證制度',
    content: '符寶網的「一物一證」制度是確保商品真偽的重要認證機制。每件商品都有獨立的認證編號，配有專業機構的檢測證書，可通過二維碼或編號查詢驗證。這個制度可以確保您購買到正品，追溯商品來源，保障消費者權益。',
    category: 'product',
  },
  {
    title: '如何選擇適合的護身符',
    content: '選擇護身符時應考慮：1.需求類型：事業選文昌符、財運選招財符、健康選平安符 2.個人八字：應配合個人五行選擇，避免與命格相沖 3.佩戴方式：隨身佩戴選小型符卡，居家擺放選大型符畫 4.開光與否：建議選擇已開光的符籙，效果更佳。',
    category: 'product',
  },
  {
    title: '風水命理基礎概念',
    content: '風水是我國傳統文化的重要組成部分，主要研究環境與人的關係。核心概念：1.氣：環境中的能量 2.龍脈：地勢走向 3.穴位：氣聚集的關鍵位置 4.陰陽：事物的兩個相對面 5.五行：金、木、水、火、土。常用方位：東代表事業與成長，南代表名聲與地位，西代表財運與子孫，北代表事業與智慧。',
    category: 'fortune',
  },
  {
    title: '符籙的歷史演變',
    content: '符籙的歷史可追溯至遠古時期，經歷了漫長的發展歷程。遠古時期以圖騰和符號為主，先秦時期開始形成系統化的符號體系。漢代道教正式形成，符籙成為道教法術的核心。魏晉南北朝時期符籙種類大幅增加，形成不同派系的符法。唐宋時期符籙文化達到鼎盛。明清時期趨於民間化，傳承方式以師徒為主。',
    category: 'culture',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query: searchQuery, topK = 5 } = body;

    if (!searchQuery) {
      return NextResponse.json(
        { error: '請提供搜索關鍵詞' },
        { status: 400 }
      );
    }

    // 从数据库读取知识库
    let knowledgeItems: { id: number; title: string; content: string; category: string }[] = [];
    try {
      const rows = await query('SELECT id, title, content, category FROM ai_knowledge');
      knowledgeItems = (rows as any[]).map(row => ({
        id: row.id,
        title: row.title || '',
        content: row.content || '',
        category: row.category || '',
      }));
    } catch {
      // 数据库不可用时使用兜底数据
    }

    // 如果数据库为空，使用兜底知识库
    const dataSource = knowledgeItems.length > 0
      ? knowledgeItems
      : fallbackKnowledge.map((item, idx) => ({ id: idx + 1, ...item }));

    // 使用关键词匹配搜索
    const results = dataSource.map(item => {
      const text = `${item.title} ${item.content}`;
      const score = keywordMatchScore(searchQuery, text);

      return {
        ...item,
        score,
        matchedText: item.content.substring(0, 200) + '...',
      };
    });

    // 排序并返回TopK
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, topK).filter(r => r.score > 0);

    return NextResponse.json({
      success: true,
      query: searchQuery,
      method: 'keyword',
      results: topResults.length > 0 ? topResults : results.slice(0, topK),
    });
  } catch (error) {
    console.error('知識庫檢索API錯誤:', error);
    return NextResponse.json(
      { error: '服務暫時不可用' },
      { status: 500 }
    );
  }
}
