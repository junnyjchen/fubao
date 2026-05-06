'use client';

import { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon, Code,
  Heading1, Heading2, Heading3, Undo, Redo, Quote, Minus
} from 'lucide-react';

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-md' },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  const addImage = useCallback(async (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    try {
      const url = await onImageUpload(file);
      addImage(url);
    } catch (error) {
      console.error('图片上传失败:', error);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const insertLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('输入链接地址', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div
        className="border rounded-md bg-muted animate-pulse flex items-center justify-center"
        style={{ minHeight: height }}
      >
        <span className="text-muted-foreground">加载编辑器...</span>
      </div>
    );
  }

  return (
    <div className={cn('rich-text-editor border rounded-md overflow-hidden', className)}>
      {/* 工具栏 */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            icon={<Undo className="h-4 w-4" />}
            tooltip="撤销"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            icon={<Redo className="h-4 w-4" />}
            tooltip="重做"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            icon={<Heading1 className="h-4 w-4" />}
            tooltip="标题1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            icon={<Heading2 className="h-4 w-4" />}
            tooltip="标题2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            icon={<Heading3 className="h-4 w-4" />}
            tooltip="标题3"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            icon={<Bold className="h-4 w-4" />}
            tooltip="加粗"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            icon={<Italic className="h-4 w-4" />}
            tooltip="斜体"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            icon={<UnderlineIcon className="h-4 w-4" />}
            tooltip="下划线"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            icon={<Strikethrough className="h-4 w-4" />}
            tooltip="删除线"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            icon={<List className="h-4 w-4" />}
            tooltip="无序列表"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            icon={<ListOrdered className="h-4 w-4" />}
            tooltip="有序列表"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            icon={<Quote className="h-4 w-4" />}
            tooltip="引用"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            icon={<Code className="h-4 w-4" />}
            tooltip="代码块"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={<Minus className="h-4 w-4" />}
            tooltip="分割线"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            icon={<AlignLeft className="h-4 w-4" />}
            tooltip="左对齐"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            icon={<AlignCenter className="h-4 w-4" />}
            tooltip="居中"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            icon={<AlignRight className="h-4 w-4" />}
            tooltip="右对齐"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={insertLink}
            active={editor.isActive('link')}
            icon={<LinkIcon className="h-4 w-4" />}
            tooltip="插入链接"
          />
          <ToolbarButton
            onClick={() => {
              if (onImageUpload) {
                fileInputRef.current?.click();
              } else {
                const url = window.prompt('输入图片地址');
                if (url) addImage(url);
              }
            }}
            icon={<ImageIcon className="h-4 w-4" />}
            tooltip="插入图片"
          />
        </div>
      )}

      {/* 编辑区域 */}
      <EditorContent
        editor={editor}
        style={{ minHeight: height }}
        className="tiptap-editor-content"
      />

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Tiptap 样式 */}
      <style jsx global>{`
        .tiptap-editor-content .tiptap {
          min-height: ${height}px;
          padding: 12px 16px;
          outline: none;
        }
        .tiptap-editor-content .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .tiptap-editor-content .tiptap h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0.5em 0;
        }
        .tiptap-editor-content .tiptap h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.5em 0;
        }
        .tiptap-editor-content .tiptap h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5em 0;
        }
        .tiptap-editor-content .tiptap p {
          margin: 0.5em 0;
        }
        .tiptap-editor-content .tiptap ul,
        .tiptap-editor-content .tiptap ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .tiptap-editor-content .tiptap blockquote {
          border-left: 3px solid hsl(var(--border));
          padding-left: 1em;
          margin: 0.5em 0;
          color: hsl(var(--muted-foreground));
        }
        .tiptap-editor-content .tiptap pre {
          background: hsl(var(--muted));
          border-radius: 6px;
          padding: 0.75em 1em;
          margin: 0.5em 0;
          overflow-x: auto;
        }
        .tiptap-editor-content .tiptap pre code {
          background: none;
          font-size: 0.9em;
        }
        .tiptap-editor-content .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 0.5em 0;
        }
        .tiptap-editor-content .tiptap a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .tiptap-editor-content .tiptap hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 1em 0;
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  icon,
  tooltip,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="sm"
      className="h-7 w-7 p-0"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
    >
      {icon}
    </Button>
  );
}
