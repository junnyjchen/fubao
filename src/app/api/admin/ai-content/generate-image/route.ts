/**
 * @fileoverview AI图片生成API
 * @description 为内容生成配图
 * @module app/api/admin/ai-content/generate-image/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

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

    // 初始化图片生成客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new ImageGenerationClient(config, customHeaders);

    // 生成图片提示词
    const prompt = imagePrompts[type](title, summary);
    
    // 添加关键词增强
    const enhancedPrompt = keywords && keywords.length > 0
      ? `${prompt} Key elements: ${keywords.slice(0, 3).join(', ')}`
      : prompt;

    // 调用图片生成API
    const response = await client.generate({
      prompt: enhancedPrompt,
      size: '2K',
      watermark: false,
    });

    const helper = client.getResponseHelper(response);

    if (!helper.success) {
      console.error('图片生成失败:', helper.errorMessages);
      return NextResponse.json(
        { error: helper.errorMessages.join(', ') || '圖片生成失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrls: helper.imageUrls,
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
 * POST /api/admin/ai-content/generate-image/batch
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

    // 初始化图片生成客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new ImageGenerationClient(config, customHeaders);

    // 批量生成
    const requests = items.map(item => ({
      prompt: imagePrompts[item.type](item.title, item.summary),
      size: '2K' as const,
      watermark: false,
    }));

    const responses = await client.batchGenerate(requests);

    const results = responses.map((response, index) => {
      const helper = client.getResponseHelper(response);
      return {
        title: items[index].title,
        success: helper.success,
        imageUrls: helper.success ? helper.imageUrls : [],
        error: helper.success ? undefined : helper.errorMessages.join(', '),
      };
    });

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
