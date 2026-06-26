-- 符寶網 MySQL 數據庫 Schema
-- 執行前請先創建數據庫: CREATE DATABASE IF NOT EXISTS fubao DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE fubao;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 用戶與認證
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL DEFAULT '',
  `nickname` VARCHAR(100) NOT NULL DEFAULT '',
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL DEFAULT '',
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(500) NOT NULL DEFAULT '',
  `language` VARCHAR(10) NOT NULL DEFAULT 'zh-TW',
  `role` VARCHAR(20) NOT NULL DEFAULT 'user',
  `points` INT NOT NULL DEFAULT 0,
  `invite_code` VARCHAR(50) NOT NULL DEFAULT '',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1:啟用 0:禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(100) NOT NULL DEFAULT '',
  `role_id` INT UNSIGNED NOT NULL DEFAULT 2,
  `status` TINYINT NOT NULL DEFAULT 1,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `permissions` JSON,
  `is_super` TINYINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 商品與分類
-- ============================================================

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `icon` VARCHAR(50) NOT NULL DEFAULT '',
  `image` VARCHAR(500) NOT NULL DEFAULT '',
  `description` TEXT DEFAULT NULL,
  `parent_id` INT UNSIGNED DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `goods` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `subtitle` VARCHAR(200) NOT NULL DEFAULT '',
  `main_image` VARCHAR(500) NOT NULL DEFAULT '',
  `images` JSON DEFAULT NULL COMMENT '商品圖片數組',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `original_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `stock` INT NOT NULL DEFAULT 0,
  `sales` INT NOT NULL DEFAULT 0,
  `is_certified` TINYINT NOT NULL DEFAULT 0,
  `category_id` INT UNSIGNED NOT NULL,
  `merchant_id` INT UNSIGNED NOT NULL,
  `type` TINYINT NOT NULL DEFAULT 1,
  `purpose` VARCHAR(100) NOT NULL DEFAULT '',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1:上架 0:下架',
  `description` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category_id`),
  INDEX `idx_merchant` (`merchant_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `goods_i18n` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `goods_id` INT UNSIGNED NOT NULL,
  `locale` VARCHAR(10) NOT NULL,
  `name` VARCHAR(200) NOT NULL DEFAULT '',
  `subtitle` VARCHAR(200) NOT NULL DEFAULT '',
  `description` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_goods_locale` (`goods_id`, `locale`),
  INDEX `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories_i18n` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED NOT NULL,
  `locale` VARCHAR(10) NOT NULL,
  `name` VARCHAR(100) NOT NULL DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_category_locale` (`category_id`, `locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 商家
-- ============================================================

CREATE TABLE IF NOT EXISTS `merchants` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'individual',
  `contact_name` VARCHAR(100) NOT NULL DEFAULT '',
  `contact_phone` VARCHAR(30) NOT NULL DEFAULT '',
  `contact_email` VARCHAR(255) NOT NULL DEFAULT '',
  `description` TEXT,
  `address` VARCHAR(500) NOT NULL DEFAULT '',
  `license_number` VARCHAR(100) NOT NULL DEFAULT '',
  `verified` TINYINT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1:啟用 0:禁用',
  `user_id` INT UNSIGNED DEFAULT NULL,
  `login_account` VARCHAR(100) NOT NULL DEFAULT '',
  `login_password` VARCHAR(255) NOT NULL DEFAULT '',
  `logo` VARCHAR(500) NOT NULL DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_login_account` (`login_account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `merchant_applications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'individual',
  `contact_name` VARCHAR(100) NOT NULL DEFAULT '',
  `contact_phone` VARCHAR(30) NOT NULL DEFAULT '',
  `contact_email` VARCHAR(255) NOT NULL DEFAULT '',
  `description` TEXT,
  `address` VARCHAR(500) NOT NULL DEFAULT '',
  `license_number` VARCHAR(100) NOT NULL DEFAULT '',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/approved/rejected',
  `review_note` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 購物車與訂單
-- ============================================================

CREATE TABLE IF NOT EXISTS `cart` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `goods_id` INT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_goods` (`user_id`, `goods_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT UNSIGNED NOT NULL,
  `merchant_id` INT UNSIGNED NOT NULL DEFAULT 1,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `shipping_fee` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `pay_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `payment_method` VARCHAR(30) NOT NULL DEFAULT '',
  `payment_status` VARCHAR(20) NOT NULL DEFAULT 'unpaid' COMMENT 'unpaid/paid/refunded',
  `payment_no` VARCHAR(100) NOT NULL DEFAULT '',
  `shipping_address` JSON DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/paid/shipped/completed/cancelled/refunded',
  `note` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `goods_id` INT UNSIGNED NOT NULL,
  `goods_name` VARCHAR(200) NOT NULL DEFAULT '',
  `goods_image` VARCHAR(500) NOT NULL DEFAULT '',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL DEFAULT '',
  `phone` VARCHAR(30) NOT NULL DEFAULT '',
  `province` VARCHAR(50) NOT NULL DEFAULT '',
  `city` VARCHAR(50) NOT NULL DEFAULT '',
  `district` VARCHAR(50) NOT NULL DEFAULT '',
  `address` VARCHAR(500) NOT NULL DEFAULT '',
  `is_default` TINYINT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 支付與退款
-- ============================================================

CREATE TABLE IF NOT EXISTS `refunds` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `reason` TEXT,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/approved/rejected/completed',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `logistics` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `company` VARCHAR(100) NOT NULL DEFAULT '',
  `tracking_no` VARCHAR(100) NOT NULL DEFAULT '',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/shipped/delivered',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 內容與百科
-- ============================================================

CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL DEFAULT '',
  `image` VARCHAR(500) NOT NULL DEFAULT '',
  `link` VARCHAR(500) NOT NULL DEFAULT '',
  `position` VARCHAR(50) NOT NULL DEFAULT 'home',
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `news` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL DEFAULT '',
  `content` LONGTEXT,
  `summary` TEXT,
  `cover_image` VARCHAR(500) NOT NULL DEFAULT '',
  `category_id` INT UNSIGNED DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT '',
  `author` VARCHAR(100) NOT NULL DEFAULT '',
  `source` VARCHAR(200) NOT NULL DEFAULT '',
  `tags` JSON DEFAULT NULL,
  `view_count` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1:發佈 0:草稿',
  `published_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `news_categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wiki_categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `icon` VARCHAR(50) NOT NULL DEFAULT '',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wiki_articles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `content` LONGTEXT,
  `summary` TEXT,
  `cover_image` VARCHAR(500) NOT NULL DEFAULT '',
  `category_id` INT UNSIGNED DEFAULT NULL,
  `author` VARCHAR(100) NOT NULL DEFAULT '',
  `view_count` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `video_categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `videos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `cover_image` VARCHAR(500) NOT NULL DEFAULT '',
  `video_url` VARCHAR(500) NOT NULL DEFAULT '',
  `category_id` INT UNSIGNED DEFAULT NULL,
  `duration` INT NOT NULL DEFAULT 0,
  `view_count` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 活動與優惠
-- ============================================================

CREATE TABLE IF NOT EXISTS `free_gifts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `cover_image` VARCHAR(500) NOT NULL DEFAULT '',
  `total_count` INT NOT NULL DEFAULT 0,
  `remain_count` INT NOT NULL DEFAULT 0,
  `points_required` INT NOT NULL DEFAULT 0,
  `start_time` DATETIME DEFAULT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(20) NOT NULL DEFAULT 'fixed' COMMENT 'fixed/percent',
  `value` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `min_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total_count` INT NOT NULL DEFAULT 0,
  `used_count` INT NOT NULL DEFAULT 0,
  `start_time` DATETIME DEFAULT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_coupons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `coupon_id` INT UNSIGNED NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'unused' COMMENT 'unused/used/expired',
  `used_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 用戶互動
-- ============================================================

CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `target_type` VARCHAR(50) NOT NULL DEFAULT 'goods' COMMENT 'goods/article/baike',
  `target_id` INT UNSIGNED NOT NULL DEFAULT 0,
  `goods_id` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '兼容旧字段',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`),
  INDEX `idx_user_goods` (`user_id`, `goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `points_log` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `type` VARCHAR(20) NOT NULL DEFAULT 'earn' COMMENT 'earn/spend',
  `description` VARCHAR(500) NOT NULL DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL DEFAULT '',
  `content` TEXT,
  `type` VARCHAR(30) NOT NULL DEFAULT 'system' COMMENT 'system/order/promotion',
  `is_read` TINYINT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- AI 與知識庫
-- ============================================================

CREATE TABLE IF NOT EXISTS `ai_knowledge` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `content` LONGTEXT,
  `category` VARCHAR(50) NOT NULL DEFAULT '',
  `source_type` VARCHAR(20) NOT NULL DEFAULT 'manual',
  `source_url` VARCHAR(500) NOT NULL DEFAULT '',
  `tags` JSON DEFAULT NULL,
  `file_type` VARCHAR(20) NOT NULL DEFAULT '',
  `file_size` INT UNSIGNED NOT NULL DEFAULT 0,
  `chunk_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_qa` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `question` VARCHAR(500) NOT NULL,
  `answer` TEXT,
  `category` VARCHAR(50) NOT NULL DEFAULT '',
  `knowledge_id` INT UNSIGNED DEFAULT NULL,
  `keywords` JSON DEFAULT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_training_tasks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `type` VARCHAR(30) NOT NULL DEFAULT '',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/running/completed/failed',
  `config` JSON DEFAULT NULL,
  `result` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- ============================================================
-- 分銷系統
-- ============================================================

CREATE TABLE IF NOT EXISTS `distribution_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `distributors` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `parent_id` INT UNSIGNED DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL DEFAULT '',
  `phone` VARCHAR(30) NOT NULL DEFAULT '',
  `social_account` VARCHAR(200) NOT NULL DEFAULT '',
  `commission_rate` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  `total_earnings` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `available_earnings` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/approved/rejected/disabled',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 系統設置
-- ============================================================

CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT,
  `group_name` VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '分組: general/payment/notification/email',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_group` (`group_name`),
  INDEX `idx_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 用戶其他
-- ============================================================

CREATE TABLE IF NOT EXISTS `oauth_accounts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `provider` VARCHAR(30) NOT NULL,
  `provider_user_id` VARCHAR(200) NOT NULL,
  `access_token` TEXT,
  `refresh_token` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_provider_user` (`provider`, `provider_user_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_notification_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `order_updates` TINYINT NOT NULL DEFAULT 1,
  `promotions` TINYINT NOT NULL DEFAULT 1,
  `system` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `invoice_no` VARCHAR(50) NOT NULL DEFAULT '',
  `type` VARCHAR(20) NOT NULL DEFAULT 'electronic' COMMENT 'electronic/paper',
  `title` VARCHAR(200) NOT NULL DEFAULT '',
  `tax_no` VARCHAR(50) NOT NULL DEFAULT '',
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/issued/cancelled',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `recharge` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `payment_method` VARCHAR(30) NOT NULL DEFAULT '',
  `payment_no` VARCHAR(100) NOT NULL DEFAULT '',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/completed/failed',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_balance` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `frozen` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 证书表（商品认证证书）
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `goods_id` INT UNSIGNED NOT NULL DEFAULT 0,
  `merchant_id` INT UNSIGNED NOT NULL DEFAULT 0,
  `type` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '证书类型',
  `certificate_no` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '证书编号',
  `issuer` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '颁发机构',
  `status` VARCHAR(20) NOT NULL DEFAULT 'valid' COMMENT 'valid/revoked/expired',
  `valid_until` DATETIME DEFAULT NULL COMMENT '有效期至',
  `verification_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '验证次数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_goods_id` (`goods_id`),
  INDEX `idx_merchant_id` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商家资质证书表
CREATE TABLE IF NOT EXISTS `merchant_certificates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `merchant_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT '',
  `image_url` VARCHAR(500) NOT NULL DEFAULT '',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/approved/rejected',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_merchant_id` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 百科文章表
CREATE TABLE IF NOT EXISTS `baike_articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `slug` VARCHAR(200) NOT NULL COMMENT 'URL标识',
  `category` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '分类',
  `cover_image` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '封面图key',
  `content` LONGTEXT NOT NULL COMMENT '富文本内容',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:0下架,1上架',
  `views` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商品SKU规格表
CREATE TABLE IF NOT EXISTS `goods_skus` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `goods_id` INT UNSIGNED NOT NULL,
  `sku_code` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'SKU编码',
  `specs` JSON NOT NULL COMMENT '规格组合 {"颜色":"红色","尺寸":"大"}',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'SKU售价',
  `original_price` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'SKU原价',
  `stock` INT NOT NULL DEFAULT 0 COMMENT 'SKU库存',
  `image` VARCHAR(500) NOT NULL DEFAULT '' COMMENT 'SKU图片',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '0禁用 1启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_goods_id` (`goods_id`),
  UNIQUE KEY `uk_sku_code` (`sku_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商品规格模板表
CREATE TABLE IF NOT EXISTS `goods_specs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `goods_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL COMMENT '规格名 如颜色/尺寸',
  `values` JSON NOT NULL COMMENT '规格值 ["红色","蓝色","绿色"]',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商家评价表
CREATE TABLE IF NOT EXISTS `merchant_reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `merchant_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `order_id` INT UNSIGNED NOT NULL DEFAULT 0,
  `goods_id` INT UNSIGNED NOT NULL DEFAULT 0,
  `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5 COMMENT '1-5星评分',
  `content` TEXT NOT NULL COMMENT '评价内容',
  `images` JSON COMMENT '评价图片',
  `reply` TEXT COMMENT '商家回复',
  `replied_at` DATETIME COMMENT '回复时间',
  `is_anonymous` TINYINT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '0隐藏 1显示',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_merchant_id` (`merchant_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 多币种支持表
CREATE TABLE IF NOT EXISTS `currencies` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(10) NOT NULL UNIQUE COMMENT '货币代码 CNY/USD/EUR',
  `name` VARCHAR(50) NOT NULL COMMENT '货币名称',
  `symbol` VARCHAR(10) NOT NULL COMMENT '货币符号 ¥/$/€',
  `rate` DECIMAL(12,6) NOT NULL DEFAULT 1 COMMENT '兑人民币汇率',
  `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认货币',
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商品多币种价格表
CREATE TABLE IF NOT EXISTS `goods_prices` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `goods_id` INT UNSIGNED NOT NULL,
  `currency_code` VARCHAR(10) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `original_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_goods_currency` (`goods_id`, `currency_code`),
  INDEX `idx_currency` (`currency_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商品多级分类增强：添加 level 和 path 字段
ALTER TABLE `categories` 
  ADD COLUMN IF NOT EXISTS `level` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '层级 1/2/3',
  ADD COLUMN IF NOT EXISTS `path` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '路径 1/2/3',
  ADD COLUMN IF NOT EXISTS `icon` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '分类图标',
  ADD COLUMN IF NOT EXISTS `image` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '分类图片';

-- 商家统计字段
ALTER TABLE `merchants`
  ADD COLUMN IF NOT EXISTS `avg_rating` DECIMAL(2,1) NOT NULL DEFAULT 5.0 COMMENT '平均评分',
  ADD COLUMN IF NOT EXISTS `review_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '评价数',
  ADD COLUMN IF NOT EXISTS `total_sales` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总销量',
  ADD COLUMN IF NOT EXISTS `level` VARCHAR(20) NOT NULL DEFAULT 'bronze' COMMENT '商家等级 bronze/silver/gold/diamond';

-- ============================================================
-- 缺失列修补 (2024-06-25)
-- ============================================================

-- articles 表（被 /api/articles 使用，但 schema 中缺失）
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL DEFAULT '',
  `content` LONGTEXT,
  `summary` TEXT,
  `cover_image` VARCHAR(500) NOT NULL DEFAULT '',
  `category` VARCHAR(100) NOT NULL DEFAULT '',
  `author` VARCHAR(100) NOT NULL DEFAULT '',
  `source` VARCHAR(200) NOT NULL DEFAULT '',
  `tags` JSON DEFAULT NULL,
  `view_count` INT NOT NULL DEFAULT 0,
  `like_count` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `published_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- admins 表：添加 last_login_at
ALTER TABLE `admins` ADD COLUMN IF NOT EXISTS `last_login_at` DATETIME DEFAULT NULL;

-- news 表：添加缺失列
ALTER TABLE `news` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE `news` ADD COLUMN IF NOT EXISTS `category` VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE `news` ADD COLUMN IF NOT EXISTS `tags` JSON DEFAULT NULL;
ALTER TABLE `news` ADD COLUMN IF NOT EXISTS `published_at` DATETIME DEFAULT NULL;

-- banners 表：添加 position
ALTER TABLE `banners` ADD COLUMN IF NOT EXISTS `position` VARCHAR(50) NOT NULL DEFAULT 'home';

-- 为已有 news 记录补上 published_at
UPDATE `news` SET `published_at` = `created_at` WHERE `published_at` IS NULL AND `status` = 1;

-- browse_history 表
CREATE TABLE IF NOT EXISTS `browse_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `goods_id` INT UNSIGNED NOT NULL,
  `goods_name` VARCHAR(200) NOT NULL DEFAULT '',
  `goods_image` VARCHAR(500) NOT NULL DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_goods_id` (`goods_id`),
  UNIQUE KEY `uk_user_goods` (`user_id`, `goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- favorites 表：添加 target_type 和 target_id
ALTER TABLE `favorites` ADD COLUMN IF NOT EXISTS `target_type` VARCHAR(50) NOT NULL DEFAULT 'goods' AFTER `user_id`;
ALTER TABLE `favorites` ADD COLUMN IF NOT EXISTS `target_id` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `target_type`;
UPDATE `favorites` SET `target_id` = `goods_id`, `target_type` = 'goods' WHERE `target_id` = 0 AND `goods_id` > 0;

SET FOREIGN_KEY_CHECKS = 1;
