/**
 * @fileoverview AI聊天API
 * @description 符宝AI助手聊天接口，支持流式输出
 */

import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const SYSTEM_PROMPT = `你是符宝网（fubao.ltd）的AI助手，专注于玄门文化科普与服务。

## 你的身份
你是符宝网的智能助手，熟悉道教文化、符箓法器、风水堪舆、命理八字等玄门知识。

## 回答原则
1. 专业准确，不夸大不误导
2. 尊重信仰，不评判或否定
3. 实事求是，不确定的内容明确说明
4. 友善耐心

## 语言风格
- 使用繁体中文（台湾）回复
- 语言亲切自然`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model = 'doubao-seed-1-8-251228', temperature = 0.7 } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: '消息格式錯誤' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const llmMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;

        const send = (data: string) => {
          if (!closed) {
            try {
              controller.enqueue(encoder.encode(data));
            } catch {
              closed = true;
            }
          }
        };

        try {
          const llmStream = client.stream(llmMessages, {
            model,
            temperature,
          });

          let hasContent = false;

          for await (const chunk of llmStream) {
            if (chunk.content) {
              hasContent = true;
              const text = typeof chunk.content === 'string'
                ? chunk.content
                : String(chunk.content);
              send(`data: ${JSON.stringify({ content: text })}\n\n`);
            }
          }

          if (!hasContent) {
            send(`data: ${JSON.stringify({ error: 'AI模型未返回內容，請稍後再試' })}\n\n`);
          }

          send('data: [DONE]\n\n');
        } catch (err: any) {
          console.error('[AI Chat] LLM stream error:', err?.message || err);
          const errMsg = err?.message || 'AI服務暫時不可用，請稍後再試';
          send(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
          send('data: [DONE]\n\n');
        } finally {
          if (!closed) {
            try { controller.close(); } catch {}
            closed = true;
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[AI Chat] API error:', error?.message || error);
    return new Response(JSON.stringify({ error: '服務暫時不可用，請稍後再試' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
