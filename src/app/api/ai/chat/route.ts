import { NextRequest } from 'next/server';
import { getActiveModel } from '@/lib/ai/store';
import { LLMClient, isLLMConfigured } from '@/lib/ai/llm-client';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * 从知识库中搜索与用户问题相关的内容
 * 使用关键词匹配搜索 title 和 content 字段
 */
async function searchKnowledge(userMessage: string, limit: number = 5): Promise<string> {
  try {
    // 从用户消息中提取关键词（简单分词：去除标点，按空格/标点分割）
    const keywords = userMessage
      .replace(/[，。！？、；：""''（）【】《》\s]+/g, ' ')
      .split(/\s+/)
      .filter(k => k.length >= 2)
      .slice(0, 5); // 最多取5个关键词

    if (keywords.length === 0) return '';

    // 构建搜索条件：任一关键词匹配 title 或 content
    const conditions: string[] = [];
    const params: any[] = [];
    for (const kw of keywords) {
      conditions.push('(k.title LIKE ? OR k.content LIKE ?)');
      params.push(`%${kw}%`, `%${kw}%`);
    }

    const whereClause = conditions.join(' OR ');
    const results = await query(
      `SELECT k.title, k.content, k.category FROM ai_knowledge k WHERE k.status = 'active' AND (${whereClause}) LIMIT ?`,
      [...params, limit]
    ) as any[];

    if (!results || results.length === 0) return '';

    // 格式化为上下文
    const contextParts = results.map((item, idx) => {
      const content = item.content.length > 500 ? item.content.substring(0, 500) + '...' : item.content;
      return `【知識${idx + 1}】${item.title}\n${content}`;
    });

    return contextParts.join('\n\n');
  } catch (error) {
    console.error('[AI Chat] 知識庫搜索失敗:', error);
    return ''; // 搜索失败不影响主流程
  }
}

/**
 * 从问答库中搜索与用户问题匹配的问答对
 */
