-- =====================================================
-- 符寶網 - 商品、新闻、百科详细数据（匹配实际表结构）
-- =====================================================

SET NAMES utf8mb4;

-- =====================================================
-- 1. 商品详细数据 (30+ 商品)
-- 注意：goods表字段为 cover, views, specs, tags 等
-- =====================================================

INSERT INTO `goods` (`merchant_id`, `category_id`, `name`, `main_image`, `images`, `description`, `price`, `original_price`, `stock`, `sales`, `views`, `specs`, `tags`, `is_featured`, `is_recommended`, `rating`, `sort`, `status`, `created_at`) VALUES

-- 護身符系列 (category_id: 8)
(1, 8, '太上老君護身符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842', '["/images/goods/fu-001-1.jpg", "/images/goods/fu-001-2.jpg"]', 
'【商品詳情】\n\n太上老君護身符，源自道教正統傳承，由資深道士手工繪製。\n\n符籙特點：\n- 採用上等朱砂書寫\n- 配合道教秘法開光\n- 配有精美錦盒包裝\n- 可懸掛或隨身佩戴\n\n使用說明：\n1. 請選擇吉日開光\n2. 誠心供奉後使用\n3. 避免沾染污穢\n4. 定期更換以保持靈力', 
299.00, 399.00, 100, 45, 1230, '{}', '["護身符", "開光", "道教"]', 1, 1, 5.0, 1, 1, NOW()),

(1, 8, '鎮宅平安符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842', '["/images/goods/fu-002-1.jpg"]', 
'【商品詳情】\n\n鎮宅平安符，道教法師開光加持，有效驅除邪祟，保護家宅平安。\n\n適用範圍：\n- 新居入伙\n- 房屋動土\n- 運勢不穩\n- 小人是非\n\n使用方法：\n1. 貼於大門背面或客廳\n2. 保持符面清潔\n3. 避免正對廁所或廚房\n4. 每年更換一次', 
399.00, 499.00, 80, 32, 890, '{}', '["鎮宅符", "平安", "驅邪"]', 1, 1, 5.0, 2, 1, NOW()),

(1, 8, '五路財神符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842', '["/images/goods/fu-003-1.jpg"]', 
'【商品詳情】\n\n五路財神符，奉請五路財神庇佑，助您財源廣進。\n\n功效說明：\n- 招攬正財\n- 偏財運勢\n- 守財護財\n- 事業順遂\n\n適用人群：\n- 經商人士\n- 投資理財者\n- 職場工作者\n- 自由職業者', 
399.00, 520.00, 95, 58, 1560, '{}', '["招財符", "財神", "五路財神"]', 1, 1, 4.9, 3, 1, NOW()),

(1, 8, '太歲平安符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842', '["/images/goods/fu-004-1.jpg"]', 
'【商品詳情】\n\n太歲平安符，專為犯太歲人士設計，有效化解太歲沖煞。\n\n犯太歲症狀：\n- 運勢低迷\n- 事業不順\n- 感情糾紛\n- 健康不佳', 
199.00, 280.00, 150, 89, 2100, '{}', '["太歲符", "化解太歲", "犯太歲"]', 1, 1, 5.0, 4, 1, NOW()),

(1, 8, '文昌進寶符套裝', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842', '["/images/goods/fu-005-1.jpg", "/images/goods/fu-005-2.jpg"]', 
'【商品詳情】\n\n文昌進寶符套裝，包含文昌符和進寶符各一，組合使用效果加倍。\n\n套裝內容：\n- 文昌符 x1\n- 進寶符 x1\n- 精美錦盒 x1\n- 使用說明書 x1\n- 開光證書 x1', 
881.00, 1200.00, 50, 23, 560, '{}', '["文昌符", "招財符", "套裝"]', 1, 1, 5.0, 5, 1, NOW()),

(1, 8, '金玉滿堂招財符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_6870e99e-5a28-4f3f-a3a2-e505f3a80143.jpeg?sign=1807974176-2f0f09eed5-0-e8f14e57ddc7372febeb59f199eefb969ba1fc83f4c1f4d0c3204e91469d9cf3', '["/images/goods/fu-006-1.jpg"]', 
'【商品詳情】\n\n金玉滿堂招財符，道教秘法開光，招財效果顯著。\n\n功效特點：\n- 招攬八方財運\n- 守護錢財不外流\n- 增強財帛宮運勢\n- 帶來富貴吉祥', 
301.00, 380.00, 120, 67, 980, '{}', '["招財符", "金玉滿堂", "旺財"]', 1, 1, 4.8, 6, 1, NOW()),

(1, 8, '姻緣和合符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_564ab3b4-7911-465e-a8e5-a2f01a0ff4de.jpeg?sign=1807974176-3cf7b22d99-0-05324e54ab45567628e5a0229d26adb20b98be6321047b2c6714b97c0979feae', '["/images/goods/fu-007-1.jpg"]', 
'【商品詳情】\n\n姻緣和合符，道教法師為單身或感情不順人士特別加持。\n\n功效說明：\n- 招攬正緣桃花\n- 增進感情和睦\n- 化解第三者危機\n- 挽回逝去感情', 
399.00, 520.00, 60, 34, 780, '{}', '["姻緣符", "和合符", "感情"]', 1, 1, 4.9, 7, 1, NOW()),

(1, 8, '太上三元賜福符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_696e37e2-beec-48f0-ab7d-1bd2ebc04457.jpeg?sign=1807974175-f8dd5a4abe-0-c1f961258e2cc8a6cdc1016a9ccd5c35fa05efc4a7d2c8fa01e447f617cbfc63', '["/images/goods/fu-008-1.jpg"]', 
'【商品詳情】\n\n太上三元賜福符，奉請三元三官大帝庇佑，消災解難。\n\n三元大帝：\n- 天官堯：賜福\n- 地官舜：赦罪\n- 水官禹：解厄', 
699.00, 899.00, 40, 18, 340, '{}', '["三元符", "賜福", "三官大帝"]', 1, 1, 5.0, 8, 1, NOW()),

(1, 8, '北斗七星符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_421130d1-6ea0-4974-ba41-346895f02c3b.jpeg?sign=1807974177-3deab25d8c-0-0ce54071a473a53d99680c005467fe1759bfe332baf196c26fe4836da6a95513', '["/images/goods/fu-009-1.jpg"]', 
'【商品詳情】\n\n北斗七星符，奉請北斗七星君庇佑。\n\n功效說明：\n- 延年益壽\n- 消災解難\n- 增福增壽\n- 化解災厄', 
299.00, 380.00, 70, 32, 650, '{}', '["北斗符", "延壽", "消災"]', 1, 1, 5.0, 9, 1, NOW()),

