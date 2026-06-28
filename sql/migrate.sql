-- 符寶網 MySQL Schema 迁移脚本
-- 用途：补全生产环境缺失的列和表
-- 执行：mysql -u fubao -p fubao < migrate.sql

-- ===== 创建辅助存储过程：安全添加列（列已存在时跳过）=====
DROP PROCEDURE IF EXISTS safe_add_column;
DELIMITER //
CREATE PROCEDURE safe_add_column(
    IN tbl_name VARCHAR(64),
    IN col_name VARCHAR(64),
    IN col_def VARCHAR(500)
)
BEGIN
    DECLARE col_count INT DEFAULT 0;
    SELECT COUNT(*) INTO col_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tbl_name
      AND COLUMN_NAME = col_name;
    IF col_count = 0 THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl_name, '` ADD COLUMN `', col_name, '` ', col_def);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- ===== admins 表 =====
CALL safe_add_column('admins', 'last_login_at', 'DATETIME DEFAULT NULL');
CALL safe_add_column('admins', 'role_id', 'INT DEFAULT 1');

-- ===== users 表 =====
CALL safe_add_column('users', 'nickname', 'VARCHAR(100) DEFAULT NULL AFTER `name`');
CALL safe_add_column('users', 'invite_code', 'VARCHAR(50) DEFAULT NULL AFTER `nickname`');

-- ===== banners 表 =====
CALL safe_add_column('banners', 'position', 'VARCHAR(50) DEFAULT NULL');
CALL safe_add_column('banners', 'link', 'VARCHAR(500) DEFAULT NULL');

-- ===== news 表 =====
CALL safe_add_column('news', 'slug', 'VARCHAR(200) DEFAULT NULL');
CALL safe_add_column('news', 'category', 'VARCHAR(100) DEFAULT NULL');
CALL safe_add_column('news', 'tags', 'VARCHAR(500) DEFAULT NULL');
CALL safe_add_column('news', 'published_at', 'DATETIME DEFAULT NULL');
CALL safe_add_column('news', 'is_featured', 'TINYINT DEFAULT 0');

-- 回填 published_at
UPDATE `news` SET `published_at` = `created_at` WHERE `published_at` IS NULL AND `created_at` IS NOT NULL;

-- ===== categories 表 =====
CALL safe_add_column('categories', 'image', 'VARCHAR(500) DEFAULT NULL');
CALL safe_add_column('categories', 'description', 'TEXT DEFAULT NULL');

