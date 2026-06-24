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

-- ===== 清理 =====
DROP PROCEDURE IF EXISTS safe_add_column;

SELECT '迁移完成！' AS result;