(1, 8, '麒麟送子符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_f0864022-f388-4656-ab8b-a6f96b66575b.jpeg?sign=1807974181-a30711ccf7-0-0abca4630cdc1a2991c6074a587a917b23ac692636e022b4f4a2fdf567a7be29', '["/images/goods/fu-010-1.jpg"]', 
'【商品詳情】\n\n麒麟送子符，道教法師為求子夫婦特別加持。\n\n功效說明：\n- 助孕求子\n- 保胎安胎\n- 母子平安\n- 子女聰明', 
399.00, 520.00, 50, 22, 480, '{}', '["麒麟符", "送子", "求子"]', 1, 1, 4.9, 10, 1, NOW()),

(1, 8, '文昌符（學業專用）', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_89c3ad4b-2543-49ff-9dc3-02a145d812db.jpeg?sign=1807974177-a01f123801-0-8fce8c16bfc569a02cae0ffbed2e11591a660d638a049d889c1d9639966de91f', '["/images/goods/fu-011-1.jpg"]', 
'【商品詳情】\n\n文昌符，專為學生和考生設計。\n\n功效說明：\n- 學業進步\n- 考試順利\n- 記憶力提升\n- 思維清晰', 
199.00, 280.00, 120, 65, 1890, '{}', '["文昌符", "學業", "考試"]', 1, 1, 5.0, 11, 1, NOW()),

(1, 8, '辟邪驅鬼符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_a281fb2a-55ff-4120-96c2-5e28157dc1c4.jpeg?sign=1807974177-d3fc760121-0-1d98464efa79d71e72535ebedebcdd9709e2b75ee92e7fbb36d95b42a6649f56', '["/images/goods/fu-012-1.jpg"]', 
'【商品詳情】\n\n辟邪驅鬼符，有效驅趕邪祟。\n\n功效說明：\n- 辟邪驅鬼\n- 鎮壓不良氣場\n- 化解各種煞氣\n- 保護人身安全', 
299.00, 399.00, 80, 35, 720, '{}', '["辟邪符", "驅鬼", "鎮邪"]', 1, 1, 4.8, 12, 1, NOW()),

-- 風水擺件系列 (category_id: 17)
(2, 17, '純銅金蟾招財擺件', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_6870e99e-5a28-4f3f-a3a2-e505f3a80143.jpeg?sign=1807974176-2f0f09eed5-0-e8f14e57ddc7372febeb59f199eefb969ba1fc83f4c1f4d0c3204e91469d9cf3', '["/images/goods/fengshui-001-1.jpg"]', 
'【商品詳情】\n\n純銅金蟾招財擺件，精選優質純銅，純手工打造。\n\n金蟾特點：\n- 三足金蟾，神話傳說\n- 口含銅錢，吸財入庫\n- 純銅打造，質感厚重\n- 表面拋光，光澤亮麗\n\n風水功效：\n- 招財進寶\n- 吸納財氣\n- 化解五黃煞\n- 守護財庫', 
680.00, 880.00, 45, 28, 890, '{}', '["金蟾", "招財", "風水擺件"]', 1, 1, 5.0, 13, 1, NOW()),

(2, 17, '翡翠貔貅吊墜', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_564ab3b4-7911-465e-a8e5-a2f01a0ff4de.jpeg?sign=1807974176-3cf7b22d99-0-05324e54ab45567628e5a0229d26adb20b98be6321047b2c6714b97c0979feae', '["/images/goods/fengshui-002-1.jpg"]', 
'【商品詳情】\n\n天然翡翠貔貅吊墜，精選A貨翡翠，質地溫潤。\n\n貔貅特點：\n- 龍頭、馬身、麟腳\n- 唯一以財寶為食的神獸\n- 辟邪轉運功效強大\n- 可招財也可守財', 
1680.00, 2200.00, 30, 15, 450, '{}', '["貔貅", "翡翠", "吊墜"]', 1, 1, 4.9, 14, 1, NOW()),

(2, 17, '紫水晶洞風水擺件', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_696e37e2-beec-48f0-ab7d-1bd2ebc04457.jpeg?sign=1807974175-f8dd5a4abe-0-c1f961258e2cc8a6cdc1016a9ccd5c35fa05efc4a7d2c8fa01e447f617cbfc63', '["/images/goods/fengshui-003-1.jpg"]', 
'【商品詳情】\n\n天然紫水晶洞風水擺件，巴西進口原礦，晶體完整。\n\n紫水晶特點：\n- 天然紫水晶晶洞\n- 巴西進口原礦\n- 晶體完整透亮\n- 能量強大持久\n\n風水功效：\n- 聚氣納財\n- 化解橫樑煞\n- 提升家居靈氣', 
980.00, 1280.00, 25, 12, 320, '{}', '["紫水晶", "風水擺件", "招財"]', 1, 1, 5.0, 15, 1, NOW()),

(2, 17, '青銅龍龜風水擺件', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_abd806fe-4ea0-4b32-9c6c-6709f1653e58.jpeg?sign=1807974282-c3d654ece1-0-e202fb281e930cecf954a009a79ecef1d0b206feb55758ee65e44253aa39473f', '["/images/goods/fengshui-004-1.jpg"]', 
'【商品詳情】\n\n青銅龍龜風水擺件，古法铸造，造型威嚴。\n\n龍龜特點：\n- 龍頭、龜身，結合吉祥\n- 青銅材質，厚重穩重\n- 古法铸造，工藝精湛\n\n風水功效：\n- 化解一切太歲相沖\n- 化煞招福\n- 催官利貴', 
1280.00, 1680.00, 20, 8, 210, '{}', '["龍龜", "青銅", "化煞"]', 1, 1, 4.8, 16, 1, NOW()),

(2, 17, '羅盤（銅質標準版）', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_ec924d7c-1d80-4ce3-ac5c-33aa3c1f178d.jpeg?sign=1807974254-6f9abba6fe-0-26a505b047a82930111270e7d57b4c52a5f5375ceb4ab573969b45372409d2f2', '["/images/goods/fengshui-005-1.jpg"]', 
'【商品詳情】\n\n優質銅質羅盤，風水師專業工具。\n\n產品特點：\n- 優質銅材製作\n- 刻度清晰精準\n- 磁針靈敏穩定\n- 做工精細美觀', 
680.00, 880.00, 40, 18, 560, '{}', '["羅盤", "風水工具", "銅質"]', 1, 1, 5.0, 17, 1, NOW()),

