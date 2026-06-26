/**
 * @fileoverview AI 模型配置 & 知识库存储层
 * @description 使用 MySQL 持久化存储，部署后配置不丢失
 */

import { query, queryOne, insert, update as dbUpdate, remove as dbRemove } from '@/lib/db';

// ==================== 模型配置 ====================

export interface AIModelConfig {
  id: string;
  name: string;           // 显示名称，如 "DeepSeek V4"
  provider: string;        // openai | deepseek | kimi | doubao | qwen | glm | custom
  apiKey: string;
  baseUrl: string;
  model: string;           // 模型 ID，如 "deepseek-chat"
  isActive: boolean;
  priority: number;
  maxTokens?: number;
  temperature?: number;
  createdAt: string;
  updatedAt: string;
}

// 默认模型配置模板（仅在表为空时插入）
const DEFAULT_MODELS: Omit<AIModelConfig, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'DeepSeek V4',
    provider: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-v4-flash',
    isActive: true,
    priority: 1,
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    isActive: true,
    priority: 2,
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    name: 'Kimi (Moonshot)',
    provider: 'kimi',
    apiKey: '',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    isActive: false,
    priority: 3,
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    name: '豆包 (Doubao)',
    provider: 'doubao',
    apiKey: '',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-pro-32k',
    isActive: false,
    priority: 4,
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    name: '通义千问 (Qwen)',
    provider: 'qwen',
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    isActive: false,
    priority: 5,
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    name: '智谱 GLM-4',
    provider: 'glm',
    apiKey: '',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4',
    isActive: false,
    priority: 6,
    maxTokens: 4096,
    temperature: 0.7,
  },
];

/** 数据库行 → AIModelConfig 映射 */
function rowToModel(row: Record<string, unknown>): AIModelConfig {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    provider: String(row.provider || ''),
    apiKey: String(row.api_key || ''),
    baseUrl: String(row.base_url || ''),
    model: String(row.model_name || ''),
    isActive: Number(row.status) === 1,
    priority: Number(row.priority || 0),
    maxTokens: Number(row.max_tokens || 4096),
    temperature: Number(row.temperature ?? 0.7),
    createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
  };
}

/** 确保默认模型已初始化（表为空时插入） */
async function ensureDefaultModels(): Promise<void> {
  try {
    const rows = await query('SELECT COUNT(*) as cnt FROM ai_model_configs');
    const cnt = (rows as any[])?.[0]?.cnt ?? 0;
    if (cnt > 0) return;

    // 表为空，插入默认模型
    for (const m of DEFAULT_MODELS) {
      await insert('ai_model_configs', {
        name: m.name,
        provider: m.provider,
        api_key: m.apiKey,
        base_url: m.baseUrl,
        model_name: m.model,
        status: m.isActive ? 1 : 0,
        priority: m.priority,
        max_tokens: m.maxTokens ?? 4096,
        temperature: m.temperature ?? 0.7,
        is_default: m.isActive ? 1 : 0,
      });
    }
  } catch (err) {
    console.error('[AI Store] ensureDefaultModels failed:', err);
  }
}

export async function loadModels(): Promise<AIModelConfig[]> {
  try {
    await ensureDefaultModels();
    const rows = await query('SELECT * FROM ai_model_configs ORDER BY priority ASC, id ASC');
    return (rows as any[]).map(rowToModel);
  } catch (err) {
    console.error('[AI Store] loadModels failed:', err);
    return [];
  }
}

export async function saveModels(models: AIModelConfig[]): Promise<void> {
  // 此方法不再使用文件写入，改为全量同步到数据库
  // 先清空再重新插入（保持简单，admin 页面调用频率低）
  try {
    await dbRemove('ai_model_configs', { '1': '1' } as any);
    for (const m of models) {
      await insert('ai_model_configs', {
        name: m.name,
        provider: m.provider,
        api_key: m.apiKey,
        base_url: m.baseUrl,
        model_name: m.model,
        status: m.isActive ? 1 : 0,
        priority: m.priority,
        max_tokens: m.maxTokens ?? 4096,
        temperature: m.temperature ?? 0.7,
        is_default: m.isActive ? 1 : 0,
      });
    }
  } catch (err) {
    console.error('[AI Store] saveModels failed:', err);
  }
}

/** @deprecated 使用 loadModels 代替 */
export const getModelConfigs = loadModels;

export async function getActiveModel(): Promise<AIModelConfig | null> {
  try {
    await ensureDefaultModels();
    // 优先返回有 apiKey 的活跃模型
    const row = await queryOne(
      "SELECT * FROM ai_model_configs WHERE status = 1 AND api_key != '' ORDER BY priority ASC, id ASC LIMIT 1"
    );
    if (row) return rowToModel(row as Record<string, unknown>);

    // 回退：返回任意活跃模型（apiKey 可能由环境变量提供）
    const fallback = await queryOne(
      'SELECT * FROM ai_model_configs WHERE status = 1 ORDER BY priority ASC, id ASC LIMIT 1'
    );
    return fallback ? rowToModel(fallback as Record<string, unknown>) : null;
  } catch (err) {
    console.error('[AI Store] getActiveModel failed:', err);
    return null;
  }
}

/** 更新单个模型配置（增量，不覆盖其他模型） */
export async function updateModel(id: string, data: Partial<AIModelConfig>): Promise<boolean> {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.provider !== undefined) updateData.provider = data.provider;
    if (data.apiKey !== undefined) updateData.api_key = data.apiKey;
    if (data.baseUrl !== undefined) updateData.base_url = data.baseUrl;
    if (data.model !== undefined) updateData.model_name = data.model;
    if (data.isActive !== undefined) {
      updateData.status = data.isActive ? 1 : 0;
      updateData.is_default = data.isActive ? 1 : 0;
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.maxTokens !== undefined) updateData.max_tokens = data.maxTokens;
    if (data.temperature !== undefined) updateData.temperature = data.temperature;

    const affected = await dbUpdate('ai_model_configs', updateData, { id: Number(id) });
    return affected > 0;
  } catch (err) {
    console.error('[AI Store] updateModel failed:', err);
    return false;
  }
}

