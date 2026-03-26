/**
 * @fileoverview 商品分类API
 * @description 获取商品分类列表
 * @module app/api/categories/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** 分类数据类型 */
interface Category {
  id: number;
  name: string;
  slug: string | null;
  icon: string | null;
  image: string | null;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
}

/**
 * 构建分类树
 */
function buildCategoryTree(categories: Category[]): Category[] {
  const map = new Map<number, Category>();
  const roots: Category[] = [];

  // 创建映射
  categories.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] });
  });

  // 构建树
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

  // 排序
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
 * 获取商品分类
 * @query tree - 是否返回树形结构，默认true
 * @query parent_id - 获取指定父分类下的子分类
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const tree = searchParams.get('tree') !== 'false';
    const parentId = searchParams.get('parent_id');
    
    // 获取所有启用的分类
    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // 如果指定了parent_id，筛选子分类
    if (parentId !== null) {
      query = query.eq('parent_id', parentId === 'null' ? null : parseInt(parentId));
    }
    
    const { data: categories, error } = await query;
    
    if (error) {
      console.error('获取分类失败:', error);
      // 返回默认分类数据
      return NextResponse.json({
        data: getDefaultCategories(),
      });
    }
    
    // 如果没有数据，返回默认分类
    if (!categories || categories.length === 0) {
      return NextResponse.json({
        data: getDefaultCategories(),
      });
    }
    
    // 构建树形结构
    const result = tree ? buildCategoryTree(categories) : categories;
    
    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error('分类API错误:', error);
    return NextResponse.json({
      data: getDefaultCategories(),
    });
  }
}

/**
 * 默认分类数据
 */
function getDefaultCategories(): Category[] {
  return [
    {
      id: 1,
      name: '符箓',
      slug: 'fujis',
      icon: '📜',
      image: null,
      parent_id: null,
      sort_order: 1,
      is_active: true,
      children: [
        { id: 11, name: '平安符', slug: 'peace', icon: null, image: null, parent_id: 1, sort_order: 1, is_active: true },
        { id: 12, name: '招財符', slug: 'wealth', icon: null, image: null, parent_id: 1, sort_order: 2, is_active: true },
        { id: 13, name: '桃花符', slug: 'love', icon: null, image: null, parent_id: 1, sort_order: 3, is_active: true },
        { id: 14, name: '健康符', slug: 'health', icon: null, image: null, parent_id: 1, sort_order: 4, is_active: true },
        { id: 15, name: '學業符', slug: 'study', icon: null, image: null, parent_id: 1, sort_order: 5, is_active: true },
      ],
    },
    {
      id: 2,
      name: '法器',
      slug: 'faqis',
      icon: '⚔️',
      image: null,
      parent_id: null,
      sort_order: 2,
      is_active: true,
      children: [
        { id: 21, name: '桃木劍', slug: 'sword', icon: null, image: null, parent_id: 2, sort_order: 1, is_active: true },
        { id: 22, name: '八卦鏡', slug: 'mirror', icon: null, image: null, parent_id: 2, sort_order: 2, is_active: true },
        { id: 23, name: '銅鈴', slug: 'bell', icon: null, image: null, parent_id: 2, sort_order: 3, is_active: true },
        { id: 24, name: '令牌', slug: 'token', icon: null, image: null, parent_id: 2, sort_order: 4, is_active: true },
      ],
    },
    {
      id: 3,
      name: '擺件',
      slug: 'decorations',
      icon: '🏺',
      image: null,
      parent_id: null,
      sort_order: 3,
      is_active: true,
      children: [
        { id: 31, name: '風水擺件', slug: 'fengshui', icon: null, image: null, parent_id: 3, sort_order: 1, is_active: true },
        { id: 32, name: '神像', slug: 'statue', icon: null, image: null, parent_id: 3, sort_order: 2, is_active: true },
        { id: 33, name: '香爐', slug: 'incense', icon: null, image: null, parent_id: 3, sort_order: 3, is_active: true },
      ],
    },
    {
      id: 4,
      name: '香燭',
      slug: 'incense-candles',
      icon: '🕯️',
      image: null,
      parent_id: null,
      sort_order: 4,
      is_active: true,
      children: [
        { id: 41, name: '線香', slug: 'incense-stick', icon: null, image: null, parent_id: 4, sort_order: 1, is_active: true },
        { id: 42, name: '盤香', slug: 'incense-coil', icon: null, image: null, parent_id: 4, sort_order: 2, is_active: true },
        { id: 43, name: '蠟燭', slug: 'candle', icon: null, image: null, parent_id: 4, sort_order: 3, is_active: true },
      ],
    },
    {
      id: 5,
      name: '書籍',
      slug: 'books',
      icon: '📚',
      image: null,
      parent_id: null,
      sort_order: 5,
      is_active: true,
      children: [
        { id: 51, name: '道教經典', slug: 'classics', icon: null, image: null, parent_id: 5, sort_order: 1, is_active: true },
        { id: 52, name: '符咒入門', slug: 'intro', icon: null, image: null, parent_id: 5, sort_order: 2, is_active: true },
        { id: 53, name: '風水知識', slug: 'fengshui-knowledge', icon: null, image: null, parent_id: 5, sort_order: 3, is_active: true },
      ],
    },
    {
      id: 6,
      name: '飾品',
      slug: 'accessories',
      icon: '📿',
      image: null,
      parent_id: null,
      sort_order: 6,
      is_active: true,
      children: [
        { id: 61, name: '佛珠', slug: 'mala', icon: null, image: null, parent_id: 6, sort_order: 1, is_active: true },
        { id: 62, name: '護身符', slug: 'amulet', icon: null, image: null, parent_id: 6, sort_order: 2, is_active: true },
        { id: 63, name: '手串', slug: 'bracelet', icon: null, image: null, parent_id: 6, sort_order: 3, is_active: true },
      ],
    },
  ];
}
