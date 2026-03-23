-- ============================================
-- 符宝网数据库表结构
-- 一物一证证书表 & 百科内容表
-- ============================================

-- 1. 证书表 (certificates)
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    certificate_no VARCHAR(50) UNIQUE NOT NULL,
    goods_id INTEGER REFERENCES goods(id) ON DELETE CASCADE,
    merchant_id INTEGER REFERENCES merchants(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL,
    issued_by VARCHAR(100) NOT NULL,
    valid_until DATE,
    verification_count INTEGER DEFAULT 0,
    last_verification TIMESTAMP,
    status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'revoked')),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 证书表索引
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_no ON certificates(certificate_no);
CREATE INDEX IF NOT EXISTS idx_certificates_goods_id ON certificates(goods_id);
CREATE INDEX IF NOT EXISTS idx_certificates_merchant_id ON certificates(merchant_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);

-- 证书表注释
COMMENT ON TABLE certificates IS '一物一证认证证书表';
COMMENT ON COLUMN certificates.certificate_no IS '证书编号，唯一标识';
COMMENT ON COLUMN certificates.goods_id IS '关联商品ID';
COMMENT ON COLUMN certificates.merchant_id IS '关联商户ID';
COMMENT ON COLUMN certificates.issue_date IS '颁发日期';
COMMENT ON COLUMN certificates.issued_by IS '颁发机构';
COMMENT ON COLUMN certificates.valid_until IS '有效期至，NULL表示永久有效';
COMMENT ON COLUMN certificates.verification_count IS '验证次数';
COMMENT ON COLUMN certificates.last_verification IS '最后验证时间';
COMMENT ON COLUMN certificates.status IS '证书状态：valid-有效，expired-已过期，revoked-已吊销';
COMMENT ON COLUMN certificates.details IS '认证详情JSON：材质、产地、工艺、开光法师等';

-- 2. 百科分类表 (wiki_categories)
CREATE TABLE IF NOT EXISTS wiki_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES wiki_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 百科分类表索引
CREATE INDEX IF NOT EXISTS idx_wiki_categories_slug ON wiki_categories(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_categories_parent_id ON wiki_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_wiki_categories_sort_order ON wiki_categories(sort_order);

-- 百科分类表注释
COMMENT ON TABLE wiki_categories IS '百科分类表';
COMMENT ON COLUMN wiki_categories.slug IS 'URL友好的唯一标识';
COMMENT ON COLUMN wiki_categories.parent_id IS '父分类ID，支持多级分类';

-- 3. 百科文章表 (wiki_articles)
CREATE TABLE IF NOT EXISTS wiki_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES wiki_categories(id) ON DELETE SET NULL,
    summary TEXT,
    content TEXT,
    cover_image VARCHAR(500),
    author VARCHAR(100) DEFAULT '符寶網編輯部',
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 百科文章表索引
CREATE INDEX IF NOT EXISTS idx_wiki_articles_slug ON wiki_articles(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_category_id ON wiki_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_is_published ON wiki_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_is_featured ON wiki_articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_tags ON wiki_articles USING GIN(tags);

-- 百科文章表注释
COMMENT ON TABLE wiki_articles IS '百科文章表';
COMMENT ON COLUMN wiki_articles.slug IS 'URL友好的唯一标识';
COMMENT ON COLUMN wiki_articles.is_published IS '是否已发布';
COMMENT ON COLUMN wiki_articles.is_featured IS '是否推荐/置顶';
COMMENT ON COLUMN wiki_articles.tags IS '文章标签数组';

-- ============================================
-- 初始数据
-- ============================================

-- 插入默认百科分类
INSERT INTO wiki_categories (name, slug, description, sort_order) VALUES
    ('符籙知識', 'fulu-knowledge', '符籙的歷史、種類與使用方法', 1),
    ('法器介紹', 'faqie-intro', '道教法器的種類與用途', 2),
    ('道教文化', 'daoism-culture', '道教文化與歷史', 3),
    ('修行入門', 'practice-intro', '道教修行基礎知識', 4)
ON CONFLICT (slug) DO NOTHING;

-- 插入示例百科文章
INSERT INTO wiki_articles (title, slug, category_id, summary, content, author, is_published, is_featured, tags) VALUES
    ('什麼是符籙？', 'what-is-fulu', 1, '符籙是道教重要的法術載體，歷史悠久，用途廣泛。', 
     '# 什麼是符籙？

符籙是道教重要的法術載體，歷史悠久，用途廣泛。

## 符籙的起源

符籙起源於古代的巫術和祭祀活動，經過道教的發展和完善，形成了獨特的符籙體系。

## 符籙的種類

- 鎮宅符：用於鎮宅辟邪
- 護身符：用於保護人身安全
- 平安符：祈求平安吉祥
- 財運符：招財進寶

## 符籙的使用方法

1. 選擇合適的符籙
2. 誠心祈禱
3. 正確佩戴或放置', 
     '符寶網編輯部', true, true, ARRAY['符籙', '道教', '入門']),
    
    ('道教法器簡介', 'daoism-tools', 2, '道教法器種類繁多，各有其特殊用途和象徵意義。',
     '# 道教法器簡介

道教法器種類繁多，各有其特殊用途和象徵意義。

## 常見法器

### 桃木劍
桃木劍是最常見的法器之一，用於驅邪鎮煞。

### 八卦鏡
八卦鏡用於化解煞氣，是風水常用的法器。

### 鈴鐺
鈴鐺用於法事中，可通神靈、驅邪祟。',
     '符寶網編輯部', true, false, ARRAY['法器', '道教', '入門'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 更新触发器 - 自动更新 updated_at
-- ============================================

-- 证书表更新触发器
CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_certificates_updated_at ON certificates;
CREATE TRIGGER trigger_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_certificates_updated_at();

-- 百科分类表更新触发器
CREATE OR REPLACE FUNCTION update_wiki_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wiki_categories_updated_at ON wiki_categories;
CREATE TRIGGER trigger_wiki_categories_updated_at
    BEFORE UPDATE ON wiki_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_wiki_categories_updated_at();

-- 百科文章表更新触发器
CREATE OR REPLACE FUNCTION update_wiki_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wiki_articles_updated_at ON wiki_articles;
CREATE TRIGGER trigger_wiki_articles_updated_at
    BEFORE UPDATE ON wiki_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_wiki_articles_updated_at();

-- ============================================
-- 完成
-- ============================================
-- 执行完成后，可调用 POST /api/seed 初始化更多测试数据
