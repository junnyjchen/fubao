-- 符寶網 初始数据插入

-- 管理员角色
INSERT IGNORE INTO admin_roles (id, name, code, permissions, is_super) VALUES
(1, '超级管理员', 'super_admin', '["*"]', 1);

-- 管理员 (密码 admin123 的 MD5: 0192023a7bbd73250516fbd9b0a1d64e)
INSERT IGNORE INTO admins (id, username, password, nickname, role_id, status) VALUES
(1, 'admin', '0192023a7bbd73250516fbd9b0a1d64e', '系统管理员', 1, 1);

-- 测试用户 (密码 admin123 的 MD5)
INSERT IGNORE INTO users (id, name, email, phone, password, language, role, points, status) VALUES
(1, '測試用戶', 'test@example.com', '13800138000', '0192023a7bbd73250516fbd9b0a1d64e', 'zh-TW', 'user', 100, 1);

-- 商品分类
INSERT IGNORE INTO categories (id, name, slug, description, icon, parent_id, sort_order, status) VALUES
(1, '符籙', 'fujis', '道教符籙，祈福驅邪', '📜', NULL, 1, 1),
(2, '法器', 'faqi', '道教科儀法器', '⚔️', NULL, 2, 1),
(3, '風水', 'fengshui', '風水擺件與工具', '🧭', NULL, 3, 1),
(4, '書籍', 'books', '道教典籍與書籍', '📚', NULL, 4, 1),
(5, '音像', 'media', '道教音視頻教程', '🎬', NULL, 5, 1),
(6, '香燭', 'incense', '香燭供品', '🕯️', NULL, 6, 1),
(7, '佩飾', 'accessories', '道教佩飾掛件', '📿', NULL, 7, 1),
(8, '其他', 'others', '其他道教用品', '🎁', NULL, 8, 1);

-- 商户
INSERT IGNORE INTO merchants (id, name, description, logo, contact_email, contact_phone, address, certification_level, rating, total_sales, status) VALUES
(1, '符寶網官方', '符寶網官方旗艦店', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=200&h=200&fit=crop', 'contact@fubao.ltd', '+852 1234 5678', '香港九龍', 3, 5.0, 5000, 1);

-- 示例商品
INSERT IGNORE INTO goods (id, name, slug, description, price, original_price, stock, images, category_id, merchant_id, status, is_featured, views, sales) VALUES
(1, '鎮宅平安符', 'zhenzhai-pingan-fu', '鎮宅平安符，由資深道士開光加持', 99.00, 199.00, 100, 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop', 1, 1, 1, 1, 500, 120),
(2, '七星劍', 'qixing-jian', '正宗七星劍，驅邪制煞', 599.00, 999.00, 50, 'https://images.unsplash.com/photo-1549921296-3b0f9a35af35?w=800&h=600&fit=crop', 2, 1, 1, 1, 300, 80),
(3, '八卦鏡', 'bagua-jing', '八卦鏡，調整風水', 199.00, 399.00, 200, 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=600&fit=crop', 3, 1, 1, 0, 200, 60);

-- Banners
INSERT IGNORE INTO banners (id, title, subtitle, image, link, position, sort, status) VALUES
(1, '符寶網正式上線', '傳承千年智慧，連接全球信眾', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1920&h=600&fit=crop', '/', 'home', 1, 1),
(2, '正統符籙 開光加持', '由資深道士親筆書寫', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=1920&h=600&fit=crop', '/shop?category=1', 'home', 2, 1);

-- 设置
INSERT IGNORE INTO settings (`key`, value, description) VALUES
('site_name', '符寶網', '網站名稱'),
('site_description', '全球玄門文化科普交易平台', '網站描述');

-- 新闻分类
INSERT IGNORE INTO news_categories (id, name, slug, sort_order) VALUES
(1, '平台公告', 'announcement', 1),
(2, '行業資訊', 'industry', 2),
(3, '活動資訊', 'activity', 3),
(4, '互動活動', 'event', 4);

-- 百科分类
INSERT IGNORE INTO wiki_categories (id, name, slug, description, icon, sort_order) VALUES
(1, '符籙文化', 'fuji', '道教符籙的種類、使用方法', '📜', 1),
(2, '法器介紹', 'faqi', '道教法器的種類、功能', '⚔️', 2),
(3, '道教科儀', 'yiyuan', '祈福、超度等科儀', '🎭', 3),
(4, '風水命理', 'fengshui', '家居風水、命理推算', '🧭', 4),
(5, '歷史傳承', 'history', '道教歷史與文化傳承', '📚', 5);

-- 视频分类
INSERT IGNORE INTO video_categories (id, name, slug, description, icon, sort_order) VALUES
(1, '符籙文化', 'fuji', '道教符籙的種類', '📜', 1),
(2, '道教科儀', 'ritual', '祈福、超度等科儀', '🎭', 2),
(3, '風水命理', 'fengshui', '家居風水', '🧭', 3),
(4, '法器介紹', 'faqi', '道教法器', '⚔️', 4),
(5, '歷史傳承', 'history', '道教歷史', '📚', 5),
(6, '養生保健', 'health', '道家養生', '🧘', 6);