/** 删除模型 */
export async function deleteModel(id: string): Promise<boolean> {
  try {
    const affected = await dbRemove('ai_model_configs', { id: Number(id) });
    return affected > 0;
  } catch (err) {
    console.error('[AI Store] deleteModel failed:', err);
    return false;
  }
}

// ==================== 知识库 ====================

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  fileName: string;
  originalName?: string;
  fileType: string;
  fileSize: number;
  category?: string;
  size?: number;
  chunks?: string[];
  chunkCount?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** 数据库行 → KnowledgeDocument 映射 */
function rowToKnowledge(row: Record<string, unknown>): KnowledgeDocument {
  let tags: string[] = [];
  try {
    const raw = row.tags;
    if (typeof raw === 'string') tags = JSON.parse(raw);
    else if (Array.isArray(raw)) tags = raw;
  } catch { /* ignore */ }

  return {
    id: String(row.id),
    title: String(row.title || ''),
    content: String(row.content || ''),
    fileName: String(row.source_url || row.title || ''),
    originalName: String(row.source_url || ''),
    fileType: String(row.source_type || 'txt'),
    fileSize: Number((row.content as string)?.length ?? 0),
    category: String(row.category || ''),
    tags,
    createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
  };
}

export async function loadKnowledge(): Promise<KnowledgeDocument[]> {
  try {
    const rows = await query("SELECT * FROM ai_knowledge WHERE status = 'active' ORDER BY id DESC");
    return (rows as any[]).map(rowToKnowledge);
  } catch (err) {
    console.error('[AI Store] loadKnowledge failed:', err);
    return [];
  }
}

export const getKnowledgeDocs = loadKnowledge;

export async function saveKnowledge(_docs: KnowledgeDocument[]): Promise<void> {
  // 知识库不再使用文件存储，改为逐条操作数据库
  // 此方法保留兼容性，但实际通过 addKnowledge/deleteKnowledge 操作
  console.warn('[AI Store] saveKnowledge() is deprecated, use addKnowledge/deleteKnowledge instead');
}

export async function addKnowledge(doc: KnowledgeDocument): Promise<KnowledgeDocument> {
  try {
    const id = await insert('ai_knowledge', {
      title: doc.title,
      content: doc.content,
      category: doc.category || '',
      source_type: doc.fileType || 'manual',
      source_url: doc.originalName || doc.fileName || '',
      tags: JSON.stringify(doc.tags || []),
      status: 'active',
    });
    return { ...doc, id: String(id) };
  } catch (err) {
    console.error('[AI Store] addKnowledge failed:', err);
    return doc;
  }
}

export async function deleteKnowledge(id: string): Promise<boolean> {
  try {
    const affected = await dbRemove('ai_knowledge', { id: Number(id), status: 'active' });
    return affected > 0;
  } catch (err) {
    console.error('[AI Store] deleteKnowledge failed:', err);
    return false;
  }
}

export async function getKnowledgeContent(id: string): Promise<string | null> {
  try {
    const row = await queryOne('SELECT content FROM ai_knowledge WHERE id = ?', [Number(id)]);
    return row ? String((row as any).content || '') : null;
  } catch (err) {
    console.error('[AI Store] getKnowledgeContent failed:', err);
    return null;
  }
}

/**
 * 简单关键词匹配检索知识库
 * 返回最相关的文档片段
 */
export async function searchKnowledge(queryText: string, maxResults = 3): Promise<Array<{ title: string; snippet: string }>> {
  try {
    const rows = await query(
      "SELECT id, title, content FROM ai_knowledge WHERE status = 'active' ORDER BY id DESC"
    );
    if (!rows || rows.length === 0) return [];

    const results: Array<{ title: string; snippet: string; score: number }> = [];

    for (const row of rows as any[]) {
      const content = String(row.content || '');
      if (!content) continue;

      const keywords = queryText.split(/[\s,，。！？、]+/).filter(k => k.length > 0);
      let score = 0;
      const lowerContent = content.toLowerCase();
      const lowerQuery = queryText.toLowerCase();

      for (const kw of keywords) {
        const lowerKw = kw.toLowerCase();
        const regex = new RegExp(lowerKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = lowerContent.match(regex);
        if (matches) score += matches.length * 2;
      }

      if (row.title && (String(row.title).toLowerCase().includes(lowerQuery) || lowerQuery.includes(String(row.title).toLowerCase()))) {
        score += 10;
      }

      if (score > 0) {
        const snippet = extractSnippet(content, queryText, 300);
        results.push({ title: String(row.title || ''), snippet, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ title, snippet }) => ({ title, snippet }));
  } catch (err) {
    console.error('[AI Store] searchKnowledge failed:', err);
    return [];
  }
}

function extractSnippet(content: string, queryText: string, maxLen: number): string {
  const keywords = queryText.split(/[\s,，。！？、]+/).filter(k => k.length > 1);
  const lowerContent = content.toLowerCase();

  let bestPos = 0;
  for (const kw of keywords) {
    const pos = lowerContent.indexOf(kw.toLowerCase());
    if (pos !== -1) {
      bestPos = pos;
      break;
    }
  }

  const start = Math.max(0, bestPos - Math.floor(maxLen / 2));
  const end = Math.min(content.length, start + maxLen);
  let snippet = content.slice(start, end);

  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
}
