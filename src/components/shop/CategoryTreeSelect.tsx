'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: Category[];
}

interface CategoryTreeSelectProps {
  value?: number | null;
  onChange: (categoryId: number) => void;
  placeholder?: string;
  className?: string;
}

export function CategoryTreeSelect({
  value,
  onChange,
  placeholder = '選擇分類',
  className = '',
}: CategoryTreeSelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories?tree=true')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {
        // Fallback mock data
        setCategories([
          { id: 1, name: '符咒', slug: 'talisman', parent_id: null },
          { id: 2, name: '法器', slug: 'ritual-tools', parent_id: null },
          { id: 3, name: '風水擺件', slug: 'fengshui', parent_id: null },
          { id: 4, name: '文創商品', slug: 'creative', parent_id: null },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCategory = findCategoryById(categories, value);

  function findCategoryById(cats: Category[], id?: number | null): Category | undefined {
    if (!id) return undefined;
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  function toggleExpand(id: number) {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  }

  function renderCategory(cat: Category, depth = 0) {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedIds.has(cat.id);
    const isSelected = cat.id === value;

    return (
      <div key={cat.id}>
        <button
          type="button"
          onClick={() => {
            onChange(cat.id);
            if (hasChildren) toggleExpand(cat.id);
            if (!hasChildren) setOpen(false);
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${
            isSelected ? 'bg-primary/10 text-primary font-medium' : ''
          }`}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <span className="w-4 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 shrink-0 text-amber-500" />
          ) : (
            <Folder className="w-4 h-4 shrink-0 text-amber-500" />
          )}
          <span className="truncate">{cat.name}</span>
        </button>
        {hasChildren && isExpanded && (
          <div>
            {cat.children!.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border bg-background hover:bg-muted text-sm transition-colors"
      >
        <span className={selectedCategory ? '' : 'text-muted-foreground'}>
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-full max-h-64 overflow-y-auto bg-card border border-border rounded-lg shadow-lg py-1">
            {loading ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">載入中...</div>
            ) : categories.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">暫無分類</div>
            ) : (
              categories.map(cat => renderCategory(cat))
            )}
          </div>
        </>
      )}
    </div>
  );
}
