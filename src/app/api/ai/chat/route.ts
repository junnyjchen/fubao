/**
 * AI 聊天 API - 支持多模型切换和知识库检索
 * POST /api/ai/chat
 * Body: { messages, modelId?, temperature?, maxTokens? }
 * Response: SSE stream
 */

import { NextRequest } from 'next/server';
import { getModelConfigs, getActiveModel, searchKnowledge } from '@/lib/ai/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 默认系统提示词 */
const DEFAULT_SYSTEM_PROMPT = `你是符寶網的AI助手，專注於玄門文化、道教、風水命理等傳統文化領域的知識解答。請用繁體中文回答，語氣專業且親切。`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** 调用 OpenAI 兼容 API */
async function callLLM(
  modelConfig: { baseUrl: string; apiKey: string; model: string },
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  const { baseUrl: apiUrl, apiKey, model: modelId } = modelConfig;

  // 确保 API URL 以 /v1 结尾
  let baseUrl = apiUrl.replace(/\/+$/, '');
  if (!baseUrl.endsWith('/v1')) {
    baseUrl = baseUrl + '/v1';
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 2048,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error('API 未返回流式响应');
  }

  return response.body;
}

/** 从知识库检索相关上下文 */
async function getKnowledgeContext(userMessage: string): Promise<string> {
  try {
    const results = await searchKnowledge(userMessage, 3);
    if (results.length === 0) return '';

    return results
      .map((r, i) => `【参考资料${i + 1}】${r.title}\n${r.snippet}`)
      .join('\n\n');
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, modelId, temperature, maxTokens } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: '請提供對話內容' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取模型配置
    let modelConfig;
    if (modelId) {
      const configs = getModelConfigs();
      modelConfig = configs.find(c => c.id === modelId && c.isActive);
    }
    if (!modelConfig) {
      modelConfig = getActiveModel();
    }
    if (!modelConfig) {
      return new Response(
        JSON.stringify({ error: '尚未配置 AI 模型，請先在管理後台「AI 配置 → 大模型配置」中添加模型' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 构建消息列表
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
    ];

    // 获取最后一条用户消息用于知识库检索
    const lastUserMsg = [...messages].reverse().find((m: ChatMessage) => m.role === 'user');
    if (lastUserMsg) {
      const knowledgeContext = await getKnowledgeContext(lastUserMsg.content);
      if (knowledgeContext) {
        chatMessages.push({
          role: 'system',
          content: `以下是與用戶問題相關的參考資料，請基於這些資料回答。如果資料不足以回答，請如實告知並結合你的知識補充：\n\n${knowledgeContext}`,
        });
      }
    }

    // 添加历史消息（最多保留最近 20 条）
    const recentMessages = messages.slice(-20);
    for (const msg of recentMessages) {
      if (msg.role === 'system') continue; // 跳过客户端传来的 system 消息
      chatMessages.push({ role: msg.role, content: msg.content });
    }

    // 创建 SSE 流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const abortController = new AbortController();

        // 超时处理（60 秒）
        const timeout = setTimeout(() => {
          abortController.abort();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '請求超時，請稍後重試' })}\n\n`));
          controller.close();
        }, 60000);

        try {
          const llmStream = await callLLM(
            modelConfig!,
            chatMessages,
            temperature ?? 0.7,
            maxTokens ?? 2048,
            abortController.signal
          );

          const reader = llmStream.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let hasContent = false;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  hasContent = true;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
                }
              } catch {
                // 跳过无法解析的行
              }
            }
          }

          if (!hasContent) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '抱歉，模型沒有返回任何內容，請稍後重試。' })}\n\n`));
          }
        } catch (error: any) {
          console.error('AI 聊天错误:', error);
          const errorMsg = error.name === 'AbortError'
            ? '請求超時，請稍後重試'
            : `AI 服務錯誤: ${error.message || '未知錯誤'}`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`));
        } finally {
          clearTimeout(timeout);
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('AI 聊天请求处理错误:', error);
    return new Response(
      JSON.stringify({ error: `服務錯誤: ${error.message || '未知錯誤'}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
