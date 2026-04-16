/**
 * @fileoverview 知识库检索API
 * @description 基于向量相似度的知识库检索
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 计算余弦相似度
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 简单的关键词匹配（作为向量搜索的补充）
function keywordMatchScore(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
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

// 混合搜索：结合向量相似度和关键词匹配
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK = 5, useEmbedding = true } = body;

    if (!query) {
      return NextResponse.json(
        { error: '請提供搜索關鍵詞' },
        { status: 400 }
      );
    }

    // 模拟知识库数据（实际应从数据库读取）
    const knowledgeBase = [
      {
        id: 1,
        title: '符籙的基本概念',
        content: '符籙是道教法術的重要組成部分，是書寫在紙張、布帛或木板上的圖形或符號，被認為具有神秘的力量。符籙通常由道士書寫，使用特殊的墨水（常用朱砂），配合特定的咒語和儀式。符籙的種類繁多，包括護身符、鎮宅符、招財符、姻緣符、平安符等。',
        category: 'culture',
      },
      {
        id: 2,
        title: '符水的使用方法',
        content: '符水是道教法事中常用的法物，將符籙焚化後溶於水中而成。使用方法：1.將符籙對著太陽方向豎立，口中默唸咒語 2.用火將符籙從上往下燃燒 3.燃燒後的符灰放入乾淨的杯中 4.加入適量清水 5.用筷子順時針攪拌三次 6.讓求符者飲用或用於擦拭身體。符水最好在24小時內使用。',
        category: 'usage',
      },
      {
        id: 3,
        title: '一物一證制度',
        content: '符寶網的「一物一證」制度是確保商品真偽的重要認證機制。每件商品都有獨立的認證編號，配有專業機構的檢測證書，可通過二維碼或編號查詢驗證。這個制度可以確保您購買到正品，追溯商品來源，保障消費者權益。',
        category: 'product',
      },
      {
        id: 4,
        title: '如何選擇適合的護身符',
        content: '選擇護身符時應考慮：1.需求類型：事業選文昌符、財運選招財符、健康選平安符 2.個人八字：應配合個人五行選擇，避免與命格相沖 3.佩戴方式：隨身佩戴選小型符卡，居家擺放選大型符畫 4.開光與否：建議選擇已開光的符籙，效果更佳。',
        category: 'product',
      },
      {
        id: 5,
        title: '風水命理基礎概念',
        content: '風水是我國傳統文化的重要組成部分，主要研究環境與人的關係。核心概念：1.氣：環境中的能量 2.龍脈：地勢走向 3.穴位：氣聚集的關鍵位置 4.陰陽：事物的兩個相對面 5.五行：金、木、水、火、土。常用方位：東代表事業與成長，南代表名聲與地位，西代表財運與子孫，北代表事業與智慧。',
        category: 'fortune',
      },
      {
        id: 6,
        title: '符籙的歷史演變',
        content: '符籙的歷史可追溯至遠古時期，經歷了漫長的發展歷程。遠古時期以圖騰和符號為主，先秦時期開始形成系統化的符號體系。漢代道教正式形成，符籙成為道教法術的核心。魏晉南北朝時期符籙種類大幅增加，形成不同派系的符法。唐宋時期符籙文化達到鼎盛。明清時期趨於民間化，傳承方式以師徒為主。',
        category: 'culture',
      },
      {
        id: 7,
        title: '八字命盤基礎解讀',
        content: '八字命盤是根據一個人的出生年月日時推算出來的命運分析工具。構成要素：年柱代表祖上及少年時期，月柱代表青年時期及手足，日柱代表中年時期及配偶，時柱代表晚年時期及子女。五行分析需要了解命格五行屬性，分析五行旺衰，判斷喜用神。十神含義包括比肩、劫財代表兄弟姐妹，正財偏財代表財運，正官七殺代表事業等。',
        category: 'fortune',
      },
      {
        id: 8,
        title: '常見的驅邪鎮宅符',
        content: '驅邪鎮宅類符籙是道教法器中最常見的類別之一。太上鎮宅符用於驅除家中邪祟，宜貼於大門或客廳，需配合儀式開光。五雷驅邪符專門驅趕不良氣場，適用於煞氣較重的場所。安宅符用於穩定家宅氣場，促進家庭和睦，適合新居入伙使用。土地符供奉土地公使用，祈求土地保佑。符籙應保持乾燥，避免沾染污穢，定期更換以保持效力。',
        category: 'culture',
      },
    ];

    // 方法1：使用向量搜索
    if (useEmbedding) {
      try {
        const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
        const embeddingClient = new EmbeddingClient(customHeaders);
        
        // 获取查询向量
        const queryEmbedding = await embeddingClient.embedText(query, { dimensions: 1024 });
        
        // 计算与每条知识的相似度（使用预计算的向量或模拟）
        // 实际应用中应从数据库读取预存的向量
        const results = knowledgeBase.map(item => {
          // 模拟向量相似度（实际应使用真实向量）
          const text = `${item.title} ${item.content}`;
          const simulatedEmbedding = Array.from({ length: 1024 }, () => Math.random());
          
          return {
            ...item,
            score: cosineSimilarity(queryEmbedding, simulatedEmbedding) * 0.7 + keywordMatchScore(query, text) * 0.3,
            matchedText: text.substring(0, 200) + '...',
          };
        });

        // 排序并返回TopK
        results.sort((a, b) => b.score - a.score);
        const topResults = results.slice(0, topK);

        return NextResponse.json({
          success: true,
          query,
          method: 'embedding',
          results: topResults,
        });
      } catch (embeddingError) {
        console.error('向量搜索失敗，回退到關鍵詞搜索:', embeddingError);
        // 回退到关键词搜索
        useEmbedding = false;
      }
    }

    // 方法2：关键词匹配
    if (!useEmbedding) {
      const results = knowledgeBase.map(item => {
        const text = `${item.title} ${item.content}`;
        const score = keywordMatchScore(query, text);
        
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
        query,
        method: 'keyword',
        results: topResults,
      });
    }
  } catch (error) {
    console.error('知識庫檢索API錯誤:', error);
    return NextResponse.json(
      { error: '服務暫時不可用' },
      { status: 500 }
    );
  }
}
