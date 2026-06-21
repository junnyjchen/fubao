/**
 * @fileoverview 知识库向量化处理API
 * @description 为知识库内容生成向量表示，支持批量处理
 * 使用豆包 Embedding API
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 调用豆包 Embedding API 生成向量
 */
async function getEmbedding(text: string, dimensions: number = 1024): Promise<number[]> {
  const apiKey = process.env.ARK_API_KEY || process.env.VOLCENGINE_API_KEY || '';
  if (!apiKey) {
    throw new Error('Embedding API 未配置，请设置 ARK_API_KEY 环境变量');
  }

  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'doubao-embedding-text-240715',
      input: text,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API 错误 (${response.status}): ${errorText.slice(0, 300)}`);
  }

  const data = await response.json();
  return data.data?.[0]?.embedding || [];
}

// 向量化单个/批量文本
export async function POST(request: NextRequest) {
  try {
    const { texts, dimensions = 1024 } = await request.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: '請提供文本數組' },
        { status: 400 }
      );
    }

    const embeddings: number[][] = [];

    // 逐条处理
    for (const text of texts) {
      try {
        const embedding = await getEmbedding(text.toString(), dimensions);
        embeddings.push(embedding);
      } catch (err) {
        console.error(`向量化失敗: ${text.toString().substring(0, 50)}...`, err);
        embeddings.push([]);
      }
    }

    return NextResponse.json({
      success: true,
      count: embeddings.length,
      dimensions: embeddings[0]?.length || 0,
      embeddings,
    });
  } catch (error) {
    console.error('向量化API錯誤:', error);
    return NextResponse.json(
      { error: '服務暫時不可用' },
      { status: 500 }
    );
  }
}

// 获取单个文本的向量
export async function PUT(request: NextRequest) {
  try {
    const { text, dimensions = 1024 } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: '請提供文本' },
        { status: 400 }
      );
    }

    const embedding = await getEmbedding(text, dimensions);

    return NextResponse.json({
      success: true,
      text: text.substring(0, 100),
      dimensions: embedding.length,
      embedding,
    });
  } catch (error) {
    console.error('獲取向量化API錯誤:', error);
    return NextResponse.json(
      { error: '服務暫時不可用' },
      { status: 500 }
    );
  }
}
