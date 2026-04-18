import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-server';
import { SupabaseClient } from '@supabase/supabase-js';

interface NewsItem {
  title: string;
  content: string;
  url: string;
  source: string;
  publishedAt?: string;
}

// 获取默认的AI配置
async function getDefaultAIConfig(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('ai_configurations')
    .select('*')
    .eq('enabled', true)
    .eq('is_default', true)
    .single();

  if (!data) {
    const { data: firstConfig } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('enabled', true)
      .limit(1)
      .single();
    return firstConfig;
  }

  return data;
}

// 获取新闻源配置
async function getNewsSourceConfig(supabase: SupabaseClient, sourceId: number) {
  const { data } = await supabase
    .from('news_sources')
    .select('*')
    .eq('id', sourceId)
    .eq('enabled', true)
    .single();

  return data;
}

// 搜索新闻
async function searchNews(keywords: string, language: string, count: number): Promise<NewsItem[]> {
  try {
    const apiToken = process.env.COZE_API_TOKEN;

    if (apiToken) {
      const response = await fetch('https://api.coze.cn/v1/workflow/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          workflow_id: 'search_news',
          parameters: {
            query: keywords,
            count: count,
            language: language,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const news: NewsItem[] = result?.data || [];
        return news.slice(0, count).map((item: any) => ({
          title: item.title || '',
          content: item.content || item.snippet || '',
          url: item.url || '',
          source: item.source || 'news',
          publishedAt: item.publishedAt || new Date().toISOString(),
        }));
      }
    }

    console.warn('未配置 COZE_API_TOKEN，使用模拟新闻数据');
    return generateMockNews(keywords, count);
  } catch (error) {
    console.error('搜索新闻失败:', error);
    return generateMockNews(keywords, count);
  }
}

// 生成模拟新闻数据（用于测试）
function generateMockNews(keywords: string, count: number): NewsItem[] {
  const now = new Date();
  const mockNews: NewsItem[] = [];
  const keywordList = keywords.split(',').map(k => k.trim());

  for (let i = 0; i < Math.min(count, 5); i++) {
    const keyword = keywordList[i % keywordList.length];
    mockNews.push({
      title: `最新${keyword}相关新闻 ${i + 1}`,
      content: `这是一篇关于${keyword}的详细报道。随着科技的发展，${keyword}领域取得了重大突破。研究人员表示，未来的发展趋势将更加注重创新和可持续发展。各界专家对此表示乐观，认为这将为行业带来新的机遇。`,
      url: `https://example.com/news/${keyword}-${i + 1}`,
      source: '模拟新闻源',
      publishedAt: new Date(now.getTime() - i * 3600000).toISOString(),
    });
  }

  return mockNews;
}

// 使用AI翻译和优化内容
async function translateAndOptimizeContent(
  title: string,
  content: string,
  sourceLanguage: string,
  targetLanguage: string,
  aiConfig: any
): Promise<{ translatedTitle: string; translatedContent: string; summary: string }> {
  try {
    const languageNames: Record<string, string> = {
      'zh-TW': '繁体中文',
      'zh': '简体中文',
      'en': '英文',
      'ja': '日文',
      'ko': '韩文',
    };

    const sourceLang = languageNames[sourceLanguage] || '中文';
    const targetLang = languageNames[targetLanguage] || '繁体中文';

    const prompt = `你是一个专业的新闻翻译和编辑。请将以下新闻内容翻译成${targetLang}，并按照以下要求处理：

1. 翻译要求：
   - 保持原文的核心意思和专业术语
   - 使用流畅、地道的${targetLang}表达
   - 新闻标题要吸引人且准确

2. 内容优化：
   - 生成一个简洁的摘要（50-100字）
   - 适当调整段落结构，便于阅读

3. 输出格式（严格按此格式输出，不要添加任何解释）：
---
标题：[翻译后的标题]
摘要：[生成的摘要]
正文：
[翻译并优化后的正文内容]
---`;

    const fullContent = `原文标题：${title}\n\n原文正文：${content}`;
    let response;

    if (aiConfig.provider === 'doubao' || aiConfig.provider === 'coze') {
      const endpoint = aiConfig.base_url || 'https://api.coze.cn/v1';
      response = await fetch(`${endpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.api_key}`,
        },
        body: JSON.stringify({
          model: aiConfig.model_id,
          messages: [{ role: 'user', content: `${prompt}\n\n${fullContent}` }],
          stream: false,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });
    } else if (aiConfig.provider === 'deepseek') {
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.api_key}`,
        },
        body: JSON.stringify({
          model: aiConfig.model_id,
          messages: [{ role: 'user', content: `${prompt}\n\n${fullContent}` }],
          stream: false,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });
    } else if (aiConfig.provider === 'kimi') {
      response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.api_key}`,
        },
        body: JSON.stringify({
          model: aiConfig.model_id,
          messages: [{ role: 'user', content: `${prompt}\n\n${fullContent}` }],
          stream: false,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });
    } else if (aiConfig.provider === 'glm') {
      response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.api_key}`,
        },
        body: JSON.stringify({
          model: aiConfig.model_id,
          messages: [{ role: 'user', content: `${prompt}\n\n${fullContent}` }],
          stream: false,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });
    } else if (aiConfig.provider === 'qwen') {
      response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.api_key}`,
        },
        body: JSON.stringify({
          model: aiConfig.model_id,
          messages: [{ role: 'user', content: `${prompt}\n\n${fullContent}` }],
          stream: false,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });
    } else {
      throw new Error(`不支持的AI提供商: ${aiConfig.provider}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API 调用失败:', response.status, errorText);
      throw new Error(`AI API 调用失败: ${response.status}`);
    }

    const result = await response.json();
    let aiContent = '';

    if (aiConfig.provider === 'doubao' || aiConfig.provider === 'coze') {
      aiContent = result.data?.messages?.[0]?.content || '';
    } else {
      aiContent = result.choices?.[0]?.message?.content || '';
    }

    const titleMatch = aiContent.match(/标题[：:]\s*(.+)/);
    const summaryMatch = aiContent.match(/摘要[：:]\s*(.+)/);
    const contentMatch = aiContent.match(/正文[：:\n]([\s\S]+)/);

    return {
      translatedTitle: titleMatch?.[1]?.trim() || title,
      translatedContent: contentMatch?.[1]?.trim() || content,
      summary: summaryMatch?.[1]?.trim() || content.slice(0, 200),
    };
  } catch (error) {
    console.error('翻译失败:', error);
    return {
      translatedTitle: title,
      translatedContent: content,
      summary: content.slice(0, 200),
    };
  }
}

// 手动执行任务
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: session } = await supabaseAdmin.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 检查管理员权限
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: '無權訪問' }, { status: 403 });
    }

    // 获取任务配置
    const { data: task, error: taskError } = await supabaseAdmin
      .from('auto_publish_tasks')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: '任務不存在' }, { status: 404 });
    }

    // 获取AI配置
    const aiConfig = await getDefaultAIConfig(supabaseAdmin);
    if (!aiConfig) {
      return NextResponse.json({ error: '請先配置AI模型' }, { status: 400 });
    }

    // 更新任务状态为运行中
    await supabaseAdmin
      .from('auto_publish_tasks')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', parseInt(id));

    let generatedCount = 0;
    const errors: string[] = [];

    // 遍历每个新闻源
    for (const sourceId of task.source_ids || []) {
      try {
        const source = await getNewsSourceConfig(supabaseAdmin, sourceId);
        if (!source) continue;

        // 搜索新闻
        const newsItems = await searchNews(
          source.keywords,
          source.language,
          source.count
        );

        // 更新新闻源的最后运行时间
        await supabaseAdmin
          .from('news_sources')
          .update({ last_run_at: new Date().toISOString() })
          .eq('id', sourceId);

        // 处理每条新闻
        for (const news of newsItems) {
          try {
            // 翻译和优化内容
            const translated = await translateAndOptimizeContent(
              news.title,
              news.content,
              source.language,
              source.target_language,
              aiConfig
            );

            // 保存到数据库
            const { error: insertError } = await supabaseAdmin
              .from('ai_generated_articles')
              .insert({
                source_id: sourceId,
                task_id: parseInt(id),
                original_title: news.title,
                original_content: news.content,
                original_url: news.url,
                original_language: source.language,
                translated_title: translated.translatedTitle,
                translated_content: translated.translatedContent,
                summary: translated.summary,
                status: 'pending',
                ai_model: aiConfig.model_id,
                ai_config_id: aiConfig.id,
              });

            if (!insertError) {
              generatedCount++;
            } else {
              errors.push(`处理 "${news.title}": ${insertError.message}`);
            }
          } catch (err) {
            errors.push(`处理 "${news.title}" 失败: ${err}`);
          }
        }
      } catch (err) {
        errors.push(`处理新闻源 ${sourceId} 失败: ${err}`);
      }
    }

    // 更新任务结果
    await supabaseAdmin
      .from('auto_publish_tasks')
      .update({
        last_run_at: new Date().toISOString(),
        last_result: {
          generatedCount,
          errors: errors.slice(0, 10),
          completedAt: new Date().toISOString(),
        },
      })
      .eq('id', parseInt(id));

    return NextResponse.json({
      success: true,
      data: {
        generatedCount,
        errors: errors.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('执行任务失败:', error);
    return NextResponse.json({ error: '執行失敗' }, { status: 500 });
  }
}
