-- =========================================
-- 符寶網 初始数据SQL
-- 生成时间: 2024-04-20
-- 版本: v1.0
-- 说明: 符寶網项目的初始数据，用于数据库初始化
-- =========================================

-- 执行前请确保数据库已创建

-- =========================================
-- 第一部分：分类数据
-- =========================================

-- 商品分类 (categories)
INSERT INTO categories (id, name, slug, description, icon, parent_id, sort_order, status, created_at, updated_at) VALUES
(1, '符籙', 'fujis', '道教符籙，祈福驅邪', '📜', NULL, 1, true, NOW(), NOW()),
(2, '法器', 'faqi', '道教科儀法器', '⚔️', NULL, 2, true, NOW(), NOW()),
(3, '風水', 'fengshui', '風水擺件與工具', '🧭', NULL, 3, true, NOW(), NOW()),
(4, '書籍', 'books', '道教典籍與書籍', '📚', NULL, 4, true, NOW(), NOW()),
(5, '音像', 'media', '道教音視頻教程', '🎬', NULL, 5, true, NOW(), NOW()),
(6, '香燭', 'incense', '香燭供品', '🕯️', NULL, 6, true, NOW(), NOW()),
(7, '佩飾', 'accessories', '道教佩飾掛件', '📿', NULL, 7, true, NOW(), NOW()),
(8, '其他', 'others', '其他道教用品', '🎁', NULL, 8, true, NOW(), NOW());

-- 百科分类 (wiki_categories)
INSERT INTO wiki_categories (id, name, slug, description, icon, sort_order, created_at, updated_at) VALUES
(1, '符籙文化', 'fuji', '道教符籙的種類、使用方法與保存技巧', '📜', 1, NOW(), NOW()),
(2, '法器介紹', 'faqi', '道教法器的種類、功能與開光知識', '⚔️', 2, NOW(), NOW()),
(3, '道教科儀', 'yiyuan', '祈福、超度、驅邪等道教科儀詳解', '🎭', 3, NOW(), NOW()),
(4, '風水命理', 'fengshui', '家居風水、命理推算與環境調整', '🧭', 4, NOW(), NOW()),
(5, '歷史傳承', 'history', '道教歷史、神仙譜系與文化傳承', '📚', 5, NOW(), NOW());

-- 新闻分类 (news_categories)
INSERT INTO news_categories (id, name, slug, sort_order, created_at, updated_at) VALUES
(1, '平台公告', 'announcement', 1, NOW(), NOW()),
(2, '行業資訊', 'industry', 2, NOW(), NOW()),
(3, '活動資訊', 'activity', 3, NOW(), NOW()),
(4, '互動活動', 'event', 4, NOW(), NOW());

-- 视频分类 (video_categories)
INSERT INTO video_categories (id, name, slug, description, icon, sort_order, created_at, updated_at) VALUES
(1, '符籙文化', 'fuji', '道教符籙的種類、使用方法與製作', '📜', 1, NOW(), NOW()),
(2, '道教科儀', 'ritual', '祈福、超度、驅邪等科儀詳解', '🎭', 2, NOW(), NOW()),
(3, '風水命理', 'fengshui', '家居風水、命理推算與環境調整', '🧭', 3, NOW(), NOW()),
(4, '法器介紹', 'faqi', '道教法器的種類、功能與開光', '⚔️', 4, NOW(), NOW()),
(5, '歷史傳承', 'history', '道教歷史、神仙譜系與文化傳承', '📚', 5, NOW(), NOW()),
(6, '養生保健', 'health', '道家養生、氣功與太極', '🧘', 6, NOW(), NOW());

-- =========================================
-- 第二部分：商户数据
-- =========================================

