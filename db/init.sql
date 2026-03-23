-- ============================================
-- 符宝网完整数据库初始化脚本
-- 执行顺序：先执行此脚本，再调用 POST /api/seed 初始化测试数据
-- ============================================

-- ============================================
-- 一、用户相关表
-- ============================================

-- 用户表 (users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'merchant', 'admin')),
    status BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

COMMENT ON TABLE users IS '用户表';

-- 用户地址表 (user_addresses)
CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    address VARCHAR(200) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

COMMENT ON TABLE user_addresses IS '用户收货地址表';

-- ============================================
-- 二、商户相关表
-- ============================================

-- 商户表 (merchants)
CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type INTEGER DEFAULT 1 CHECK (type IN (1, 2, 3)),
    logo VARCHAR(500),
    description TEXT,
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    address VARCHAR(200),
    qualifications TEXT[],
    status BOOLEAN DEFAULT false,
    certification_level INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_type ON merchants(type);

COMMENT ON TABLE merchants IS '商户表，type: 1-个人，2-企业，3-认证';

-- ============================================
-- 三、商品相关表
-- ============================================

-- 商品分类表 (categories)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE,
    icon VARCHAR(50),
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

COMMENT ON TABLE categories IS '商品分类表';

-- 商品表 (goods)
CREATE TABLE IF NOT EXISTS goods (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES merchants(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    type INTEGER DEFAULT 1,
    purpose VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    images TEXT[],
    main_image VARCHAR(500),
    description TEXT,
    is_certified BOOLEAN DEFAULT false,
    status BOOLEAN DEFAULT true,
    sort INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_goods_merchant_id ON goods(merchant_id);
CREATE INDEX IF NOT EXISTS idx_goods_category_id ON goods(category_id);
CREATE INDEX IF NOT EXISTS idx_goods_status ON goods(status);
CREATE INDEX IF NOT EXISTS idx_goods_is_certified ON goods(is_certified);

COMMENT ON TABLE goods IS '商品表';

-- ============================================
-- 四、订单相关表
-- ============================================

-- 订单表 (orders)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    pay_amount DECIMAL(10,2) NOT NULL,
    pay_status INTEGER DEFAULT 0 CHECK (pay_status IN (0, 1, 2)),
    pay_method VARCHAR(20),
    pay_time TIMESTAMP,
    order_status INTEGER DEFAULT 0 CHECK (order_status IN (0, 1, 2, 3, 4)),
    shipping_name VARCHAR(50),
    shipping_phone VARCHAR(20),
    shipping_address VARCHAR(200),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_pay_status ON orders(pay_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);

COMMENT ON TABLE orders IS '订单表，pay_status: 0-未支付，1-已支付，2-退款；order_status: 0-待付款，1-待发货，2-已发货，3-已完成，4-已取消';

-- 订单商品表 (order_items)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    goods_id INTEGER REFERENCES goods(id) ON DELETE SET NULL,
    goods_name VARCHAR(200),
    goods_image VARCHAR(500),
    price DECIMAL(10,2),
    quantity INTEGER,
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

COMMENT ON TABLE order_items IS '订单商品明细表';

-- 购物车表 (cart)
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    goods_id INTEGER REFERENCES goods(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    selected BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, goods_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

COMMENT ON TABLE cart IS '购物车表';

-- ============================================
-- 五、证书相关表
-- ============================================

-- 证书表 (certificates)
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

CREATE INDEX IF NOT EXISTS idx_certificates_certificate_no ON certificates(certificate_no);
CREATE INDEX IF NOT EXISTS idx_certificates_goods_id ON certificates(goods_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);

COMMENT ON TABLE certificates IS '一物一证认证证书表';

-- ============================================
-- 六、百科相关表
-- ============================================

-- 百科分类表 (wiki_categories)
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

CREATE INDEX IF NOT EXISTS idx_wiki_categories_slug ON wiki_categories(slug);

COMMENT ON TABLE wiki_categories IS '百科分类表';

-- 百科文章表 (wiki_articles)
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

CREATE INDEX IF NOT EXISTS idx_wiki_articles_slug ON wiki_articles(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_category_id ON wiki_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_is_published ON wiki_articles(is_published);

COMMENT ON TABLE wiki_articles IS '百科文章表';

-- ============================================
-- 七、视频相关表
-- ============================================

-- 视频分类表 (video_categories)
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

CREATE INDEX IF NOT EXISTS idx_video_categories_slug ON video_categories(slug);

COMMENT ON TABLE video_categories IS '视频分类表';

-- 视频表 (videos)
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

CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_is_published ON videos(is_published);

COMMENT ON TABLE videos IS '视频内容表';

-- ============================================
-- 八、内容相关表
-- ============================================

-- 新闻资讯表 (news)
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE,
    cover VARCHAR(500),
    summary TEXT,
    content TEXT,
    type INTEGER DEFAULT 1 CHECK (type IN (1, 2, 3, 4)),
    views INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_type ON news(type);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);

COMMENT ON TABLE news IS '新闻资讯表，type: 1-全球新闻，2-行业资讯，3-平台活动，4-用户互动';

-- 轮播图表 (banners)
CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    image VARCHAR(500) NOT NULL,
    link VARCHAR(200),
    position VARCHAR(20) DEFAULT 'home',
    sort_order INTEGER DEFAULT 0,
    status BOOLEAN DEFAULT true,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);

COMMENT ON TABLE banners IS '轮播图表';

-- ============================================
-- 九、其他功能表
-- ============================================

-- 用户收藏表 (favorites)
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    goods_id INTEGER REFERENCES goods(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, goods_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

COMMENT ON TABLE favorites IS '用户收藏表';

-- 商品评价表 (reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    goods_id INTEGER REFERENCES goods(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    images TEXT[],
    is_anonymous BOOLEAN DEFAULT false,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_goods_id ON reviews(goods_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

COMMENT ON TABLE reviews IS '商品评价表';

-- ============================================
-- 十、初始数据
-- ============================================

-- 插入默认商品分类
INSERT INTO categories (name, slug, icon, description, sort_order) VALUES
    ('符籙', 'fulu', '📜', '各類符籙法器', 1),
    ('法器', 'fayqi', '🗡️', '道教法器用品', 2),
    ('開光物品', 'kaiGuang', '✨', '開光加持物品', 3),
    ('書籍', 'books', '📖', '道教典籍書籍', 4),
    ('其他', 'other', '📦', '其他玄門用品', 5)
ON CONFLICT (slug) DO NOTHING;

-- 插入默认百科分类
INSERT INTO wiki_categories (name, slug, description, sort_order) VALUES
    ('符籙知識', 'fulu-knowledge', '符籙的歷史、種類與使用方法', 1),
    ('法器介紹', 'faqie-intro', '道教法器的種類與用途', 2),
    ('道教文化', 'daoism-culture', '道教文化與歷史', 3),
    ('修行入門', 'practice-intro', '道教修行基礎知識', 4)
ON CONFLICT (slug) DO NOTHING;

-- 插入默认视频分类
INSERT INTO video_categories (name, slug, description, icon, sort_order) VALUES
    ('道長說符', 'master-says', '道長講解符籙知識與使用方法', '📜', 1),
    ('法器開箱', 'unboxing', '法器開箱展示與介紹', '🗡️', 2),
    ('宮觀巡禮', 'temple-tour', '各地道教宮觀參訪記錄', '🏛️', 3),
    ('法會直播', 'live-ceremony', '開光法會等活動直播回放', '🪷', 4),
    ('修行入門', 'practice-intro', '道教修行基礎知識講解', '📖', 5)
ON CONFLICT (slug) DO NOTHING;

-- 插入默认管理员账户（密码: admin123）
INSERT INTO users (username, email, password, nickname, role, status) VALUES
    ('admin', 'admin@fubao.ltd', '$2a$10$rQZ9QxZQxZQxZQxZQxZQxOZQxZQxZQxZQxZQxZQxZQxZQxZQxZQx', '管理員', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 十一、更新触发器
-- ============================================

-- 通用更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['users', 'merchants', 'goods', 'orders', 'certificates', 'wiki_categories', 'wiki_articles', 'video_categories', 'videos', 'news'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_%s_updated_at ON %s', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trigger_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl, tbl);
    END LOOP;
END $$;

-- ============================================
-- 完成
-- ============================================
-- 数据库表结构创建完成！
-- 请调用 POST /api/seed 初始化测试数据
