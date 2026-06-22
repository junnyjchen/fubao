/**
 * AI 训练中心 - 训练统计
 */
import { NextResponse } from 'next/server';
import { count, query } from '@/lib/db';

export async function GET() {
  try {
    const knowledgeTotal = await count('ai_knowledge', '1=1', []);
    const qaTotal = await count('ai_qa', '1=1', []);
    const tasksTotal = await count('ai_training_tasks', '1=1', []);
    const activeKnowledge = await count('ai_knowledge', 'status = ?', ['active']);
    const activeQA = await count('ai_qa', 'is_active = ?', [true]);

    // 获取知识库分类统计
    const categoryStats = await query(
      `SELECT category, COUNT(*) as count FROM ai_knowledge GROUP BY category`
    );

    return NextResponse.json({
      success: true,
      data: {
        knowledge: {
          total: knowledgeTotal,
          active: activeKnowledge,
          categories: categoryStats || [],
        },
        qa: {
          total: qaTotal,
          active: activeQA,
        },
        tasks: {
          total: tasksTotal,
        },
        top: categoryStats || [],
      }
    });
  } catch (error) {
    console.error('获取训练统计失败:', error);
    return NextResponse.json({
      success: true,
      data: {
        knowledge: { total: 0, active: 0, categories: [] },
        qa: { total: 0, active: 0 },
        tasks: { total: 0 },
        top: [],
      }
    });
  }
}
