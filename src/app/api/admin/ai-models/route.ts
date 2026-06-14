/**
 * @fileoverview AI 模型配置 API
 * GET  /api/admin/ai-models      - 获取所有模型
 * POST /api/admin/ai-models      - 添加/更新模型
 * DELETE /api/admin/ai-models?id=xxx - 删除模型
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadModels, saveModels, type AIModelConfig } from '@/lib/ai/store';

export async function GET() {
  try {
    const models = loadModels();
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
    const models = loadModels();

    const { id, name, provider, apiKey, baseUrl, model, isActive, priority, maxTokens, temperature } = body;

    if (!name || !provider || !baseUrl || !model) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (id) {
      // 更新已有模型
      const idx = models.findIndex(m => m.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: '模型不存在' }, { status: 404 });
      }
      // 如果传了新的 apiKey 且不是掩码，则更新
      if (apiKey && !apiKey.includes('****')) {
        models[idx].apiKey = apiKey;
      }
      models[idx].name = name;
      models[idx].provider = provider;
      models[idx].baseUrl = baseUrl;
      models[idx].model = model;
      models[idx].isActive = isActive ?? models[idx].isActive;
      models[idx].priority = priority ?? models[idx].priority;
      models[idx].maxTokens = maxTokens ?? models[idx].maxTokens;
      models[idx].temperature = temperature ?? models[idx].temperature;
      models[idx].updatedAt = now;
    } else {
      // 新增模型
      if (!apiKey || apiKey.includes('****')) {
        return NextResponse.json({ error: '请提供有效的 API Key' }, { status: 400 });
      }
      const newModel: AIModelConfig = {
        id: `${provider}-${Date.now()}`,
        name,
        provider,
        apiKey,
        baseUrl,
        model,
        isActive: isActive ?? false,
        priority: priority ?? models.length + 1,
        maxTokens: maxTokens ?? 4096,
        temperature: temperature ?? 0.7,
        createdAt: now,
        updatedAt: now,
      };
      models.push(newModel);
    }

    saveModels(models);
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

    const models = loadModels();
    const filtered = models.filter(m => m.id !== id);
    if (filtered.length === models.length) {
      return NextResponse.json({ error: '模型不存在' }, { status: 404 });
    }

    saveModels(filtered);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
