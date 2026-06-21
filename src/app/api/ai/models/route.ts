import { NextResponse } from 'next/server';
import { getLLMClient } from '@/lib/ai/llm-client';

/**
 * GET /api/ai/models
 * 获取可用模型列表
 */
export async function GET() {
  try {
    const client = getLLMClient();
    const models = client.getAvailableModels();

    return NextResponse.json({
      success: true,
      provider: client.getProviderName(),
      models,
    });
  } catch (error: unknown) {
    console.error('[AI Models] Error:', error);
    return NextResponse.json(
      { error: '获取模型列表失败' },
      { status: 500 }
    );
  }
}
