/**
 * AI 训练中心 - 训练统计
 */
import { NextResponse } from 'next/server';
import { count, query } from '@/lib/db';

export async function GET() {
  try {
    const knowledgeTotal = await count('ai_knowledge', '1=1', []);
    const knowledgeReady = await count('ai_knowledge', 'status = ?', ['active']);
    const knowledgePending = await count('ai_knowledge', 'status = ?', ['draft']);
    const qaTotal = await count('ai_qa', '1=1', []);
    const qaActive = await count('ai_qa', 'is_active = ?', [1]);
    const tasksTotal = await count('ai_training_tasks', '1=1', []);
    const tasksCompleted = await count('ai_training_tasks', 'status = ?', ['completed']);

    // 获取知识库分类统计
    const categoryStats = await query(
      `SELECT category, COUNT(*) as count FROM ai_knowledge GROUP BY category`
    ) as any[];

    // 获取热门知识（按ID倒序作为近似排序）
    const topKnowledge = await query(
      `SELECT id, title, category FROM ai_knowledge WHERE status = 'active' ORDER BY id DESC LIMIT 5`
    ) as any[];

    return NextResponse.json({
      success: true,
      data: {
        knowledge: {
          total: knowledgeTotal,
          ready: knowledgeReady,
          pending: knowledgePending,
          usage_total: 0,
          categories: categoryStats || [],
        },
        qa: {
          active: qaActive,
          total: qaTotal,
          avg_accuracy: 0,
        },
        task: {
          total: tasksTotal,
          completed: tasksCompleted,
        },
        top: topKnowledge || [],
        categories: categoryStats || [],
      }
    });
  } catch (error) {
    console.error('獲取訓練統計失敗:', error);
    return NextResponse.json({
      success: true,
      data: {
        knowledge: { total: 0, ready: 0, pending: 0, usage_total: 0, categories: [] },
        qa: { active: 0, total: 0, avg_accuracy: 0 },
        task: { total: 0, completed: 0 },
        top: [],
        categories: [],
      }
    });
  }
}
