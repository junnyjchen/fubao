/**
 * @fileoverview AI 模型配置 API
 * GET  /api/admin/ai-models      - 获取所有模型
 * POST /api/admin/ai-models      - 添加/更新模型
 * DELETE /api/admin/ai-models?id=xxx - 删除模型
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadModels, updateModel, deleteModel, type AIModelConfig } from '@/lib/ai/store';
import { insert, queryOne } from '@/lib/db';

export async function GET() {
  try {
    const models = await loadModels();
    // 不返回完整 apiKey，只返回前4位+后4位
    const safeModels = models.map(m => ({
      ...m,
      apiKey: m.apiKey ? m.apiKey.slice(0, 4) + '****' + m.apiKey.slice(-4) : '',
    }));
    return NextResponse.json({ models: safeModels });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, provider, apiKey, baseUrl, model, isActive, priority, maxTokens, temperature } = body;

    if (!name || !provider || !baseUrl || !model) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (id) {
      // 更新已有模型
      const existing = await queryOne('SELECT id FROM ai_model_configs WHERE id = ?', [Number(id)]);
      if (!existing) {
        return NextResponse.json({ error: '模型不存在' }, { status: 404 });
      }
      // 构建更新数据
      const updateData: Partial<AIModelConfig> = {
        name,
        provider,
        baseUrl,
        model,
        isActive: isActive ?? true,
        priority: priority ?? 99,
        maxTokens: maxTokens ?? 4096,
        temperature: temperature ?? 0.7,
      };
      // 如果传了新的 apiKey 且不是掩码，则更新
      if (apiKey && !apiKey.includes('****')) {
        updateData.apiKey = apiKey;
      }
      const ok = await updateModel(String(id), updateData);
      if (!ok) {
        return NextResponse.json({ error: '更新失败' }, { status: 500 });
      }
    } else {
      // 新增模型
      if (!apiKey || apiKey.includes('****')) {
        return NextResponse.json({ error: '请提供有效的 API Key' }, { status: 400 });
      }
      const models = await loadModels();
      await insert('ai_model_configs', {
        name,
        provider,
        api_key: apiKey,
        base_url: baseUrl,
        model_name: model,
        status: isActive ? 1 : 0,
        priority: priority ?? models.length + 1,
        max_tokens: maxTokens ?? 4096,
        temperature: temperature ?? 0.7,
        is_default: isActive ? 1 : 0,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少模型 ID' }, { status: 400 });
    }

    const ok = await deleteModel(id);
    if (!ok) {
      return NextResponse.json({ error: '模型不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