(2, 17, '文昌塔風水擺件', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_81efd059-04f4-4785-86c1-db25b00939c7.jpeg?sign=1807974288-080cf2e13c-0-d5bb6bdbb1c7f8164fbffd338706dcd27ddca9fb463c8954c3dd23fe0883b139', '["/images/goods/fengshui-006-1.jpg"]', 
'【商品詳情】\n\n文昌塔風水擺件，提升學業運勢。\n\n功效說明：\n- 提升學業運\n- 考試順利\n- 增加記憶力\n- 利於考試升學', 
398.00, 520.00, 60, 32, 780, '{}', '["文昌塔", "學業", "風水擺件"]', 1, 1, 4.9, 18, 1, NOW()),

(2, 17, '山水畫風水掛屏', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_609d1bc4-6066-49d9-82a4-c22620bcc9ef.jpeg?sign=1807974284-8c81f9a337-0-5237a041b85eee5741894e3674ccf9aa06e3f9447d1dbeb30d0f8c18cddb6968', '["/images/goods/fengshui-007-1.jpg"]', 
'【商品詳情】\n\n精選山水畫風水掛屏，精美工藝。\n\n風水寓意：\n- 山代表人脈\n- 水代表財運\n- 靠山面水\n- 財丁兩旺', 
1280.00, 1680.00, 25, 10, 180, '{}', '["山水畫", "掛屏", "招財"]', 1, 1, 4.7, 19, 1, NOW()),

-- 法器系列 (category_id: 9)
(1, 9, '桃木令牌', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_0b6b3be5-05f5-4aa3-ada1-b610a8dfc35a.jpeg?sign=1807974319-3680d2b4c6-0-b25e7ac4cecb22cddaddf76a1235380b90f20fbe74f1dc30767a07c39df94fec', '["/images/goods/faqi-001-1.jpg"]', 
'【商品詳情】\n\n桃木令牌，精選百年桃木，道法師傅開光加持。\n\n令牌特點：\n- 百年桃木，辟邪聖物\n- 手工雕刻，圖案精美\n- 道士開光，法力加持\n- 配有精美錦盒', 
580.00, 780.00, 35, 16, 420, '{}', '["桃木", "令牌", "法器"]', 1, 1, 5.0, 20, 1, NOW()),

(1, 9, '紫檀木印章', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_d38205c5-c123-46e9-9eb4-f889c05f696c.jpeg?sign=1807974319-027efcd3da-0-f889c4a3e3a32e53222c6caf59fcfa73d7d3d582bac35649ce67a47077f064d4', '["/images/goods/faqi-002-1.jpg"]', 
'【商品詳情】\n\n紫檀木法師印章，名貴木材，精工雕刻。\n\n印章特點：\n- 印度小葉紫檀\n- 名貴木材，質地細膩\n- 手工雕刻，字跡清晰\n- 配有印章盒', 
880.00, 1180.00, 25, 10, 280, '{}', '["紫檀", "印章", "法器"]', 1, 1, 4.9, 21, 1, NOW()),

(1, 10, '純銅風鈴', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_2108d751-e352-48df-8aff-fbdd237ee014.jpeg?sign=1807974316-3a157c831f-0-10b1297adca9c0b879d68e1eec5882d9f11b02914e740eb36f8d0b8995465cdc', '["/images/goods/faqi-003-1.jpg"]', 
'【商品詳情】\n\n純銅風鈴，精美工藝，聲音清脆。\n\n風鈴特點：\n- 純銅打造\n- 手工製作\n- 聲音清脆悅耳\n- 造型美觀大方\n\n風水作用：\n- 化解聲煞\n- 招來祥瑞', 
380.00, 480.00, 60, 35, 650, '{}', '["風鈴", "純銅", "化解煞氣"]', 1, 1, 5.0, 22, 1, NOW()),

-- 香燭供品系列 (category_id: 20)
(3, 20, '檀香線香套裝', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_de9748d4-0f86-47a5-a356-151ef91fb860.jpeg?sign=1807974320-7c215d7c02-0-a6771d65777d2e499e7c78f1c5c3b16ad38dd64d101aa810e503227e943c9834', '["/images/goods/incense-001-1.jpg"]', 
'【商品詳情】\n\n天然檀香線香套裝，精選天然原料，古法製作。\n\n線香特點：\n- 天然檀香原料\n- 無化學添加\n- 燃燒時間持久\n- 香氣清幽怡人\n\n套裝內容：\n- 線香 x30支\n- 精美香座 x1\n- 香盒 x1', 
128.00, 168.00, 200, 89, 2340, '{}', '["檀香", "線香", "供香"]', 1, 1, 4.8, 23, 1, NOW()),

(3, 20, '蓮花燭台套裝', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_6768c358-9d71-4d9b-a6c1-3fe6a2b077a5.jpeg?sign=1807974346-a09356f1f1-0-840e382d9e449c54ef1f06bb86ea5b4c171e835088acae612bee661e6985d2f2', '["/images/goods/incense-002-1.jpg"]', 
'【商品詳情】\n\n蓮花燭台套裝，精美蓮花造型，適合同時供奉多尊神明。\n\n產品特點：\n- 優質陶瓷材質\n- 蓮花造型，美觀大方\n- 適用蠟燭：细蜡或粗蜡', 
258.00, 320.00, 80, 42, 890, '{}', '["燭台", "蓮花", "供奉"]', 1, 1, 4.9, 24, 1, NOW()),

(3, 21, '金紙套裝組合', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_6ab6f7dc-2908-43b9-89c4-8ac25f80f208.jpeg?sign=1807974348-03154670ba-0-4730f5ca3b11cc8916dc14255194593074cc08b691cf55db8d98c17aea58e716', '["/images/goods/incense-003-1.jpg"]', 
'【商品詳情】\n\n傳統金紙套裝組合，包含多種祭祀用金紙。\n\n套裝內容：\n- 大箔銀紙 x100張\n- 小箔金紙 x50張\n- 經衣 x20張\n- 土地公金 x30張', 
168.00, 220.00, 150, 76, 1560, '{}', '["金紙", "祭祀", "供品"]', 1, 1, 5.0, 25, 1, NOW()),

(3, 21, '供奉套裝（基礎版）', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_872d85f4-ff8b-4a4b-ae62-cfbcdb819ce4.jpeg?sign=1807974752-f363d47592-0-d08b20c7e4420f12b26da8219dcf46f24b60ea573d39fd913723ad4c4764e88e', '["/images/goods/incense-004-1.jpg"]', 
'【商品詳情】\n\n供奉套裝基礎版，滿足日常供奉需求。\n\n套裝內容：\n- 蓮花燭台 x1對\n- 檀香線香 x1盒\n- 小箔金紙 x1疊', 
368.00, 480.00, 100, 52, 980, '{}', '["供奉套裝", "基礎版", "祭祀"]', 1, 1, 4.8, 26, 1, NOW()),

