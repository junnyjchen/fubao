/**
 * @fileoverview 知识库向量化处理API
 * @description 为知识库内容生成向量表示，支持批量处理
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 初始化Embedding客户端
const getEmbeddingClient = (request: NextRequest) => {
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
  return new EmbeddingClient(customHeaders);
};

// 向量化单个文本
export async function POST(request: NextRequest) {
  try {
    const { texts, dimensions = 1024 } = await request.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: '請提供文本數組' },
        { status: 400 }
      );
    }

    const client = getEmbeddingClient(request);
    const embeddings: number[][] = [];

    // 批量处理，每批10条
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      for (const text of batch) {
        try {
          const embedding = await client.embedText(text.toString(), { dimensions });
          embeddings.push(embedding);
        } catch (err) {
          console.error(`向量化失敗: ${text.substring(0, 50)}...`, err);
          // 返回null占位
          embeddings.push([]);
        }
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

    const client = getEmbeddingClient(request);
    const embedding = await client.embedText(text, { dimensions });

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
