/**
 * AI训练相关API接口封装
 */

// 获取知识库列表
export async function getKnowledgeList(params: {
  page?: number;
  page_size?: number;
  category?: string;
  status?: string;
  keyword?: string;
}) {
  const { api } = await import('@/lib/api');
  return api.get('/admin/ai/training/knowledge', { params });
}

// 获取知识库详情
export async function getKnowledgeDetail(id: number) {
  const { api } = await import('@/lib/api');
  return api.get('/admin/ai/training/knowledgeDetail', { params: { id } });
}

// 创建知识库
export async function createKnowledge(data: {
  title: string;
  content: string;
  category?: string;
  source_type?: string;
  source_url?: string;
  tags?: string[];
  status?: string;
}) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/knowledgeCreate', data);
}

// 更新知识库
export async function updateKnowledge(data: {
  id: number;
  title?: string;
  content?: string;
  category?: string;
  source_type?: string;
  source_url?: string;
  tags?: string[];
  status?: string;
}) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/knowledgeUpdate', data);
}

// 删除知识库
export async function deleteKnowledge(id: number) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/knowledgeDelete', { id });
}

// 批量导入知识库
export async function batchImportKnowledge(data: {
  data: Array<{
    title: string;
    content: string;
    category?: string;
    tags?: string[];
  }>;
  category?: string;
}) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/knowledgeBatchImport', data);
}

// 获取问答对列表
export async function getQAList(params: {
  page?: number;
  page_size?: number;
  category?: string;
  knowledge_id?: number;
}) {
  const { api } = await import('@/lib/api');
  return api.get('/admin/ai/training/qa', { params });
}

// 创建问答对
export async function createQA(data: {
  question: string;
  answer: string;
  category?: string;
  knowledge_id?: number;
  keywords?: string[];
}) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/qaCreate', data);
}

// 更新问答对
export async function updateQA(data: {
  id: number;
  question?: string;
  answer?: string;
  category?: string;
  keywords?: string[];
  is_active?: boolean;
}) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/qaUpdate', data);
}

// 删除问答对
export async function deleteQA(id: number) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/qaDelete', { id });
}

// 从知识库生成问答对
export async function generateQA(knowledgeId: number) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/generateQA', { knowledge_id: knowledgeId });
}

// 获取训练任务列表
export async function getTrainingTasks(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}) {
  const { api } = await import('@/lib/api');
  return api.get('/admin/ai/training/tasks', { params });
}

// 创建训练任务
export async function createTrainingTask(data: {
  name: string;
  description?: string;
  type?: string;
  knowledge_ids?: number[];
}) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/taskCreate', data);
}

// 启动训练任务
export async function startTrainingTask(id: number) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/taskStart', { id });
}

// 取消训练任务
export async function cancelTrainingTask(id: number) {
  const { api } = await import('@/lib/api');
  return api.post('/admin/ai/training/taskCancel', { id });
}

// 获取训练统计
export async function getTrainingStats() {
  const { api } = await import('@/lib/api');
  return api.get('/admin/ai/training/stats');
}

// 搜索知识库
export async function searchKnowledge(params: {
  query: string;
  category?: string;
  limit?: number;
}) {
  const { api } = await import('@/lib/api');
  return api.get('/admin/ai/training/search', { params });
}

// 获取推荐问答（用户端）
export async function getRecommendedQA(params: {
  query: string;
  limit?: number;
}) {
  const { api } = await import('@/lib/api');
  return api.get('/ai/recommendQA', { params });
}
