-- ============================================
-- 符宝网视频学堂数据库表结构
-- 视频分类 & 视频内容表
-- ============================================

-- 1. 视频分类表 (video_categories)
CREATE TABLE IF NOT EXISTS video_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 视频分类表索引
CREATE INDEX IF NOT EXISTS idx_video_categories_slug ON video_categories(slug);
CREATE INDEX IF NOT EXISTS idx_video_categories_sort_order ON video_categories(sort_order);

-- 视频分类表注释
COMMENT ON TABLE video_categories IS '视频分类表';
COMMENT ON COLUMN video_categories.slug IS 'URL友好的唯一标识';
COMMENT ON COLUMN video_categories.icon IS '分类图标';

-- 2. 视频表 (videos)
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES video_categories(id) ON DELETE SET NULL,
    description TEXT,
    cover_image VARCHAR(500),
    video_url VARCHAR(500),
    duration INTEGER DEFAULT 0,
    author VARCHAR(100),
    author_avatar VARCHAR(500),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[],
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 视频表索引
CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_is_published ON videos(is_published);
CREATE INDEX IF NOT EXISTS idx_videos_is_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_videos_sort_order ON videos(sort_order);

-- 视频表注释
COMMENT ON TABLE videos IS '视频内容表';
COMMENT ON COLUMN videos.slug IS 'URL友好的唯一标识';
COMMENT ON COLUMN videos.duration IS '视频时长（秒）';
COMMENT ON COLUMN videos.is_published IS '是否已发布';
COMMENT ON COLUMN videos.is_featured IS '是否推荐/置顶';

-- ============================================
-- 初始数据
-- ============================================

-- 插入默认视频分类
INSERT INTO video_categories (name, slug, description, icon, sort_order) VALUES
    ('道長說符', 'master-says', '道長講解符籙知識與使用方法', '📜', 1),
    ('法器開箱', 'unboxing', '法器開箱展示與介紹', '🗡️', 2),
    ('宮觀巡禮', 'temple-tour', '各地道教宮觀參訪記錄', '🏛️', 3),
    ('法會直播', 'live-ceremony', '開光法會等活動直播回放', '🪷', 4),
    ('修行入門', 'practice-intro', '道教修行基礎知識講解', '📖', 5)
ON CONFLICT (slug) DO NOTHING;

-- 插入示例视频
INSERT INTO videos (title, slug, category_id, description, author, duration, is_published, is_featured, tags, sort_order) VALUES
    ('道長說符：鎮宅符的正確貼法', 'master-says-zhenzai-fu', 1, 
     '青城山道長親自講解鎮宅符的正確貼法，包括位置選擇、時辰講究、注意事項等。',
     '青城山道長', 285, true, true, ARRAY['鎮宅符', '道長說符', '貼符方法'], 1),
    
    ('法器開箱：開光銅錢劍', 'unboxing-copper-sword', 2,
     '本期開箱展示龍虎山開光銅錢劍，詳細介紹其材質、工藝與使用方法。',
     '符寶網官方', 420, true, true, ARRAY['法器', '開箱', '銅錢劍', '開光'], 2),
    
    ('龍虎山天師府巡禮', 'tour-longhushan', 3,
     '走進道教祖庭龍虎山天師府，探訪千年道教聖地的歷史與文化。',
     '玄門遊記', 680, true, false, ARRAY['龍虎山', '天師府', '宮觀'], 3),
    
    ('開光法會現場直播回放', 'live-kaiGuang-ceremony', 4,
     '武當山開光法會現場直播回放，見證法器開光儀式全過程。',
     '武當山道觀', 3600, true, false, ARRAY['開光', '法會', '直播'], 4),
    
    ('道教入門：什麼是符籙？', 'intro-what-is-fulu', 5,
     '初學者必看！全面了解符籙的起源、種類與基本使用方法。',
     '符寶網編輯部', 520, true, true, ARRAY['符籙', '入門', '道教'], 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 更新触发器 - 自动更新 updated_at
-- ============================================

-- 视频分类表更新触发器
CREATE OR REPLACE FUNCTION update_video_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_video_categories_updated_at ON video_categories;
CREATE TRIGGER trigger_video_categories_updated_at
    BEFORE UPDATE ON video_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_video_categories_updated_at();

-- 视频表更新触发器
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_videos_updated_at ON videos;
CREATE TRIGGER trigger_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_videos_updated_at();

-- ============================================
-- 完成
-- ============================================
