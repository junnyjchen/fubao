import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query, queryOne, insert, update } from '@/lib/db';
import { errorResponse, successResponse, listResponse, messageResponse } from '@/lib/api-response';

// 验证商家身份
function verifyMerchant(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fubao-secret-key-2025') as Record<string, unknown>;
    if (decoded.type !== 'merchant') return null;
    return { merchantId: decoded.merchantId as number, type: decoded.type as string };
  } catch {
    return null;
  }
}

// GET: 获取商家自己的商品列表 / 单个商品
export async function GET(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return errorResponse('请先登录商家后台', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 获取单个商品
    if (id) {
      const goods = await queryOne('SELECT * FROM goods WHERE id = ? AND merchant_id = ?', [id, merchant.merchantId]);
      if (!goods) {
        return errorResponse('商品不存在', 404);
      }
      // 解析 images JSON
      if (goods.images && typeof goods.images === 'string') {
        try { goods.images = JSON.parse(goods.images); } catch { goods.images = goods.images.split(',').filter(Boolean); }
      }
      if (!Array.isArray(goods.images)) goods.images = [];
      return successResponse(goods);
    }

    // 获取列表
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const offset = (page - 1) * limit;

    let whereConditions = ['merchant_id = ?'];
    let params: any[] = [merchant.merchantId];

    if (status !== null && status !== undefined && status !== '') {
      whereConditions.push('status = ?');
      params.push(parseInt(status));
    }

    if (keyword) {
      whereConditions.push('name LIKE ?');
      params.push(`%${keyword}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    const goods = await query(
      `SELECT * FROM goods WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // 解析每条记录的 images JSON
    for (const item of goods) {
      if (item.images && typeof item.images === 'string') {
        try { item.images = JSON.parse(item.images); } catch { item.images = item.images.split(',').filter(Boolean); }
      }
      if (!Array.isArray(item.images)) item.images = [];
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM goods WHERE ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    return listResponse(goods, { total, page, limit });
  } catch (error: any) {
    console.error('获取商家商品失败:', error);
    return errorResponse('获取商品列表失败', 500);
  }
}

// POST: 商家发布商品
export async function POST(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return errorResponse('请先登录商家后台', 401);
  }

  try {
    const body = await request.json();
    const {
      name, subtitle, price, original_price, stock, category_id,
      type, purpose, description, detail, main_image, images, is_certified,
      specs
    } = body;

    if (!name || !price || !stock) {
      return errorResponse('商品名称、价格和库存为必填项', 400);
    }

    // images 支持数组或逗号分隔字符串，统一转为 JSON 数组存入
    let imagesJson: string | null = null;
    if (Array.isArray(images) && images.length > 0) {
      imagesJson = JSON.stringify(images);
    } else if (typeof images === 'string' && images.trim()) {
      imagesJson = JSON.stringify(images.split(',').filter(Boolean));
    }

    const id = await insert('goods', {
      name,
      subtitle: subtitle || '',
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      stock: parseInt(stock),
      category_id: category_id || null,
      merchant_id: merchant.merchantId,
      type: type || 1,
      purpose: purpose || '',
      description: description || '',
      detail: detail || null,
      main_image: main_image || (Array.isArray(images) ? images[0] || '' : ''),
      images: imagesJson,
      is_certified: is_certified ? 1 : 0,
      specs: specs ? (typeof specs === 'string' ? specs : JSON.stringify(specs)) : null,
      status: 1,
      sales: 0,
    });

    if (!id) {
      return errorResponse('发布商品失败，数据库写入异常', 500);
    }

    return successResponse({ id }, '商品发布成功');
  } catch (error: any) {
    console.error('商家发布商品失败:', error);
    return errorResponse('发布商品失败: ' + (error.message || ''), 500);
  }
}

// PUT: 商家更新商品
export async function PUT(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return errorResponse('请先登录商家后台', 401);
  }

  try {
    const body = await request.json();
    const { id, name, subtitle, price, original_price, stock, category_id,
      type, purpose, description, detail, main_image, images, is_certified, status, specs } = body;

    if (!id) {
      return errorResponse('缺少商品ID', 400);
    }

    // 验证商品属于该商家
    const existing = await queryOne('SELECT * FROM goods WHERE id = ? AND merchant_id = ?', [id, merchant.merchantId]);
    if (!existing) {
      return errorResponse('商品不存在或不属于该商家', 403);
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (original_price !== undefined) updateData.original_price = original_price ? parseFloat(original_price) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category_id !== undefined) updateData.category_id = category_id;
    if (type !== undefined) updateData.type = type;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (description !== undefined) updateData.description = description;
    if (detail !== undefined) updateData.detail = detail;
    if (is_certified !== undefined) updateData.is_certified = is_certified ? 1 : 0;
    if (status !== undefined) updateData.status = parseInt(status);
    if (specs !== undefined) updateData.specs = specs ? (typeof specs === 'string' ? specs : JSON.stringify(specs)) : null;

    // 处理图片
    if (images !== undefined) {
      let imagesJson: string | null = null;
      if (Array.isArray(images) && images.length > 0) {
        imagesJson = JSON.stringify(images);
      } else if (typeof images === 'string' && images.trim()) {
        imagesJson = JSON.stringify(images.split(',').filter(Boolean));
      }
      updateData.images = imagesJson;
    }

    // main_image: 如果传了就用传的，否则从 images 取第一张
    if (main_image !== undefined) {
      updateData.main_image = main_image;
    } else if (images !== undefined && Array.isArray(images) && images.length > 0) {
      updateData.main_image = images[0];
    }

    if (Object.keys(updateData).length > 0) {
      await update('goods', id, updateData);
    }

    return messageResponse('商品更新成功');
  } catch (error: any) {
    console.error('商家更新商品失败:', error);
    return errorResponse('更新商品失败: ' + (error.message || ''), 500);
  }
}

// DELETE: 商家删除商品
export async function DELETE(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return errorResponse('请先登录商家后台', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少商品ID', 400);
    }

    // 验证商品属于该商家
    const existing = await queryOne('SELECT * FROM goods WHERE id = ? AND merchant_id = ?', [id, merchant.merchantId]);
    if (!existing) {
      return errorResponse('商品不存在或不属于该商家', 403);
    }

    await query('DELETE FROM goods WHERE id = ? AND merchant_id = ?', [id, merchant.merchantId]);

    return messageResponse('商品已删除');
  } catch (error: any) {
    console.error('商家删除商品失败:', error);
    return errorResponse('删除商品失败', 500);
  }
}