-- 道教典籍系列 (category_id: 19)
(4, 19, '道德經全文詳解', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_379aacde-5169-4c92-9cf2-ec3c0e0cd8e4.jpeg?sign=1807974349-872184edc3-0-1e1bd005a45c4d34f565f9a21a17d13603136350022512003aa6d492722717dc', '["/images/goods/book-001-1.jpg"]', 
'【商品詳情】\n\n《道德經》全文詳解本，道教必讀經典。\n\n內容特點：\n- 原文全文收錄\n- 逐句註釋詳解\n- 白話譯文對照\n- 精美線裝版本', 
128.00, 168.00, 100, 45, 890, '{}', '["道德經", "道教典籍", "經書"]', 1, 1, 5.0, 27, 1, NOW()),

(4, 19, '易經基礎讀本', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_0da9b1e1-1901-4181-9482-70ee31e10646.jpeg?sign=1807974358-7013cec5c4-0-f88039fc9caa820796fada350b08fde9296c7b24f39f02a8fc7a14df2357948d', '["/images/goods/book-002-1.jpg"]', 
'【商品詳情】\n\n《易經》基礎讀本，含六十四卦詳解。\n\n內容包括：\n- 六十四卦全圖\n- 卦辭詳解\n- 爻辭分析\n- 實用占卜方法', 
158.00, 198.00, 80, 38, 780, '{}', '["易經", "占卜", "命理"]', 1, 1, 4.9, 28, 1, NOW()),

-- 命理服務 (category_id: 18)
(5, 18, '八字命盤分析服務', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_efbc12e3-d27d-49bc-8f4e-575c5acf82e3.jpeg?sign=1807974393-5d8ed527ca-0-abf8ff34144f508791ab57bdf1ac7bb659ec8647b617597efcac4169c15adb79', '["/images/goods/service-001-1.jpg"]', 
'【服務詳情】\n\n八字命盤分析服務，由資深命理師提供服務。\n\n服務內容：\n- 完整命盤分析\n- 五行旺衰判斷\n- 大運流年分析\n- 事業感情建議\n\n服務流程：\n1. 提供出生年月日時\n2. 命理師排盤分析\n3. 3-5個工作日出具報告\n4. 可預約語音解讀', 
299.00, 399.00, 999, 156, 3200, '{}', '["八字", "命盤", "命理"]', 1, 1, 4.7, 29, 1, NOW()),

(5, 18, '風水堪輿服務', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_aa5a9f13-c8b0-4475-b05c-c48fdc6b3c54.jpeg?sign=1807974392-496b0f5e1d-0-2f1c0cb0d8c690515e056d410a4c77db07a5d6a94755b46c3ee42f6c91412f17', '["/images/goods/service-002-1.jpg"]', 
'【服務詳情】\n\n專業風水堪輿服務，上門實地勘察。\n\n服務範圍：\n- 住宅風水勘察\n- 商業風水評估\n- 選址風水分析\n- 裝修風水建議', 
1888.00, 2588.00, 50, 23, 560, '{}', '["風水", "堪輿", "勘察"]', 1, 1, 4.8, 30, 1, NOW()),

(5, 18, '合婚配對服務', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_a2fc534a-be88-4cd6-821a-254bb4f35635.jpeg?sign=1807974392-a461acec12-0-9aef014d6f17cc1ffabae979c710beb3f182c4dac2bee066abe6b33d8ae31a90', '["/images/goods/service-003-1.jpg"]', 
'【服務詳情】\n\n八字合婚配對服務，幫您找到命中注定的那一位。\n\n服務內容：\n- 雙方八字合盤分析\n- 婚姻宮分析\n- 婚後生活預測\n- 相處建議指導', 
399.00, 520.00, 80, 45, 1200, '{}', '["合婚", "配對", "姻緣"]', 1, 1, 4.9, 31, 1, NOW()),

-- 開光聖品系列 (category_id: 22)
(1, 22, '開光聖品豪華套裝', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_bba1d98c-0a88-44f7-872f-3d5c7c06960b.jpeg?sign=1807974384-27ba570b80-0-0698d48d3d6d160332b98c20d4531dc23c37192f8a8319c71dc7e119bbfa488f', '["/images/goods/blessing-001-1.jpg", "/images/goods/blessing-001-2.jpg"]', 
'【商品詳情】\n\n開光聖品豪華套裝，包含多種開光聖品。\n\n套裝內容：\n1. 太上老君護身符 x1\n2. 五路財神符 x1\n3. 桃木令牌 x1\n4. 開光聖水 x1瓶\n5. 紅繩 x2條\n6. 精美錦盒 x1\n7. 開光證書 x1', 
1888.00, 2588.00, 30, 12, 280, '{}', '["開光聖品", "套裝", "豪華版"]', 1, 1, 5.0, 32, 1, NOW()),

(1, 22, '招財轉運聖品套裝', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_09dbd23c-d4c2-4f5a-8eb8-999b094ca58e.jpeg?sign=1807974422-196137b4aa-0-e28b957ee657d0d7882e2ee2184c49e7cd7f5f2f4d5b36675d942b3b08dcffe4', '["/images/goods/blessing-002-1.jpg"]', 
'【商品詳情】\n\n招財轉運聖品套裝，助您財源滾滾。\n\n套裝內容：\n1. 金玉滿堂招財符 x1\n2. 五路財神符 x1\n3. 純銅金蟾 x1\n4. 招財聖水 x1瓶\n5. 招財金元寶 x6個', 
1288.00, 1688.00, 40, 18, 420, '{}', '["招財套裝", "轉運", "聖品"]', 1, 1, 4.9, 33, 1, NOW()),

(1, 22, '太歲錦囊（2024專用）', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_fa584ce6-61c6-497a-89ad-7ab691797036.jpeg?sign=1807974416-945366b385-0-0140b943935d51d6437072a459b34ef49249cac10c5744c6654c24f81f838abf', '["/images/goods/blessing-003-1.jpg"]', 
'【商品詳情】\n\n2024甲辰年太歲錦囊，由名師特別設計。\n\n2024年犯太歲生肖：\n- 龍（破太歲）\n- 狗（沖太歲）\n- 兔（刑太歲）\n- 牛（害太歲）\n\n錦囊內容：\n- 太歲符 x1\n- 五帝錢 x1串\n- 化太歲咒紙 x1\n- 平安符 x1', 
299.00, 399.00, 200, 156, 4560, '{}', '["太歲錦囊", "化解太歲", "2024"]', 1, 1, 5.0, 34, 1, NOW()),

-- =====================================================
-- 2. 文章/百科详细数据 (20+ 词条)
-- 注意：articles表字段为 cover, excerpt, status 等
-- =====================================================

INSERT INTO `articles` (`category_id`, `title`, `cover`, `excerpt`, `content`, `author`, `source`, `views`, `likes`, `status`, `is_featured`, `published_at`, `created_at`) VALUES

