/**
 * @fileoverview Toast通知封装
 * @description 统一的Toast消息通知工具
 * @module lib/toast
 */

import { toast as sonnerToast } from 'sonner';

// 基础类型
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * 显示Toast通知
 */
function showToast(type: ToastType, title: string, options?: ToastOptions) {
  const duration = options?.duration || 3000;

  switch (type) {
    case 'success':
      sonnerToast.success(title, {
        description: options?.description,
        duration,
        action: options?.action,
      });
      break;
    case 'error':
      sonnerToast.error(title, {
        description: options?.description,
        duration,
        action: options?.action,
      });
      break;
    case 'warning':
      sonnerToast.warning(title, {
        description: options?.description,
        duration,
        action: options?.action,
      });
      break;
    case 'info':
      sonnerToast.info(title, {
        description: options?.description,
        duration,
        action: options?.action,
      });
      break;
  }
}

// 导出的Toast工具
export const toast = {
  success: (title: string, options?: ToastOptions) =>
    showToast('success', title, options),

  error: (title: string, options?: ToastOptions) =>
    showToast('error', title, options),

  warning: (title: string, options?: ToastOptions) =>
    showToast('warning', title, options),

  info: (title: string, options?: ToastOptions) =>
    showToast('info', title, options),

  // 加载状态Toast
  loading: (title: string, options?: ToastOptions) =>
    sonnerToast.loading(title, {
      description: options?.description,
    }),

  // 自定义Promise Toast
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  // 取消Toast
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

// 预设的消息模板
export const toastMessages = {
  // 成功消息
  success: {
    login: '登錄成功',
    logout: '已安全退出',
    register: '註冊成功',
    save: '保存成功',
    update: '更新成功',
    delete: '刪除成功',
    create: '創建成功',
    submit: '提交成功',
    copy: '已複製到剪貼板',
    order: '下單成功',
    payment: '支付成功',
    favorite: '已加入收藏',
    unfavorite: '已取消收藏',
    cart: '已加入購物車',
    coupon: '優惠券領取成功',
  },

  // 错误消息
  error: {
    network: '網絡錯誤，請稍後重試',
    unknown: '發生未知錯誤',
    login: '登錄失敗，請檢查賬號密碼',
    register: '註冊失敗，請稍後重試',
    save: '保存失敗',
    update: '更新失敗',
    delete: '刪除失敗',
    create: '創建失敗',
    submit: '提交失敗',
    unauthorized: '請先登錄',
    forbidden: '無權限操作',
    notFound: '資源不存在',
    payment: '支付失敗',
    coupon: '優惠券領取失敗',
    outOfStock: '商品庫存不足',
  },

  // 警告消息
  warning: {
    leave: '確定要離開嗎？未保存的內容將丟失',
    delete: '確定要刪除嗎？此操作不可恢復',
    logout: '確定要退出登錄嗎？',
    clearCart: '確定要清空購物車嗎？',
  },

  // 信息消息
  info: {
    maintenance: '系統正在維護中',
    update: '發現新版本，建議更新',
    newMessage: '您有新消息',
    orderStatus: '訂單狀態已更新',
  },
};

// 使用示例：
/*
import { toast, toastMessages } from '@/lib/toast';

// 成功消息
toast.success(toastMessages.success.login);
toast.success('自定義成功消息', { description: '詳細描述' });

// 错误消息
toast.error(toastMessages.error.network);
toast.error('自定義錯誤消息', { 
  description: '詳細描述',
  action: { label: '重試', onClick: () => {} }
});

// Promise Toast
toast.promise(fetchData(), {
  loading: '加載中...',
  success: '加載成功',
  error: '加載失敗',
});
*/
