const API_BASE = '/api'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any; headers?: Record<string, string>
}

export async function api<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const { method = 'GET', body, headers = {} } = options
  const config: RequestInit = { method, headers: { 'Content-Type': 'application/json', ...headers } }
  if (body && method !== 'GET') config.body = JSON.stringify(body)
  const response = await fetch(url, config)
  if (!response.ok) throw new Error(`API Error: ${response.status}`)
  return response.json()
}

export const goodsApi = {
  list: (params?: Record<string, any>) => api(`/goods${params ? '?' + new URLSearchParams(params).toString() : ''}`),
  detail: (id: number) => api(`/goods/${id}`),
}
export const newsApi = {
  list: (params?: Record<string, any>) => api(`/news${params ? '?' + new URLSearchParams(params).toString() : ''}`),
  detail: (slug: string) => api(`/news/${slug}`),
}
export const orderApi = {
  list: () => api('/orders'),
  detail: (id: number) => api(`/orders/${id}`),
  create: (data: any) => api('/orders', { method: 'POST', body: data }),
}
