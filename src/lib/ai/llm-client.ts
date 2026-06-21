/**
 * @fileoverview 通用 LLM 客户端 - 直接调用大模型 API
 * @description 替代 coze-coding-dev-sdk，直接调用豆包/DeepSeek/Kimi 等模型 API
 * 支持流式 (SSE) 和非流式调用
 */

// ============================================================
// 类型定义
// ============================================================

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentPart[];
}

export interface ContentPart {
  type: 'text' | 'image_url' | 'video_url';
  text?: string;
  image_url?: { url: string; detail?: 'high' | 'low' };
  video_url?: { url: string; fps?: number | null };
}

export interface LLMConfig {
  model?: string;
  thinking?: 'enabled' | 'disabled';
  caching?: 'enabled' | 'disabled';
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

// ============================================================
// Provider 配置
// ============================================================

interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  models: string[];
}

function getProviderConfig(): ProviderConfig {
  const provider = process.env.AI_PROVIDER || 'volcengine';

  switch (provider) {
    case 'deepseek':
      return {
        name: 'deepseek',
        baseUrl: 'https://api.deepseek.com/v1',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        defaultModel: 'deepseek-chat',
        models: ['deepseek-chat', 'deepseek-reasoner'],
      };
    case 'kimi':
      return {
        name: 'kimi',
        baseUrl: 'https://api.moonshot.cn/v1',
        apiKey: process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '',
        defaultModel: 'moonshot-v1-8k',
        models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
      };
    case 'volcengine':
    default:
      return {
        name: 'volcengine',
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        apiKey: process.env.ARK_API_KEY || process.env.VOLCENGINE_API_KEY || '',
        defaultModel: 'doubao-seed-1-8-251228',
        models: [
          'doubao-seed-2-0-pro-260215',
          'doubao-seed-2-0-lite-260215',
          'doubao-seed-2-0-mini-260215',
          'doubao-seed-1-8-251228',
          'deepseek-v3-2-251201',
          'deepseek-r1-250528',
        ],
      };
  }
}

// ============================================================
// 工具函数
// ============================================================

/**
 * 将 ContentPart[] 转换为纯文本（用于不支持多模态的模型）
 */
function contentPartsToText(parts: ContentPart[]): string {
  return parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text || '')
    .join('\n');
}

/**
 * 将 Message 转换为 OpenAI 兼容格式
 */
function toOpenAIMessage(msg: Message): Record<string, unknown> {
  // 简单文本消息
  if (typeof msg.content === 'string') {
    return { role: msg.role, content: msg.content };
  }

  // 多模态消息
  const openaiContent: Record<string, unknown>[] = [];
  for (const part of msg.content) {
    if (part.type === 'text' && part.text) {
      openaiContent.push({ type: 'text', text: part.text });
    } else if (part.type === 'image_url' && part.image_url) {
      openaiContent.push({
        type: 'image_url',
        image_url: {
          url: part.image_url.url,
          detail: part.image_url.detail || 'auto',
        },
      });
    }
    // video_url 暂不支持 OpenAI 格式，跳过
  }

  return { role: msg.role, content: openaiContent };
}

// ============================================================
// LLMClient 类
// ============================================================

export class LLMClient {
  private provider: ProviderConfig;

  constructor() {
    this.provider = getProviderConfig();
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): { id: string; provider: string }[] {
    return this.provider.models.map((m) => ({
      id: m,
      provider: this.provider.name,
    }));
  }

  /**
   * 获取当前 provider 名称
   */
  getProviderName(): string {
    return this.provider.name;
  }

  /**
   * 非流式调用
   */
  async invoke(
    messages: Message[],
    llmConfig?: LLMConfig
  ): Promise<LLMResponse> {
    const model = llmConfig?.model || this.provider.defaultModel;
    const temperature = llmConfig?.temperature ?? 0.7;
    const maxTokens = llmConfig?.maxTokens || 4096;

    const openaiMessages = messages.map(toOpenAIMessage);

    const body: Record<string, unknown> = {
      model,
      messages: openaiMessages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    };

    // 思考模式（仅豆包支持）
    if (llmConfig?.thinking === 'enabled' && this.provider.name === 'volcengine') {
      body.thinking = { type: 'enabled' };
    }

    const response = await fetch(`${this.provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.provider.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const msg = `LLM API 錯誤 (${response.status}): ${errorText.slice(0, 500)}`;
      // 友好化常见错误
      if (response.status === 403 && errorText.includes('not supported')) {
        throw new Error('AI 服務暫不支持當前地區，請聯繫管理員配置可用地區的 API Key');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('AI 服務認證失敗，請檢查 API Key 是否正確');
      }
      if (response.status === 429) {
        throw new Error('AI 服務請求過於頻繁，請稍後重試');
      }
      throw new Error(msg);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content || '',
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  /**
   * 流式调用 - 返回 AsyncGenerator
   */
  async *stream(
    messages: Message[],
    llmConfig?: LLMConfig
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const model = llmConfig?.model || this.provider.defaultModel;
    const temperature = llmConfig?.temperature ?? 0.7;
    const maxTokens = llmConfig?.maxTokens || 4096;

    const openaiMessages = messages.map(toOpenAIMessage);

    const body: Record<string, unknown> = {
      model,
      messages: openaiMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
    };

    // 思考模式
    if (llmConfig?.thinking === 'enabled' && this.provider.name === 'volcengine') {
      body.thinking = { type: 'enabled' };
    }

    const response = await fetch(`${this.provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.provider.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403 && errorText.includes('not supported')) {
        throw new Error('AI 服務暫不支持當前地區，請聯繫管理員配置可用地區的 API Key');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('AI 服務認證失敗，請檢查 API Key 是否正確');
      }
      if (response.status === 429) {
        throw new Error('AI 服務請求過於頻繁，請稍後重試');
      }
      throw new Error(
        `LLM API 錯誤 (${response.status}): ${errorText.slice(0, 500)}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            yield { content: '', done: true };
            return;
          }

          try {
            const data = JSON.parse(dataStr);
            const delta = data.choices?.[0]?.delta;

            if (delta?.content) {
              yield { content: delta.content, done: false };
            }

            // 思考内容（豆包 thinking 模式）
            if (delta?.reasoning_content) {
              yield { content: delta.reasoning_content, done: false };
            }
          } catch {
            // 跳过解析失败的行
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { content: '', done: true };
  }
}

// ============================================================
// 单例导出
// ============================================================

let _client: LLMClient | null = null;

export function getLLMClient(): LLMClient {
  if (!_client) {
    _client = new LLMClient();
  }
  return _client;
}

/**
 * 检查 LLM 是否已配置（有 API Key）
 */
export function isLLMConfigured(): boolean {
  const provider = getProviderConfig();
  return !!provider.apiKey;
}
