'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseSearchOptions<T> {
  debounceMs?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface SearchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  search: (query: string) => void;
  clear: () => void;
}

/**
 * 搜索 Hook
 * 支持防抖和自动清理
 */
export function useSearch<T>(
  url: string,
  options: UseSearchOptions<T> = {}
): SearchResult<T> {
  const { debounceMs = 300, onSuccess, onError } = options;
  
  const [query, setQuery] = useState('');
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback((q: string) => {
    setQuery(q);
    
    if (!q || q.trim().length < 2) {
      setData(null);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ q: q.trim() });
        const response = await fetch(`${url}?${params}`);
        
        if (!response.ok) {
          throw new Error(`搜索失败: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('搜索出错');
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [url, debounceMs, onSuccess, onError]);

  const clear = useCallback(() => {
    setQuery('');
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, search, clear };
}

/**
 * 通用数据获取 Hook
 */
interface UseFetchOptions<T> {
  immediate?: boolean;
  params?: Record<string, string>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {}
): FetchResult<T> {
  const { immediate = true, params, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let fetchUrl = url;
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        fetchUrl = `${url}?${searchParams}`;
      }

      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('请求出错');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [url, params, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * 分页 Hook
 */
interface UsePaginationOptions<T> {
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

interface PaginationResult<T> {
  data: T[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
}

export function usePagination<T>(
  url: string,
  options: UsePaginationOptions<T> = {}
): PaginationResult<T> & { fetch: (params?: Record<string, string>) => Promise<void> } {
  const { pageSize = 20, onPageChange } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPageState] = useState(1);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<Record<string, string>>({});

  const totalPages = Math.ceil(total / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const fetch = useCallback(async (additionalParams?: Record<string, string>) => {
    setLoading(true);
    
    try {
      const allParams = {
        ...params,
        ...additionalParams,
        page: String(page),
        limit: String(pageSize),
      };
      
      const searchParams = new URLSearchParams(allParams);
      const response = await fetch(`${url}?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.data) {
        setData(result.data);
      }
      if (result.pagination) {
        setTotal(result.pagination.total || 0);
      }
    } catch (err) {
      console.error('Pagination fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [url, page, pageSize, params]);

  useEffect(() => {
    fetch();
  }, [page]);

  const setPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageState(newPage);
      onPageChange?.(newPage);
    }
  }, [totalPages, onPageChange]);

  const next = useCallback(() => {
    if (hasNext) setPage(page + 1);
  }, [hasNext, page, setPage]);

  const prev = useCallback(() => {
    if (hasPrev) setPage(page - 1);
  }, [hasPrev, page, setPage]);

  return {
    data,
    loading,
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    setPage,
    next,
    prev,
    fetch,
  };
}

/**
 * 表单提交 Hook
 */
interface UseSubmitOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

interface SubmitResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  submit: (body: any) => Promise<T | null>;
  reset: () => void;
}

export function useSubmit<T>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options: UseSubmitOptions<T> = {}
): SubmitResult<T> {
  const { onSuccess, onError, onFinally } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(async (body: any): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || '提交失败');
      }

      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('提交出错');
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
      onFinally?.();
    }
  }, [url, method, onSuccess, onError, onFinally]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, submit, reset };
}