async function searchQA(userMessage: string, limit: number = 3): Promise<string> {
  try {
    const keywords = userMessage
      .replace(/[，。！？、；：""''（）【】《》\s]+/g, ' ')
      .split(/\s+/)
      .filter(k => k.length >= 2)
      .slice(0, 5);

    if (keywords.length === 0) return '';

    const conditions: string[] = [];
    const params: any[] = [];
    for (const kw of keywords) {
      conditions.push('(q.question LIKE ? OR q.keywords LIKE ? OR q.answer LIKE ?)');
      params.push(`%${kw}%`, `%${kw}%`, `%${kw}%`);
    }

    const whereClause = conditions.join(' OR ');
    const results = await query(
      `SELECT q.question, q.answer FROM ai_qa q WHERE q.is_active = 1 AND (${whereClause}) LIMIT ?`,
      [...params, limit]
    ) as any[];

    if (!results || results.length === 0) return '';

    const qaParts = results.map((item, idx) => {
      return `【問答${idx + 1}】問：${item.question}\n答：${item.answer}`;
    });

    return qaParts.join('\n\n');
  } catch (error) {
    console.error('[AI Chat] 問答庫搜索失敗:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  // 检查 AI 是否已配置
  const configured = await isLLMConfigured();
  if (!configured) {
    return createSSEErrorResponse('AI 模型未配置或 API Key 未設置，請在管理後台 AI 模型配置中設置有效的 API Key');
  }

  try {
    const body = await request.json();
    const { message, history = [], thinking = false } = body;

    if (!message || typeof message !== 'string') {
      return createSSEErrorResponse('請提供有效的訊息內容');
    }

    const activeModel = await getActiveModel();
    if (!activeModel) {
      return createSSEErrorResponse('未找到活躍的 AI 模型，請在管理後台啟用至少一個模型');
    }

    // 搜索知识库和问答库，构建上下文
    let knowledgeContext = '';
    try {
      const [knowledgeResults, qaResults] = await Promise.all([
        searchKnowledge(message, 5),
        searchQA(message, 3),
      ]);

      if (knowledgeResults || qaResults) {
        const parts: string[] = [];
        if (knowledgeResults) parts.push('=== 知識庫參考資料 ===\n' + knowledgeResults);
        if (qaResults) parts.push('=== 問答庫參考資料 ===\n' + qaResults);
        knowledgeContext = parts.join('\n\n');
      }
    } catch (e) {
      console.error('[AI Chat] 知識庫搜索異常:', e);
    }

    // 构造系统提示：基础提示 + 知识库上下文
    let systemPrompt = '你是符寶網的 AI 助手，專注於玄門文化科普。你精通道教、佛教、符咒、法器、風水、周易等傳統文化知識，能以通俗易懂的方式為用戶解答相關問題。請用繁體中文回答。';

    if (knowledgeContext) {
      systemPrompt += `\n\n以下是從符寶網知識庫中檢索到的相關資料，請優先參考這些資料來回答用戶問題。如果知識庫資料能回答用戶問題，請基於知識庫內容回答；如果知識庫資料不足以回答，請結合你自身的知識進行補充，並標註哪些內容來自知識庫、哪些是你的補充。\n\n${knowledgeContext}`;
    }

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    // 添加历史消息
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (h.role === 'user' || h.role === 'assistant') {
          messages.push({ role: h.role, content: h.content || '' });
        }
      }
    }

    // 添加当前用户消息
    messages.push({ role: 'user', content: message });

    const client = new LLMClient();
    const chatStream = client.stream(
      messages,
      {
        maxTokens: activeModel.maxTokens || 2048,
        temperature: activeModel.temperature || 0.7,
      }
    );

    const encoder = new TextEncoder();
    const send = (data: Record<string, unknown>) => `data: ${JSON.stringify(data)}\n\n`;

    const stream = new ReadableStream({
      async start(controller) {
        let hasContent = false;
        let hasReasoning = false;

        try {
          // 发送开始信号
          controller.enqueue(encoder.encode(send({ type: 'start', model: activeModel.model, hasKnowledge: !!knowledgeContext })));

          for await (const chunk of chatStream) {
            if (chunk.content) {
              hasContent = true;
              controller.enqueue(encoder.encode(send({ type: 'content', content: chunk.content })));
            }

            if (chunk.reasoning) {
              hasReasoning = true;
              controller.enqueue(encoder.encode(send({ type: 'reasoning', content: chunk.reasoning })));
            }

            if (chunk.done) {
              break;
            }
          }

          // 如果流结束但没有内容也没有推理，发送警告
          if (!hasContent && !hasReasoning) {
            console.warn('[AI Chat] Stream ended without content. Model:', activeModel.model);
            controller.enqueue(encoder.encode(send({
              type: 'error',
              content: 'AI 模型未返回任何內容，可能原因：1) 模型名稱不正確 2) API Key 無權限 3) 模型服務暫時不可用。請檢查管理後台 AI 模型配置。',
            })));
          }

          controller.enqueue(encoder.encode(send({ type: 'done' })));
        } catch (streamError) {
          const errMsg = streamError instanceof Error ? streamError.message : '串流錯誤';
          console.error('[AI Chat] Stream iteration error:', errMsg);
          controller.enqueue(encoder.encode(send({ type: 'error', content: `AI 回覆出錯: ${errMsg}` })));
          controller.enqueue(encoder.encode(send({ type: 'done' })));
        } finally {
          try { controller.close(); } catch { /* already closed */ }
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[AI Chat] Request error:', error);
    const msg = error instanceof Error ? error.message : '請求處理錯誤';
    return createSSEErrorResponse(msg);
  }
}

/**
 * 创建 SSE 格式的错误响应（HTTP 200 + text/event-stream）
 * 前端可以统一用 SSE 解析方式处理
 */
function createSSEErrorResponse(errorMessage: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: errorMessage })}\n\n`));
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
