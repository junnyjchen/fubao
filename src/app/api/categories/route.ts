/**
 * @fileoverview 商品分类API
 * @description 获取商品分类列表 - MySQL 实现
 * @module app/api/categories/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/** 分类数据类型 */
interface Category {
  id: number;
  name: string;
  slug: string | null;
  icon: string | null;
  image: string | null;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;  // 映射自 status 列
  children?: Category[];
}

/**
 * 构建分类树
 */
function buildCategoryTree(categories: Category[]): Category[] {
  const map = new Map<number, Category>();
  const roots: Category[] = [];

  categories.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach(cat => {
    const node = map.get(cat.id)!;
    if (cat.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(cat.parent_id);
      if (parent) {
        parent.children!.push(node);
      }
    }
  });

  const sortChildren = (nodes: Category[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };
  sortChildren(roots);

  return roots;
}

/**
 * GET /api/categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tree = searchParams.get('tree') !== 'false';
    const parentId = searchParams.get('parent_id');

    // 从 MySQL 查询所有启用的分类
    let categories: Category[];

    if (parentId) {
      categories = await query<Category>(
        'SELECT * FROM categories WHERE status = 1 AND parent_id = ? ORDER BY sort_order ASC',
        [parseInt(parentId)]
      );
    } else {
      categories = await query<Category>(
        'SELECT * FROM categories WHERE status = 1 ORDER BY sort_order ASC'
      );
    }

    if (tree && !parentId) {
      const treeData = buildCategoryTree(categories);
      return NextResponse.json({ success: true, data: treeData });
    }

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
