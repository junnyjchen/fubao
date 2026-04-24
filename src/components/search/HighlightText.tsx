/**
 * @fileoverview 搜索高亮组件
 * @description 高亮显示搜索关键词
 * @module components/search/HighlightText
 */

'use client';

import { useMemo } from 'react';

interface HighlightTextProps {
  text: string;
  keyword: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * 高亮显示搜索关键词
 */
export function HighlightText({
  text,
  keyword,
  className = '',
  highlightClassName = 'text-primary font-semibold bg-primary/10 px-0.5 rounded',
}: HighlightTextProps) {
  const highlightedText = useMemo(() => {
    if (!keyword.trim()) {
      return <span className={className}>{text}</span>;
    }

    // 创建正则表达式，忽略大小写
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          // 检查是否匹配关键词（忽略大小写）
          if (part.toLowerCase() === keyword.toLowerCase()) {
            return (
              <mark key={index} className={highlightClassName}>
                {part}
              </mark>
            );
          }
          return part;
        })}
      </span>
    );
  }, [text, keyword, className, highlightClassName]);

  return highlightedText;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 高亮显示多个关键词
 */
export function HighlightKeywords({
  text,
  keywords,
  className = '',
  highlightClassName = 'text-primary font-semibold bg-primary/10 px-0.5 rounded',
}: {
  text: string;
  keywords: string[];
  className?: string;
  highlightClassName?: string;
}) {
  const highlightedText = useMemo(() => {
    if (!keywords.length || keywords.every(k => !k.trim())) {
      return <span className={className}>{text}</span>;
    }

    // 过滤空关键词并转义
    const validKeywords = keywords.filter(k => k.trim()).map(escapeRegExp);
    
    if (!validKeywords.length) {
      return <span className={className}>{text}</span>;
    }

    // 创建正则表达式
    const regex = new RegExp(`(${validKeywords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          // 检查是否匹配任一关键词
          const isMatch = keywords.some(
            k => k.trim() && part.toLowerCase() === k.toLowerCase()
          );
          
          if (isMatch) {
            return (
              <mark key={index} className={highlightClassName}>
                {part}
              </mark>
            );
          }
          return part;
        })}
      </span>
    );
  }, [text, keywords, className, highlightClassName]);

  return highlightedText;
}