-- 文化科普类 (category_id: 4)
(4, '符籙的起源與發展', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_b0abaf23-00e9-474b-9644-49c41c00e645.jpeg?sign=1807974445-067bb60d22-0-6a52118c82c43149e6502015ca2a98c2b1aeed6a81ba873cb89795743a01d43c', 
'符籙是我國道教法術的重要組成部分，也是我國傳統文化中最具神秘色彩的元素之一。本文章為您詳細介紹符籙的起源與發展歷程。', 
'<h2>符籙的起源</h2><p>符籙的歷史可追溯至遠古時期，據傳最早的符籙是由黃帝所創。</p><h2>先秦時期</h2><p>在先秦時期，符籙主要用於軍事和政治領域。</p><h2>漢代發展</h2><p>漢代是符籙發展的重要時期，道教正式形成。</p><h2>現代傳承</h2><p>現代符籙主要傳承於道教宮觀和民間道士手中。</p>',
'符寶小編', '符寶網', 3250, 234, 1, 1, DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 60 DAY)),

(4, '道教的主要神祇', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_1107fa34-4c48-4eec-879f-f4e4bc9647ce.jpeg?sign=1807974445-fe8b9c98eb-0-379bb4ab0bf1dc4282fff76b5841a3a644e821af43821405c38aa3b9d2bfd8ba', 
'道教是我國本土宗教，擁有龐大的神祇體系。本文章為您詳細介紹道教的主要神祇。',
'<h2>道祖級神祇</h2><p>三清道祖是道教最高神。</p><h2>日月星辰神祇</h2><p>包括東皇太一、結璘、二十八宿等。</p><h2>自然神祇</h2><p>包括四海龍王、土地公、城隍等。</p><h2>歷史人物神祇</h2><p>包括關聖帝君、文昌帝君、媽祖等。</p>',
'符寶小編', '符寶網', 2890, 198, 1, 1, DATE_SUB(NOW(), INTERVAL 55 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY)),

(4, '道教科儀基礎知識', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_0e7c8e9b-2d7b-40d5-b2af-2625bae0a7b6.jpeg?sign=1807974448-d15a43972d-0-f791e08bc1d7b74c74e240db73903424d943c6676504b5d9ca6daf10245d45d6', 
'道教科儀是道教宗教實踐的重要組成部分，包括各種法事、齋醮、祭祀等活動。',
'<h2>科儀的由來</h2><p>道教科儀起源於古代巫術和祭祀活動。</p><h2>主要科儀類型</h2><p>包括齋醮科儀、祭祀科儀、驅邪科儀等。</p><h2>重要節日科儀</h2><p>春節、端午、中元、重陽、冬至等都有相應的科儀。</p>',
'符寶小編', '符寶網', 2100, 156, 1, 0, DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY)),

(4, '道教修煉方法概述', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_8b347316-5116-488f-a151-3d58cc5b9d7a.jpeg?sign=1807974453-8b7bacd0ca-0-926463a7364292c3322706577fb1c545214fea9be983af29feddf3a57abc937f', 
'道教追求長生不老、修煉成仙，發展出了豐富的修煉方法體系。',
'<h2>修煉的核心理念</h2><p>道教修煉強調「天人合一」。</p><h2>主要修煉方法</h2><p>包括內丹術、外丹術、符籙法、存思術、導引術等。</p><h2>現代修煉建議</h2><p>從養生做起，循序漸進，尋求明師指導。</p>',
'符寶小編', '符寶網', 1780, 134, 1, 0, DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- 使用指导类 (category_id: 5)
(5, '符水的製作與使用', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_b5a75453-faad-4f07-a39b-d80aaa014e9b.jpeg?sign=1807974487-0ece57ff0b-0-fb507b58fd38b6e7c6c4574973097ef27bd9952f10812a09e4dd6a958f3e4b39', 
'符水是道教法事中常用的法物，將符籙焚化後溶於水中而成。本文章為您詳細介紹符水的製作與使用方法。',
'<h2>符水的歷史</h2><p>符水治病在我國有悠久的歷史。</p><h2>符水的製作方法</h2><p>傳統儀式法需要選擇吉日良辰，配合咒語進行。</p><h2>符水的使用方法</h2><p>可內服或外用，需在24小時內使用。</p>',
'符寶小編', '符寶網', 4560, 345, 1, 1, DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY)),

(5, '風水擺件的正確擺放', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_7c3dc709-102b-49b2-b9f5-f3f90e49579d.jpeg?sign=1807974481-010844f741-0-17ef0e8f42d3e37fdc78c9257ed9da21b4477e34b7d85d141d21b0d50af3543b', 
'風水擺件可以調節家居氣場，但擺放位置和方法很有講究。本指南為您詳細介紹各類風水擺件的正確擺放方法。',
'<h2>風水擺件的基本原則</h2><p>根據命理選擇，配合房屋方位。</p><h2>常見風水擺件及擺放方法</h2><p>包括貔貅、金蟾、財神、龍龜等。</p><h2>擺放禁忌</h2><p>不可放在橫樑下、廁所或廚房、床頭等位置。</p>',
'符寶小編', '符寶網', 3890, 289, 1, 1, DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),

(5, '如何選擇適合的護身符', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_a306d0c6-4b50-4f3d-9850-4bcd35cac483.jpeg?sign=1807974491-6db62d9ec5-0-ec84cf42aa7bbce75e891174cd31cc2cb95d1a89ee01cbbcbe146b2aed8871aa', 
'護身符種類繁多，選擇適合自己的護身符可以起到事半功倍的效果。',
'<h2>選擇護身符的基本原則</h2><p>根據需求選擇正規道觀出品。</p><h2>不同需求的護身符選擇</h2><p>平安類、招財類、學業類、感情類各有不同推薦。</p><h2>保養方法</h2><p>保持乾燥，避免沾染污穢。</p>',
'符寶小編', '符寶網', 2980, 212, 1, 0, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),

(5, '羅盤使用教程', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_108f82f7-7b4c-48a2-a8d2-9c20eacf8ee1.jpeg?sign=1807974479-d3b838d05b-0-f369720b10434c553b447ee15a43cafc333838729f51bd2a02e6939a2007362f', 
'羅盤是風水師必備的工具，主要用於測定方位和氣場。本教程為您詳細介紹羅盤的使用方法。',
'<h2>羅盤的結構</h2><p>包括天池、內盤、外盤等部分。</p><h2>使用步驟</h2><p>放置羅盤、調整水平、對準方向、讀取方位。</p><h2>注意事項</h2><p>避免干擾，保持清潔，定期校正。</p>',
'符寶小編', '符寶網', 2890, 198, 1, 0, DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY)),

