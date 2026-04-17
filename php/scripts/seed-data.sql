-- =====================================================
-- 符寶網 - 扩展测试数据
-- 包含：用户、分类、商品、订单、地址、优惠券、收藏、AI知识库等
-- =====================================================

SET NAMES utf8mb4;

-- =====================================================
-- 1. 扩展分类数据
-- =====================================================

INSERT INTO `categories` (`name`, `icon`, `sort`, `status`) VALUES
('符籙', '🧧', 101, 1),
('法器', '⚱️', 102, 1),
('風水擺件', '🏺', 103, 1),
('命理服務', '📿', 104, 1),
('道教典籍', '📜', 105, 1),
('香燭供品', '🕯️', 106, 1),
('開光聖品', '✨', 107, 1);

-- 子分类
INSERT INTO `categories` (`parent_id`, `name`, `icon`, `sort`, `status`) VALUES
-- 符籙子分类
(1, '護身符', NULL, 1, 1),
(1, '鎮宅符', NULL, 2, 1),
(1, '招財符', NULL, 3, 1),
(1, '姻緣符', NULL, 4, 1),
(1, '文昌符', NULL, 5, 1),
(1, '太歲符', NULL, 6, 1),
-- 法器子分类
(2, '令牌', NULL, 1, 1),
(2, '印章', NULL, 2, 1),
(2, '劍', NULL, 3, 1),
(2, '鈴', NULL, 4, 1),
-- 風水擺件子分类
(3, '銅器', NULL, 1, 1),
(3, '玉石', NULL, 2, 1),
(3, '木雕', NULL, 3, 1),
(3, '書畫', NULL, 4, 1);

-- =====================================================
-- 2. 用户测试数据
-- =====================================================

