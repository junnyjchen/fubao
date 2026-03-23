/**
 * @fileoverview 后台管理数据操作 Hook
 * @description 提供统一的数据获取、创建、更新、删除操作
 * @module hooks/useAdminData
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

/** 分页状态 */
interface PaginationState {
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总数量 */
  total: number;
}

/** 数据状态 */
interface DataState<T> {
  /** 数据列表 */
  data: T[];
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 分页信息 */
  pagination: PaginationState;
}

/** 查询参数 */
interface QueryParams {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 其他参数 */
  [key: string]: string | number | boolean | undefined;
}

/**
 * 后台管理数据操作 Hook
 * @param apiPath - API 路径
 * @param initialPageSize - 初始每页数量
 * @returns 数据状态和操作方法
 */
export function useAdminData<T extends { id: number | string }>(
  apiPath: string,
  initialPageSize: number = 20
) {
  const [state, setState] = useState<DataState<T>>({
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: initialPageSize,
      total: 0,
    },
  });

  /**
   * 获取数据列表
   * @param params - 查询参数
   */
  const fetchData = useCallback(async (params?: QueryParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const searchParams = new URLSearchParams();
      
      // 添加分页参数
      const page = params?.page ?? state.pagination.page;
      const pageSize = params?.pageSize ?? state.pagination.pageSize;
      searchParams.set('page', String(page));
      searchParams.set('limit', String(pageSize));

      // 添加其他参数
      Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && key !== 'page' && key !== 'pageSize') {
          searchParams.set(key, String(value));
        }
      });

      const response = await fetch(`${apiPath}?${searchParams.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '獲取數據失敗');
      }

      setState((prev) => ({
        ...prev,
        data: result.data || [],
        loading: false,
        pagination: {
          ...prev.pagination,
          page,
          pageSize,
          total: result.total || result.data?.length || 0,
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '獲取數據失敗',
      }));
    }
  }, [apiPath, state.pagination.page, state.pagination.pageSize]);

  /**
   * 创建数据
   * @param item - 新数据
   * @returns 是否成功
   */
  const createItem = useCallback(async (item: Partial<T>): Promise<boolean> => {
    try {
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '創建失敗');
      }

      await fetchData();
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '創建失敗',
      }));
      return false;
    }
  }, [apiPath, fetchData]);

  /**
   * 更新数据
   * @param id - 数据ID
   * @param item - 更新数据
   * @returns 是否成功
   */
  const updateItem = useCallback(async (id: T['id'], item: Partial<T>): Promise<boolean> => {
    try {
      const response = await fetch(`${apiPath}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '更新失敗');
      }

      await fetchData();
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '更新失敗',
      }));
      return false;
    }
  }, [apiPath, fetchData]);

  /**
   * 删除数据
   * @param id - 数据ID
   * @returns 是否成功
   */
  const deleteItem = useCallback(async (id: T['id']): Promise<boolean> => {
    if (!confirm('確定要刪除此項目嗎？')) {
      return false;
    }

    try {
      const response = await fetch(`${apiPath}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '刪除失敗');
      }

      await fetchData();
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '刪除失敗',
      }));
      return false;
    }
  }, [apiPath, fetchData]);

  /**
   * 更新分页
   * @param pagination - 新的分页状态
   */
  const updatePagination = useCallback((pagination: Partial<PaginationState>) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, ...pagination },
    }));
  }, []);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 初始化加载数据
  useEffect(() => {
    fetchData();
  }, [state.pagination.page, state.pagination.pageSize]);

  return {
    ...state,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    updatePagination,
    clearError,
  };
}

/**
 * 获取单个数据的 Hook
 * @param apiPath - API 路径
 * @param id - 数据ID
 * @returns 数据状态和刷新方法
 */
export function useAdminItem<T>(apiPath: string, id: string | number | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取数据
   */
  const fetchItem = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiPath}/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '獲取數據失敗');
      }

      setData(result.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '獲取數據失敗');
    } finally {
      setLoading(false);
    }
  }, [apiPath, id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    data,
    loading,
    error,
    refresh: fetchItem,
  };
}