-- 命理类 (category_id: 6)
(6, '八字命理基礎教程', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_58608059-f928-4145-864c-452443e5b8b3.jpeg?sign=1807974525-bc2f1f4594-0-c5574b1cc771d6054190fe593f28a28eb0f1874a2a82fc52a761e4b30cb191b9', 
'八字命理是我國傳統命理學的核心，通過一個人出生的年月日時來推算命運。本教程為初學者詳細介紹八字命理的基礎知識。',
'<h2>八字的構成</h2><p>八字由四柱組成，每柱包含一個天干和一個地支。</p><h2>天干地支</h2><p>十天干：甲、乙、丙、丁、戊、己、庚、辛、壬、癸。</p><h2>大運與流年</h2><p>大運每十年一個，流年每年變化。</p>',
'符寶小編', '符寶網', 5670, 423, 1, 1, DATE_SUB(NOW(), INTERVAL 65 DAY), DATE_SUB(NOW(), INTERVAL 65 DAY)),

(6, '五行與健康養生', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_736ef993-f1b0-477b-b713-23d8bd7c2f99.jpeg?sign=1807974525-6582195d2a-0-471c650d74ce7d00f12a209051f1837a99bc25747eab86c27305de145f0f1a6a', 
'五行學說是中醫理論的基礎，五行平衡與人體健康密切相關。本文章為您詳細介紹五行與健康的關係。',
'<h2>五行對應人體</h2><p>木對應肝膽、火對應心小腸、土對應脾胃、金對應肺大腸、水對應腎膀胱。</p><h2>五行失衡與疾病</h2><p>不同五行失衡會導致不同的健康問題。</p><h2>五行養生方法</h2><p>根據五行特點進行針對性養生。</p>',
'符寶小編', '符寶網', 3450, 267, 1, 0, DATE_SUB(NOW(), INTERVAL 55 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY)),

(6, '流年運勢預測', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_ed52bef5-d125-454a-8916-621b8a3b525a.jpeg?sign=1807974531-3800fa4cc9-0-95d4bb29a0597b541f3bfd357a8feb35d6ce6a1f89417c71399d97da0991cf18', 
'流年運勢是根據每年的天干地支變化來預測該年整體運勢的方法。本文章為您詳細介紹流年運勢的計算和分析方法。',
'<h2>什麼是流年</h2><p>流年是指每年的天干地支組合。</p><h2>流年的影響</h2><p>包括事業發展、財運起伏、感情變化、健康狀況等。</p><h2>2024年流年特點</h2><p>2024年是甲辰年，木氣旺盛。</p>',
'符寶小編', '符寶網', 4320, 312, 1, 1, DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY)),

