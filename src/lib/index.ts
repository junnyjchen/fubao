/**
 * Lib 目录索引
 * 
 * 本文件统一导出 lib 目录下的公共 API
 */

// API 相关
export { api } from './api-request';
export { API_CONFIG, getApiUrl, getApiMode, isRemoteApi } from './api-config';

// 类型定义 - 从 api-response 和 types 导出
export type { ApiResponse, PaginatedResponse, PageParams, ListParams } from './types';
export type { 
  User, LoginParams, RegisterParams,
  Goods, GoodsSpec, Category,
  Order, OrderItem, CartItem,
  Merchant, Coupon, Address,
  Article, Banner, Notification,
  // AI 相关类型
  AIMessage, AIConversation, AIKnowledge, AIQA, AITrainingTask,
  AIChatRequest, AIKnowledgeSearchResult,
} from './types';

// 工具函数
export * from './utils';
export * from './format';
export * from './validation';
export * from './constants';

// Hooks - 从 hooks.ts 导出
export * from './hooks';
