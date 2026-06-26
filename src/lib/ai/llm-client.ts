/**
 * @fileoverview 通用 LLM 客户端 - 直接调用大模型 API
 * @description 优先读取后台 AI 模型配置（/admin/ai-models），无配置时 fallback 到 .env
 * 支持流式 (SSE) 和非流式调用，兼容 OpenAI API 格式
 */

import { getActiveModel, type AIModelConfig } from './store';

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
// Provider 配置（.env fallback）
// ============================================================

interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  models: string[];
  temperature: number;
  maxTokens: number;
}

function getEnvProviderConfig(): ProviderConfig {
  const provider = process.env.AI_PROVIDER || 'deepseek';

  switch (provider) {
    case 'volcengine':
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
        temperature: 0.7,
        maxTokens: 4096,
      };
    case 'kimi':
      return {
        name: 'kimi',
        baseUrl: 'https://api.moonshot.cn/v1',
        apiKey: process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || '',
        defaultModel: 'moonshot-v1-8k',
        models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
        temperature: 0.7,
        maxTokens: 4096,
      };
    case 'deepseek':
    default:
      return {
        name: 'deepseek',
        baseUrl: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        defaultModel: 'deepseek-chat',
        models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'],
        temperature: 0.7,
        maxTokens: 4096,
      };
  }
}

/**
 * 从后台配置获取 Provider，fallback 到 .env
 * 每次调用都重新读取，确保后台修改立即生效
 */
function resolveProviderConfig(): ProviderConfig {
  const envConfig = getEnvProviderConfig();

  try {
    const active = getActiveModel();
    if (active) {
      // 优先使用后台配置的 apiKey，否则 fallback 到环境变量
      const apiKey = active.apiKey || envConfig.apiKey;
      if (apiKey) {
        return {
          name: active.provider,
          baseUrl: active.baseUrl,
          apiKey,
          defaultModel: active.model,
          models: [active.model],
          temperature: active.temperature ?? 0.7,
          maxTokens: active.maxTokens ?? 4096,
        };
      }
    }
  } catch {
    // 后台配置读取失败，fallback 到 .env
  }

  return envConfig;
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
  /**
   * 获取当前 Provider 配置（每次调用都重新解析，确保后台配置生效）
   */
  private get provider(): ProviderConfig {
    return resolveProviderConfig();
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
    const { provider } = this;
    const model = llmConfig?.model || provider.defaultModel;
    const temperature = llmConfig?.temperature ?? provider.temperature;
    const maxTokens = llmConfig?.maxTokens || provider.maxTokens;

    const openaiMessages = messages.map(toOpenAIMessage);

    const body: Record<string, unknown> = {
      model,
      messages: openaiMessages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      thinking: { type: 'disabled' },
    };

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
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
      throw new Error(`LLM API 錯誤 (${response.status}): ${errorText.slice(0, 500)}`);
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
    const { provider } = this;
    const model = llmConfig?.model || provider.defaultModel;
    const temperature = llmConfig?.temperature ?? provider.temperature;
    const maxTokens = llmConfig?.maxTokens || provider.maxTokens;

    const openaiMessages = messages.map(toOpenAIMessage);

    const body: Record<string, unknown> = {
      model,
      messages: openaiMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
      // DeepSeek V4 默认开启 thinking 模式，必须显式关闭
      // 否则模型只输出 reasoning_content，前端无可见内容
      thinking: { type: 'disabled' },
    };

    // 超时控制：连接超时 15s，总超时 120s
    const controller = new AbortController();
    const connectTimeout = setTimeout(() => controller.abort(), 15000);
    const totalTimeout = setTimeout(() => controller.abort(), 120000);

    let response: Response;
    try {
      response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      clearTimeout(connectTimeout);
      clearTimeout(totalTimeout);
      if (fetchErr instanceof DOMException && fetchErr.name === 'AbortError') {
        throw new Error('AI 服務連接超時，請檢查網絡或稍後重試');
      }
      throw new Error(`AI 服務連接失敗: ${fetchErr instanceof Error ? fetchErr.message : '未知錯誤'}`);
    } finally {
      clearTimeout(connectTimeout);
    }

    if (!response.ok) {
      clearTimeout(totalTimeout);
      const errorText = await response.text();
      if (response.status === 402) {
        throw new Error('AI 服務帳戶餘額不足，請充值後重試');
      }
      if (response.status === 403 && errorText.includes('not supported')) {
        throw new Error('AI 服務暫不支持當前地區，請聯繫管理員配置可用地區的 API Key');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('AI 服務認證失敗，請檢查 API Key 是否正確');
      }
      if (response.status === 429) {
        throw new Error('AI 服務請求過於頻繁，請稍後重試');
      }
      throw new Error(`LLM API 錯誤 (${response.status}): ${errorText.slice(0, 500)}`);
    }

    clearTimeout(totalTimeout);

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

            // 思考内容（DeepSeek / 豆包 thinking 模式）
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
 * 检查 LLM 是否已配置（后台配置或 .env 任一有 API Key 即可）
 */
export function isLLMConfigured(): boolean {
  try {
    const active = getActiveModel();
    if (active && active.apiKey) return true;
  } catch {
    // 读取失败
  }
  const envConfig = getEnvProviderConfig();
  return !!envConfig.apiKey;
}
