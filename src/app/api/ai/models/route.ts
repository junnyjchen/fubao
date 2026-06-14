/**
 * 获取可用模型列表 API
 * GET /api/ai/models
 */
import { getModelConfigs } from '@/lib/ai/store';

export async function GET() {
  try {
    const configs = getModelConfigs();
    // 只返回已启用的模型，隐藏敏感信息
    const models = configs
      .filter(c => c.isActive)
      .map(({ id, name, provider, model }) => ({ id, name, provider, model }));

    return Response.json({ models });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