INSERT INTO merchants (id, name, description, logo, contact_email, contact_phone, address, certification_level, rating, total_sales, status, created_at, updated_at) VALUES
(1, '符寶網官方', '符寶網官方旗艦店，正統道教文化傳承', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=200&h=200&fit=crop', 'contact@fubao.ltd', '+852 1234 5678', '香港九龍', 3, 5.0, 5000, true, NOW(), NOW());

-- =========================================
-- 第三部分：Banners轮播图
-- =========================================

INSERT INTO banners (id, title, subtitle, image, link, position, sort, status, created_at, updated_at) VALUES
(1, '符寶網正式上線', '傳承千年智慧，連接全球信眾', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1920&h=600&fit=crop', '/', 'home', 1, true, NOW(), NOW()),
(2, '正統符籙 開光加持', '由資深道士親筆書寫，正統道觀開光', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=1920&h=600&fit=crop', '/shop?category=1', 'home', 2, true, NOW(), NOW()),
(3, '道教文化百科', '探索千年道教的奧秘', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&h=600&fit=crop', '/wiki', 'home', 3, true, NOW(), NOW()),
(4, '會員專屬福利', '加入會員，享更多優惠', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920&h=600&fit=crop', '/user/vip', 'home', 4, true, NOW(), NOW());

-- =========================================
-- 第四部分：新闻数据
-- =========================================

INSERT INTO news (id, title, slug, summary, content, cover_image, type, views, is_featured, status, published_at, created_at, updated_at) VALUES
(1, '符寶網正式上線：開啟全球玄門文化新紀元', 'fubao-officially-launches', '符寶網作為全球首個專注於玄門文化的電商平台，正式宣佈上線運營。', '<h2>符寶網：傳承千年智慧，連接全球信眾</h2><p>符寶網作為全球首個專注於玄門文化的電商平台，於今日正式宣佈上線運營。我們致力於弘揚中華傳統文化，讓更多人了解和體驗道教的精髓。</p><h3>平台使命</h3><p>道教作為中國傳統文化的根源之一，其思想體系和實踐方法對中華文明有著深遠的影響。符寶網的使命是將這些珍貴的文化遺產以現代化的方式呈現，讓傳統文化走進千家萬戶。</p><h3>平台特色</h3><ul><li><strong>正品保障</strong>：所有商品均經過正規渠道，品質保證</li><li><strong>文化傳承</strong>：弘揚道教文化，傳承千年智慧</li><li><strong>專業服務</strong>：提供專業的諮詢和售後服務</li><li><strong>AI助手</strong>：智能問答，解答您的任何疑問</li></ul>', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop', 1, 2568, true, true, NOW(), NOW(), NOW()),

(2, '道教文化與現代生活：傳統智慧的當代應用', 'taoism-modern-life-application', '傳統道教文化如何與現代生活相結合？本文深入探討道教思想在當代社會的應用價值。', '<h2>道法自然：天人合一的現代意義</h2><p>道教文化強調「道法自然」、「天人合一」的理念，這些思想在現代社會依然具有重要的指導意義。</p><h3>道家思想的核心</h3><ul><li><strong>無為而治</strong>：順應自然規律，不強求</li><li><strong>上善若水</strong>：像水一樣柔弱但能攻克堅強</li><li><strong>知足常樂</strong>：珍惜當下，不貪心</li></ul><h3>實踐應用</h3><h4>1. 冥想與養生</h4><p>道教的靜坐冥想方法能幫助現代人緩解壓力、調理身心。</p><h4>2. 風水與環境</h4><p>傳統風水學說的核心理念——選擇適宜的居住環境——仍有參考價值。</p>', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', 2, 1892, true, true, NOW(), NOW(), NOW()),

(3, '符籙使用指南：傳承千年的道教法術', 'fuji-usage-guide', '符籙使用時需要注意的事項，讓您更好地發揮符籙的效果。', '<h2>符籙：溝通天地的橋樑</h2><p>符籙是道教法術的重要組成部分，被視為天界神仙的文字或命令。</p><h3>符籙的種類</h3><ul><li><strong>鎮宅符</strong>：用於保護住宅平安，驅除邪祟</li><li><strong>治病符</strong>：用於醫治疾病，緩解症狀</li><li><strong>招財符</strong>：用於招攬財運，廣開財源</li><li><strong>平安符</strong>：用於保佑平安，逢凶化吉</li><li><strong>太歲符</strong>：用於化解太歲沖煞</li></ul><h3>符籙的使用方法</h3><p>符籙通常需要由有道行的道士開光加持後才能使用。使用時需心存善念。</p>', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=600&fit=crop', 3, 1567, false, true, NOW(), NOW(), NOW()),

(4, '新年祈福法會圓滿成功：千名信眾共祈平安', 'new-year-blessing-ceremony-success', '新年祈福法會圓滿舉辦，為善信祈福納祥，現場千名信眾共襄盛舉。', '<h2>祈福法會：傳承千年的傳統習俗</h2><p>由符寶網舉辦的新年祈福法會已圓滿成功舉行，吸引了來自各地的善信參與。</p><h3>法會內容</h3><ul><li><strong>祈福法事</strong>：由高功法師主持，祈求國泰民安</li><li><strong>送太歲</strong>：化解本命年的沖煞</li><li><strong>點燈祈福</strong>：點亮心燈，照亮前程</li><li><strong>拜太歲</strong>：參拜太歲星君，祈求護佑</li></ul><h3>未來活動預告</h3><p>符寶網將繼續舉辦各類道教文化活動。</p>', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop', 4, 987, false, true, NOW(), NOW(), NOW()),

(5, '道觀參訪指南：香港著名道觀推薦', 'hongkong-taoist-temples-guide', '香港著名道觀推薦，帶您領略道教文化的魅力。', '<h2>香港道觀：傳統與現代的交融</h2><p>香港作為道教傳播的重要地區，擁有眾多歷史悠久、規模宏大的道觀。</p><h3>蓬瀛仙館</h3><p>蓬瀛仙館是香港最著名的道觀之一，建於1930年代，供奉全真派祖師。</p><h3>黃大仙祠</h3><p>黃大仙祠是香港香火最旺的廟宇之一，以靈驗著稱。</p><h3>青松觀</h3><p>青松觀是香港主要的全真道觀之一，以園林建築著稱。</p><h3>參觀禮儀</h3><ul><li>衣著整潔，避免暴露</li><li>保持安靜，不可大聲喧嘩</li><li>尊重神明，心存敬意</li></ul>', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop', 2, 1234, false, true, NOW(), NOW(), NOW());

-- =========================================
-- 第五部分：百科文章
-- =========================================

INSERT INTO wiki_articles (id, title, slug, summary, content, cover_image, author, views, is_featured, status, category_id, created_at, updated_at) VALUES
(1, '道教基礎：什麼是符籙', 'what-is-fuji', '符籙是道教法術的重要組成部分，被視為天界神仙的文字或命令。', '<h2>什麼是符籙？</h2><p>符籙是道教法術的重要組成部分，被視為天界神仙的文字或命令。道士通過書寫、祭煉過的符紙，來達到祈福、驅邪、治病等目的。</p><h3>符籙的歷史</h3><p>符籙起源於遠古時期的巫術，在漢代道教形成後逐漸系統化。</p><h3>符籙的種類</h3><ul><li><strong>鎮宅符</strong>：用於保護住宅平安</li><li><strong>治病符</strong>：用於醫治疾病</li><li><strong>招財符</strong>：用於招攬財運</li><li><strong>平安符</strong>：用於保佑平安</li></ul><h3>符籙的使用方法</h3><p>符籙通常需要由有道行的道士開光加持後才能使用。</p>', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=600&fit=crop', '符寶網', 3567, true, true, 1, NOW(), NOW()),

(2, '道教法器大全：種類與作用', 'types-of-faqi', '法器是道士進行法事活動的重要工具，每種法器都有其獨特的功能。', '<h2>法器的種類與作用</h2><p>法器是道士進行法事活動的重要工具，每種法器都有其獨特的功能和象徵意義。</p><h3>令牌</h3><p>令牌是道士法器之首，用於號令天兵天將，具有至高無上的權威。</p><h3>七星劍</h3><p>七星劍是驅邪制煞的利器，象徵北斗七星之力。</p><h3>鈴鐺</h3><p>鈴鐺用於招魂引魄，通靈感應。</p><h3>如意</h3><p>如意象徵心想事成，萬事如意。</p>', 'https://images.unsplash.com/photo-1549921296-3b0f9a35af35?w=800&h=600&fit=crop', '符寶網', 2890, true, true, 2, NOW(), NOW()),

(3, '開光儀式：傳承千年的道教傳統', 'kaiguang-ritual', '開光是道教傳統儀式，旨在賦予物品靈性，使其具有神聖力量。', '<h2>開光儀式的由來與意義</h2><p>開光是道教傳統儀式，源於古代祭祀文化。道教認為，普通物品經過開光後，可以承載神靈之力。</p><h3>開光的種類</h3><ul><li><strong>神像開光</strong>：為神像開光，使其具有靈性</li><li><strong>法器開光</strong>：為法器開光，增強其靈力</li><li><strong>風水開光</strong>：為風水物品開光，調整氣場</li></ul><h3>開光儀式的流程</h3><ol><li><strong>淨壇</strong>：清潔法壇</li><li><strong>請神</strong>：恭請神明降臨</li><li><strong>誦經</strong>：朗誦道教經典</li><li><strong>點睛</strong>：以朱砂開光</li></ol>', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop', '符寶網', 2156, false, true, 3, NOW(), NOW()),

(4, '風水基礎：如何看風水', 'fengshui-basics', '風水是中華傳統文化的重要組成部分，學習基礎知識可以改善家居環境。', '<h2>風水基礎知識</h2><p>風水學說是中華傳統文化的瑰寶，研究人與居住環境關係的學問。</p><h3>風水的基本原則</h3><ol><li><strong>藏風聚氣</strong>：選址時應選擇避風、有屏障的地方</li><li><strong>依山傍水</strong>：理想的生活環境應該有山有水</li><li><strong>坐北朝南</strong>：房屋朝向以坐北朝南為最佳</li></ol><h3>家居風水禁忌</h3><ul><li>大門正對電梯或樓梯</li><li>鏡子正對床鋪</li><li>橫樑壓頂</li></ul>', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', '符寶網', 1987, true, true, 4, NOW(), NOW()),

(5, '道教神仙譜系：主要神明介紹', 'taoist-gods-introduction', '道教是多神宗教，擁有龐大的神仙體系。了解主要神明有助於更好地理解道教文化。', '<h2>道教神仙譜系</h2><p>道教是多神宗教，擁有龐大的神仙體系。神仙是道教的信仰核心。</p><h3>道教最高神：三清</h3><ul><li><strong>元始天尊</strong>：象徵宇宙的本源</li><li><strong>靈寶天尊</strong>：象徵陰陽兩儀</li><li><strong>道德天尊</strong>（太上老君）：即老子</li></ul><h3>玉皇大帝</h3><p>玉皇大帝是天界的最高統治者，俗稱「老天爺」。</p><h3>關帝爺</h3><p>關帝爺即關羽，因其忠義而被神化。在商業界尤為流行，被視為武財神。</p>', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop', '符寶網', 1876, false, true, 5, NOW(), NOW()),

(6, '道教科儀：常用法事詳解', 'taoist-rituals-details', '道教科儀是道教修煉和法事活動的規範，了解這些有助於更好地參與道教文化。', '<h2>道教科儀詳解</h2><p>道教科儀是道教法事活動的規範和程式，是道士與神明溝通的方式。</p><h3>祈福法事</h3><p>祈福法事是最常見的道教科儀，用於祈求平安、健康、財運等。</p><h3>超度法事</h3><p>超度法事用於幫助亡魂離苦得樂，早日投胎轉世。</p><h3>驅邪法事</h3><p>驅邪法事用於驅除邪祟、化解煞氣。</p><h3>拜太歲</h3><p>犯太歲的年份運勢不佳，通過拜太歲法事可以化解太歲沖煞。</p>', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop', '符寶網', 1567, false, true, 3, NOW(), NOW());

-- =========================================
-- 第六部分：视频数据
-- =========================================

INSERT INTO videos (id, title, slug, description, cover, url, duration, category_id, author, views, likes, is_featured, status, sort, published_at, created_at, updated_at) VALUES
(1, '符籙基礎教程：認識道教符籙', 'fuji-basic-tutorial', '<h2>符籙基礎教程</h2><p>本視頻為大家詳細介紹道教符籙的基礎知識。</p><h3>主要內容</h3><ul><li>什麼是符籙</li><li>符籙的歷史起源</li><li>常見符籙種類介紹</li><li>符籙的使用方法</li></ul>', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=640&h=360&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1234, 1, '符寶網', 5678, 234, true, true, 1, NOW(), NOW(), NOW()),

(2, '道教科儀：開光儀式詳解', 'kaiguang-ritual-video', '<h2>道教科儀：開光儀式</h2><p>開光是道教傳統儀式，本視頻為大家詳細講解開光儀式的流程和注意事項。</p>', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=640&h=360&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2345, 2, '符寶網', 4567, 189, true, true, 2, NOW(), NOW(), NOW()),

(3, '風水入門：家居風水基礎知識', 'fengshui-basics-video', '<h2>風水入門課程</h2><p>本視頻為風水愛好者介紹家居風水的基礎知識，幫助大家改善居住環境。</p>', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1567, 3, '符寶網', 7890, 345, true, true, 3, NOW(), NOW(), NOW()),

(4, '法器介紹：令牌與七星劍的使用', 'faqi-intro-video', '<h2>法器介紹課程</h2><p>本視頻為大家介紹道教常用的法器，包括令牌、七星劍、鈴鐺等。</p>', 'https://images.unsplash.com/photo-1549921296-3b0f9a35af35?w=640&h=360&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1890, 4, '符寶網', 3456, 156, false, true, 4, NOW(), NOW(), NOW()),

(5, '道教神仙：認識三清祖師', 'taoist-gods-video', '<h2>道教神仙譜系</h2><p>本視頻為大家介紹道教的主要神仙，特別是最高神三清。</p>', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=640&h=360&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2100, 5, '符寶網', 4321, 201, false, true, 5, NOW(), NOW(), NOW()),

(6, '太歲知識：2024年犯太歲化解方法', 'taishui-2024-video', '<h2>太歲知識詳解</h2><p>本視頻為大家詳細講解什麼是太歲，如何化解。</p>', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=640&h=360&fit=crop', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1678, 3, '符寶網', 6543, 289, true, true, 6, NOW(), NOW(), NOW());

-- =========================================
-- 第七部分：商品数据
-- =========================================

INSERT INTO goods (id, name, subtitle, description, main_image, images, price, original_price, stock, sales, is_certified, type, purpose, merchant_id, category_id, status, created_at, updated_at) VALUES
(0, '免費平安符', '新手免費領取，道祖加持護平安', '<h2>免費領取平安符</h2><p>符寶網為回饋廣大信眾，特推出免費平安符領取活動。</p><h3>符咒功效</h3><ul><li>護佑人身安全</li><li>化解小人是非</li><li>出入平安</li><li>逢凶化吉</li></ul><h3>領取說明</h3><p>每位用戶限領一份，由正統道觀開光加持，心誠則靈。</p>', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=800&fit=crop"]', '0.00', '99.00', 9999, 1523, true, 1, '平安', 1, 1, true, NOW(), NOW()),

(1, '太上老君護身符', '正統道教開光，護佑平安', '<h2>太上老君護身符</h2><p>本品由正統道觀出品，經高功法師開光加持，具有護身辟邪之效。</p><h3>規格</h3><ul><li>尺寸：10cm x 5cm</li><li>材質：宣紙</li><li>開光：高功法師主法</li></ul>', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg', '[]', '199.00', '399.00', 100, 256, true, 1, '護身', 1, 1, true, NOW(), NOW()),

(2, '鎮宅符一套', '鎮宅驅邪，保家平安', '<h2>鎮宅符一套</h2><p>一套四張，包含門神符、鎮宅符、驅邪符、保家符。</p>', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&h=400&fit=crop', '[]', '299.00', '599.00', 50, 128, true, 1, '鎮宅', 1, 1, true, NOW(), NOW()),

(3, '招財進寶符', '招財納福，財運亨通', '<h2>招財進寶符</h2><p>專為招財而設，適合商鋪、辦公室、家中財位使用。</p>', 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&h=400&fit=crop', '[]', '168.00', '268.00', 80, 189, true, 1, '招財', 1, 1, true, NOW(), NOW());

-- =========================================
-- 第八部分：管理员账户
-- =========================================

-- 管理员密码: admin123 (需要bcrypt哈希)
-- INSERT INTO admin_users (email, password, name, role, created_at) VALUES
-- ('admin@fubao.ltd', '$2b$10$...', '系統管理員', 'super_admin', NOW());

-- =========================================
-- 初始化完成
-- =========================================

-- 验证数据
SELECT '初始化数据已导入完成！' AS status;
SELECT 'categories: ' || COUNT(*) FROM categories;
SELECT 'wiki_categories: ' || COUNT(*) FROM wiki_categories;
SELECT 'news: ' || COUNT(*) FROM news;
SELECT 'wiki_articles: ' || COUNT(*) FROM wiki_articles;
SELECT 'videos: ' || COUNT(*) FROM videos;
SELECT 'goods: ' || COUNT(*) FROM goods;
SELECT 'banners: ' || COUNT(*) FROM banners;