INSERT INTO `users` (`username`, `email`, `phone`, `password`, `nickname`, `name`, `gender`, `birthday`, `status`, `created_at`) VALUES
('john_doe', 'john@example.com', '0912345678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '約翰', '約翰·王', 'male', '1990-05-15', 1, DATE_SUB(NOW(), INTERVAL 90 DAY)),
('mary_chen', 'mary@example.com', '0923456789', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '瑪麗', '陳瑪麗', 'female', '1985-08-20', 1, DATE_SUB(NOW(), INTERVAL 60 DAY)),
('alex_wu', 'alex@example.com', '0934567890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '亞歷克斯', '吳亞歷克斯', 'male', '1992-03-10', 1, DATE_SUB(NOW(), INTERVAL 45 DAY)),
('sarah_lin', 'sarah@example.com', '0945678901', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '莎拉', '林莎拉', 'female', '1988-11-25', 1, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('david_zhang', 'david@example.com', '0956789012', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '大衛', '張大衛', 'male', '1995-01-08', 1, DATE_SUB(NOW(), INTERVAL 20 DAY)),
('emma_liu', 'emma@example.com', '0967890123', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '艾瑪', '劉艾瑪', 'female', '1993-07-22', 1, DATE_SUB(NOW(), INTERVAL 15 DAY)),
('james_huang', 'james@example.com', '0978901234', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '詹姆斯', '黃詹姆斯', 'male', '1987-04-30', 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),
('lisa_wang', 'lisa@example.com', '0989012345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '麗莎', '王麗莎', 'female', '1991-09-18', 1, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- =====================================================
-- 3. 用户地址数据
-- =====================================================

INSERT INTO `user_addresses` (`user_id`, `name`, `phone`, `province`, `city`, `district`, `address`, `is_default`, `created_at`) VALUES
(1, '約翰·王', '0912345678', '台灣', '台北市', '大安區', '復興南路一段100號', 1, NOW()),
(1, '約翰·王', '0912345678', '台灣', '新北市', '板橋區', '中山路一段200號', 0, NOW()),
(2, '陳瑪麗', '0923456789', '台灣', '高雄市', '苓雅區', '五福一路88號', 1, NOW()),
(3, '吳亞歷克斯', '0934567890', '台灣', '台中市', '西屯區', '台灣大道三段66號', 1, NOW()),
(4, '林莎拉', '0945678901', '台灣', '桃園市', '桃園區', '中正路100號', 1, NOW()),
(5, '張大衛', '0956789012', '台灣', '新竹市', '東區', '光復路一段200號', 1, NOW()),
(6, '劉艾瑪', '0967890123', '台灣', '台南市', '中西區', '中山路88號', 1, NOW()),
(7, '黃詹姆斯', '0978901234', '台灣', '台北市', '信義區', '松壽路66號', 1, NOW()),
(8, '王麗莎', '0989012345', '台灣', '新北市', '中和區', '連城路200號', 1, NOW());

-- =====================================================
-- 4. 扩展AI训练知识库
-- =====================================================

INSERT INTO `ai_training_knowledge` (`title`, `content`, `category`, `source_type`, `tags`, `status`, `admin_id`, `created_at`) VALUES

-- 文化科普类
('道教科儀基礎', '道教科儀是道教宗教實踐的重要組成部分，包括各種法事、齋醮、祭祀等活動。\n\n常見科儀：\n1. 早朝：清晨舉行的科儀\n2. 午朝：中午舉行的科儀\n3. 晚朝：傍晚舉行的科儀\n4. 懺悔：懺悔罪過的科儀\n5. 度亡：超度亡魂的科儀\n\n重要場合：\n- 春節祈福\n- 端午驅邪\n- 中元普渡\n- 重陽登高\n- 冬至祭天', 'culture', 'text', '["道教", "科儀", "法事"]', 'ready', 1, NOW()),

('太歲的由來與化解', '太歲是我國傳統民俗中的重要概念，源於道教對木星（歲星）的崇拜。\n\n什麼是太歲：\n- 太歲是道教護法神靈\n- 每60年一輪迴，對應天干地支\n- 與當年生肖相沖者為「犯太歲」\n\n犯太歲的生肖：\n- 沖太歲：運勢動盪\n- 害太歲：小人作祟\n- 破太歲：財運受損\n- 刑太歲：口舌是非\n\n化解方法：\n1. 安太歲：在廟宇安太歲\n2. 佩戴化太歲符\n3. 多做善事積德\n4. 避免衝動決策', 'culture', 'text', '["太歲", "化解", "風水"]', 'ready', 1, NOW()),

('五行的相生相剋', '五行學說是我國傳統文化的核心概念，包括金、木、水、火、土五种基本元素。\n\n五行相生：\n- 金生水：水要靠金來開礦\n- 水生木：木要靠水來滋潤\n- 木生火：火要靠木來燃燒\n- 火生土：土要靠火來燒煉\n- 土生金：金要靠土來孕育\n\n五行相剋：\n- 金剋木：刀斧能砍木\n- 木剋土：植物能破土\n- 土剋水：水來土掩\n- 水剋火：水能滅火\n- 火剋金：火能熔金\n\n五行與行業：\n- 金：金融、法律、珠寶\n- 木：農業、林業、造紙\n- 水：餐飲、旅遊、水產\n- 火：餐飲、電力、照明\n- 土：房地產、農業、礦產', 'fortune', 'text', '["五行", "相生", "相剋"]', 'ready', 1, NOW()),

('羅盤的使用方法', '羅盤是風水師必備的工具，主要用於測定方位和氣場。\n\n羅盤結構：\n1. 天池：中央的磁針\n2. 內盤：可以轉動的圓盤\n3. 外盤：固定的方形底座\n4. 刻度：表示方位角度\n\n使用步驟：\n1. 將羅盤放在平穩的地面\n2. 調整羅盤使其水平\n3. 轉動內盤讓磁針指向南\n4. 讀取刻度確定方位\n\n注意事項：\n- 避免在有磁場干擾的地方使用\n- 保持羅盤清潔乾燥\n- 定期校正磁針', 'fortune', 'text', '["羅盤", "風水", "工具"]', 'ready', 1, NOW()),

-- 商品使用类
('符籙的開光儀式', '開光是道教重要的宗教儀式，為符籙賦予靈力。\n\n開光流程：\n1. 選擇吉日良辰\n2. 準備香燭供品\n3. 淨身淨口\n4. 誦經持咒\n5. 書符或請符\n6. 點睛開光\n7. 加持灌輸法力\n\n開光物品：\n- 符籙\n- 神像\n- 玉器\n- 護身符\n\n自開光方法：\n1. 將符籙對著陽光\n2. 誠心誦讀咒語\n3. 滴血（如需要）\n4. 供奉後使用\n\n注意：自開光效果不如道觀正式開光', 'usage', 'text', '["開光", "儀式", "符籙"]', 'ready', 1, NOW()),

('符籙的佩戴禁忌', '佩戴符籙有諸多禁忌需要注意，否則可能影響效果。\n\n佩戴禁忌：\n1. 不可讓外人觸摸\n2. 不可沾染污穢\n3. 不可讓符沾水\n4. 夫妻同房時取下\n5. 不可佩戴過期符\n\n保存方法：\n- 放在乾淨的袋子或盒子\n- 避免陽光直射\n- 不可放在低處\n- 保持乾燥通風\n\n處理方式：\n- 如符受損可火化送走\n- 不可隨意丟棄\n- 應到廟宇請求處理', 'usage', 'text', '["禁忌", "佩戴", "符籙"]', 'ready', 1, NOW()),

('風水擺件的擺放', '風水擺件可以調節家居氣場，但擺放位置很有講究。\n\n常見擺件：\n1. 貔貅：招財進寶，頭朝門外\n2. 金蟾：招財納福，頭朝室內\n3. 龍龜：化煞招福，頭朝門\n4. 麒麟：化解煞氣，頭朝外\n5. 龍柱：提升氣場，靠牆而立\n\n擺放原則：\n- 根據個人命理選擇\n- 配合房屋方位\n- 注意五行相生相剋\n- 避免放在汙穢處\n\n注意事項：\n- 擺件必須開光才有效果\n- 定期清潔保養\n- 損壞後應妥善處理', 'usage', 'text', '["風水擺件", "擺放", "禁忌"]', 'ready', 1, NOW()),

-- 产品类
('符寶網認證流程', '符寶網對所有上架商品進行嚴格認證，確保是正品。\n\n認證流程：\n1. 商家提交入駐申請\n2. 資質審核（營業執照、師傅證書）\n3. 商品審核（材料、工藝、功效）\n4. 價格審核（市場比較、合理定價）\n5. 簽署認證協議\n6. 發放認證標識\n\n認證標識：\n- 一物一證：唯一編碼\n- 二維碼：掃碼驗證\n- 防偽標籤：杜絕假冒\n\n售後保障：\n- 7天無理由退換\n- 正品保障\n- 專家諮詢', 'product', 'text', '["認證", "正品", "保障"]', 'ready', 1, NOW()),

('如何識別假冒符籙', '市場上存在假冒符籙，消費者需要學會識別。\n\n假冒特徵：\n1. 價格過於便宜\n2. 包裝粗糙\n3. 無師傅簽名\n4. 無認證編號\n5. 質地低劣\n\n正規符籙特徵：\n1. 有師傅親筆簽名\n2. 蓋有道觀印章\n3. 配有合格證書\n4. 包裝精美\n5. 價格合理\n\n購買建議：\n- 選擇正規渠道\n- 查看商家資質\n- 索取正規發票\n- 驗證認證編號', 'product', 'text', '["假冒", "識別", "正品"]', 'ready', 1, NOW()),

-- 命理类
('流年運勢計算', '流年運勢是根據每年的天干地支變化來預測運勢的方法。\n\n計算方法：\n1. 確定出生年的天干地支\n2. 找出流年的天干地支\n3. 分析天干地支與命局的關係\n4. 判斷吉凶方位\n\n流年特點：\n- 每個流年持續一年\n- 影響該年的整體運勢\n- 可預測事業、感情、健康\n\n注意事項：\n- 流年只是參考\n- 命運掌握在自己手中\n- 努力同樣重要\n- 遇到不利流年要多積德', 'fortune', 'text', '["流年", "運勢", "命理"]', 'ready', 1, NOW()),

('命盤合盤分析', '合盤是分析兩人關係的重要命理方法。\n\n合盤要素：\n1. 年柱合：代表長輩緣分\n2. 月柱合：代表同輩關係\n3. 日柱合：代表夫妻緣分\n4. 時柱合：代表晚輩緣分\n\n合婚標準：\n- 雙方五行互補\n- 日干相合\n- 地支三合或六合\n- 無嚴重沖剋\n\n合盤意義：\n- 了解相處模式\n- 預測未來發展\n- 解決相處問題\n\n注意：合盤只是參考，不能決定一切', 'fortune', 'text', '["合盤", "合婚", "命理"]', 'ready', 1, NOW());

-- =====================================================
-- 5. 扩展AI问答对
-- =====================================================

INSERT INTO `ai_qa_pairs` (`question`, `answer`, `category`, `keywords`, `is_active`, `created_at`) VALUES

-- 文化科普类
('道教和佛教有什麼區別？', '道教和我國佛教是兩大主要宗教，有以下主要區別：\n\n核心信仰：\n- 道教：追求長生不老、修道成仙\n- 佛教：追求解脫輪迴、涅槃境界\n\n修煉方式：\n- 道教：內丹、外丹、符籙、法術\n- 佛教：禪定、持戒、布施、念佛\n\n經典：\n- 道教：《道德經》、《南華經》、《太平經》\n- 佛教：《心經》、《金剛經》、《法華經》\n\n宗教場所：\n- 道教：道觀\n- 佛教：寺廟\n\n兩者在我國歷史上有融合趨勢，稱為「道佛合一」。', 'culture', '["道教", "佛教", "區別"]', 1, NOW()),

('什麼是道觀？', '道觀是道教供奉神靈和進行宗教活動的場所。\n\n道觀特點：\n- 通常依山而建\n- 環境清幽\n- 供奉道教神靈\n- 有道士修行\n\n著名道觀：\n- 龍虎山：正一道祖庭\n- 武當山：全真道聖地\n- 蓬萊閣：神仙傳說之地\n- 白雲觀：北京最大道觀\n\n道觀功能：\n- 供奉神靈\n- 舉行法事\n- 刻印符籙\n- 道士修行\n- 遊客參觀\n\n遊覽道觀時應保持安靜尊重。', 'culture', '["道觀", "寺廟", "宗教"]', 1, NOW()),

-- 使用类
('符可以放在枕頭下嗎？', '符籙是否可以放在枕頭下，需要根據符的種類和個人情況判斷。\n\n可以放在枕頭下的符：\n1. 安眠符：幫助睡眠\n2. 鎮驚符：安撫心神\n3. 辟邪符：驅趕邪祟\n\n不宜放在枕頭下的符：\n1. 招財符：應放在財位\n2. 事業符：應放在辦公室\n3. 姻緣符：應放在桃花位\n\n注意事項：\n- 保持符的清潔\n- 避免符接觸皮膚時間過長\n- 孕婦使用前應諮詢\n- 兒童使用需謹慎\n\n如有疑問，請諮詢專業人士。', 'usage', '["符", "枕頭", "睡眠"]', 1, NOW()),

('符水可以給小孩喝嗎？', '符水是否可以給小孩飲用，需要謹慎考慮：\n\n一般建議：\n1. 3歲以下幼兒：不建議飲用\n2. 3-6歲兒童：少量稀釋後飲用\n3. 6歲以上兒童：可適量飲用\n\n安全注意事項：\n1. 符水必須是正規道觀製作\n2. 確認符的來源和開光師傅\n3. 符水應新鮮配置\n4. 避免過量飲用\n\n替代方案：\n- 兒童可佩戴小型平安符\n- 可用符水擦拭身體\n- 可將符放在兒童房間\n\n重要提醒：\n符水不能替代醫療，有病應及時就醫。', 'usage', '["符水", "小孩", "兒童"]', 1, NOW()),

('哪些日子不適合使用符？', '傳統上有些日子不太適合使用符籙：\n\n不宜使用符的日子：\n1. 三元節（農曆正月十五、七月十五、十月十五）\n2. 清明節、端午節：祭祀日\n3. 師傅忌日\n4. 沖師傅生肖之日\n\n說明：\n- 以上只是傳統說法\n- 緊急情況仍可使用\n- 誠心最重要\n\n推薦使用符的日子：\n1. 農曆初一、十五\n2. 天赦日\n3. 納財日\n4. 個人吉日\n\n如有疑問，可諮詢專業道士。', 'usage', '["符", "日子", "禁忌"]', 1, NOW()),

-- 产品类
('符寶網的商品是正品嗎？', '符寶網對商品品質有嚴格把控：\n\n正品保障：\n1. 商家入駐需提交資質證明\n2. 所有商品經過專業審核\n3. 實行「一物一證」制度\n4. 可掃描二維碼驗證真偽\n\n品質控制：\n- 材料檢測\n- 工藝評估\n- 功效驗證\n- 價格審核\n\n消費者保障：\n- 7天無理由退換\n- 正品假一賠十\n- 專業客服諮詢\n- 售後服務保障\n\n驗證方式：\n1. 掃描商品二維碼\n2. 輸入認證編號查詢\n3. 查看商品證書', 'product', '["正品", "保障", "驗證"]', 1, NOW()),

('如何聯繫符寶網客服？', '符寶網提供多種客服聯繫方式：\n\n聯繫方式：\n1. 在線客服：網站右下角Chat圖標\n2. 電話客服：400-XXX-XXXX（工作日9:00-18:00）\n3. 郵箱：service@fubao.com\n4. 微信公眾號：符寶網\n\n服務項目：\n- 商品諮詢\n- 訂單問題\n- 售後服務\n- 退款申請\n- 使用指導\n\n響應時間：\n- 在線客服：即時響應\n- 電話客服：等待不超過1分鐘\n- 郵件回覆：24小時內\n\n我們的客服團隊隨時為您服務！', 'product', '["客服", "聯繫", "服務"]', 1, NOW()),

-- 命理类
('八字軟弱應該怎麼辦？', '八字軟弱是指日主元氣不足，需要通過後天努力來彌補：\n\n五行補救：\n1. 根據喜用神選擇行業\n2. 穿戴補五行顏色的衣物\n3. 選擇有利方位的住所\n4. 佩戴相應五行飾品\n\n生活建議：\n1. 加強身體鍛煉\n2. 保持充足睡眠\n3. 注意營養均衡\n4. 避免過度勞累\n5. 多接觸正能量的人和事\n\n風水調整：\n- 選擇有利風水環境\n- 調整家居布局\n- 擺放風水飾品\n\n心態調整：\n- 積極樂觀\n- 不斷學習提升\n- 建立自信心\n- 勇於面對挑戰', 'fortune', '["八字", "軟弱", "補救"]', 1, NOW()),

('什麼是喜用神？', '喜用神是八字命理中的重要概念：\n\n定義：\n- 喜神：對命局有利的五行\n- 用神：對命局最有幫助的五行\n\n作用：\n1. 指導選擇行業\n2. 指導選擇方位\n3. 指導選擇顏色\n4. 指導選擇飾品\n5. 指導選擇伴侶\n\n如何判斷：\n1. 分析日主旺衰\n2. 找出所需五行\n3. 配合大運流年\n4. 綜合判斷\n\n注意事項：\n- 最好請專業命理師分析\n- 不要過度依賴命理\n- 後天努力同樣重要\n- 命運是可以改變的', 'fortune', '["喜用神", "八字", "命理"]', 1, NOW()),

-- =====================================================
-- 6. 优惠券测试数据
-- =====================================================

INSERT INTO `coupons` (`name`, `type`, `discount_type`, `discount_value`, `min_amount`, `max_discount`, `total_count`, `remain_count`, `valid_from`, `valid_until`, `status`, `created_at`) VALUES
('新用戶專屬', 'new_user', 'fixed', 50, 200, 50, 1000, 850, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 1, NOW()),
('滿100減20', 'general', 'fixed', 20, 100, 20, 5000, 4200, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 1, NOW()),
('滿300減50', 'general', 'fixed', 50, 300, 50, 3000, 2800, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, NOW()),
('9折優惠券', 'general', 'percent', 10, 500, 200, 2000, 1500, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 23 DAY), 1, NOW()),
('VIP專屬85折', 'vip', 'percent', 15, 1000, 500, 500, 300, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 55 DAY), 1, NOW()),
('節日特惠滿500減100', 'general', 'fixed', 100, 500, 100, 2000, 1800, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, NOW());

-- =====================================================
-- 7. 收藏测试数据
-- =====================================================

INSERT INTO `favorites` (`user_id`, `goods_id`, `created_at`) VALUES
(1, 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 3, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1, 5, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 4, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 1, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(3, 6, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(4, 2, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(4, 5, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 3, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 4, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(7, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 6, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =====================================================
-- 8. 用户优惠券数据
-- =====================================================

INSERT INTO `user_coupons` (`user_id`, `coupon_id`, `status`, `used_at`, `order_id`, `created_at`) VALUES
(1, 1, 'used', DATE_SUB(NOW(), INTERVAL 5 DAY), 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 2, 'unused', NULL, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 3, 'used', DATE_SUB(NOW(), INTERVAL 2 DAY), 3, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(4, 1, 'unused', NULL, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 4, 'expired', NULL, NULL, DATE_SUB(NOW(), INTERVAL 25 DAY));

-- =====================================================
-- 9. 购物车测试数据
-- =====================================================

INSERT INTO `cart` (`user_id`, `goods_id`, `quantity`, `specs`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '{}', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(1, 3, 2, '{}', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(2, 2, 1, '{}', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(3, 4, 1, '{}', DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(3, 5, 3, '{}', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(4, 1, 1, '{}', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(5, 6, 2, '{}', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(6, 2, 1, '{}', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- =====================================================
-- 10. 订单测试数据
-- =====================================================

INSERT INTO `orders` (`user_id`, `order_no`, `total_amount`, `status`, `payment_method`, `payment_status`, `shipping_status`, `address_id`, `coupon_id`, `remark`, `created_at`, `updated_at`) VALUES
(1, 'FB202401150001', 598.00, 'completed', 'credit_card', 'paid', 'delivered', 1, 1, '盡快發貨', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 'FB202401160002', 1280.00, 'completed', 'line_pay', 'paid', 'delivered', 2, NULL, NULL, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
(3, 'FB202401180003', 399.00, 'completed', 'credit_card', 'paid', 'delivered', 3, 3, '送禮用，包裝精美點', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 'FB202401200004', 899.00, 'shipped', 'atm', 'paid', 'shipped', 4, NULL, NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 'FB202401220005', 1580.00, 'paid', 'credit_card', 'paid', 'pending', 5, 4, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 'FB202401250006', 668.00, 'pending', 'credit_card', 'pending', 'pending', 6, NULL, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(7, 'FB202401150007', 450.00, 'cancelled', 'credit_card', 'refunded', 'cancelled', 7, NULL, '取消了', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
(8, 'FB202401160008', 1200.00, 'completed', 'line_pay', 'paid', 'delivered', 8, NULL, NULL, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- 订单项测试数据
INSERT INTO `order_items` (`order_id`, `goods_id`, `goods_name`, `cover_image`, `price`, `quantity`, `specs`, `subtotal`) VALUES
(1, 1, '太上老君護身符', '/images/goods/fu-001.jpg', 299.00, 1, '{}', 299.00),
(1, 3, '五路財神符', '/images/goods/fu-003.jpg', 299.00, 1, '{}', 299.00),
(2, 2, '鎮宅平安符', '/images/goods/fu-002.jpg', 399.00, 1, '{}', 399.00),
(2, 5, '文昌進寶符套裝', '/images/goods/fu-005.jpg', 881.00, 1, '{}', 881.00),
(3, 4, '太歲平安符', '/images/goods/fu-004.jpg', 399.00, 1, '{}', 399.00),
(4, 1, '太上老君護身符', '/images/goods/fu-001.jpg', 299.00, 2, '{}', 598.00),
(4, 6, '金玉滿堂招財符', '/images/goods/fu-006.jpg', 301.00, 1, '{}', 301.00),
(5, 5, '文昌進寶符套裝', '/images/goods/fu-005.jpg', 881.00, 1, '{}', 881.00),
(5, 2, '鎮宅平安符', '/images/goods/fu-002.jpg', 399.00, 1, '{}', 399.00),
(5, 3, '五路財神符', '/images/goods/fu-003.jpg', 299.00, 1, '{}', 299.00),
(6, 1, '太上老君護身符', '/images/goods/fu-001.jpg', 299.00, 2, '{}', 598.00),
(6, 4, '太歲平安符', '/images/goods/fu-004.jpg', 70.00, 1, '{}', 70.00),
(7, 2, '鎮宅平安符', '/images/goods/fu-002.jpg', 450.00, 1, '{}', 450.00),
(8, 5, '文昌進寶符套裝', '/images/goods/fu-005.jpg', 881.00, 1, '{}', 881.00),
(8, 6, '金玉滿堂招財符', '/images/goods/fu-006.jpg', 319.00, 1, '{}', 319.00);

-- =====================================================
-- 11. 通知测试数据
-- =====================================================

INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `is_read`, `created_at`) VALUES
(1, 'order', '訂單已發貨', '您的訂單 FB202401150001 已發貨，快遞單號：SF1234567890', 1, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(1, 'system', '優惠券即將過期', '您有一張滿100減20優惠券即將在3天後過期，請儘快使用', 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'order', '訂單已簽收', '您的訂單 FB202401160002 已簽收，感謝購買！', 1, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(2, 'promotion', '新品上架', '【新品上架】太上三元賜福符系列新品上市，限時8折優惠', 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'order', '訂單已發貨', '您的訂單 FB202401180003 已發貨', 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 'system', '優惠券到賬', '恭喜獲得新用戶專屬50元優惠券，限時30天使用', 0, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 'order', '支付成功', '您的訂單 FB202401220005 已支付成功', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 'order', '待支付提醒', '您的訂單 FB202401250006 尚未支付，請在24小時內完成支付', 0, NOW()),
(7, 'order', '退款已完成', '您的訂單 FB202401150007 退款已原路返回，預計1-3個工作日到賬', 1, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(8, 'order', '訂單已簽收', '您的訂單 FB202401160008 已簽收，感謝購買！記得去評價喔~', 1, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- =====================================================
-- 12. 用户反馈测试数据
-- =====================================================

INSERT INTO `feedback` (`user_id`, `type`, `content`, `contact`, `status`, `reply`, `created_at`, `replied_at`) VALUES
(1, 'product', '購買的護身符質量很好，包裝精美，物流很快！希望能多一些招財類的符', 'line:john888', 'replied', '感謝您的支持和建議，我們會陸續上架更多招財類符籙', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY)),
(2, 'order', '訂單還沒發貨，已經3天了', 'phone:0923456789', 'replied', '抱歉延誤，我們已催促倉庫盡快發貨，預計明天發出', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 'other', '請問符籙可以快遞到香港嗎？', 'email:mary@example.com', 'replied', '可以的，我們支持國際快遞，運費到付，具體請聯繫客服', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
(4, 'product', '收到的符和圖片有點色差', 'line:lisa_wang', 'pending', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NULL),
(5, 'order', '包裝太簡單了，希望能精美一些，買來送人的', 'wechat:alex_wu', 'replied', '感謝您的建議，我們將在禮品包裝上做改進，送貨時選擇禮品盒包裝', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- =====================================================
-- 13. Banner测试数据
-- =====================================================

INSERT INTO `banners` (`title`, `image`, `link_type`, `link_value`, `sort`, `status`, `start_time`, `end_time`, `created_at`) VALUES
('新春祈福', '/images/banners/spring.jpg', 'category', '1', 1, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 60 DAY)),
('開運符8折', '/images/banners/lucky.jpg', 'goods', '5', 2, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
('AI助手上線', '/images/banners/ai.jpg', 'page', '/ai-assistant', 3, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 27 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('知識庫上線', '/images/banners/knowledge.jpg', 'page', '/knowledge', 4, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
('會員專區', '/images/banners/vip.jpg', 'page', '/user/vip', 5, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY));

-- =====================================================
-- 14. 公告测试数据
-- =====================================================

INSERT INTO `announcements` (`title`, `content`, `type`, `is_top`, `status`, `published_at`, `created_at`) VALUES
('【系統公告】春節期間物流通知', '親愛的用户，春節期間（2/1-2/15）訂單將延遲發貨，感謝理解！', 'system', 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('【促銷活動】情人節特別優惠', '情人節期間（2/10-2/14）全場單筆滿500減100，趕快選購送給心愛的人吧！', 'promotion', 0, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('【新品上架】太上三元賜福符系列', '全新上架的太上三元賜福符系列，包含天官賜福、地官赦罪、水官解厄三種符籙', 'product', 0, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('【功能更新】AI助手功能升級', '我們的AI助手已升級，可以更準確地回答關於符籙使用和道教文化的問題', 'system', 0, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- =====================================================
-- 15. AI训练任务测试数据
-- =====================================================

INSERT INTO `ai_training_tasks` (`name`, `description`, `type`, `status`, `progress`, `model_version`, `knowledge_ids`, `result`, `created_at`, `started_at`, `completed_at`) VALUES
('初始訓練', '首次完整訓練，包含所有知識庫', 'full', 'completed', 100, 'v1.0.0', '[1,2,3,4,5,6,7,8]', '{"accuracy": 0.92, "samples": 500}', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
('內容擴展訓練', '新增文化科普類內容', 'incremental', 'completed', 100, 'v1.1.0', '[9,10]', '{"accuracy": 0.94, "samples": 120}', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY)),
('FAQ補充訓練', '補充常見問題問答', 'incremental', 'completed', 100, 'v1.2.0', '[11,12,13]', '{"accuracy": 0.96, "samples": 80}', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('緊急更新訓練', '修復假符識別相關問題', 'incremental', 'running', 65, 'v1.3.0', '[14]', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NULL);

-- =====================================================
-- 16. 文章/百科测试数据
-- =====================================================

INSERT INTO `articles` (`title`, `category`, `content`, `cover_image`, `author`, `views`, `is_published`, `published_at`, `created_at`) VALUES
('道教符籙的由來與發展', 'culture', '道教符籙是我國傳統文化的重要組成部分...', '/images/articles/fu-history.jpg', '符寶小編', 1250, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
('如何正確使用護身符', 'usage', '護身符是道教法器中最常見的一種...', '/images/articles/protection.jpg', '符寶小編', 980, 1, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
('風水基礎：五行與八卦', 'fortune', '風水是我國傳統文化的重要組成部分...', '/images/articles/fengshui.jpg', '符寶小編', 1560, 1, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
('太歲年如何化解', 'fortune', '犯太歲是傳統民俗中的重要概念...', '/images/articles/taisui.jpg', '符寶小編', 2100, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
('道教法器的種類與用途', 'culture', '道教法器是道士進行宗教活動的重要工具...', '/images/articles/faqi.jpg', '符寶小編', 890, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));

-- =====================================================
-- 17. 新闻测试数据
-- =====================================================

INSERT INTO `news` (`title`, `summary`, `content`, `cover_image`, `source`, `views`, `is_published`, `published_at`, `created_at`) VALUES
('龍虎山天師府發布年度符籙展覽公告', '備受矚目的年度符籙展覽即將舉行...', '龍虎山天師府近日宣布...', '/images/news/exhibition.jpg', '道教協會', 4500, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('道教文化遺產保護研討會在京舉行', '來自全國各地的專家學者齊聚一堂...', '為期三天的道教文化遺產保護研討會...', '/images/news/conference.jpg', '文化部', 3200, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
('AI技術助力傳統符籙文化傳承', '人工智能技術正被應用於傳統文化的保護...', '利用AI技術對古老年鑑進行數字化...', '/images/news/ai-culture.jpg', '科技部', 2800, 1, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
('春節期間道教宮觀開放時間公告', '各大道教宮觀公佈春節期間的開放時間...', '為方便信眾春節期間祈福...', '/images/news/temple.jpg', '道教協會', 5600, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- =====================================================
-- 執行完成
-- =====================================================
