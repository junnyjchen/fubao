/**
 * @fileoverview 确认对话框组件
 * @description 用于确认操作的模态对话框
 * @module components/ui/ConfirmDialog
 */

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '確認',
  cancelText = '取消',
  onConfirm,
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={variant}
              onClick={handleConfirm}
              disabled={loading}
              className="min-w-[80px]"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 删除确认对话框
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = '確認刪除',
  description = '此操作無法撤銷，確定要刪除嗎？',
  onConfirm,
  loading = false,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText="刪除"
      cancelText="取消"
      onConfirm={onConfirm}
      variant="destructive"
      loading={loading}
    />
  );
}

// 操作确认对话框（批量操作等）
interface ActionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  actionText?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ActionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  actionText = '確認',
  onConfirm,
  loading = false,
}: ActionConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText={actionText}
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}
