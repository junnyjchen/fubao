/**
 * @fileoverview SEO分析API
 * @description 分析内容的SEO质量，提供优化建议
 * @module app/api/admin/ai-content/seo-analysis/route
 */

import { NextRequest, NextResponse } from 'next/server';

/** SEO分析请求 */
interface SEOAnalysisRequest {
  title: string;
  summary: string;
  content: string;
  keywords: string[];
  metaDescription: string;
}

/** SEO分析结果 */
interface SEOAnalysisResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  analysis: {
    title: {
      score: number;
      length: number;
      hasKeyword: boolean;
      suggestions: string[];
    };
    summary: {
      score: number;
      length: number;
      hasKeyword: boolean;
      suggestions: string[];
    };
    content: {
      score: number;
      length: number;
      keywordDensity: Record<string, number>;
      readability: number;
      suggestions: string[];
    };
    keywords: {
      score: number;
      count: number;
      relevance: number;
      suggestions: string[];
    };
    metaDescription: {
      score: number;
      length: number;
      hasKeyword: boolean;
      suggestions: string[];
    };
  };
  overallSuggestions: string[];
}

/**
 * 计算关键词密度
 */
function calculateKeywordDensity(content: string, keyword: string): number {
  const cleanContent = content.toLowerCase();
  const cleanKeyword = keyword.toLowerCase();
  const keywordCount = (cleanContent.match(new RegExp(cleanKeyword, 'g')) || []).length;
  const totalWords = cleanContent.replace(/\s+/g, '').length;
  return totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
}

/**
 * 计算可读性分数（基于句子长度和段落结构）
 */
function calculateReadability(content: string): number {
  const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  if (sentences.length === 0) return 50;
  
  const avgSentenceLength = content.length / sentences.length;
  const avgParagraphLength = sentences.length / Math.max(paragraphs.length, 1);
  
  // 理想句子长度：20-40字
  const sentenceScore = avgSentenceLength >= 20 && avgSentenceLength <= 40 ? 100 :
    avgSentenceLength < 20 ? 70 : Math.max(50, 100 - (avgSentenceLength - 40) * 2);
  
  // 理想段落：3-7个句子
  const paragraphScore = avgParagraphLength >= 3 && avgParagraphLength <= 7 ? 100 :
    avgParagraphLength < 3 ? 60 : Math.max(50, 100 - (avgParagraphLength - 7) * 5);
  
  return Math.round((sentenceScore + paragraphScore) / 2);
}

/**
 * 分析标题SEO
 */
function analyzeTitle(title: string, keywords: string[]): SEOAnalysisResult['analysis']['title'] {
  const suggestions: string[] = [];
  let score = 100;
  
  // 标题长度检查（理想：25-35字）
  const length = title.length;
  if (length < 15) {
    suggestions.push('標題過短，建議15-35字');
    score -= 20;
  } else if (length > 40) {
    suggestions.push('標題過長，建議15-35字');
    score -= 10;
  }
  
  // 关键词检查
  const hasKeyword = keywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()));
  if (!hasKeyword) {
    suggestions.push('標題應包含核心關鍵詞');
    score -= 30;
  }
  
  return {
    score: Math.max(0, score),
    length,
    hasKeyword,
    suggestions,
  };
}

/**
 * 分析摘要SEO
 */
function analyzeSummary(summary: string, keywords: string[]): SEOAnalysisResult['analysis']['summary'] {
  const suggestions: string[] = [];
  let score = 100;
  
  // 摘要长度检查（理想：80-150字）
  const length = summary.length;
  if (length < 50) {
    suggestions.push('摘要過短，建議80-150字');
    score -= 20;
  } else if (length > 200) {
    suggestions.push('摘要過長，建議80-150字');
    score -= 10;
  }
  
  // 关键词检查
  const hasKeyword = keywords.some(kw => summary.toLowerCase().includes(kw.toLowerCase()));
  if (!hasKeyword) {
    suggestions.push('摘要應包含核心關鍵詞');
    score -= 20;
  }
  
  return {
    score: Math.max(0, score),
    length,
    hasKeyword,
    suggestions,
  };
}

/**
 * 分析正文SEO
 */
function analyzeContent(
  content: string,
  keywords: string[]
): SEOAnalysisResult['analysis']['content'] {
  const suggestions: string[] = [];
  let score = 100;
  
  // 内容长度检查
  const length = content.length;
  if (length < 300) {
    suggestions.push('內容過短，建議至少500字');
    score -= 30;
  } else if (length < 500) {
    suggestions.push('內容可再豐富，建議800字以上');
    score -= 10;
  }
  
  // 关键词密度分析
  const keywordDensity: Record<string, number> = {};
  keywords.forEach(kw => {
    const density = calculateKeywordDensity(content, kw);
    keywordDensity[kw] = Number(density.toFixed(2));
    
    // 理想密度：1-3%
    if (density < 0.5) {
      suggestions.push(`關鍵詞「${kw}」密度過低，建議增加出現次數`);
      score -= 5;
    } else if (density > 5) {
      suggestions.push(`關鍵詞「${kw}」密度過高，可能被視為關鍵詞堆砌`);
      score -= 10;
    }
  });
  
  // 可读性分析
  const readability = calculateReadability(content);
  if (readability < 60) {
    suggestions.push('內容可讀性較差，建議優化句子和段落結構');
    score -= 15;
  }
  
  return {
    score: Math.max(0, score),
    length,
    keywordDensity,
    readability,
    suggestions,
  };
}

