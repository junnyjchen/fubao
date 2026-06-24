-- 符寶網 MySQL Schema 迁移脚本
-- 用途：补全生产环境缺失的列和表
-- 执行：mysql -u fubao -p fubao < migrate.sql

-- ===== admins 表 =====
ALTER TABLE `admins` ADD COLUMN IF NOT EXISTS `last_login_at` DATETIME DEFAULT NULL;

-- ===== users 表 =====
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `nickname` VARCHAR(100) DEFAULT NULL AFTER `name`;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `invite_code` VARCHAR(50) DEFAULT NULL AFTER `nickname`;

-- ===== banners 表 =====
ALTER TABLE `banners` ADD COLUMN IF NOT EXISTS `position` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `banners` ADD COLUMN IF NOT EXISTS `link` VARCHAR(500) DEFAULT NULL;

-- ===== news 表 =====
ALTER TABLE `news` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(200) DEFAULT NULL;
ALTER TABLE `news` ADD COLUMN IF NOT EXISTS `category` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `news` ADD COLUMN IF NOT EXISTS `tags` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `news` ADD COLUMN IF NOT EXISTS `published_at` DATETIME DEFAULT NULL;

-- 回填 published_at
UPDATE `news` SET `published_at` = `created_at` WHERE `published_at` IS NULL AND `created_at` IS NOT NULL;

-- ===== categories 表 =====
ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `image` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `description` TEXT DEFAULT NULL;

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
-- 代码已统一使用 is_read 列（与 MySQL 表结构一致）
-- 如果表里只有 read 列（旧结构），添加 is_read 并回填
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `is_read` TINYINT DEFAULT 0;
UPDATE `notifications` SET `is_read` = `read` WHERE `is_read` = 0 AND `read` = 1;

-- ===== favorites 表 =====
ALTER TABLE `favorites` ADD COLUMN IF NOT EXISTS `target_type` VARCHAR(50) DEFAULT 'goods' AFTER `user_id`;
ALTER TABLE `favorites` ADD COLUMN IF NOT EXISTS `target_id` INT DEFAULT NULL AFTER `target_type`;

-- 回填 target_id（如果原表只有 goods_id）
UPDATE `favorites` SET `target_id` = `goods_id` WHERE `target_id` IS NULL AND `goods_id` IS NOT NULL;
UPDATE `favorites` SET `target_type` = 'goods' WHERE `target_type` = 'goods' AND `target_id` IS NOT NULL;

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

-- ===== 插入默认超级管理员角色（如不存在）=====
INSERT IGNORE INTO `admin_roles` (`id`, `name`, `code`, `permissions`, `is_super`) VALUES
(1, '超級管理員', 'super_admin', '["*"]', 1);

-- ===== 确保 admins 表有 role_id 列 =====
ALTER TABLE `admins` ADD COLUMN IF NOT EXISTS `role_id` INT DEFAULT 1;
UPDATE `admins` SET `role_id` = 1 WHERE `role_id` IS NULL OR `role_id` = 0;
