'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

// ==================== 数据获取 Hooks ====================

/**
 * 通用数据获取 Hook
 */
export function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<T>(url);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/**
 * 带依赖的数据获取 Hook
 */
export function useFetchDeps<T>(url: string, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get<T>(url);
        if (!cancelled) {
          setData(response);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, ...deps]);

  return { data, loading, error };
}

// ==================== 分页 Hooks ====================

/**
 * 分页数据获取 Hook
 */
interface PaginationParams {
  page?: number;
  page_size?: number;
}

interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export function usePagination<T>(
  url: string,
  initialParams?: PaginationParams
) {
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    page_size: 10,
    ...initialParams,
  });
  const [data, setData] = useState<PaginatedResult<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      const response = await api.get<PaginatedResult<T>>(`${url}?${queryParams}`);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((page_size: number) => {
    setParams({ page: 1, page_size });
  }, []);

  return {
    data: data?.list || [],
    total: data?.total || 0,
    page: data?.page || 1,
    page_size: data?.page_size || 10,
    totalPages: data?.total_pages || 1,
    loading,
    error,
    refresh: fetchData,
    setPage,
    setPageSize,
  };
}

// ==================== 表单提交 Hooks ====================

/**
 * 表单提交 Hook
 */
export function useSubmit<T = unknown>(
  url: string,
  options?: {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const submit = useCallback(
    async (body: unknown) => {
      try {
        setLoading(true);
        setError(null);
        const method = options?.method || 'POST';
        const response = await api.request<T>(url, {
          method,
          body: method !== 'DELETE' ? body : undefined,
        });
        setData(response);
        options?.onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err as Error;
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [url, options]
  );

  return { loading, error, data, submit };
}

// ==================== 搜索 Hooks ====================

/**
 * 搜索 Hook（带防抖）
 */
export function useSearch<T>(
  url: string,
  debounceMs = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(
    async (q: string) => {
      setQuery(q);

      if (!q.trim()) {
        setResults([]);
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          const response = await api.get<T[]>(`${url}?q=${encodeURIComponent(q)}`);
          setResults(response);
          setError(null);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    [url, debounceMs]
  );

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return { query, results, loading, error, search, clear };
}

// ==================== 轮询 Hooks ====================

/**
 * 轮询 Hook
 */
export function usePolling<T>(
  url: string,
  intervalMs = 5000,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const response = await api.get<T>(url);
        if (!cancelled) {
          setData(response);
          setError(null);
          setTimestamp(Date.now());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [url, intervalMs, enabled]);

  return { data, loading, error, timestamp, refresh: () => setTimestamp(Date.now()) };
}

// ==================== 离线缓存 Hooks ====================

/**
 * 带本地缓存的数据获取 Hook
 */
export function useLocalFetch<T>(
  url: string,
  storageKey: string,
  cacheTime = 5 * 60 * 1000 // 5 minutes
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    const now = Date.now();

    if (cached) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (now - timestamp < cacheTime) {
          setData(cachedData);
          setFromCache(true);
          setLoading(false);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    const fetchData = async () => {
      try {
        if (!fromCache) {
          setLoading(true);
        }
        const response = await api.get<T>(url);
        localStorage.setItem(
          storageKey,
          JSON.stringify({ data: response, timestamp: now })
        );
        setData(response);
        setFromCache(false);
        setError(null);
      } catch (err) {
        if (!fromCache) {
          setError(err as Error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!fromCache) {
      fetchData();
    }
  }, [url, storageKey, cacheTime, fromCache]);

  return { data, loading, error, fromCache, refresh: () => {
    localStorage.removeItem(storageKey);
    setFromCache(false);
  }};
}

// ==================== 数组操作 Hooks ====================

/**
 * 分页 Hook（用于前端分页）
 */
export function useArrayPagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  return {
    items: paginatedItems,
    page,
    totalPages,
    total: items.length,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * 过滤 Hook
 */
export function useFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean
) {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const filteredItems = items.filter(filterFn);

  const updateFilter = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filteredItems,
    filters,
    updateFilter,
    resetFilters,
  };
}

// ==================== 列表操作 Hooks ====================

/**
 * 可选中的列表 Hook
 */
export function useSelectableList<T extends { id: number }>(items: T[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggle = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: number) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const selectedItems = items.filter((item) => selectedIds.has(item.id));

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    isAllSelected: items.length > 0 && selectedIds.size === items.length,
    isSomeSelected: selectedIds.size > 0 && selectedIds.size < items.length,
  };
}
