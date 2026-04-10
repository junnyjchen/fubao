-- AI新闻自动发布功能数据库表
-- 运行此SQL创建所需表

-- AI模型配置表
CREATE TABLE IF NOT EXISTS ai_configurations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model_id VARCHAR(100) NOT NULL,
    api_key TEXT,
    base_url VARCHAR(500),
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ai_config_enabled_idx ON ai_configurations(enabled);

-- 新闻源表
CREATE TABLE IF NOT EXISTS news_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    keywords TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'zh',
    target_language VARCHAR(10) DEFAULT 'zh-TW',
    category_id INTEGER,
    count INTEGER DEFAULT 5,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS news_sources_enabled_idx ON news_sources(enabled);

-- 定时任务表
CREATE TABLE IF NOT EXISTS auto_publish_tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source_ids JSONB,
    schedule VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    last_run_at TIMESTAMPTZ,
    last_result JSONB,
    auto_publish BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS auto_publish_tasks_status_idx ON auto_publish_tasks(status);

-- AI生成的文章表
CREATE TABLE IF NOT EXISTS ai_generated_articles (
    id SERIAL PRIMARY KEY,
    source_id INTEGER NOT NULL,
    task_id INTEGER,
    original_title TEXT NOT NULL,
    original_content TEXT,
    original_url VARCHAR(500),
    original_language VARCHAR(10) DEFAULT 'zh',
    translated_title TEXT,
    translated_content TEXT,
    summary TEXT,
    cover VARCHAR(500),
    category_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    published_at TIMESTAMPTZ,
    published_article_id INTEGER,
    ai_model VARCHAR(100),
    ai_config_id INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ai_gen_articles_status_idx ON ai_generated_articles(status);
CREATE INDEX IF NOT EXISTS ai_gen_articles_source_id_idx ON ai_generated_articles(source_id);
CREATE INDEX IF NOT EXISTS ai_gen_articles_created_at_idx ON ai_generated_articles(created_at);

-- RLS 策略 (Row Level Security)
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_publish_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_articles ENABLE ROW LEVEL SECURITY;

-- 为 ai_configurations 创建 RLS 策略
CREATE POLICY "允许管理员对 ai_configurations 的所有操作" ON ai_configurations
    FOR ALL USING (auth.role() = 'authenticated');

-- 为 news_sources 创建 RLS 策略
CREATE POLICY "允许管理员对 news_sources 的所有操作" ON news_sources
    FOR ALL USING (auth.role() = 'authenticated');

-- 为 auto_publish_tasks 创建 RLS 策略
CREATE POLICY "允许管理员对 auto_publish_tasks 的所有操作" ON auto_publish_tasks
    FOR ALL USING (auth.role() = 'authenticated');

-- 为 ai_generated_articles 创建 RLS 策略
CREATE POLICY "允许管理员对 ai_generated_articles 的所有操作" ON ai_generated_articles
    FOR ALL USING (auth.role() = 'authenticated');
