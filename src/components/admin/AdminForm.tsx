/**
 * @fileoverview 后台管理表单组件
 * @description 提供统一的表单字段组件，简化表单开发
 * @module components/admin/AdminForm
 */

'use client';

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

/** 表单字段包装器属性 */
interface FormFieldWrapperProps {
  /** 字段标签 */
  label: string;
  /** 字段标识 */
  name: string;
  /** 是否必填 */
  required?: boolean;
  /** 错误信息 */
  error?: string;
  /** 提示信息 */
  hint?: string;
  /** 子元素 */
  children: ReactNode;
  /** 标签宽度 */
  labelWidth?: string;
  /** 是否水平布局 */
  horizontal?: boolean;
}

/**
 * 表单字段包装器
 * @param props - 组件属性
 * @returns 表单字段包装器组件
 */
export function FormFieldWrapper({
  label,
  name,
  required = false,
  error,
  hint,
  children,
  labelWidth = '120px',
  horizontal = false,
}: FormFieldWrapperProps) {
  const containerClass = horizontal
    ? 'flex items-start gap-4'
    : 'space-y-2';

  return (
    <div className={containerClass}>
      <Label
        htmlFor={name}
        className={cn(
          'text-sm font-medium',
          horizontal && 'flex-shrink-0 pt-2',
          error && 'text-destructive'
        )}
        style={horizontal ? { width: labelWidth } : undefined}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className={cn('flex-1 space-y-1', !horizontal && 'pt-0')}>
        {children}
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}

/** 输入框字段属性 */
interface FormInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 字段标签 */
  label: string;
  /** 是否必填 */
  required?: boolean;
  /** 错误信息 */
  error?: string;
  /** 提示信息 */
  hint?: string;
  /** 是否水平布局 */
  horizontal?: boolean;
}

/**
 * 表单输入框字段
 */
export const FormInputField = forwardRef<HTMLInputElement, FormInputFieldProps>(
  ({ label, required, error, hint, horizontal, className, ...props }, ref) => {
    return (
      <FormFieldWrapper
        label={label}
        name={props.name || ''}
        required={required}
        error={error}
        hint={hint}
        horizontal={horizontal}
      >
        <Input
          ref={ref}
          className={cn(error && 'border-destructive', className)}
          {...props}
        />
      </FormFieldWrapper>
    );
  }
);

FormInputField.displayName = 'FormInputField';

/** 文本域字段属性 */
interface FormTextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 字段标签 */
  label: string;
  /** 是否必填 */
  required?: boolean;
  /** 错误信息 */
  error?: string;
  /** 提示信息 */
  hint?: string;
  /** 是否水平布局 */
  horizontal?: boolean;
}

/**
 * 表单文本域字段
 */
export const FormTextareaField = forwardRef<HTMLTextAreaElement, FormTextareaFieldProps>(
  ({ label, required, error, hint, horizontal, className, ...props }, ref) => {
    return (
      <FormFieldWrapper
        label={label}
        name={props.name || ''}
        required={required}
        error={error}
        hint={hint}
        horizontal={horizontal}
      >
        <Textarea
          ref={ref}
          className={cn(error && 'border-destructive', className)}
          {...props}
        />
      </FormFieldWrapper>
    );
  }
);

FormTextareaField.displayName = 'FormTextareaField';

/** 下拉选择字段属性 */
interface FormSelectFieldProps {
  /** 字段标签 */
  label: string;
  /** 字段标识 */
  name: string;
  /** 是否必填 */
  required?: boolean;
  /** 错误信息 */
  error?: string;
  /** 提示信息 */
  hint?: string;
  /** 是否水平布局 */
  horizontal?: boolean;
  /** 当前值 */
  value?: string;
  /** 值变化回调 */
  onValueChange?: (value: string) => void;
  /** 占位符 */
  placeholder?: string;
  /** 选项列表 */
  options: Array<{ value: string; label: string }>;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 表单下拉选择字段
 */
export function FormSelectField({
  label,
  name,
  required,
  error,
  hint,
  horizontal,
  value,
  onValueChange,
  placeholder = '請選擇',
  options,
  disabled,
}: FormSelectFieldProps) {
  return (
    <FormFieldWrapper
      label={label}
      name={name}
      required={required}
      error={error}
      hint={hint}
      horizontal={horizontal}
    >
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(error && 'border-destructive')}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
}

/** 开关字段属性 */
interface FormSwitchFieldProps {
  /** 字段标签 */
  label: string;
  /** 字段标识 */
  name: string;
  /** 提示信息 */
  hint?: string;
  /** 是否水平布局 */
  horizontal?: boolean;
  /** 当前值 */
  checked?: boolean;
  /** 值变化回调 */
  onCheckedChange?: (checked: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 表单开关字段
 */
export function FormSwitchField({
  label,
  name,
  hint,
  horizontal,
  checked,
  onCheckedChange,
  disabled,
}: FormSwitchFieldProps) {
  return (
    <div className={cn('flex items-center gap-4', horizontal && 'justify-between')}>
      <div className="space-y-0.5">
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch
        id={name}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

/** 表单操作按钮组属性 */
interface FormActionsProps {
  /** 提交按钮文本 */
  submitText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否正在提交 */
  submitting?: boolean;
  /** 提交按钮是否禁用 */
  submitDisabled?: boolean;
  /** 子元素（额外的按钮） */
  children?: ReactNode;
}

/**
 * 表单操作按钮组
 */
export function FormActions({
  submitText = '提交',
  cancelText = '取消',
  onCancel,
  submitting = false,
  submitDisabled = false,
  children,
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t">
      {children}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          disabled={submitting}
        >
          {cancelText}
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={submitting || submitDisabled}
      >
        {submitting ? '提交中...' : submitText}
      </button>
    </div>
  );
}

/** 表单容器属性 */
interface FormContainerProps {
  /** 子元素 */
  children: ReactNode;
  /** 提交回调 */
  onSubmit?: (e: React.FormEvent) => void;
  /** 是否加载中 */
  loading?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 表单容器
 */
export function FormContainer({
  children,
  onSubmit,
  loading = false,
  className,
}: FormContainerProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'space-y-6',
        loading && 'pointer-events-none opacity-60',
        className
      )}
    >
      {children}
    </form>
  );
}
