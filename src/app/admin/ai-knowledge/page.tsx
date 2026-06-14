'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface KnowledgeDocument {
  id: string;
  title: string;
  originalName: string;
  category: string;
  size: number;
  chunkCount: number;
  createdAt: string;
}

export default function AIKnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ title: string; content: string } | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ai-knowledge');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      toast.error('加载文档列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
      toast.error('请选择文件');
      return;
    }

    // 检查文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小不能超过 10MB');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/admin/ai-knowledge', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success(`上传成功，已拆分为 ${data.document.chunkCount} 个知识片段`);
      form.reset();
      loadDocuments();
    } catch {
      toast.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此文档？删除后 AI 将无法检索到相关内容。')) return;
    try {
      const res = await fetch(`/api/admin/ai-knowledge?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      toast.success('已删除');
      loadDocuments();
    } catch {
      toast.error('删除失败');
    }
  };

  const handleView = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ai-knowledge/${id}`);
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      setViewingDoc({ title: data.title, content: data.content });
    } catch {
      toast.error('加载文档失败');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI 知识库</h1>
          <p className="text-muted-foreground mt-1">上传文档资料，AI 助手将基于这些内容回答问题</p>
        </div>
      </div>

      {/* 上传区域 */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-foreground mb-3">上传文档</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                name="title"
                placeholder="文档标题（可选，默认使用文件名）"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="w-40">
              <input
                type="text"
                name="category"
                placeholder="分类（可选）"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              name="file"
              accept=".txt,.md,.json,.csv,.html,.xml,.yaml,.yml"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground file:mr-3 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:cursor-pointer"
            />
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
            >
              {uploading ? '上传中...' : '上传'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            支持 txt、md、json、csv、html、xml、yaml 格式，最大 10MB。上传后自动分块用于知识检索。
          </p>
        </form>
      </div>

      {/* 文档列表 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">还没有上传任何文档</p>
          <p className="text-sm text-muted-foreground mt-1">上传文档后，AI 助手将能够基于这些内容回答用户问题</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{doc.title || doc.originalName}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {doc.originalName} · {formatSize(doc.size)} · {doc.chunkCount} 个片段
                  {doc.category !== '通用' && ` · ${doc.category}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  上传于 {new Date(doc.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => handleView(doc.id)} className="px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors text-foreground">
                  查看
                </button>
                <button onClick={() => handleDelete(doc.id)} className="px-3 py-1.5 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10 transition-colors">
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 查看文档弹窗 */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewingDoc(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground truncate">{viewingDoc.title}</h2>
              <button onClick={() => setViewingDoc(null)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto bg-muted rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap font-mono">
              {viewingDoc.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
