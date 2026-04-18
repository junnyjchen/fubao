'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Upload } from 'lucide-react';

// 动态导入 ReactQuill 以避免 SSR 问题
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] border rounded-md bg-muted animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground">加载编辑器...</span>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  height?: number;
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '请输入内容...',
  className,
  readOnly = false,
  height = 300,
  onImageUpload,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);
  const quillInstanceRef = useRef<any>(null);

  useEffect(() => {
    setIsReady(true);
    
    // 等待 Quill 加载后尝试获取实例
    const timer = setInterval(() => {
      const editors = document.querySelectorAll('.rich-text-editor .ql-editor');
      if (editors.length > 0) {
        const container = editors[0].closest('.quill');
        if (container?.nextSibling) {
          const parent = container.parentElement;
          if (parent) {
            // Quill 实例在 ReactQuill 组件内部，我们通过事件来访问
          }
        }
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image', 'video'],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['code-block'],
        ['clean'],
      ],
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background',
    'code-block',
  ];

  const handleChange = useCallback(
    (content: string) => {
      onChange(content);
    },
    [onChange]
  );

  const handleImageUpload = async () => {
    if (onImageUpload && fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      try {
        const url = await onImageUpload(file);
        // 通过 DOM 操作插入图片
        const editor = document.querySelector('.rich-text-editor .ql-editor');
        if (editor) {
          const range = window.getSelection()?.getRangeAt(0);
          if (range) {
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '100%';
            img.className = 'ql-img-inserted';
            range.insertNode(img);
          } else {
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '100%';
            img.className = 'ql-img-inserted';
            editor.appendChild(img);
          }
        }
      } catch (error) {
        console.error('图片上传失败:', error);
      }
      fileInputRef.current.value = '';
    }
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('rich-text-editor', className)}>
      {isReady && (
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{ minHeight: height }}
        />
      )}
      
      {/* 隐藏的文件输入框用于图片上传 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      
      {/* 自定义图片上传按钮（当有onImageUpload时显示） */}
      {onImageUpload && (
        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={insertImage}
          >
            <Upload className="w-4 h-4 mr-2" />
            上传图片
          </Button>
          <span className="text-xs text-muted-foreground">
            支持 JPG、PNG、GIF、WebP 格式
          </span>
        </div>
      )}
      
      <style jsx global>{`
        .rich-text-editor .quill {
          background: white;
          border-radius: 0.5rem;
        }
        .rich-text-editor .ql-toolbar.ql-snow {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: hsl(var(--border)) !important;
          background: hsl(var(--muted));
        }
        .rich-text-editor .ql-container.ql-snow {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: hsl(var(--border)) !important;
          font-size: 0.95rem;
        }
        .rich-text-editor .ql-editor {
          min-height: ${height - 60}px;
          max-height: ${height}px;
          padding: 1rem;
          line-height: 1.8;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        .rich-text-editor .ql-editor h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }
        .rich-text-editor .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor .ql-editor p {
          margin-bottom: 0.75rem;
        }
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.75rem 0;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .rich-text-editor .ql-snow .ql-fill {
          fill: hsl(var(--foreground));
        }
        .rich-text-editor .ql-snow .ql-picker {
          color: hsl(var(--foreground));
        }
        .rich-text-editor .ql-snow.ql-toolbar button:hover,
        .rich-text-editor .ql-snow .ql-toolbar button:hover,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active {
          color: hsl(var(--primary));
        }
        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: hsl(var(--primary));
        }
        .rich-text-editor .ql-snow .ql-tooltip {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          color: hsl(var(--foreground));
        }
        .rich-text-editor .ql-snow .ql-tooltip input[type=text] {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.25rem;
          color: hsl(var(--foreground));
        }
        .rich-text-editor .ql-snow .ql-tooltip a.ql-action::after,
        .rich-text-editor .ql-snow .ql-tooltip a.ql-remove::before {
          color: hsl(var(--primary));
        }
        .rich-text-editor .ql-snow .ql-tooltip a.ql-remove {
          color: hsl(var(--destructive));
        }
        
        /* 代码块样式 */
        .rich-text-editor .ql-editor pre {
          background: hsl(var(--muted));
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          overflow-x: auto;
        }
        .rich-text-editor .ql-editor code {
          background: hsl(var(--muted));
          border-radius: 0.25rem;
          padding: 0.125rem 0.375rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
        }
        
        /* 引用块样式 */
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        
        .dark .rich-text-editor .ql-toolbar.ql-snow {
          background: hsl(var(--muted)/0.5);
        }
        .dark .rich-text-editor .ql-container.ql-snow {
          background: hsl(var(--card));
        }
        .dark .rich-text-editor .ql-editor {
          color: hsl(var(--foreground));
        }
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
        }
        .dark .rich-text-editor .ql-editor pre {
          background: hsl(var(--muted));
        }
        .dark .rich-text-editor .ql-editor code {
          background: hsl(var(--muted));
        }
      `}</style>
    </div>
  );
}

// 简化版本（不带图片上传）
export function SimpleRichTextEditor({
  value,
  onChange,
  placeholder = '请输入内容...',
  className,
  height = 200,
}: Omit<RichTextEditorProps, 'onImageUpload'>) {
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      height={height}
    />
  );
}
