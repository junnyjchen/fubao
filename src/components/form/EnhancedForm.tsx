/**
 * @fileoverview 增强的表单验证和错误提示组件
 * @description 提供更好的表单验证体验
 * @module components/form/EnhancedForm
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, X, Info, AlertTriangle } from 'lucide-react';

/**
 * 输入框状态
 */
type InputState = 'idle' | 'focused' | 'valid' | 'error' | 'disabled';

/**
 * 验证状态图标
 */
function ValidationIcon({ state }: { state: InputState }) {
  if (state === 'valid') {
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  }
  if (state === 'error') {
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  }
  return null;
}

/**
 * 带验证状态的输入框
 */
interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 验证状态 */
  validationState?: InputState;
  /** 错误消息 */
  errorMessage?: string;
  /** 成功消息 */
  successMessage?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 是否显示字符计数 */
  showCharCount?: boolean;
  /** 最大字符数 */
  maxLength?: number;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 容器类名 */
  containerClassName?: string;
  /** 动画错误提示 */
  animateError?: boolean;
}

export function ValidatedInput({
  validationState = 'idle',
  errorMessage,
  successMessage,
  helpText,
  showCharCount,
  maxLength,
  leftIcon,
  rightIcon,
  containerClassName,
  animateError = true,
  className,
  value,
  onFocus,
  onBlur,
  ...props
}: ValidatedInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const charCount = typeof value === 'string' ? value.length : 0;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  const showError = validationState === 'error' && !focused;
  const showSuccess = validationState === 'valid' && !focused;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {/* 输入框容器 */}
      <div
        className={cn(
          'relative flex items-center rounded-md border transition-all duration-200',
          'focus-within:ring-2 focus-within:ring-offset-0',
          validationState === 'error' && !focused && 'border-destructive focus-within:ring-destructive/20',
          validationState === 'valid' && !focused && 'border-green-500 focus-within:ring-green-500/20',
          validationState === 'disabled' && 'opacity-50 cursor-not-allowed bg-muted/50',
          !validationState || validationState === 'idle' || focused ? 'border-input' : '',
          'focus-within:border-primary focus-within:ring-primary/20',
          leftIcon ? 'pl-10' : 'pl-3',
          rightIcon ? 'pr-10' : 'pr-3'
        )}
      >
        {/* 左侧图标 */}
        {leftIcon && (
          <div className="absolute left-3 text-muted-foreground">
            {leftIcon}
          </div>
        )}

        {/* 输入框 */}
        <input
          ref={inputRef}
          className={cn(
            'flex-1 h-10 bg-transparent outline-none text-sm',
            'placeholder:text-muted-foreground',
            validationState === 'disabled' && 'cursor-not-allowed',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          value={value}
          {...props}
        />

        {/* 右侧图标 */}
        <div className="absolute right-3 flex items-center gap-1.5">
          <ValidationIcon state={validationState} />
          {rightIcon && !showError && !showSuccess && (
            <span className="text-muted-foreground">{rightIcon}</span>
          )}
          {/* 清除按钮 */}
          {props.type !== 'password' && value && focused && (
            <button
              type="button"
              onClick={() => {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype,
                  'value'
                )?.set;
                nativeInputValueSetter?.call(inputRef.current, '');
                inputRef.current?.dispatchEvent(new Event('input', { bubbles: true }));
              }}
              className="p-0.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* 底部信息区域 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {/* 错误提示 */}
          {showError && errorMessage && (
            <p
              className={cn(
                'text-sm text-destructive flex items-center gap-1.5',
                animateError && 'animate-in slide-in-from-top-1'
              )}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errorMessage}
            </p>
          )}

          {/* 成功提示 */}
          {showSuccess && successMessage && (
            <p className="text-sm text-green-600 dark:text-green-500 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {successMessage}
            </p>
          )}

          {/* 帮助文本 */}
          {!showError && !showSuccess && helpText && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              {helpText}
            </p>
          )}
        </div>

        {/* 字符计数 */}
        {showCharCount && maxLength && (
          <p className={cn(
            'text-xs tabular-nums',
            charCount >= maxLength ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 实时密码强度指示器
 */
interface PasswordStrengthProps {
  password: string;
  className?: string;
}

const passwordRules = [
  { label: '至少8个字符', test: (p: string) => p.length >= 8 },
  { label: '包含大写字母', test: (p: string) => /[A-Z]/.test(p) },
  { label: '包含小写字母', test: (p: string) => /[a-z]/.test(p) },
  { label: '包含数字', test: (p: string) => /\d/.test(p) },
  { label: '包含特殊字符', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = passwordRules.filter(rule => rule.test(password)).length;
  
  const strengthLabels = ['太弱', '弱', '一般', '良好', '强'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ];

  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* 强度条 */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < strength ? strengthColors[strength - 1] : 'bg-muted'
            )}
          />
        ))}
      </div>
      
      {/* 强度文字 */}
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-xs font-medium',
          strength <= 2 ? 'text-red-500' : strength <= 3 ? 'text-yellow-500' : 'text-green-500'
        )}>
          {strengthLabels[strength - 1] || '未输入'}
        </span>
        <span className="text-xs text-muted-foreground">
          {strength}/5 规则满足
        </span>
      </div>

      {/* 规则列表 */}
      <ul className="space-y-1">
        {passwordRules.map((rule, i) => (
          <li
            key={i}
            className={cn(
              'text-xs flex items-center gap-1.5 transition-colors',
              rule.test(password) ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
            )}
          >
            {rule.test(password) ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-current" />
            )}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 表单提交状态
 */
type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

/**
 * 提交按钮状态
 */
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: SubmitStatus;
  submittingText?: string;
  successText?: string;
  errorText?: string;
}

export function SubmitButton({
  status = 'idle',
  submittingText = '提交中...',
  successText = '提交成功',
  errorText = '提交失败',
  children,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const isDisabled = disabled || status === 'submitting';

  return (
    <button
      className={cn(
        'relative transition-all duration-200',
        isDisabled && 'opacity-70 cursor-not-allowed',
        status === 'success' && 'bg-green-500 hover:bg-green-600',
        status === 'error' && 'bg-destructive hover:bg-destructive/90',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* 加载状态 */}
      {status === 'submitting' && (
        <>
          <span className="opacity-0">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {submittingText}
          </span>
        </>
      )}

      {/* 成功状态 */}
      {status === 'success' && (
        <span className="flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {successText}
        </span>
      )}

      {/* 错误状态 */}
      {status === 'error' && (
        <span className="flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorText}
        </span>
      )}

      {/* 默认状态 */}
      {status === 'idle' && children}
    </button>
  );
}

/**
 * 错误边界提示
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-destructive">出错了</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {this.state.error?.message || '发生了未知错误'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="mt-3 text-sm text-primary hover:underline"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
