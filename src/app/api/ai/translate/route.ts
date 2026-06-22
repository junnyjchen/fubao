import { NextRequest, NextResponse } from 'next/server';
import { getLLMClient, isLLMConfigured } from '@/lib/ai/llm-client';

/**
 * AI翻译API - 使用LLM将文本翻译为指定语言
 * POST /api/ai/translate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLocale, sourceLocale = 'zh-TW', context } = body;

    if (!text || !targetLocale) {
      return NextResponse.json({ error: '缺少必要参数: text, targetLocale' }, { status: 400 });
    }

    if (!isLLMConfigured()) {
      return NextResponse.json({ error: 'AI 服務未配置，請在後台「AI模型配置」中啟用至少一個模型' }, { status: 503 });
    }

    const LOCALE_NAMES: Record<string, string> = {
      'zh-TW': '繁體中文',
      'zh-CN': '简体中文',
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'vi': 'Tiếng Việt',
      'th': 'ไทย',
      'fr': 'Français',
      'de': 'Deutsch',
      'es': 'Español',
    };

    const targetName = LOCALE_NAMES[targetLocale] || targetLocale;
    const sourceName = LOCALE_NAMES[sourceLocale] || sourceLocale;

    // 构建翻译提示词
    const systemPrompt = `你是一个专业的玄門文化翻译专家。请将以下${sourceName}内容翻译为${targetName}。
要求：
1. 保持专业术语的准确性（如符咒、法器、风水等玄門术语需准确翻译）
2. 保持原文的语气和风格
3. 如果是商品名称，翻译要简洁有力；如果是商品描述，翻译要生动吸引人
4. 如果原文中有HTML标签，保留HTML标签不变，只翻译标签内的文本
5. 直接输出翻译结果，不要加任何解释或说明
${context ? `6. 翻译上下文：这是${context}的内容` : ''}`;

    const client = getLLMClient();

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ];

    const result = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.3,
    });

    const translatedText = result.content || '';

    return NextResponse.json({
      success: true,
      translatedText,
      sourceLocale,
      targetLocale,
    });
  } catch (error: unknown) {
    console.error('[AI翻译] 失败:', error);
    const message = error instanceof Error ? error.message : '翻译失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
