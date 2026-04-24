/**
 * AI训练相关API接口封装
 */

import { getApiUrl } from './api-config';

// 基础请求函数
async function request<T = any>(
  method: string,
  path: string,
  data?: any,
  params?: any
): Promise<T> {
  const url = getApiUrl(path);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  // 处理 GET 请求的参数
  if (method === 'GET' && params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    options.body = undefined;
  } else if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// API 对象
const api = {
  get: <T = any>(path: string, config?: { params?: any }) => 
    request<T>( 'GET', path, undefined, config?.params),
  post: <T = any>(path: string, data?: any) => 
    request<T>('POST', path, data),
  put: <T = any>(path: string, data?: any) => 
    request<T>('PUT', path, data),
  delete: <T = any>(path: string, data?: any) => 
    request<T>('DELETE', path, data),
};

// 获取知识库列表
export async function getKnowledgeList(params: {
  page?: number;
  page_size?: number;
  category?: string;
  status?: string;
  keyword?: string;
}) {
  return api.get('/admin/ai/training/knowledge', { params });
}

// 获取知识库详情
export async function getKnowledgeDetail(id: number) {
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
  return api.post('/admin/ai/training/knowledgeUpdate', data);
}

// 删除知识库
export async function deleteKnowledge(id: number) {
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
  return api.post('/admin/ai/training/knowledgeBatchImport', data);
}

// 获取问答对列表
export async function getQAList(params: {
  page?: number;
  page_size?: number;
  category?: string;
  knowledge_id?: number;
}) {
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
  return api.post('/admin/ai/training/qaUpdate', data);
}

// 删除问答对
export async function deleteQA(id: number) {
  return api.post('/admin/ai/training/qaDelete', { id });
}

// 从知识库生成问答对
export async function generateQA(knowledgeId: number) {
  return api.post('/admin/ai/training/generateQA', { knowledge_id: knowledgeId });
}

// 获取训练任务列表
export async function getTrainingTasks(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}) {
  return api.get('/admin/ai/training/tasks', { params });
}

// 创建训练任务
export async function createTrainingTask(data: {
  name: string;
  description?: string;
  type?: string;
  knowledge_ids?: number[];
}) {
  return api.post('/admin/ai/training/taskCreate', data);
}

// 启动训练任务
export async function startTrainingTask(id: number) {
  return api.post('/admin/ai/training/taskStart', { id });
}

// 取消训练任务
export async function cancelTrainingTask(id: number) {
  return api.post('/admin/ai/training/taskCancel', { id });
}

// 获取训练统计
export async function getTrainingStats() {
  return api.get('/admin/ai/training/stats');
}

// 搜索知识库
export async function searchKnowledge(params: {
  query: string;
  category?: string;
  limit?: number;
}) {
  return api.get('/admin/ai/training/search', { params });
}

// 获取推荐问答（用户端）
export async function getRecommendedQA(params: {
  query: string;
  limit?: number;
}) {
  return api.get('/ai/recommendQA', { params });
}
