import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');
  const isFeatured = searchParams.get('featured') === 'true';
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('articles')
      .select('*')
      .eq('status', true)
      .order('sort', { ascending: true })
      .order('published_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }
    if (isFeatured) {
      query = query.eq('is_featured', true);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, page, limit });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
