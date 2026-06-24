/**
 * @fileoverview AI 模型配置 & 知识库存储层
 * @description 使用 JSON 文件持久化存储，支持 Docker 环境
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'ai');
const MODELS_FILE = path.join(DATA_DIR, 'models.json');
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'knowledge.json');
const DOCS_DIR = path.join(DATA_DIR, 'docs');

// 确保目录存在
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ==================== 模型配置 ====================

export interface AIModelConfig {
  id: string;
  name: string;           // 显示名称，如 "DeepSeek V3"
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

// 默认模型配置模板
const DEFAULT_MODELS: AIModelConfig[] = [
  {
    id: 'deepseek-default',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    isActive: true,
    priority: 1,
    maxTokens: 4096,
    temperature: 0.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'openai-default',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    isActive: true,
    priority: 2,
    maxTokens: 4096,
    temperature: 0.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kimi-default',
    name: 'Kimi (Moonshot)',
    provider: 'kimi',
    apiKey: '',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    isActive: false,
    priority: 3,
    maxTokens: 4096,
    temperature: 0.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doubao-default',
    name: '豆包 (Doubao)',
    provider: 'doubao',
    apiKey: '',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-pro-32k',
    isActive: false,
    priority: 4,
    maxTokens: 4096,
    temperature: 0.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'qwen-default',
    name: '通义千问 (Qwen)',
    provider: 'qwen',
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    isActive: false,
    priority: 5,
    maxTokens: 4096,
    temperature: 0.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'glm-default',
    name: '智谱 GLM-4',
    provider: 'glm',
    apiKey: '',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4',
    isActive: false,
    priority: 6,
    maxTokens: 4096,
    temperature: 0.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function loadModels(): AIModelConfig[] {
  ensureDir(DATA_DIR);
  if (!fs.existsSync(MODELS_FILE)) {
    saveModels(DEFAULT_MODELS);
    return DEFAULT_MODELS;
  }
  try {
    const data = fs.readFileSync(MODELS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return DEFAULT_MODELS;
  }
}

export function saveModels(models: AIModelConfig[]): void {
  ensureDir(DATA_DIR);
  fs.writeFileSync(MODELS_FILE, JSON.stringify(models, null, 2), 'utf-8');
}

/** @deprecated 使用 loadModels 代替 */
export const getModelConfigs = loadModels;

export function getActiveModel(): AIModelConfig | null {
  const models = loadModels();
  // 优先返回有 apiKey 的活跃模型
  const withKey = models.filter(m => m.isActive && m.apiKey).sort((a, b) => a.priority - b.priority);
  if (withKey.length > 0) return withKey[0];
  // 回退：返回任意活跃模型（apiKey 可能由环境变量提供）
  const active = models.filter(m => m.isActive).sort((a, b) => a.priority - b.priority);
  return active[0] || null;
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

export function loadKnowledge(): KnowledgeDocument[] {
  ensureDir(DATA_DIR);
  if (!fs.existsSync(KNOWLEDGE_FILE)) {
    saveKnowledge([]);
    return [];
  }
  try {
    const data = fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export const getKnowledgeDocs = loadKnowledge;

export function saveKnowledge(docs: KnowledgeDocument[]): void {
  ensureDir(DATA_DIR);
  fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(docs, null, 2), 'utf-8');
}

export function addKnowledge(doc: KnowledgeDocument): KnowledgeDocument {
  const docs = loadKnowledge();
  docs.unshift(doc);
  saveKnowledge(docs);
  // 保存文档内容到文件
  ensureDir(DOCS_DIR);
  fs.writeFileSync(path.join(DOCS_DIR, `${doc.id}.txt`), doc.content, 'utf-8');
  return doc;
}

export function deleteKnowledge(id: string): boolean {
  const docs = loadKnowledge();
  const filtered = docs.filter(d => d.id !== id);
  if (filtered.length === docs.length) return false;
  saveKnowledge(filtered);
  // 删除文档文件
  const docFile = path.join(DOCS_DIR, `${id}.txt`);
  if (fs.existsSync(docFile)) fs.unlinkSync(docFile);
  return true;
}

export function getKnowledgeContent(id: string): string | null {
  const docFile = path.join(DOCS_DIR, `${id}.txt`);
  if (!fs.existsSync(docFile)) return null;
  return fs.readFileSync(docFile, 'utf-8');
}

/**
 * 简单关键词匹配检索知识库
 * 返回最相关的文档片段
 */
export function searchKnowledge(query: string, maxResults = 3): Array<{ title: string; snippet: string }> {
  const docs = loadKnowledge();
  if (docs.length === 0) return [];

  const results: Array<{ title: string; snippet: string; score: number }> = [];

  for (const doc of docs) {
    const content = getKnowledgeContent(doc.id);
    if (!content) continue;

    // 分词并计算匹配度
    const keywords = query.split(/[\s,，。！？、]+/).filter(k => k.length > 0);
    let score = 0;
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();

    for (const kw of keywords) {
      const lowerKw = kw.toLowerCase();
      // 精确匹配加分
      const regex = new RegExp(lowerKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = lowerContent.match(regex);
      if (matches) score += matches.length * 2;
    }

    // 标题匹配加分
    if (doc.title.toLowerCase().includes(lowerQuery) || lowerQuery.includes(doc.title.toLowerCase())) {
      score += 10;
    }

    if (score > 0) {
      // 提取相关片段
      const snippet = extractSnippet(content, query, 300);
      results.push({ title: doc.title, snippet, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ title, snippet }) => ({ title, snippet }));
}

function extractSnippet(content: string, query: string, maxLen: number): string {
  const keywords = query.split(/[\s,，。！？、]+/).filter(k => k.length > 1);
  const lowerContent = content.toLowerCase();

  // 找第一个关键词出现的位置
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
