/**
 * @fileoverview AI内容生成API
 * @description 使用大语言模型生成产品、百科、新闻内容
 * @module app/api/admin/ai-content/generate/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/** 内容类型 */
type ContentType = 'product' | 'wiki' | 'news';

/** 生成请求 */
interface GenerateRequest {
  type: ContentType;
  keyword: string;
  category?: string;
}

/** 生成的内容 */
interface GeneratedContent {
  title: string;
  summary: string;
  content: string;
  keywords: string[];
  metaDescription: string;
  category?: string;
  tags?: string[];
}

/** 系统提示词配置 */
const systemPrompts: Record<ContentType, string> = {
  product: `你是一位专业的电商内容创作者，专注于玄门文化产品（符籙、法器、唸珠、經書等）。
你需要根据用户提供的关键词，生成产品描述内容。

要求：
1. 标题要包含核心关键词，具有吸引力，适合SEO优化
2. 摘要简明扼要，突出产品特点和功效（100字以内）
3. 正文内容要包含：
   - 产品介绍和历史文化背景
   - 产品特点和功效说明
   - 使用方法和注意事项
   - 适合人群推荐
4. 内容要专业、可信，融入玄门文化知识
5. 语言使用繁体中文，符合香港台湾用户习惯
6. 内容要有一定的深度，800-1200字

请严格按照JSON格式返回结果，不要添加任何其他文字。`,

  wiki: `你是一位玄门文化知识专家，擅长撰写科普类文章。
你需要根据用户提供的关键词，生成百科知识内容。

要求：
1. 标题要准确概括内容，适合SEO优化
2. 摘要简明扼要，概括核心知识点（100字以内）
3. 正文内容要包含：
   - 概念解释和历史渊源
   - 核心知识点详解
   - 实际应用场景
   - 常见问题解答
4. 内容要专业、权威、通俗易懂
5. 语言使用繁体中文，符合香港台湾用户习惯
6. 内容要有深度，1000-1500字

请严格按照JSON格式返回结果，不要添加任何其他文字。`,

  news: `你是一位玄门文化领域的新闻编辑，擅长撰写新闻资讯类文章。
你需要根据用户提供的关键词，生成新闻资讯内容。

要求：
1. 标题要有新闻性，吸引眼球，适合SEO优化
2. 摘要概括新闻要点，引起读者兴趣（100字以内）
3. 正文内容要包含：
   - 新闻导语（时间、地点、事件）
   - 事件详情和发展过程
   - 相关背景介绍
   - 专家观点或社会反响
4. 内容要客观、准确、有新闻价值
5. 语言使用繁体中文，符合香港台湾用户习惯
6. 内容要有深度，800-1200字

请严格按照JSON格式返回结果，不要添加任何其他文字。`,
};

/** 用户提示词模板 */
const userPromptTemplates: Record<ContentType, (keyword: string, category?: string) => string> = {
  product: (keyword, category) => `请为以下玄门文化产品生成产品描述：

关键词：${keyword}
${category ? `分类：${category}` : ''}

请生成包含以下字段的产品内容：
{
  "title": "产品标题（包含关键词，30字以内）",
  "summary": "产品摘要（80-100字）",
  "content": "产品详细描述正文",
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "metaDescription": "SEO描述（150字以内）",
  "category": "${category || 'other'}",
  "tags": ["标签1", "标签2", "标签3"]
}

请直接返回JSON，不要添加任何其他内容。`,

  wiki: (keyword, category) => `请为以下主题生成玄门文化百科内容：

关键词：${keyword}
${category ? `分类：${category}` : ''}

请生成包含以下字段的百科内容：
{
  "title": "百科标题（包含关键词，25字以内）",
  "summary": "内容摘要（80-100字）",
  "content": "百科正文内容",
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "metaDescription": "SEO描述（150字以内）",
  "category": "${category || 'culture'}",
  "tags": ["标签1", "标签2", "标签3"]
}

请直接返回JSON，不要添加任何其他内容。`,

  news: (keyword, category) => `请为以下主题生成玄门文化新闻资讯：

关键词：${keyword}
${category ? `分类：${category}` : ''}

请生成包含以下字段的新闻内容：
{
  "title": "新闻标题（包含关键词，30字以内）",
  "summary": "新闻摘要（80-100字）",
  "content": "新闻正文内容",
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "metaDescription": "SEO描述（150字以内）",
  "category": "${category || 'news'}",
  "tags": ["标签1", "标签2", "标签3"]
}

请直接返回JSON，不要添加任何其他内容。`,
};

/**
 * 解析AI返回的JSON
 */
function parseAIResponse(text: string): GeneratedContent | null {
  try {
    // 尝试直接解析
    return JSON.parse(text);
  } catch {
    // 尝试提取JSON部分
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
 * POST /api/admin/ai-content/generate
 * 生成AI内容
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { type, keyword, category } = body;

    if (!keyword || !type) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    if (!['product', 'wiki', 'news'].includes(type)) {
      return NextResponse.json(
        { error: '無效的內容類型' },
        { status: 400 }
      );
    }

    // 初始化LLM客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const messages = [
      { role: 'system' as const, content: systemPrompts[type] },
      { role: 'user' as const, content: userPromptTemplates[type](keyword, category) },
    ];

    // 调用LLM生成内容
    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215', // 使用均衡模型
      temperature: 0.8, // 较高的温度增加创意性
    });

    // 解析返回结果
    const content = parseAIResponse(response.content);

    if (!content) {
      console.error('AI返回格式错误:', response.content);
      return NextResponse.json(
        { error: '內容生成格式錯誤，請重試' },
        { status: 500 }
      );
    }

    // 验证必要字段
    if (!content.title || !content.summary || !content.content) {
      return NextResponse.json(
        { error: '生成的內容不完整，請重試' },
        { status: 500 }
      );
    }

    // 确保keywords是数组
    if (!Array.isArray(content.keywords)) {
      content.keywords = keyword.split(/[,，、]/).map(k => k.trim()).filter(Boolean);
    }

    // 确保tags是数组
    if (!Array.isArray(content.tags)) {
      content.tags = [];
    }

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('AI内容生成失败:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '內容生成失敗' },
      { status: 500 }
    );
  }
}
