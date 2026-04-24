/**
 * @fileoverview 批量操作组件
 * @description 用于表格批量选择和操作的组件
 * @module components/ui/BatchActions
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Trash2, 
  CheckSquare, 
  X, 
  MoreHorizontal,
  Download,
  Archive,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BatchAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick: (ids: string[]) => void | Promise<void>;
  confirm?: boolean;
  confirmMessage?: string;
}

interface BatchActionsProps<T extends { id: string }> {
  data: T[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  actions?: BatchAction[];
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
  className?: string;
}

export function BatchActions<T extends { id: string }>({
  data,
  selectedIds,
  onSelectionChange,
  actions,
  className,
}: BatchActionsProps<T>) {
  const allIds = data.map(item => item.id);
  const isAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
  const isPartialSelected = selectedIds.length > 0 && !isAllSelected;

  // 全选/取消全选
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allIds);
    }
  }, [isAllSelected, allIds, onSelectionChange]);

  // 清除选择
  const handleClearSelection = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  // 默认操作
  const defaultActions: BatchAction[] = actions || [
    {
      label: '批量刪除',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'destructive',
      onClick: async (ids) => {
        console.log('删除:', ids);
      },
      confirm: true,
      confirmMessage: '確定要刪除選中的項目嗎？',
    },
    {
      label: '批量導出',
      icon: <Download className="w-4 h-4" />,
      onClick: async (ids) => {
        console.log('导出:', ids);
      },
    },
  ];

  if (selectedIds.length === 0) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Checkbox
          checked={isAllSelected}
          ref={(ref) => {
            if (ref) {
              (ref as HTMLButtonElement).dataset.state = isPartialSelected ? 'indeterminate' : isAllSelected ? 'checked' : 'unchecked';
            }
          }}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm text-muted-foreground">全選</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 bg-muted/50 rounded-lg',
        className
      )}
    >
      {/* 选择状态 */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          ref={(ref) => {
            if (ref) {
              (ref as HTMLButtonElement).dataset.state = isPartialSelected ? 'indeterminate' : isAllSelected ? 'checked' : 'unchecked';
            }
          }}
          onCheckedChange={handleSelectAll}
        />
        <Badge variant="secondary">
          已選擇 {selectedIds.length} 項
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearSelection}
        >
          <X className="w-4 h-4" />
          取消選擇
        </Button>
      </div>

      {/* 批量操作按钮 */}
      <div className="flex items-center gap-2 ml-auto">
        {defaultActions.slice(0, 2).map((action, index) => (
          <Button
            key={index}
            variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => action.onClick(selectedIds)}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </Button>
        ))}

        {/* 更多操作 */}
        {defaultActions.length > 2 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
                更多操作
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {defaultActions.slice(2).map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(selectedIds)}
                  className={cn(
                    action.variant === 'destructive' && 'text-destructive'
                  )}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// 简化的批量选择行
interface BatchRowProps {
  id: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function BatchRow({
  id,
  isSelected,
  onToggle,
  children,
  className,
}: BatchRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        isSelected && 'bg-primary/5',
        className
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(id)}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}

// 批量操作工具栏（用于表格头部）
interface BatchToolbarProps {
  total: number;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  children?: React.ReactNode;
}

export function BatchToolbar({
  total,
  selectedCount,
  onSelectAll,
  onClearSelection,
  children,
}: BatchToolbarProps) {
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-muted/30 border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedCount === total && total > 0}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedCount > 0
              ? `已選擇 ${selectedCount}/${total} 項`
              : `共 ${total} 項`}
          </span>
        </div>
        
        {selectedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            <X className="w-4 h-4 mr-1" />
            清除選擇
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

// 预设的批量操作
export function useBatchActions<T extends { id: string }>(
  data: T[],
  onBatchDelete?: (ids: string[]) => Promise<void>,
  onBatchExport?: (ids: string[]) => void
) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(data.map(item => item.id));
  }, [data]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const actions: BatchAction[] = [
    {
      label: '批量刪除',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'destructive',
      onClick: async (ids) => {
        if (onBatchDelete) {
          await onBatchDelete(ids);
          clearSelection();
        }
      },
    },
    {
      label: '批量導出',
      icon: <Download className="w-4 h-4" />,
      onClick: (ids) => {
        if (onBatchExport) {
          onBatchExport(ids);
        }
      },
    },
    {
      label: '批量上架',
      icon: <Eye className="w-4 h-4" />,
      onClick: (ids) => {
        console.log('上架:', ids);
      },
    },
    {
      label: '批量下架',
      icon: <EyeOff className="w-4 h-4" />,
      onClick: (ids) => {
        console.log('下架:', ids);
      },
    },
    {
      label: '批量歸檔',
      icon: <Archive className="w-4 h-4" />,
      onClick: (ids) => {
        console.log('归档:', ids);
      },
    },
    {
      label: '批量發送',
      icon: <Send className="w-4 h-4" />,
      onClick: (ids) => {
        console.log('发送:', ids);
      },
    },
  ];

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    actions,
  };
}
