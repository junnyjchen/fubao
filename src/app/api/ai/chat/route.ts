import { NextRequest } from 'next/server';
import { getActiveModel } from '@/lib/ai/store';
import { LLMClient, isLLMConfigured } from '@/lib/ai/llm-client';

export const runtime = 'nodejs';
export const maxDuration = 60;

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

    // 构造完整的消息列表（系统提示 + 历史消息 + 当前消息）
    const systemPrompt = '你是符寶網的 AI 助手，專注於玄門文化科普。你精通道教、佛教、符咒、法器、風水、周易等傳統文化知識，能以通俗易懂的方式為用戶解答相關問題。請用繁體中文回答。';
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
          controller.enqueue(encoder.encode(send({ type: 'start', model: activeModel.model })));

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
