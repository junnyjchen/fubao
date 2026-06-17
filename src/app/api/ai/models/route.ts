/**
 * 获取可用模型列表 API
 * GET /api/ai/models
 * 使用 coze-coding-dev-sdk 提供的模型
 */

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  model: string;
  description: string;
  supportsThinking: boolean;
  supportsVision: boolean;
}

const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'doubao-lite',
    name: '豆包 Seed Lite',
    provider: 'doubao',
    model: 'doubao-seed-2-0-lite-260215',
    description: '均衡型模型，兼顾性能与成本',
    supportsThinking: true,
    supportsVision: true,
  },
  {
    id: 'doubao-mini',
    name: '豆包 Seed Mini',
    provider: 'doubao',
    model: 'doubao-seed-2-0-mini-260215',
    description: '低时延、高并发，适合轻量级任务',
    supportsThinking: true,
    supportsVision: true,
  },
  {
    id: 'doubao-pro',
    name: '豆包 Seed Pro',
    provider: 'doubao',
    model: 'doubao-seed-2-0-pro-260215',
    description: '旗舰级全能模型，复杂推理与长链路任务',
    supportsThinking: true,
    supportsVision: true,
  },
  {
    id: 'deepseek-default',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    model: 'deepseek-v3-2-251201',
    description: '平衡推理能力与输出长度，适合日常使用',
    supportsThinking: true,
    supportsVision: false,
  },
  {
    id: 'kimi',
    name: 'Kimi K2.5',
    provider: 'kimi',
    model: 'kimi-k2-5-260127',
    description: 'Agent、代码、视觉理解能力突出',
    supportsThinking: true,
    supportsVision: true,
  },
  {
    id: 'glm',
    name: 'GLM-5',
    provider: 'glm',
    model: 'glm-5-0-260211',
    description: '智谱旗舰模型，复杂系统工程与长程Agent任务',
    supportsThinking: false,
    supportsVision: false,
  },
  {
    id: 'qwen',
    name: 'Qwen 3.5 Plus',
    provider: 'qwen',
    model: 'qwen-3-5-plus-260215',
    description: '原生视觉语言模型，推理效率高',
    supportsThinking: false,
    supportsVision: true,
  },
];

export async function GET() {
  return Response.json({ models: AVAILABLE_MODELS });
}
