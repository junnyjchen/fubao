/**
 * @fileoverview 证书管理API
 * @description 管理员证书列表和新增功能
 * @module app/api/admin/certificates/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import type { JsonValue } from '@/types/common';

interface CertificateRecord {
  id: number;
  certificate_no: string;
  goods_id: number;
  merchant_id: number | null;
  issue_date: string;
  issued_by: string;
  valid_until: string | null;
  verification_count: number;
  last_verification: string | null;
  details: JsonValue | null;
  created_at: string;
  goods: { id: number; name: string; main_image: string | null } | { id: number; name: string; main_image: string | null }[] | null;
  merchant: { id: number; name: string } | { id: number; name: string }[] | null;
}

/**
 * 获取证书列表
 * GET /api/admin/certificates
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    let query = client
      .from('certificates')
      .select(`
        id,
        certificate_no,
        goods_id,
        merchant_id,
        issue_date,
        issued_by,
        valid_until,
        verification_count,
        last_verification,
        details,
        created_at,
        goods:goods_id (
          id,
          name,
          main_image
        ),
        merchant:merchant_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('查询证书列表失败:', error);
      // 如果表不存在或查询失败，返回空数据
      return NextResponse.json({ data: [], total: 0 });
    }

    // 计算状态
    const certificatesWithStatus = (data || []).map((cert: CertificateRecord) => {
      let status: 'valid' | 'expired' | 'revoked' = 'valid';
      if (cert.valid_until && new Date(cert.valid_until) < new Date()) {
        status = 'expired';
      }

      // 处理关联数据
      const goodsData = Array.isArray(cert.goods) ? cert.goods[0] : cert.goods;
      const merchantData = Array.isArray(cert.merchant) ? cert.merchant[0] : cert.merchant;

      return {
        ...cert,
        status,
        goods: goodsData,
        merchant: merchantData,
      };
    });

    return NextResponse.json({
      data: certificatesWithStatus,
      total: count,
    });
  } catch (error) {
    console.error('获取证书列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 创建新证书
 * POST /api/admin/certificates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const {
      certificate_no,
      goods_id,
      merchant_id,
      issue_date,
      issued_by,
      valid_until,
      details,
    } = body;

    // 验证必填字段
    if (!certificate_no || !goods_id || !issue_date || !issued_by) {
      return NextResponse.json(
        { error: '請填寫完整信息' },
        { status: 400 }
      );
    }

    // 检查证书编号是否已存在
    const { data: existing } = await client
      .from('certificates')
      .select('id')
      .eq('certificate_no', certificate_no)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '證書編號已存在' },
        { status: 400 }
      );
    }

    // 插入证书
    const { data, error } = await client
      .from('certificates')
      .insert({
        certificate_no: certificate_no.toUpperCase(),
        goods_id,
        merchant_id: merchant_id || null,
        issue_date,
        issued_by,
        valid_until: valid_until || null,
        details: details || null,
        verification_count: 0,
        status: 'valid',
      })
      .select()
      .single();

    if (error) {
      console.error('创建证书失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '證書創建成功',
      data,
    });
  } catch (error) {
    console.error('创建证书失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