-- ===== articles 表（如不存在则创建）=====
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) DEFAULT NULL,
  `summary` TEXT DEFAULT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `cover` VARCHAR(500) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `tags` VARCHAR(500) DEFAULT NULL,
  `author_id` INT DEFAULT NULL,
  `status` TINYINT DEFAULT 1,
  `is_featured` TINYINT DEFAULT 0,
  `views` INT DEFAULT 0,
  `published_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== certificates 表（如不存在则创建）=====
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `issuer` VARCHAR(200) DEFAULT NULL,
  `issue_date` DATE DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `certificate_no` VARCHAR(100) DEFAULT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `goods_id` INT DEFAULT NULL,
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_goods_id` (`goods_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== notifications 表 =====
CALL safe_add_column('notifications', 'is_read', 'TINYINT DEFAULT 0');
-- 如果旧表有 read 列，回填数据
UPDATE `notifications` SET `is_read` = 1 WHERE `is_read` = 0 AND EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'read'
);

-- ===== favorites 表 =====
CALL safe_add_column('favorites', 'target_type', 'VARCHAR(50) DEFAULT ''goods'' AFTER `user_id`');
CALL safe_add_column('favorites', 'target_id', 'INT DEFAULT NULL AFTER `target_type`');

-- 回填 target_id（如果原表只有 goods_id）
UPDATE `favorites` SET `target_id` = `goods_id` WHERE `target_id` IS NULL AND EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'favorites' AND COLUMN_NAME = 'goods_id'
);

-- ===== browse_history 表（如不存在则创建）=====
CREATE TABLE IF NOT EXISTS `browse_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `goods_id` INT NOT NULL,
  `goods_name` VARCHAR(200) DEFAULT NULL,
  `goods_image` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_goods_id` (`goods_id`),
  UNIQUE KEY `uk_user_goods` (`user_id`, `goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== admin_roles 表（如不存在则创建）=====
CREATE TABLE IF NOT EXISTS `admin_roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `permissions` TEXT DEFAULT NULL,
  `is_super` TINYINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认超级管理员角色
INSERT IGNORE INTO `admin_roles` (`id`, `name`, `code`, `permissions`, `is_super`) VALUES
(1, '超級管理員', 'super_admin', '["*"]', 1);

-- 确保 admins 有 role_id
UPDATE `admins` SET `role_id` = 1 WHERE `role_id` IS NULL OR `role_id` = 0;

-- ===== orders 表 =====
CALL safe_add_column('orders', 'address_snapshot', 'TEXT DEFAULT NULL');
CALL safe_add_column('orders', 'payment_method', 'VARCHAR(50) DEFAULT NULL');
CALL safe_add_column('orders', 'payment_no', 'VARCHAR(100) DEFAULT NULL');
CALL safe_add_column('orders', 'paid_at', 'DATETIME DEFAULT NULL');
CALL safe_add_column('orders', 'shipped_at', 'DATETIME DEFAULT NULL');
CALL safe_add_column('orders', 'received_at', 'DATETIME DEFAULT NULL');
CALL safe_add_column('orders', 'cancel_reason', 'VARCHAR(500) DEFAULT NULL');
CALL safe_add_column('orders', 'note', 'TEXT DEFAULT NULL');
CALL safe_add_column('orders', 'invoice_title', 'VARCHAR(200) DEFAULT NULL');

-- ===== order_items 表 =====
CALL safe_add_column('order_items', 'goods_image', 'VARCHAR(500) DEFAULT NULL');
CALL safe_add_column('order_items', 'goods_price', 'DECIMAL(10,2) DEFAULT NULL');

-- ===== goods 表 =====
CALL safe_add_column('goods', 'images', 'TEXT DEFAULT NULL');
CALL safe_add_column('goods', 'detail', 'LONGTEXT DEFAULT NULL');
CALL safe_add_column('goods', 'specs', 'TEXT DEFAULT NULL');
CALL safe_add_column('goods', 'is_featured', 'TINYINT DEFAULT 0');
CALL safe_add_column('goods', 'sales', 'INT DEFAULT 0');
CALL safe_add_column('goods', 'locale', 'VARCHAR(10) DEFAULT ''zh''');
CALL safe_add_column('goods', 'parent_id', 'INT DEFAULT NULL');

-- ===== settings 表（如不存在则创建）=====
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== ai_model_configs 表（如不存在则创建）=====
CREATE TABLE IF NOT EXISTS `ai_model_configs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL DEFAULT '',
  `provider` VARCHAR(50) NOT NULL DEFAULT '',
  `model_name` VARCHAR(100) NOT NULL DEFAULT '',
  `base_url` VARCHAR(500) NOT NULL DEFAULT '',
  `api_key` VARCHAR(500) NOT NULL DEFAULT '',
  `max_tokens` INT NOT NULL DEFAULT 4096,
  `temperature` DECIMAL(3,2) NOT NULL DEFAULT 0.70,
  `priority` INT NOT NULL DEFAULT 0,
  `is_default` TINYINT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ai_model_configs 缺失字段迁移（旧表可能缺少 name/priority）
CALL safe_add_column('ai_model_configs', 'name', 'VARCHAR(100) DEFAULT NULL AFTER `id`');
CALL safe_add_column('ai_model_configs', 'priority', 'INT DEFAULT 0 AFTER `temperature`');

-- 插入默认 AI 模型配置（增量，不覆盖已有数据）
INSERT IGNORE INTO ai_model_configs (id, `name`, provider, model_name, base_url, api_key, max_tokens, temperature, priority, is_default, status) VALUES
(1, 'DeepSeek V4', 'deepseek', 'deepseek-chat', 'https://api.deepseek.com', '', 8192, 0.70, 1, 1, 1),
(2, 'OpenAI GPT-4o', 'openai', 'gpt-4o', 'https://api.openai.com/v1', '', 4096, 0.70, 2, 0, 1),
(3, 'Kimi', 'moonshot', 'moonshot-v1-auto', 'https://api.moonshot.cn/v1', '', 8192, 0.70, 3, 0, 1),
(4, '豆包', 'doubao', 'doubao-pro-32k', 'https://ark.cn-beijing.volces.com/api/v3', '', 4096, 0.70, 4, 0, 1),
(5, '通义千问', 'qwen', 'qwen-turbo', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '', 4096, 0.70, 5, 0, 1),
(6, '智谱 GLM-4', 'zhipu', 'glm-4', 'https://open.bigmodel.cn/api/paas/v4', '', 4096, 0.70, 6, 0, 1);

-- ai_knowledge 缺失字段迁移
CALL safe_add_column('ai_knowledge', 'file_type', 'VARCHAR(20) DEFAULT NULL AFTER `tags`');
CALL safe_add_column('ai_knowledge', 'file_size', 'INT UNSIGNED DEFAULT 0 AFTER `file_type`');
CALL safe_add_column('ai_knowledge', 'chunk_count', 'INT UNSIGNED DEFAULT 0 AFTER `file_size`');

-- ===== free_gifts 缺失字段迁移 =====
CALL safe_add_column('free_gifts', 'name', 'VARCHAR(200) NOT NULL DEFAULT \'\' COMMENT \'商品名稱\' AFTER `title`');
CALL safe_add_column('free_gifts', 'image', 'VARCHAR(500) NOT NULL DEFAULT \'\' COMMENT \'商品圖片URL\' AFTER `cover_image`');
CALL safe_add_column('free_gifts', 'original_price', 'DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT \'原價\' AFTER `image`');
CALL safe_add_column('free_gifts', 'claimed', 'INT NOT NULL DEFAULT 0 COMMENT \'已領取數量\' AFTER `remain_count`');
CALL safe_add_column('free_gifts', 'limit_per_user', 'INT NOT NULL DEFAULT 1 COMMENT \'每人限領\' AFTER `claimed`');
CALL safe_add_column('free_gifts', 'shipping_fee', 'DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT \'郵寄運費\' AFTER `limit_per_user`');
CALL safe_add_column('free_gifts', 'merchant_id', 'INT UNSIGNED DEFAULT NULL COMMENT \'商戶ID\' AFTER `shipping_fee`');
CALL safe_add_column('free_gifts', 'category', 'VARCHAR(50) NOT NULL DEFAULT \'\' COMMENT \'分類\' AFTER `merchant_id`');
CALL safe_add_column('free_gifts', 'is_new_user_only', 'TINYINT NOT NULL DEFAULT 0 COMMENT \'僅限新用戶\' AFTER `category`');
CALL safe_add_column('free_gifts', 'is_active', 'TINYINT NOT NULL DEFAULT 1 COMMENT \'是否啟用\' AFTER `is_new_user_only`');

-- 创建 free_gift_claims 表（如果不存在）
CREATE TABLE IF NOT EXISTS `free_gift_claims` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `gift_id` INT UNSIGNED NOT NULL COMMENT '免費商品ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用戶ID',
  `receive_type` ENUM('shipping','pickup') NOT NULL DEFAULT 'pickup' COMMENT '領取方式',
  `shipping_name` VARCHAR(100) DEFAULT NULL COMMENT '收貨人姓名',
  `shipping_phone` VARCHAR(30) DEFAULT NULL COMMENT '收貨人手機',
  `shipping_address` VARCHAR(500) DEFAULT NULL COMMENT '收貨地址',
  `claim_no` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '領取編號',
  `pay_amount` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '支付金額',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0=待處理 1=已確認 2=已發貨 3=已完成 4=已取消',
  `claimed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '領取時間',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成時間',
  KEY `idx_gift_id` (`gift_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_claim_no` (`claim_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 同步 title → name（已有数据以 title 值填充 name 字段）
UPDATE free_gifts SET name = title WHERE name = '' OR name IS NULL;
-- 同步 remain_count → stock 逻辑（remain_count 即为剩余库存）
-- 同步 cover_image → image（已有数据以 cover_image 值填充 image 字段）
UPDATE free_gifts SET image = cover_image WHERE image = '' OR image IS NULL;

-- ===== 清理 =====
DROP PROCEDURE IF EXISTS safe_add_column;

SELECT '迁移完成！' AS result;
