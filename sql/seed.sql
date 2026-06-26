-- 符寶網 種子數據
-- 執行順序: 先 schema.sql 再 seed.sql

-- 管理員角色
INSERT IGNORE INTO admin_roles (id, name, code, permissions, is_super) VALUES
(1, '超級管理員', 'super_admin', '["*"]', 1),
(2, '內容編輯', 'editor', '["goods:read","goods:write","articles:read","articles:write"]', 0);

-- 管理員帳號 (密碼: admin123, MD5: 0192023a7bbd73250516fbd9b0a1d64e)
INSERT IGNORE INTO admins (id, username, password, nickname, role_id, status) VALUES
(1, 'admin', '0192023a7bbd73250516fbd9b0a1d64e', '系統管理員', 1, 1),
(2, 'editor', '0192023a7bbd73250516fbd9b0a1d64e', '內容編輯', 2, 1);

-- 用戶 (密碼: admin123)
INSERT IGNORE INTO users (id, name, email, phone, password, language, role, points, status) VALUES
(1, '測試用戶', 'test@example.com', '13800138000', '0192023a7bbd73250516fbd9b0a1d64e', 'zh-TW', 'user', 100, 1),
(2, '演示用戶', 'demo@example.com', '13800138001', '0192023a7bbd73250516fbd9b0a1d64e', 'zh-TW', 'user', 50, 1);

-- 分類
INSERT IGNORE INTO categories (id, name, slug, icon, parent_id, sort_order, status) VALUES
(1, '符咒', 'fuzhou', '📜', NULL, 1, 1),
(2, '法器', 'faqi', '🔮', NULL, 2, 1),
(3, '供品', 'gongpin', '🏮', NULL, 3, 1),
(4, '修行用品', 'xiuxing', '📿', NULL, 4, 1),
(5, '風水擺件', 'fengshui', '🏔', NULL, 5, 1),
(6, '開運飾品', 'kaiyun', '📿', NULL, 6, 1);

-- 商家
INSERT IGNORE INTO merchants (id, name, type, contact_name, contact_phone, contact_email, description, address, license_number, verified, status, user_id, login_account, login_password) VALUES
(1, '符寶網官方旗艦店', 'enterprise', '陳道長', '13800138000', 'shop@fubao.com', '符寶網官方旗艦店，提供正宗道門法器與符咒', '台北市松山區八德路四段', 'FUBAO-001', 1, 1, 1, 'fubao_admin', 'admin123');

-- 商品
INSERT IGNORE INTO goods (id, name, subtitle, main_image, price, original_price, stock, sales, is_certified, category_id, merchant_id, type, purpose, status, description) VALUES
(1, '太極護身符', '道法自然·太極守護', '/images/products/taiji-fu.jpg', 99, 199, 100, 56, 1, 1, 1, 1, '護身辟邪', 1, '由道長親手繪製的太極護身符，具有強大的辟邪護身功效。'),
(2, '桃木劍·鎮宅法器', '千年桃木·正氣凜然', '/images/products/peach-sword.jpg', 299, 499, 50, 23, 1, 2, 1, 1, '鎮宅辟邪', 1, '選用千年桃木精雕而成，劍身刻有北斗七星符文，鎮宅辟邪之聖器。'),
(3, '天然沉香線香', '靜心修禪·品味天然', '/images/products/incense.jpg', 68, 128, 200, 89, 0, 3, 1, 1, '靜心修行', 1, '產自越南的天然沉香線香，香氣清雅持久，適合靜坐冥想使用。'),
(4, '紫檀佛珠手串', '靈性紫檀·修心養性', '/images/products/bracelet.jpg', 158, 258, 80, 45, 1, 4, 1, 1, '修心養性', 1, '精選印度老料紫檀，手工打磨拋光，每顆珠子都蘊含自然靈性。'),
(5, '龍龜風水擺件', '招財納福·鎮宅化煞', '/images/products/dragon-turtle.jpg', 388, 688, 30, 12, 1, 5, 1, 1, '招財化煞', 1, '銅製龍龜擺件，龍龜為瑞獸，主招財化煞，適合辦公室或家中擺放。'),
(6, '黑曜石觀音吊墜', '天然黑曜石·觀音庇佑', '/images/products/obsidian.jpg', 128, 228, 120, 67, 0, 6, 1, 1, '開運護身', 1, '天然黑曜石精雕觀音像，黑曜石具有強大的辟邪化煞能力。');

-- 輪播圖
INSERT IGNORE INTO banners (id, title, image, link, sort_order, status) VALUES
(1, '新春特惠', '/images/banners/spring.jpg', '/shop', 1, 1),
(2, '道法自然', '/images/banners/dao.jpg', '/baike', 2, 1);

-- 系統設置
INSERT IGNORE INTO settings (`key`, `value`) VALUES
('site_name', '符寶網'),
('site_description', '全球玄門文化科普交易平台'),
('contact_email', 'contact@fubao.com');

