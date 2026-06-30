/**
 * @fileoverview AI内容生成API
 * @description 使用大语言模型生成产品、百科、新闻内容
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMClient, isLLMConfigured } from '@/lib/ai/llm-client';

/** 内容类型 */
type ContentType = 'product' | 'wiki' | 'news';

/** 调用LLM生成内容（非流式） */
async function generateWithLLM(prompt: string): Promise<string> {
  const client = getLLMClient();

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: '你是一個專業的玄門文化內容創作專家，擅長撰寫道門、風水、符咒、法器等相關領域的專業內容。請用繁體中文回答。' },
    { role: 'user', content: prompt },
  ];

  const result = await client.invoke(messages, {
    temperature: 0.8,
  });

  return result.content || '';
}

/** 生成產品內容的提示詞 */
function buildProductPrompt(topic: string, category?: string): string {
  return `請為以下玄門文化產品撰寫詳細的商品描述：

產品名稱：${topic}

請按以下JSON格式返回（不要包含其他文字）：
{
  "title": "產品標題",
  "description": "產品簡短描述（50字以內）",
  "content": "產品詳細描述（包含材質、功效、使用方法等，500字以上，使用HTML格式）",
  "price": 建議售價（數字）,
  "original_price": 原價（數字）,
  "category": "${category || 'fuzhou'}",
  "tags": ["標籤1", "標籤2", "標籤3"]
}

注意：content字段必須是HTML格式，例如：<h2>產品介紹</h2><p>...</p><h2>功效說明</h2><p>...</p>
category 必須是以下值之一：fuzhou(符咒), faqi(法器), fengshui(風水), zhouyi(周易), daojiao(道教), fojiao(佛教)`;
}

/** 生成百科內容的提示詞 */
function buildWikiPrompt(topic: string, category?: string): string {
  return `請為以下玄門文化主題撰寫百科文章：

主題：${topic}

請按以下JSON格式返回（不要包含其他文字，content字段使用HTML格式）：
{
  "title": "文章標題",
  "summary": "文章摘要（100字以內，純文本）",
  "content": "文章正文（1000字以上，使用HTML格式，包含<h2>、<h3>小標題、<p>段落、<strong>強調等標記）",
  "category": "${category || 'daojiao'}",
  "tags": ["標籤1", "標籤2", "標籤3"]
}

注意：content字段必須是HTML格式，例如：<h2>歷史淵源</h2><p>開光儀式起源於...</p><h2>文化內涵</h2><p>...</p>
category 必須是以下值之一：fuzhou(符咒), faqi(法器), fengshui(風水), zhouyi(周易), daojiao(道教), fojiao(佛教)`;
}

/** 生成新聞內容的提示詞 */
function buildNewsPrompt(topic: string): string {
  return `請為以下玄門文化話題撰寫新聞資訊：

話題：${topic}

請按以下JSON格式返回（不要包含其他文字，content字段使用HTML格式）：
{
  "title": "新聞標題",
  "summary": "新聞摘要（100字以內，純文本）",
  "content": "新聞正文（800字以上，使用HTML格式，包含<h2>、<p>、<strong>等標記）",
  "category": "新聞動態",
  "tags": ["標籤1", "標籤2", "標籤3"]
}

注意：content字段必須是HTML格式，例如：<h2>事件背景</h2><p>...</p><h2>詳細內容</h2><p>...</p>
category 必須是以下值之一：新聞動態, 活動資訊, 行業資訊, 政策法規`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, type = 'news', category } = body;

    if (!topic) {
      return NextResponse.json({ error: '請提供主題' }, { status: 400 });
    }

    if (!(await isLLMConfigured())) {
      return NextResponse.json({ 
        error: 'AI 服務未配置，請在後台「AI模型配置」中啟用至少一個模型' 
      }, { status: 503 });
    }

    // 構建提示詞
    let prompt: string;
    const contentType = type as ContentType;
    switch (contentType) {
      case 'product':
        prompt = buildProductPrompt(topic, category);
        break;
      case 'wiki':
        prompt = buildWikiPrompt(topic, category);
        break;
      case 'news':
      default:
        prompt = buildNewsPrompt(topic);
        break;
    }

    // 調用LLM生成內容
    const rawContent = await generateWithLLM(prompt);

    // 解析JSON結果
    let generatedContent: Record<string, unknown>;
    try {
      // 嘗試從返回內容中提取JSON
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      } else {
        generatedContent = {
          title: `${topic} - AI生成內容`,
          content: rawContent,
          summary: rawContent.substring(0, 100),
          tags: [topic],
        };
      }
    } catch {
      generatedContent = {
        title: `${topic} - AI生成內容`,
        content: rawContent,
        summary: rawContent.substring(0, 100),
        tags: [topic],
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        type: contentType,
        topic,
        generated: generatedContent,
        raw: rawContent,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '內容生成失敗';
    console.error('[AI Content Generate] 錯誤:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
