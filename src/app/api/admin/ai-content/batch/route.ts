/**
 * @fileoverview AI内容批量生成API
 * @description 批量生成多个内容，支持队列处理
 * @module app/api/admin/ai-content/batch/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/** 内容类型 */
type ContentType = 'product' | 'wiki' | 'news';

/** 批量生成请求 */
interface BatchGenerateRequest {
  items: Array<{
    type: ContentType;
    keyword: string;
    category?: string;
  }>;
}

/** 批量生成结果 */
interface BatchGenerateResult {
  keyword: string;
  type: ContentType;
  success: boolean;
  content?: {
    title: string;
    summary: string;
    content: string;
    keywords: string[];
    metaDescription: string;
  };
  error?: string;
}

/** 系统提示词配置 */
const systemPrompts: Record<ContentType, string> = {
  product: `你是一位专业的电商内容创作者，专注于玄门文化产品（符籙、法器、唸珠、經書等）。
生成产品描述内容，要求：
1. 标题包含核心关键词，30字以内
2. 摘要简明扼要，80-100字
3. 正文800-1200字，包含产品介绍、特点功效、使用方法、适合人群
4. 使用繁体中文

严格返回JSON格式。`,

  wiki: `你是一位玄门文化知识专家，擅长撰写科普类文章。
生成百科知识内容，要求：
1. 标题准确概括内容，25字以内
2. 摘要概括核心知识点，80-100字
3. 正文1000-1500字，包含概念解释、核心知识、应用场景、常见问题
4. 使用繁体中文

严格返回JSON格式。`,

  news: `你是一位玄门文化领域的新闻编辑，擅长撰写新闻资讯。
生成新闻内容，要求：
1. 标题有新闻性，30字以内
2. 摘要概括新闻要点，80-100字
3. 正文800-1200字，包含导语、详情、背景、观点
4. 使用繁体中文

严格返回JSON格式。`,
};

/** 用户提示词模板 */
const userPromptTemplates: Record<ContentType, (keyword: string, category?: string) => string> = {
  product: (keyword, category) => `关键词：${keyword}
分类：${category || 'other'}

返回JSON：
{"title":"产品标题","summary":"摘要","content":"正文","keywords":["关键词1","关键词2","关键词3","关键词4","关键词5"],"metaDescription":"SEO描述"}`,

  wiki: (keyword, category) => `关键词：${keyword}
分类：${category || 'culture'}

返回JSON：
{"title":"百科标题","summary":"摘要","content":"正文","keywords":["关键词1","关键词2","关键词3","关键词4","关键词5"],"metaDescription":"SEO描述"}`,

  news: (keyword, category) => `关键词：${keyword}
分类：${category || 'news'}

返回JSON：
{"title":"新闻标题","summary":"摘要","content":"正文","keywords":["关键词1","关键词2","关键词3","关键词4","关键词5"],"metaDescription":"SEO描述"}`,
};

/**
 * 解析AI返回的JSON
 */
function parseAIResponse(text: string): BatchGenerateResult['content'] | null {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * 生成单个内容
 */
async function generateSingleContent(
  client: LLMClient,
  type: ContentType,
  keyword: string,
  category?: string
): Promise<BatchGenerateResult> {
  try {
    const messages = [
      { role: 'system' as const, content: systemPrompts[type] },
      { role: 'user' as const, content: userPromptTemplates[type](keyword, category) },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.8,
    });

    const content = parseAIResponse(response.content);

    if (!content || !content.title || !content.summary || !content.content) {
      return {
        keyword,
        type,
        success: false,
        error: '生成的內容不完整',
      };
    }

    if (!Array.isArray(content.keywords)) {
      content.keywords = keyword.split(/[,，、]/).map(k => k.trim()).filter(Boolean);
    }

    return {
      keyword,
      type,
      success: true,
      content,
    };
  } catch (error) {
    return {
      keyword,
      type,
      success: false,
      error: error instanceof Error ? error.message : '生成失敗',
    };
  }
}

/**
 * POST /api/admin/ai-content/batch
 * 批量生成AI内容
 */
export async function POST(request: NextRequest) {
  try {
    const body: BatchGenerateRequest = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '請提供要生成的內容列表' },
        { status: 400 }
      );
    }

    if (items.length > 10) {
      return NextResponse.json(
        { error: '單次最多生成10條內容' },
        { status: 400 }
      );
    }

    // 初始化LLM客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 并行生成所有内容
    const results = await Promise.all(
      items.map((item) =>
        generateSingleContent(client, item.type, item.keyword, item.category)
      )
    );

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      total: items.length,
      successCount,
      failCount: items.length - successCount,
      results,
    });
  } catch (error) {
    console.error('批量生成失败:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '批量生成失敗' },
      { status: 500 }
    );
  }
}
