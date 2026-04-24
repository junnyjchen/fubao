/**
 * @fileoverview 语义化 HTML 组件
 * @description 提供语义化 HTML 标签支持，提升可访问性和 SEO
 * @module components/seo/SemanticElements
 */

import { cn } from '@/lib/utils';

/**
 * 主导航
 */
interface MainNavProps {
  children: React.ReactNode;
  className?: string;
}

export function MainNav({ children, className }: MainNavProps) {
  return (
    <header className={cn('border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <nav aria-label="主导航" role="navigation">
        {children}
      </nav>
    </header>
  );
}

/**
 * 主内容区域
 */
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function MainContent({ children, className, id = 'main-content' }: MainContentProps) {
  return (
    <main id={id} className={className} tabIndex={-1}>
      {children}
    </main>
  );
}

/**
 * 面包屑导航
 */
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export function Breadcrumb({ items, className, separator = '/' }: BreadcrumbProps) {
  return (
    <nav aria-label="面包屑导航" className={cn('mb-4', className)}>
      <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-muted-foreground/50" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.href ? (
              <a href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * 文章区块
 */
interface ArticleProps {
  children: React.ReactNode;
  className?: string;
  articleData?: {
    author?: string;
    datePublished?: string;
    dateModified?: string;
    category?: string;
  };
}

export function Article({ children, className, articleData }: ArticleProps) {
  return (
    <article className={className}>
      {articleData && (
        <meta itemProp="author" content={articleData.author} />
      )}
      {children}
    </article>
  );
}

/**
 * 章节标题
 */
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface SectionHeadingProps {
  level: HeadingLevel;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionHeading({ level, children, className, id }: SectionHeadingProps) {
  const Tag = level;
  return (
    <Tag id={id} className={cn('scroll-mt-20', className)} itemProp="headline">
      {children}
    </Tag>
  );
}

/**
 * 侧边栏
 */
interface AsideProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function Aside({ children, className, ariaLabel = '侧边栏' }: AsideProps) {
  return (
    <aside aria-label={ariaLabel} className={className}>
      {children}
    </aside>
  );
}

/**
 * 页脚
 */
interface FooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SiteFooter({ children, className }: FooterProps) {
  return (
    <footer className={cn('border-t bg-muted/50', className)}>
      {children}
    </footer>
  );
}

/**
 * 列表容器（用于无障碍）
 */
interface ListProps {
  children: React.ReactNode;
  ordered?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function List({ children, ordered = false, className, ariaLabel }: ListProps) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag aria-label={ariaLabel} className={cn(ordered ? 'list-decimal' : 'list-disc', 'pl-5 space-y-1', className)}>
      {children}
    </Tag>
  );
}

export function ListItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={className}>{children}</li>;
}

/**
 * 定义列表（术语表）
 */
interface DefinitionListProps {
  terms: Array<{
    term: string;
    definition: React.ReactNode;
  }>;
  className?: string;
}

export function DefinitionList({ terms, className }: DefinitionListProps) {
  return (
    <dl className={cn('space-y-4', className)}>
      {terms.map((item, index) => (
        <div key={index}>
          <dt className="font-semibold text-foreground">{item.term}</dt>
          <dd className="mt-1 text-muted-foreground">{item.definition}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * 表格（带语义标签）
 */
interface TableProps {
  children: React.ReactNode;
  className?: string;
  caption?: string;
}

export function Table({ children, className, caption }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)}>
        {caption && <caption className="text-muted-foreground py-2 text-left">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <thead className={cn('[&_tr]:border-b', className)}>{children}</thead>;
}

export function TableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)}>{children}</tbody>;
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}>{children}</tr>;
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th scope="col" className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground', className)}>{children}</th>;
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('p-4 align-middle', className)}>{children}</td>;
}

/**
 * 引用区块
 */
interface BlockquoteProps {
  children: React.ReactNode;
  cite?: string;
  className?: string;
}

export function Blockquote({ children, cite, className }: BlockquoteProps) {
  return (
    <blockquote cite={cite} className={cn('border-l-4 border-primary pl-4 italic text-muted-foreground', className)}>
      {children}
    </blockquote>
  );
}

/**
 * 代码区块
 */
interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({ children, language, filename, className }: CodeBlockProps) {
  return (
    <figure className={cn('not-prose my-4 rounded-lg border bg-muted overflow-hidden', className)}>
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          {filename && <span className="text-sm font-medium">{filename}</span>}
          {language && <span className="text-xs text-muted-foreground uppercase">{language}</span>}
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </figure>
  );
}

/**
 * 时间元素
 */
interface TimeProps {
  dateTime: string;
  children: React.ReactNode;
  className?: string;
}

export function Time({ dateTime, children, className }: TimeProps) {
  return (
    <time dateTime={dateTime} className={className}>
      {children}
    </time>
  );
}

/**
 * 缩写
 */
interface AbbrProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Abbr({ title, children, className }: AbbrProps) {
  return (
    <abbr title={title} className={className}>
      {children}
    </abbr>
  );
}

/**
 * 标记/高亮
 */
interface MarkProps {
  children: React.ReactNode;
  className?: string;
}

export function Mark({ children, className }: MarkProps) {
  return (
    <mark className={cn('bg-yellow-200/50 dark:bg-yellow-900/50 px-0.5 rounded', className)}>
      {children}
    </mark>
  );
}

/**
 * 删除线
 */
interface DelProps {
  children: React.ReactNode;
  cite?: string;
  dateTime?: string;
  className?: string;
}

export function Del({ children, cite, dateTime, className }: DelProps) {
  return (
    <del cite={cite} dateTime={dateTime} className={cn('line-through text-muted-foreground', className)}>
      {children}
    </del>
  );
}

/**
 * 下划线
 */
interface InsProps {
  children: React.ReactNode;
  cite?: string;
  dateTime?: string;
  className?: string;
}

export function Ins({ children, cite, dateTime, className }: InsProps) {
  return (
    <ins cite={cite} dateTime={dateTime} className={cn('underline decoration-primary/50', className)}>
      {children}
    </ins>
  );
}

/**
 * 进度条（语义化）
 */
interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export function Progress({ value, max = 100, label, className }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label} className={className}>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {label && <span className="sr-only">{label}: {percentage}%</span>}
    </div>
  );
}

/**
 * 跳过链接（可访问性）
 */
interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export function SkipLink({ href = '#main-content', children = '跳转到主要内容' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-lg"
    >
      {children}
    </a>
  );
}

/**
 * 折叠内容（使用 details/summary）
 */
export function CollapsibleSection({ 
  summary, 
  children, 
  defaultOpen = false, 
  className 
}: { 
  summary: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean; 
  className?: string; 
}) {
  return (
    <details open={defaultOpen} className={cn('border rounded-lg group', className)}>
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none font-medium hover:bg-muted/50">
        {summary}
        <svg 
          className="w-4 h-4 transition-transform group-open:rotate-180" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
