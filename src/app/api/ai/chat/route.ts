/**
 * @fileoverview AI聊天API
 * @description 符宝AI助手聊天接口，支持流式输出
 * @module app/api/ai/chat/route
 */

import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 符宝AI助手系统提示词
const SYSTEM_PROMPT = `你是符宝网（fubao.ltd）的AI助手，专注于玄门文化科普与服务。

## 你的身份
你是符宝网的智能助手，熟悉道教文化、符箓法器、风水堪舆、命理八字等玄门知识。

## 你的能力
1. **文化科普**：解答道教文化、符箓法器、风水命理等问题
2. **产品咨询**：介绍符宝网的商品，帮助用户选择合适的符箓法器
3. **证书查询**：帮助用户了解一物一证认证体系
4. **使用指导**：指导用户正确使用符箓法器的方法和注意事项

## 回答原则
1. **专业准确**：提供准确、专业的玄门知识，不夸大不误导
2. **尊重信仰**：尊重用户的信仰，不评判或否定
3. **实事求是**：承认知识的局限性，不确定的内容明确说明
4. **友善耐心**：用友善、耐心的态度回答问题
5. **安全合规**：不提供违法违规内容，不涉及政治敏感话题

## 语言风格
- 使用繁体中文（台湾）回复
- 语言亲切自然，避免过于玄奥的表述
- 适当使用道教文化相关的敬语

## 注意事项
- 不做医疗诊断或治疗建议
- 不承诺符箓法器的功效
- 建议用户理性消费，按需购买`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model = 'doubao-seed-1-6-251015', temperature = 0.7 } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: '消息格式錯誤' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化LLM客户端
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息列表
    const llmMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const llmStream = client.stream(llmMessages, {
            model,
            temperature,
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              // SSE格式发送数据
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }

          // 发送结束标记
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('AI流式输出错误:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'AI服務暫時不可用' })}\n\n`)
          );
          controller.close();
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
  } catch (error) {
    console.error('AI聊天API错误:', error);
    return new Response(JSON.stringify({ error: '服務暫時不可用，請稍後再試' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
