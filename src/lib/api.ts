import { mockGoods, mockNews, mockBaike } from './mock-data'

const API_BASE = '/api'
let apiAvailable = true

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

async function api<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const { method = 'GET', body, headers = {} } = options

  const config: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    apiAvailable = true
    return response.json()
  } catch (error) {
    apiAvailable = false
    throw error
  }
}

// 商品 API
export const goodsApi = {
  list: async (params?: Record<string, any>) => {
    try {
      const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
      return await api(`/goods${query}`)
    } catch {
      // Mock 数据兜底
      return {
        data: mockGoods.slice(0, params?.limit || 10),
        pagination: { page: 1, limit: params?.limit || 10, total: mockGoods.length, total_pages: 1 }
      }
    }
  },
  detail: async (id: number) => {
    try {
      return await api(`/goods/${id}`)
    } catch {
      const goods = mockGoods.find(g => g.id === id) || mockGoods[0]
      return {
        data: {
          ...goods,
          description: '【商品詳情】\n\n這是一款優質的玄門文化產品，由資深道士手工製作。\n\n產品特點：\n- 正統傳承\n- 手工製作\n- 開光加持\n- 配有精美包裝',
          images: [goods.main_image],
          certificate: goods.is_certified ? {
            certificate_no: `FB-FU-2024-${String(id).padStart(3, '0')}`,
            issue_date: '2024-01-15',
            issued_by: '張天師第六十三代傳人',
          } : null,
        }
      }
    }
  },
}

// 新闻 API
export const newsApi = {
  list: async (params?: Record<string, any>) => {
    try {
      const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
      return await api(`/news${query}`)
    } catch {
      return {
        data: mockNews.slice(0, params?.limit || 10),
        pagination: { page: 1, limit: params?.limit || 10, total: mockNews.length, total_pages: 1 }
      }
    }
  },
  detail: async (slug: string) => {
    try {
      return await api(`/news/${slug}`)
    } catch {
      const news = mockNews.find(n => n.slug === slug || n.id === Number(slug)) || mockNews[0]
      return { data: news }
    }
  },
}

// 订单 API
export const orderApi = {
  list: async () => {
    try {
      return await api('/orders')
    } catch {
      return { data: [] }
    }
  },
  detail: async (id: number) => {
    try {
      return await api(`/orders/${id}`)
    } catch {
      return {
        data: {
          id,
          order_no: `ORD-${Date.now()}`,
          status: 0,
          total_amount: '0.00',
          items: [],
          created_at: new Date().toISOString(),
        }
      }
    }
  },
  create: async (data: any) => {
    try {
      return await api('/orders', { method: 'POST', body: data })
    } catch {
      return { data: { id: Date.now(), order_no: `ORD-${Date.now()}` } }
    }
  },
}

// 百科 API
export const baikeApi = {
  list: async () => {
    try {
      return await api('/baike')
    } catch {
      return { data: mockBaike }
    }
  },
  detail: async (slug: string) => {
    try {
      return await api(`/baike/${slug}`)
    } catch {
      const article = mockBaike.find(a => a.slug === slug || a.id === Number(slug)) || mockBaike[0]
      return { data: article }
    }
  },
}

// 通用 API
export const apiRequest = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return api<T>(`${endpoint}${query}`)
  },
  post: <T = any>(endpoint: string, data?: any) => api<T>(endpoint, { method: 'POST', body: data }),
  put: <T = any>(endpoint: string, data?: any) => api<T>(endpoint, { method: 'PUT', body: data }),
  delete: <T = any>(endpoint: string) => api<T>(endpoint, { method: 'DELETE' }),
}

export { api, apiAvailable }
