import { pgTable, serial, varchar, text, boolean, jsonb, integer, timestamp, index } from 'drizzle-orm/pg-core';

// AI 配置表
export const aiConfigurations = pgTable("ai_configurations", {
  id: serial("id").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // 配置名称
  provider: varchar("provider", { length: 50 }).notNull(), // 提供商: doubao, deepseek, kimi, glm
  modelId: varchar("model_id", { length: 100 }).notNull(), // 模型ID
  apiKey: text("api_key"), // API密钥（加密存储）
  baseUrl: varchar("base_url", { length: 500 }), // API地址
  enabled: boolean("enabled").default(true).notNull(),
  isDefault: boolean("is_default").default(false), // 是否默认配置
  settings: jsonb("settings"), // 其他设置 (temperature, maxTokens等)
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

// 新闻源表
export const newsSources = pgTable("news_sources", {
  id: serial("id").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // 源名称
  keywords: text("keywords").notNull(), // 搜索关键词（逗号分隔）
  language: varchar("language", { length: 10 }).default('zh'), // 源语言
  targetLanguage: varchar("target_language", { length: 10 }).default('zh-TW'), // 目标语言
  categoryId: integer("category_id"), // 关联分类
  count: integer("count").default(5), // 每次抓取数量
  enabled: boolean("enabled").default(true).notNull(),
  lastRunAt: timestamp("last_run_at", { withTimezone: true, mode: 'string' }), // 上次运行时间
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

// 自动发布任务表
export const autoPublishTasks = pgTable("auto_publish_tasks", {
  id: serial("id").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // 任务名称
  sourceIds: jsonb("source_ids"), // 关联的新闻源ID数组
  schedule: varchar("schedule", { length: 50 }).notNull(), // 执行时间表达式 (如 "0 6 * * *" 每天6点)
  status: varchar("status", { length: 20 }).default('active'), // active, paused, error
  lastRunAt: timestamp("last_run_at", { withTimezone: true, mode: 'string' }), // 上次执行时间
  lastResult: jsonb("last_result"), // 上次执行结果
  autoPublish: boolean("auto_publish").default(false), // 是否自动发布
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

// AI生成的文章表
export const aiGeneratedArticles = pgTable("ai_generated_articles", {
  id: serial("id").notNull(),
  sourceId: integer("source_id").notNull(), // 新闻源ID
  taskId: integer("task_id"), // 任务ID
  originalTitle: text("original_title").notNull(), // 原文标题
  originalContent: text("original_content"), // 原文内容
  originalUrl: varchar("original_url", { length: 500 }), // 原文链接
  originalLanguage: varchar("original_language", { length: 10 }).default('zh'),
  translatedTitle: text("translated_title"), // 翻译后标题
  translatedContent: text("translated_content"), // 翻译后内容
  summary: text("summary"), // AI生成的摘要
  cover: varchar("cover", { length: 500 }), // 封面图
  categoryId: integer("category_id"), // 分类ID
  status: varchar("status", { length: 20 }).default('pending'), // pending, approved, published, rejected
  publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
  publishedArticleId: integer("published_article_id"), // 发布的文章ID
  aiModel: varchar("ai_model", { length: 100 }), // 使用的AI模型
  aiConfigId: integer("ai_config_id"), // 使用的AI配置ID
  errorMessage: text("error_message"), // 错误信息
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

// 类型导出
export type AIConfiguration = typeof aiConfigurations.$inferSelect;
export type NewAIConfiguration = typeof aiConfigurations.$inferInsert;
export type NewsSource = typeof newsSources.$inferSelect;
export type NewNewsSource = typeof newsSources.$inferInsert;
export type AutoPublishTask = typeof autoPublishTasks.$inferSelect;
export type NewAutoPublishTask = typeof autoPublishTasks.$inferInsert;
export type AIGeneratedArticle = typeof aiGeneratedArticles.$inferSelect;
export type NewAIGeneratedArticle = typeof aiGeneratedArticles.$inferInsert;