/**
 * 分析关键词SEO
 */
function analyzeKeywords(
  keywords: string[],
  content: string,
  title: string
): SEOAnalysisResult['analysis']['keywords'] {
  const suggestions: string[] = [];
  let score = 100;
  
  // 关键词数量检查
  const count = keywords.length;
  if (count < 3) {
    suggestions.push('關鍵詞數量過少，建議3-8個');
    score -= 20;
  } else if (count > 10) {
    suggestions.push('關鍵詞數量過多，建議3-8個');
    score -= 10;
  }
  
  // 关键词相关性检查
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();
  let relevanceCount = 0;
  
  keywords.forEach(kw => {
    const kwLower = kw.toLowerCase();
    if (contentLower.includes(kwLower) || titleLower.includes(kwLower)) {
      relevanceCount++;
    }
  });
  
  const relevance = keywords.length > 0 ? (relevanceCount / keywords.length) * 100 : 0;
  if (relevance < 50) {
    suggestions.push('部分關鍵詞與內容不相關，請調整');
    score -= 20;
  }
  
  return {
    score: Math.max(0, score),
    count,
    relevance: Math.round(relevance),
    suggestions,
  };
}

/**
 * 分析Meta描述SEO
 */
function analyzeMetaDescription(
  metaDescription: string,
  keywords: string[]
): SEOAnalysisResult['analysis']['metaDescription'] {
  const suggestions: string[] = [];
  let score = 100;
  
  // Meta描述长度检查（理想：120-160字）
  const length = metaDescription.length;
  if (length < 80) {
    suggestions.push('Meta描述過短，建議120-160字');
    score -= 20;
  } else if (length > 180) {
    suggestions.push('Meta描述過長，搜索引擎可能截斷');
    score -= 10;
  }
  
  // 关键词检查
  const hasKeyword = keywords.some(kw => 
    metaDescription.toLowerCase().includes(kw.toLowerCase())
  );
  if (!hasKeyword) {
    suggestions.push('Meta描述應包含核心關鍵詞');
    score -= 20;
  }
  
  return {
    score: Math.max(0, score),
    length,
    hasKeyword,
    suggestions,
  };
}

/**
 * 计算总体SEO分数和等级
 */
function calculateOverallScore(analysis: SEOAnalysisResult['analysis']): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' } {
  const weights = {
    title: 0.2,
    summary: 0.15,
    content: 0.35,
    keywords: 0.15,
    metaDescription: 0.15,
  };
  
  const score = Math.round(
    analysis.title.score * weights.title +
    analysis.summary.score * weights.summary +
    analysis.content.score * weights.content +
    analysis.keywords.score * weights.keywords +
    analysis.metaDescription.score * weights.metaDescription
  );
  
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';
  
  return { score, grade };
}

/**
 * 生成总体建议
 */
function generateOverallSuggestions(analysis: SEOAnalysisResult['analysis']): string[] {
  const suggestions: string[] = [];
  
  // 汇总所有建议
  const allSuggestions = [
    ...analysis.title.suggestions,
    ...analysis.summary.suggestions,
    ...analysis.content.suggestions,
    ...analysis.keywords.suggestions,
    ...analysis.metaDescription.suggestions,
  ];
  
  // 去重并返回最重要的建议
  const uniqueSuggestions = [...new Set(allSuggestions)];
  return uniqueSuggestions.slice(0, 5);
}

/**
 * POST /api/admin/ai-content/seo-analysis
 * 分析内容SEO质量
 */
export async function POST(request: NextRequest) {
  try {
    const body: SEOAnalysisRequest = await request.json();
    const { title, summary, content, keywords, metaDescription } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: '請提供標題和內容' },
        { status: 400 }
      );
    }

    // 执行各项分析
    const titleAnalysis = analyzeTitle(title, keywords || []);
    const summaryAnalysis = analyzeSummary(summary || '', keywords || []);
    const contentAnalysis = analyzeContent(content, keywords || []);
    const keywordsAnalysis = analyzeKeywords(keywords || [], content, title);
    const metaDescriptionAnalysis = analyzeMetaDescription(metaDescription || '', keywords || []);

    const analysis: SEOAnalysisResult['analysis'] = {
      title: titleAnalysis,
      summary: summaryAnalysis,
      content: contentAnalysis,
      keywords: keywordsAnalysis,
      metaDescription: metaDescriptionAnalysis,
    };

    const { score, grade } = calculateOverallScore(analysis);
    const overallSuggestions = generateOverallSuggestions(analysis);

    const result: SEOAnalysisResult = {
      score,
      grade,
      analysis,
      overallSuggestions,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('SEO分析失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'SEO分析失敗' },
      { status: 500 }
    );
  }
}
