/**
 * @fileoverview AI图片生成API
 * @description 为内容生成配图，使用豆包图片生成 API
 */

import { NextRequest, NextResponse } from 'next/server';

/** 图片生成请求 */
interface ImageGenerateRequest {
  type: 'product' | 'wiki' | 'news';
  title: string;
  summary?: string;
  keywords?: string[];
}

/** 图片类型配置 */
const imagePrompts: Record<string, (title: string, summary?: string) => string> = {
  product: (title, summary) => 
    `Traditional Chinese Taoist religious artifact: ${title}. ` +
    `Professional product photography, studio lighting, clean background, ` +
    `high quality, detailed texture, traditional Chinese style, spiritual and mystical atmosphere. ` +
    `${summary ? `Context: ${summary.substring(0, 100)}` : ''}`,
  
  wiki: (title, summary) => 
    `Illustration for Chinese Taoist culture encyclopedia article about ${title}. ` +
    `Traditional Chinese painting style, elegant and scholarly, ` +
    `soft colors, cultural heritage atmosphere, educational illustration. ` +
    `${summary ? `Context: ${summary.substring(0, 100)}` : ''}`,
  
  news: (title, summary) => 
    `News illustration for Chinese Taoist cultural event: ${title}. ` +
    `Professional editorial photography style, cultural event atmosphere, ` +
    `traditional Chinese elements, warm lighting, journalistic quality. ` +
    `${summary ? `Context: ${summary.substring(0, 100)}` : ''}`,
};

/**
 * 调用豆包图片生成 API
 */
async function generateImage(prompt: string): Promise<string[]> {
  const apiKey = process.env.ARK_API_KEY || process.env.VOLCENGINE_API_KEY || '';
  if (!apiKey) {
    throw new Error('图片生成 API 未配置，请设置 ARK_API_KEY 环境变量');
  }

  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'doubao-seedream-4-0-250828',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 403 && errorText.includes('not supported')) {
      throw new Error('圖片生成服務暫不支持當前地區，請聯繫管理員配置可用地區的 API Key');
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error('圖片生成服務認證失敗，請檢查 API Key 是否正確');
    }
    if (response.status === 429) {
      throw new Error('圖片生成服務請求過於頻繁，請稍後重試');
    }
    throw new Error(`圖片生成 API 錯誤 (${response.status}): ${errorText.slice(0, 300)}`);
  }

  const data = await response.json();
  return (data.data || []).map((item: { url: string }) => item.url);
}

/**
 * POST /api/admin/ai-content/generate-image
 * 为内容生成配图
 */
export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerateRequest = await request.json();
    const { type, title, summary, keywords } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: '請提供標題和內容類型' },
        { status: 400 }
      );
    }

    // 生成图片提示词
    const prompt = imagePrompts[type](title, summary);
    
    // 添加关键词增强
    const enhancedPrompt = keywords && keywords.length > 0
      ? `${prompt} Key elements: ${keywords.slice(0, 3).join(', ')}`
      : prompt;

    // 调用图片生成API
    const imageUrls = await generateImage(enhancedPrompt);

    return NextResponse.json({
      success: true,
      imageUrls,
      prompt: enhancedPrompt,
    });
  } catch (error) {
    console.error('图片生成失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '圖片生成失敗' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ai-content/generate-image
 * 批量生成配图
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items }: { items: ImageGenerateRequest[] } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '請提供要生成圖片的內容列表' },
        { status: 400 }
      );
    }

    if (items.length > 5) {
      return NextResponse.json(
        { error: '單次最多生成5張圖片' },
        { status: 400 }
      );
    }

    // 批量生成
    const results = await Promise.all(
      items.map(async (item) => {
        try {
          const prompt = imagePrompts[item.type](item.title, item.summary);
          const imageUrls = await generateImage(prompt);
          return {
            title: item.title,
            success: true,
            imageUrls,
          };
        } catch (err) {
          return {
            title: item.title,
            success: false,
            imageUrls: [],
            error: err instanceof Error ? err.message : '生成失敗',
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      total: items.length,
      successCount,
      failCount: items.length - successCount,
      results,
    });
  } catch (error) {
    console.error('批量图片生成失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '批量圖片生成失敗' },
      { status: 500 }
    );
  }
}
