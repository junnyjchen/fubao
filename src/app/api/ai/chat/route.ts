import { NextRequest } from 'next/server';
import { getLLMClient, isLLMConfigured } from '@/lib/ai/llm-client';
import { getActiveModel } from '@/lib/ai/store';

// 符寶網 AI 助手系统提示词
const SYSTEM_PROMPT = `你是「符寶網」的玄門文化AI助手，你的名字叫「符寶」。

你的专业领域：
- 中国传统玄学文化（风水、命理、卜卦、择日）
- 道教科仪、符咒法器知识
- 佛学基础、禅修入门
- 传统节日与民俗文化
- 中医养生与气功基础

你的回答风格：
- 专业但通俗易懂，避免过度玄奥
- 客观中立，不迷信不封建
- 尊重传统文化的同时保持科学态度
- 适当引用经典文献，增加权威性
- 回答使用繁体中文

注意事项：
- 不提供具体的算命占卜服务
- 不推荐任何超自然解决方案
- 涉及健康问题建议咨询专业医生
- 对于不确定的内容，坦诚说明`;

// 豆包模型映射（豆包需要使用火山引擎的 endpoint ID，这里映射为实际的模型标识）
const DOUBAO_MODEL_MAP: Record<string, string> = {
  'doubao-lite': 'doubao-seed-2-0-lite-260215',
  'doubao-mini': 'doubao-seed-2-0-mini-260215',
  'doubao-pro': 'doubao-seed-2-0-pro-260215',
  'doubao-default': 'doubao-seed-1-8-251228',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages = [], model: requestedModel, thinking = false } = body;
    const activeModel = getActiveModel();
    const model = requestedModel || (activeModel ? activeModel.model : 'deepseek-chat');

    if (!messages.length) {
      return new Response(
        JSON.stringify({ error: '请提供对话消息' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查 LLM 是否已配置
    if (!isLLMConfigured()) {
      return new Response(
        JSON.stringify({ error: 'AI 服務未配置，請在後台「AI模型配置」中啟用至少一個模型' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 映射模型ID（仅豆包需要映射，其他模型直接使用后台配置的 model 标识）
    const mappedModel = DOUBAO_MODEL_MAP[model] || model;

    // 构建消息列表
    const sdkMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    for (const msg of messages) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        sdkMessages.push({ role: msg.role, content: msg.content });
      }
    }

    // 确保至少有一条 user 消息
    const hasUserMsg = sdkMessages.some(m => m.role === 'user');
    if (!hasUserMsg) {
      return new Response(
        JSON.stringify({ error: '对话消息必须包含用户消息' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 初始化LLM客户端
    const client = getLLMClient();

    // SSE 流式输出
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(sdkMessages, {
            model: mappedModel,
            thinking: thinking ? 'enabled' : 'disabled',
            temperature: 0.8,
          });

          for await (const chunk of llmStream) {
            if (chunk.done) break;
            if (chunk.content) {
              const data = JSON.stringify({ content: chunk.content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // 发送结束标记
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : 'AI 服务暂时不可用';
          console.error('[AI Chat] Stream error:', errMsg);
          const errorData = JSON.stringify({ error: errMsg });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('[AI Chat] Error:', error);
    const message = error instanceof Error ? error.message : 'AI 服务暂时不可用';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