(6, '合盤與姻緣分析', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_bbcb6505-63ab-4e00-b17b-773304b12d5c.jpeg?sign=1807974530-cf5c9f6e68-0-eef2d0a152d4c2ca15697499e8aac34971cce70e7e6c0264b2f0e212ec913db6', 
'合盤是分析兩人關係的重要命理方法，可以幫助了解彼此的契合程度。',
'<h2>合盤的意義</h2><p>通過分析雙方八字的配合程度來判斷婚姻契合度。</p><h2>合盤的主要內容</h2><p>包括五行配合、命局分析、宮位分析、桃花分析。</p><h2>提升姻緣運的方法</h2><p>擺放姻緣符，催旺桃花位。</p>',
'符寶小編', '符寶網', 4120, 345, 1, 0, DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- 太歲文化 (category_id: 7)
(7, '太歲文化詳解', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_0d1e998f-30a2-4ea5-8f50-07d63b87cfd2.jpeg?sign=1807974560-b7c1b00c74-0-4642114f6055fd4af70c9c2c8ffe3525329ba93ab06f3be0eabfb1bf924c86e7', 
'太歲是我國傳統民俗中的重要概念，源於道教對木星（歲星）的崇拜。本文章為您詳細介紹太歲文化。',
'<h2>太歲的由來</h2><p>太歲起源於我國古代天文學和道教信仰。</p><h2>太歲的種類</h2><p>包括值太歲、沖太歲、害太歲、破太歲、刑太歲。</p><h2>化解方法</h2><p>包括安太歲、佩戴化太歲符、多做善事等。</p>',
'符寶小編', '符寶網', 5670, 432, 1, 1, DATE_SUB(NOW(), INTERVAL 70 DAY), DATE_SUB(NOW(), INTERVAL 70 DAY)),

-- 产品类 (category_id: 8)
(8, '一物一證制度詳解', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_28d5e6ac-4160-4f5d-b9f5-0841f90182f5.jpeg?sign=1807974564-3edfaba425-0-08931e5268072a8ae6fb8296beaed0e3de8c49f6b1960443bb258bd08d422d62', 
'符寶網的「一物一證」制度是確保商品真偽的重要認證機制。本文章為您詳細介紹一物一證制度。',
'<h2>什麼是一物一證</h2><p>每一件商品都配有獨立的認證證書。</p><h2>認證內容</h2><p>包括獨立認證編號、檢測證書、開光證明等。</p><h2>驗證方式</h2><p>可掃描二維碼或輸入編號查詢。</p>',
'符寶小編', '符寶網', 2340, 178, 1, 0, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),

(8, '如何識別正規符籙', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_94e2ad5f-d75d-41c7-a19e-9cd1d63c5a05.jpeg?sign=1807974563-7e388f4ba0-0-f4e34843ac13bc3963e6384dc6aa2b59eae1638a6fdcd2b1024672c4de871c4d', 
'市場上存在假冒符籙，消費者需要學會識別正規符籙的方法。',
'<h2>正規符籙的特徵</h2><p>來源正規、包裝精美、證書齊全、價格合理。</p><h2>假冒符籙的特徵</h2><p>價格過低、來源不明、包裝粗糙、無證書。</p><h2>識別方法</h2><p>一看、二摸、三聞、四驗。</p>',
'符寶小編', '符寶網', 3210, 245, 1, 0, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),

(8, '符籙保養與維護', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_33f2a0b7-50c0-479f-8b31-ba304774af2b.jpeg?sign=1807974566-44b471fb02-0-9bb36df112e8383fba8d7fb52b2777dda63549b18dac7469b3f2eaf6c647a64e', 
'正確的保養和維護可以延長符籙的使用壽命，保持其功效。',
'<h2>符籙保存原則</h2><p>乾燥通風、避免高溫、清潔衛生。</p><h2>不同材質的保養</h2><p>紙質、布質、玉石符牌各有不同的保養方法。</p><h2>符籙更換周期</h2><p>一般符籙1-2年更換一次。</p>',
'符寶小編', '符寶網', 1980, 145, 1, 0, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- =====================================================
-- 3. 新闻详细数据 (15+ 条)
-- =====================================================

-- 创建 news 表
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` int(11) UNSIGNED DEFAULT NULL COMMENT '分类ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `cover` varchar(255) DEFAULT NULL COMMENT '封面图',
  `excerpt` text COMMENT '摘要',
  `content` longtext COMMENT '内容（HTML）',
  `author` varchar(50) DEFAULT NULL COMMENT '作者',
  `source` varchar(100) DEFAULT NULL COMMENT '来源',
  `views` int(11) NOT NULL DEFAULT 0 COMMENT '浏览量',
  `likes` int(11) NOT NULL DEFAULT 0 COMMENT '点赞数',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：0草稿 1发布',
  `is_featured` tinyint(1) NOT NULL DEFAULT 0 COMMENT '精选',
  `published_at` datetime DEFAULT NULL COMMENT '发布时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='新闻表';

INSERT INTO `news` (`category_id`, `title`, `cover`, `excerpt`, `content`, `source`, `author`, `views`, `status`, `is_featured`, `published_at`, `created_at`) VALUES

-- 行业新闻 (category_id: 9)
(9, '龍虎山天師府年度法會圓滿成功', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_64cb2088-df26-4991-ae99-f03c7d497dba.jpeg?sign=1807974590-7e38252d0f-0-4568b7ec8a37b72be5c32c04d90733f6bacff2add6b173c5bb07635ab21d98d4', 
'備受矚目的龍虎山天師府年度祈福法會於上月成功舉辦，來自各地的數千名信眾參與。',
'<h2>法會概況</h2><p>本次法會為期三天，吸引了來自海峽兩岸及港澳地區的數千名道教徒和文化愛好者參與。</p><h2>法會內容</h2><p>包括祈福法會、符籙加持、道教科儀、文化展覽等。</p><h2>社會反響</h2><p>法會得到了社會各界的廣泛關注。</p>',
'道教協會官方', '符寶小編', 5680, 1, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),

(9, '道教文化遺產保護研討會在京舉行', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_a16c8848-4921-4ef2-a1de-db350db1ac2f.jpeg?sign=1807974597-6a8341412d-0-aa29248d01ea6ffaffdcecbc0402ede8f2959ae6bacc3f6519f938f9b9f1cfb2', 
'為期三天的道教文化遺產保護研討會在北京閉幕，專家學者共商道教文化傳承大計。',
'<h2>研討會概況</h2><p>為期三天的研討會匯聚了來自全國各地的專家學者、道教界人士等百餘人參加。</p><h2>研討主題</h2><p>包括道教文物保護、非物質文化遺產傳承、道教文化傳播等。</p><h2>重要成果</h2><p>會議通過了《道教文化遺產保護倡議書》。</p>',
'文化部官方', '符寶小編', 4560, 1, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),

(9, '首屆道教文化師資培訓班開班', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_983e9298-620c-4ddb-afb7-3763db97b6df.jpeg?sign=1807974704-2ef3df06b4-0-4177635d272bdac211e39fc00238036d9f6d2b3000dac3a44cea8f3f01b49333', 
'由中國道教協會主辦的首屆道教文化師資培訓班正式開班，培養道教文化傳承人才。',
'<h2>培訓內容</h2><p>包括理論課程、實踐課程、教學方法、考察實踐等。</p><h2>師資力量</h2><p>包括道教協會專家、知名學者、資深道士等。</p><h2>培訓目標</h2><p>培養道教文化傳承人、文化傳播使者、教育培訓師資。</p>',
'道教協會', '符寶小編', 3450, 1, 0, DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY)),

-- 市场动态 (category_id: 10)
(10, 'AI技術助力傳統符籙文化數字化傳承', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_7503a40b-6538-43ad-95a1-6640e0620c62.jpeg?sign=1807974599-3974e351a2-0-096e561a0d136926b5218d36fc0ffa9366aa4173b311ee134f0e054b2a8271f7', 
'人工智能技術正被應用於傳統文化的保護與傳承，為符籙文化帶來新的可能。',
'<h2>技術應用</h2><p>包括符籙數字化、智能識別、知識圖譜、智能問答等。</p><h2>符寶網實踐</h2><p>符寶網已上線AI助手功能，可為用戶解答符籙、道教文化等相關問題。</p><h2>未來展望</h2><p>將進一步探索AI技術在道教文化保護、傳播、教育等方面的應用。</p>',
'科技部官方', '符寶小編', 3890, 1, 1, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),

(10, '符寶網完成新一輪融資，加速佈局道教文化產業', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_f7434d76-7c44-47be-a387-8a42047b9080.jpeg?sign=1807974636-1663eafd02-0-724538bf5e8ea90cf6f05139f3a430a2c29ae7d3a28e9eace955b7642bfcd02a', 
'符寶網宣佈完成B輪融資，將持續投入道教文化內容建設和技術研發。',
'<h2>融資詳情</h2><p>本輪融資金額達數億元，將主要用於技術研發、內容建設、市場拓展等。</p><h2>發展歷程</h2><p>符寶網成立以來，註冊用戶突破百萬，合作宮觀超過500家。</p><h2>未來規劃</h2><p>將繼續深耕道教文化領域，打造「道教文化+互聯網」的標杆模式。</p>',
'財經頻道', '符寶小編', 4560, 1, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),

(10, '傳統符籙行業標準化座談會召開', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_dc1353fd-95e7-42f3-bcbd-3f855e8beb14.jpeg?sign=1807974670-57411a9259-0-71b1b7450e0fbae362eb5d620f658f2755bddc45f6b9defd0b94ae0c849c3c21', 
'業內專家齊聚一堂，共同探討符籙行業標準化發展之路。',
'<h2>座談背景</h2><p>近年來，符籙市場快速發展，但也存在一些問題。</p><h2>討論主題</h2><p>包括品質標準、市場規範、知識產權等。</p><h2>重要成果</h2><p>會議達成推動行業自律、建立認證體系等共識。</p>',
'行業協會', '符寶小編', 3450, 1, 0, DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),

(10, '道教文化產業迎來發展新機遇', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_d871dc68-7d31-4cde-b70d-db2c6e97ee57.jpeg?sign=1807974670-eb6df92198-0-7361380e49f1584ceb3f77ad8be20c7f4361e3935c2df5845ef71c5610cca18d', 
'業內人士分析，道教文化產業正迎來快速發展的新階段。',
'<h2>市場規模</h2><p>道教文化產業市場規模持續擴大。</p><h2>發展趨勢</h2><p>包括數字化轉型、品牌化發展、跨界融合、國際化發展。</p><h2>前景展望</h2><p>道教文化產業發展前景廣闊。</p>',
'經濟觀察', '符寶小編', 4560, 1, 0, DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- 文化活动 (category_id: 11)
(11, '春節期間道教宮觀開放時間公告', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_82d9ef28-8a01-4bab-a120-c323366fd47f.jpeg?sign=1807974591-58e3b073b8-0-1ebe90624dd2015bb0a6c6e923eb649cf0e89841c7015c57d325bf952043c705', 
'春節臨近，各地道教宮觀陸續公佈春節期間的開放時間和活動安排。',
'<h2>主要宮觀安排</h2><p>包括白雲觀（北京）、龍虎山（江西）、武當山（湖北）、蓬萊閣（山東）等。</p><h2>溫馨提示</h2><p>提前了解開放時間，錯峰出行，保持安靜尊重。</p><h2>祈福建議</h2><p>春節期間可準備香燭供品、祈福帶、護身符等。</p>',
'道教協會', '符寶小編', 6780, 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),

(11, '「道教文化節」將在武當山舉行', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_aa08f76a-9b88-4f37-b510-10d870bcdc7d.jpeg?sign=1807974625-59f210c2f0-0-590b400d9f3d88ca3b7cf13a3e845e3238bee4c1ef0ab57817ce31366631a25c', 
'第五屆「道教文化節」將於下月在武當山舉行，屆時將舉辦豐富多彩的文化活動。',
'<h2>活動概況</h2><p>本屆文化節為期一周，將舉辦多場精彩活動。</p><h2>特色活動</h2><p>包括祈福法會、文化展覽、互動體驗、學術交流等。</p><h2>參與方式</h2><p>可通過符寶網平台報名參加。</p>',
'旅遊局', '符寶小編', 5670, 1, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),

(11, '「符籙藝術」展覽在台北故宮展出', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_48984342-8cb4-4746-9cbe-e9aabea392ae.jpeg?sign=1807974624-ba118472ff-0-6b246930b08472bde83be545e84bcdd06f1a4d95e2cf299daaba94c55002a74a', 
'「符籙藝術」展覽在台北故宮博物院展出，展示珍貴的符籙文物和文化內涵。',
'<h2>展覽內容</h2><p>展出珍貴的符籙文物，包括唐代符籙真跡、宋代道教文書等。</p><h2>展區設置</h2><p>包括歷史區、工藝區、文化區、互動區。</p><h2>展覽意義</h2><p>弘揚中華優秀傳統文化，讓更多人了解和認識符籙藝術。</p>',
'故宮博物院', '符寶小編', 6230, 1, 1, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),

(11, '我國首個道教文化數字博物館上線', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_e955c1f8-91ee-439e-b4c3-ec16b30a0fc8.jpeg?sign=1807974631-7c9633eb98-0-3160e16c855c252a728acdf3872a6b8589f54d0ac9464779750b10c0ed0c1d50', 
'由國家文物局支持的「道教文化數字博物館」正式上線，公眾可在線參觀道教文化珍貴文物。',
'<h2>博物館概況</h2><p>收錄了全國各地道教宮觀的珍貴文物。</p><h2>主要展區</h2><p>包括符籙展區、法器展區、經典展區、建築展區。</p><h2>技術特點</h2><p>採用720度全景展示、3D文物模型、VR虛擬參觀等技術。</p>',
'國家文物局', '符寶小編', 5230, 1, 1, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),

(11, '太極拳成功申遺周年慶祝活動舉行', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_fbdc504b-634d-4862-86b4-62a8eb4e7a1e.jpeg?sign=1807974698-6f26934d08-0-f0c36eab303c896e0fb50dcecb9b9d6e60715811d1bfa577fa325c2761dffb33', 
'太極拳成功列入聯合國非物質文化遺產周年慶祝活動在各地舉行。',
'<h2>慶祝活動</h2><p>各地舉辦豐富多彩的活動，包括太極拳表演、功夫展示等。</p><h2>太極拳由來</h2><p>起源於武當山，融合道家思想。</p><h2>文化意義</h2><p>太極拳的成功申遺弘揚了中華武術。</p>',
'文化部', '符寶小編', 4560, 1, 0, DATE_SUB(NOW(), INTERVAL 55 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY)),

-- 政策法规 (category_id: 12)
(12, '《宗教活動場所管理辦法》正式實施', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_38e711ba-7de9-4b99-a4df-22e520a86978.jpeg?sign=1807974730-08af954788-0-4a81a4568257a44b7d2875f1c28c110743a91dcd5ac558dcdce38fa53a6f155e', 
'新版《宗教活動場所管理辦法》正式實施，對宗教活動場所的管理提出新規範。',
'<h2>主要內容</h2><p>包括場所管理、活動規範、人員管理、財務管理等。</p><h2>行業影響</h2><p>新規範的實施將規範宗教活動場所管理。</p><h2>企業回應</h2><p>符寶網表示將積極配合新規範。</p>',
'宗教事務局', '符寶小編', 3890, 1, 0, DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY)),

-- 健康养生 (category_id: 13)
(13, '新型冠狀病毒與傳統養生文化研討會召開', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_db5ee31e-ae8d-4c8f-9dc6-cfd7237aa261.jpeg?sign=1807974668-d77945eab5-0-a5f36735156464547b362b6cb1b8be338ac5aa2624a07a6c7120a6cfb7a585a4', 
'專家學者研討傳統道教養生文化在現代健康領域的應用價值。',
'<h2>研討內容</h2><p>包括道家養生理論、傳統功法、飲食養生、精神調養等。</p><h2>專家觀點</h2><p>傳統養生文化具有獨特價值，現代人可以借鑒傳統智慧。</p><h2>實踐應用</h2><p>包括慢病調理、康復保健、心理疏導等。</p>',
'中醫藥管理局', '符寶小編', 3890, 1, 0, DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 60 DAY)),

-- 国际交流 (category_id: 14)
(14, '「一帶一路」道教文化交流論壇舉行', 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_60063f84-bf9f-4461-b54a-28ac1ec5cf4c.jpeg?sign=1807974668-6d8216db51-0-34834c40267c7f579118666677393832f40e00eb975438d618da2c7e42db89cf', 
'道教文化交流論壇聚焦「一帶一路」沿線國家的道教文化傳播與合作。',
'<h2>論壇概況</h2><p>論壇吸引了來自「一帶一路」沿線20多個國家的代表參加。</p><h2>交流主題</h2><p>包括文化傳播、學術研究、產業合作等。</p><h2>重要成果</h2><p>達成多項合作協議和文化機構合作備忘錄。</p>',
'外交部', '符寶小編', 3450, 1, 0, DATE_SUB(NOW(), INTERVAL 65 DAY), DATE_SUB(NOW(), INTERVAL 65 DAY)),

-- =====================================================
-- 執行完成
-- =====================================================
