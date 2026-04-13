'use client';

import { cn } from '@/lib/utils';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

/**
 * 富文本内容渲染组件
 * 用于正确渲染从富文本编辑器保存的HTML内容
 */
export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  // 检查内容是否包含HTML标签
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (!content) {
    return null;
  }

  if (isHtml) {
    // 使用 dangerouslySetInnerHTML 渲染 HTML 内容
    return (
      <div
        className={cn('rich-text-content', className)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // 纯文本内容
  return (
    <div className={cn('rich-text-content', className)}>
      {content.split('\n').map((line, index) => (
        <p key={index} className="mb-4 last:mb-0">
          {line || '\u00A0'}
        </p>
      ))}
    </div>
  );
}

// 全局样式（可在 globals.css 中添加）
/*
.rich-text-content {
  line-height: 1.8;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.rich-text-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.rich-text-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.rich-text-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.rich-text-content p {
  margin-bottom: 0.75rem;
}

.rich-text-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.rich-text-content a {
  color: hsl(var(--primary));
  text-decoration: underline;
}

.rich-text-content a:hover {
  text-decoration: none;
}

.rich-text-content blockquote {
  border-left: 4px solid hsl(var(--primary));
  padding-left: 1rem;
  margin: 1rem 0;
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

.rich-text-content pre {
  background: hsl(var(--muted));
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  margin: 1rem 0;
}

.rich-text-content code {
  background: hsl(var(--muted));
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875em;
}

.rich-text-content pre code {
  background: none;
  padding: 0;
}

.rich-text-content ul,
.rich-text-content ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.rich-text-content li {
  margin-bottom: 0.5rem;
}

.rich-text-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.rich-text-content th,
.rich-text-content td {
  border: 1px solid hsl(var(--border));
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.rich-text-content th {
  background: hsl(var(--muted));
  font-weight: 600;
}

.rich-text-content hr {
  border: none;
  border-top: 1px solid hsl(var(--border));
  margin: 1.5rem 0;
}

.rich-text-content video {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}
*/
