'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  isActive: boolean;
  priority: number;
  maxTokens: number;
  temperature: number;
  createdAt: string;
  updatedAt: string;
}

const PROVIDER_PRESETS: Record<string, { name: string; baseUrl: string; models: string[] }> = {
  openai: { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'] },
  qwen: { name: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-plus', 'qwen-max', 'qwen-turbo'] },
  zhipu: { name: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4-plus', 'glm-4-flash'] },
  moonshot: { name: 'Moonshot', baseUrl: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'] },
  baidu: { name: '文心一言', baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat', models: ['ernie-4.0-8k', 'ernie-3.5-8k'] },
  custom: { name: '自定义', baseUrl: '', models: [] },
};

export default function AIModelsPage() {
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    provider: 'openai',
    apiKey: '',
    baseUrl: '',
    model: '',
    isActive: true,
    priority: 1,
    maxTokens: 4096,
    temperature: 0.7,
  });

  const loadModels = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ai-models');
      const data = await res.json();
      setModels(data.models || []);
    } catch {
      toast.error('加载模型列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadModels(); }, [loadModels]);

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider];
    setForm(f => ({
      ...f,
      provider,
      baseUrl: preset?.baseUrl || '',
      model: preset?.models?.[0] || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = { ...form };
      if (editingId) body.id = editingId;

      const res = await fetch('/api/admin/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success(editingId ? '模型已更新' : '模型已添加');
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', provider: 'openai', apiKey: '', baseUrl: '', model: '', isActive: true, priority: 1, maxTokens: 4096, temperature: 0.7 });
      loadModels();
    } catch {
      toast.error('保存失败');
    }
  };

  const handleEdit = (m: AIModelConfig) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      provider: m.provider,
      apiKey: '',
      baseUrl: m.baseUrl,
      model: m.model,
      isActive: m.isActive,
      priority: m.priority,
      maxTokens: m.maxTokens,
      temperature: m.temperature,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此模型配置？')) return;
    try {
      const res = await fetch(`/api/admin/ai-models?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      toast.success('已删除');
      loadModels();
    } catch {
      toast.error('删除失败');
    }
  };

  const handleToggleActive = async (m: AIModelConfig) => {
    try {
      const res = await fetch('/api/admin/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...m, isActive: !m.isActive, apiKey: m.apiKey }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      loadModels();
    } catch {
      toast.error('操作失败');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI 模型配置</h1>
          <p className="text-muted-foreground mt-1">配置多个大模型 API，AI 助手将按优先级自动选择可用模型</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          + 添加模型
        </button>
      </div>

      {/* 模型列表 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : models.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground mb-4">还没有配置任何 AI 模型</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            添加第一个模型
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map(m => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-foreground">{m.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {m.isActive ? '启用' : '停用'}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {PROVIDER_PRESETS[m.provider]?.name || m.provider}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {m.baseUrl} / {m.model}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  API Key: {m.apiKey} · 优先级: {m.priority} · 温度: {m.temperature}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggleActive(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${m.isActive ? 'border-border hover:bg-muted text-foreground' : 'border-primary/30 hover:bg-primary/5 text-primary'}`}
                >
                  {m.isActive ? '停用' : '启用'}
                </button>
                <button onClick={() => handleEdit(m)} className="px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors text-foreground">
                  编辑
                </button>
                <button onClick={() => handleDelete(m.id)} className="px-3 py-1.5 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10 transition-colors">
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 添加/编辑弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-foreground mb-4">{editingId ? '编辑模型' : '添加模型'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">模型名称</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="例如：GPT-4o"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">模型提供商</label>
                <select
                  value={form.provider}
                  onChange={e => handleProviderChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {Object.entries(PROVIDER_PRESETS).map(([key, p]) => (
                    <option key={key} value={key}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">API Key</label>
                <input
                  type="password"
                  required={!editingId}
                  value={form.apiKey}
                  onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                  placeholder={editingId ? '留空则不修改' : 'sk-...'}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">API 地址</label>
                <input
                  type="text"
                  required
                  value={form.baseUrl}
                  onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">模型标识</label>
                <input
                  type="text"
                  required
                  value={form.model}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="gpt-4o"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {PROVIDER_PRESETS[form.provider]?.models.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {PROVIDER_PRESETS[form.provider].models.map(m => (
                      <button key={m} type="button" onClick={() => setForm(f => ({ ...f, model: m }))}
                        className={`px-2 py-0.5 text-xs rounded border transition-colors ${form.model === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">优先级</label>
                  <input type="number" min={1} max={99} value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">温度 (0-2)</label>
                  <input type="number" min={0} max={2} step={0.1} value={form.temperature}
                    onChange={e => setForm(f => ({ ...f, temperature: parseFloat(e.target.value) || 0.7 }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">最大 Token</label>
                <input type="number" min={256} max={128000} value={form.maxTokens}
                  onChange={e => setForm(f => ({ ...f, maxTokens: parseInt(e.target.value) || 4096 }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground">启用此模型</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  {editingId ? '保存修改' : '添加模型'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