-- AI 知識庫
INSERT IGNORE INTO ai_knowledge (id, title, content, category, source_type, tags, status) VALUES
(1, '道教符咒基础知识', '符咒是道教法术的重要组成部分，是道士沟通天地、驱邪镇煞的重要工具。符咒由符文和咒语组成，符文是用朱砂或墨汁书写的特定图形和文字，咒语是配合符文使用的口诀。', 'fulu', 'manual', '["符咒","道教","基础"]', 'active'),
(2, '开光仪式流程', '开光是一种宗教仪式，通过特定的法事程序，赋予法器灵性和法力。开光仪式一般包括：净坛、请神、加持、封符等步骤。', 'ceremony', 'manual', '["开光","仪式","法器"]', 'active'),
(3, '风水基础知识', '风水是中国传统文化的重要组成部分，讲究人与自然环境的和谐。风水学主要包括阳宅风水和阴宅风水两大类。', 'fengshui', 'manual', '["风水","基础","环境"]', 'active');

-- AI 模型配置（增量插入，仅当记录不存在时插入，已有记录不覆盖）
INSERT IGNORE INTO ai_model_configs (id, `name`, provider, model_name, base_url, api_key, max_tokens, temperature, priority, is_default, status) VALUES
(1, 'DeepSeek V4', 'deepseek', 'deepseek-chat', 'https://api.deepseek.com', '', 8192, 0.70, 1, 1, 1),
(2, 'OpenAI GPT-4o', 'openai', 'gpt-4o', 'https://api.openai.com/v1', '', 4096, 0.70, 2, 0, 1),
(3, 'Kimi', 'moonshot', 'moonshot-v1-auto', 'https://api.moonshot.cn/v1', '', 8192, 0.70, 3, 0, 1),
(4, '豆包', 'doubao', 'doubao-pro-32k', 'https://ark.cn-beijing.volces.com/api/v3', '', 4096, 0.70, 4, 0, 1),
(5, '通义千问', 'qwen', 'qwen-turbo', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '', 4096, 0.70, 5, 0, 1),
(6, '智谱 GLM-4', 'zhipu', 'glm-4', 'https://open.bigmodel.cn/api/paas/v4', '', 4096, 0.70, 6, 0, 1);

-- AI 問答
INSERT IGNORE INTO ai_qa (id, question, answer, category, knowledge_id, keywords, is_active) VALUES
(1, '什么是符咒？', '符咒是道教法术的重要组成部分，由符文和咒语组成，用于沟通天地、驱邪镇煞。', 'fulu', 1, '["符咒","道教"]', 1),
(2, '开光是什么意思？', '开光是一种宗教仪式，通过特定法事程序赋予法器灵性和法力，包括净坛、请神、加持、封符等步骤。', 'ceremony', 2, '["开光","仪式"]', 1);

-- 商品多語言
INSERT IGNORE INTO goods_i18n (id, goods_id, locale, name, subtitle, description) VALUES
(1, 1, 'en', 'Tai Chi Amulet', 'Dao follows nature·Tai Chi Guardian', 'A Tai Chi amulet hand-drawn by a Taoist priest, with powerful evil-warding and protective effects.'),
(2, 1, 'ja', '太極護身符', '道法自然·太極守護', '道士が手書きした太極護身符、強力な厄除け護身の効能があります。'),
(3, 2, 'en', 'Peach Wood Sword', 'Millennium Peach Wood·Righteous Spirit', 'Crafted from millennium-old peach wood, the sword body is engraved with Big Dipper talisman runes.'),
(4, 2, 'ja', '桃木剣·鎮宅法器', '千年桃木·正気凛然', '千年の桃木から精巧に彫刻され、剣身に北斗七星の符文が刻まれています。'),
(5, 3, 'en', 'Natural Agarwood Incense', 'Meditation·Natural Fragrance', 'Natural agarwood incense from Vietnam, with an elegant and long-lasting aroma.'),
(6, 3, 'ja', '天然沈香線香', '静心修禅·天然の香り', 'ベトナム産の天然沈香線香、香りは清雅で長持ちし、座禅瞑想に適しています。');

-- 分類多語言
INSERT IGNORE INTO categories_i18n (id, category_id, locale, name) VALUES
(1, 1, 'en', 'Talismans'),
(2, 1, 'ja', '符咒'),
(3, 2, 'en', 'Ritual Items'),
(4, 2, 'ja', '法器'),
(5, 3, 'en', 'Offerings'),
(6, 3, 'ja', '供品'),
(7, 4, 'en', 'Cultivation Supplies'),
(8, 4, 'ja', '修行用品'),
(9, 5, 'en', 'Feng Shui Decor'),
(10, 5, 'ja', '風水擺件'),
(11, 6, 'en', 'Lucky Accessories'),
(12, 6, 'ja', '開運飾品');
