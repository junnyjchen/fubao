-- =============================================
-- 符寶網 MySQL 数据库完整迁移脚本
-- 执行方式: 在宝塔 phpMyAdmin 或 MySQL 命令行中执行
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. 用户表
-- =============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL DEFAULT (REPLACE(UUID(), '-', '')),
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` text DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `language` varchar(10) DEFAULT 'zh-TW',
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_email_idx` (`email`),
  KEY `users_phone_idx` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. 管理员用户表
-- =============================================
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'admin' NOT NULL,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `last_login_ip` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `admin_users_username_idx` (`username`),
  KEY `admin_users_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认管理员账户
-- 密码: admin123 (bcrypt加密)
INSERT INTO `admin_users` (`username`, `password`, `name`, `role`, `status`) VALUES
('admin', '$2b$10$oQEZ5ju13tOVFg82ccMDnOGDH7LE/Xt4o45GXRumvCvAR5j4HJfhO', '系統管理員', 'super_admin', 1)
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `name` = VALUES(`name`), `role` = VALUES(`role`);

-- =============================================
-- 3. OAuth提供商表
-- =============================================
CREATE TABLE IF NOT EXISTS `oauth_providers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `client_secret` text DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT 0 NOT NULL,
  `config` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `provider` (`provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. 用户OAuth账号表
-- =============================================
CREATE TABLE IF NOT EXISTS `user_oauth_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_user_id` varchar(255) NOT NULL,
  `access_token` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_oauth_accounts_user_id_idx` (`user_id`),
  UNIQUE KEY `user_oauth_accounts_provider_user_idx` (`provider`,`provider_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. 收货地址表
-- =============================================
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `province` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `district` varchar(50) NOT NULL,
  `address` varchar(200) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `addresses_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. 分类表
-- =============================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `icon` varchar(500) DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sort` int DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_parent_id_idx` (`parent_id`),
  KEY `categories_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. 商品表
-- =============================================
CREATE TABLE IF NOT EXISTS `goods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `merchant_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT 0,
  `images` text DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `specs` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_recommended` tinyint(1) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `sort` int DEFAULT 0,
  `sales` int DEFAULT 0,
  `views` int DEFAULT 0,
  `likes` int DEFAULT 0,
  `rating` decimal(3,2) DEFAULT '5.00',
  `reviews_count` int DEFAULT 0,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `goods_slug_unique` (`slug`),
  KEY `goods_merchant_id_idx` (`merchant_id`),
  KEY `goods_category_id_idx` (`category_id`),
  KEY `goods_slug_idx` (`slug`),
  KEY `goods_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. 订单表
-- =============================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `merchant_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `shipping_fee` decimal(10,2) DEFAULT '0.00',
  `actual_amount` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'pending' NOT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT 'unpaid' NOT NULL,
  `payment_time` datetime DEFAULT NULL,
  `shipping_name` varchar(50) DEFAULT NULL,
  `shipping_phone` varchar(20) DEFAULT NULL,
  `shipping_province` varchar(50) DEFAULT NULL,
  `shipping_city` varchar(50) DEFAULT NULL,
  `shipping_district` varchar(50) DEFAULT NULL,
  `shipping_address` varchar(200) DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `tracking_company` varchar(100) DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `received_at` datetime DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `orders_user_id_idx` (`user_id`),
  KEY `orders_merchant_id_idx` (`merchant_id`),
  KEY `orders_order_no_idx` (`order_no`),
  KEY `orders_status_idx` (`status`),
  KEY `orders_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. 订单商品表
-- =============================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `goods_id` int NOT NULL,
  `goods_name` varchar(200) NOT NULL,
  `goods_image` varchar(500) DEFAULT NULL,
  `specs` json DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_idx` (`order_id`),
  KEY `order_items_goods_id_idx` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. 购物车表
-- =============================================
CREATE TABLE IF NOT EXISTS `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `goods_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `specs` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carts_user_id_idx` (`user_id`),
  KEY `carts_goods_id_idx` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 11. 收藏表
-- =============================================
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `goods_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_user_goods_unique` (`user_id`,`goods_id`),
  KEY `favorites_user_id_idx` (`user_id`),
  KEY `favorites_goods_id_idx` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 12. 商家表
-- =============================================
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` int DEFAULT 1,
  `logo` varchar(500) DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `certification_level` int DEFAULT 1,
  `contact_name` varchar(50) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `province` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '5.00',
  `total_sales` int DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `merchants_status_idx` (`status`),
  KEY `merchants_type_idx` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 13. 文章表
-- =============================================
CREATE TABLE IF NOT EXISTS `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `author` varchar(50) DEFAULT NULL,
  `author_id` varchar(36) DEFAULT NULL,
  `views` int DEFAULT 0,
  `likes` int DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `sort` int DEFAULT 0,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_unique` (`slug`),
  KEY `articles_slug_idx` (`slug`),
  KEY `articles_category_idx` (`category`),
  KEY `articles_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 14. 证书表
-- =============================================
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `certificate_no` varchar(50) NOT NULL,
  `goods_id` int DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `merchant_id` int DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `issued_at` datetime DEFAULT NULL,
  `valid_from` datetime DEFAULT NULL,
  `valid_to` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active' NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_no` (`certificate_no`),
  KEY `certificates_goods_id_idx` (`goods_id`),
  KEY `certificates_user_id_idx` (`user_id`),
  KEY `certificates_merchant_id_idx` (`merchant_id`),
  KEY `certificates_certificate_no_idx` (`certificate_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 15. 优惠券表
-- =============================================
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(20) DEFAULT 'fixed' NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_amount` decimal(10,2) DEFAULT '0.00',
  `max_discount` decimal(10,2) DEFAULT NULL,
  `total_count` int DEFAULT NULL,
  `used_count` int DEFAULT 0,
  `per_user_limit` int DEFAULT 1,
  `valid_from` datetime NOT NULL,
  `valid_to` datetime NOT NULL,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `coupons_code_idx` (`code`),
  KEY `coupons_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 16. 用户优惠券表
-- =============================================
CREATE TABLE IF NOT EXISTS `user_coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `coupon_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_coupons_user_id_idx` (`user_id`),
  KEY `user_coupons_coupon_id_idx` (`coupon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 17. 用户余额表
-- =============================================
CREATE TABLE IF NOT EXISTS `user_balances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `frozen_balance` decimal(10,2) DEFAULT '0.00',
  `total_recharge` decimal(10,2) DEFAULT '0.00',
  `total_withdraw` decimal(10,2) DEFAULT '0.00',
  `total_expense` decimal(10,2) DEFAULT '0.00',
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `user_balances_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 18. 充值记录表
-- =============================================
CREATE TABLE IF NOT EXISTS `recharges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `order_no` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT 'pending' NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `recharges_user_id_idx` (`user_id`),
  KEY `recharges_order_no_idx` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 19. 余额变动记录表
-- =============================================
CREATE TABLE IF NOT EXISTS `balance_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `type` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance_before` decimal(10,2) NOT NULL,
  `balance_after` decimal(10,2) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `related_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `balance_logs_user_id_idx` (`user_id`),
  KEY `balance_logs_type_idx` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 20. 视频表
-- =============================================
CREATE TABLE IF NOT EXISTS `videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `duration` int DEFAULT 0,
  `category_id` int DEFAULT NULL,
  `author` varchar(50) DEFAULT NULL,
  `author_id` varchar(36) DEFAULT NULL,
  `views` int DEFAULT 0,
  `likes` int DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `sort` int DEFAULT 0,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `videos_slug_unique` (`slug`),
  KEY `videos_category_id_idx` (`category_id`),
  KEY `videos_slug_idx` (`slug`),
  KEY `videos_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 21. 新闻表
-- =============================================
CREATE TABLE IF NOT EXISTS `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `author` varchar(50) DEFAULT NULL,
  `author_id` varchar(36) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `views` int DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `sort` int DEFAULT 0,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `news_slug_unique` (`slug`),
  KEY `news_slug_idx` (`slug`),
  KEY `news_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 22. 轮播图表
-- =============================================
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `image` varchar(500) NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `link_type` varchar(20) DEFAULT 'url',
  `position` varchar(50) DEFAULT 'home',
  `sort` int DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `banners_position_idx` (`position`),
  KEY `banners_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 23. 公告表
-- =============================================
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `type` varchar(20) DEFAULT 'info',
  `is_top` tinyint(1) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 24. 会员申请表
-- =============================================
CREATE TABLE IF NOT EXISTS `merchant_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` int DEFAULT 1,
  `logo` varchar(500) DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `contact_name` varchar(50) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `province` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `license_images` text DEFAULT NULL,
  `id_card_images` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending' NOT NULL,
  `reject_reason` text DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `merchant_applications_user_id_idx` (`user_id`),
  KEY `merchant_applications_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 25. 工单表
-- =============================================
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_no` varchar(50) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `type` varchar(20) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `images` text DEFAULT NULL,
  `priority` varchar(20) DEFAULT 'normal',
  `status` varchar(20) DEFAULT 'open' NOT NULL,
  `assigned_to` int DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_no` (`ticket_no`),
  KEY `tickets_user_id_idx` (`user_id`),
  KEY `tickets_status_idx` (`status`),
  KEY `tickets_type_idx` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 26. 工单回复表
-- =============================================
CREATE TABLE IF NOT EXISTS `ticket_replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `content` text NOT NULL,
  `images` text DEFAULT NULL,
  `is_internal` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_replies_ticket_id_idx` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 27. 评价表
-- =============================================
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `goods_id` int NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `rating` int NOT NULL,
  `content` text DEFAULT NULL,
  `images` text DEFAULT NULL,
  `reply` text DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_goods_id_idx` (`goods_id`),
  KEY `reviews_order_id_idx` (`order_id`),
  KEY `reviews_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 28. 退款表
-- =============================================
CREATE TABLE IF NOT EXISTS `refunds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `user_id` int NOT NULL,
  `merchant_id` int NOT NULL,
  `type` varchar(20) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `images` text DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending' NOT NULL,
  `merchant_reply` text DEFAULT NULL,
  `admin_reply` text DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `tracking_company` varchar(100) DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `refunds_order_id_idx` (`order_id`),
  KEY `refunds_user_id_idx` (`user_id`),
  KEY `refunds_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 29. 关键词表
-- =============================================
CREATE TABLE IF NOT EXISTS `search_keywords` (
  `id` int NOT NULL AUTO_INCREMENT,
  `keyword` varchar(100) NOT NULL,
  `count` int DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 30. 浏览历史表
-- =============================================
CREATE TABLE IF NOT EXISTS `browse_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `goods_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `browse_history_user_id_idx` (`user_id`),
  KEY `browse_history_goods_id_idx` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 31. 会员用户表
-- =============================================
CREATE TABLE IF NOT EXISTS `merchant_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `merchant_id` int NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int DEFAULT 1 NOT NULL,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `merchant_users_merchant_id_idx` (`merchant_id`),
  KEY `merchant_users_username_idx` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 32. 用户签到表
-- =============================================
CREATE TABLE IF NOT EXISTS `user_signins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sign_date` varchar(10) NOT NULL,
  `continuous_days` int DEFAULT 1,
  `points_earned` int DEFAULT 5,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_signins_date` (`sign_date`),
  KEY `idx_user_signins_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 33. AI配置表
-- =============================================
CREATE TABLE IF NOT EXISTS `ai_configurations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `api_key` text DEFAULT NULL,
  `api_url` varchar(500) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ai_configurations_provider_idx` (`provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 34. AI生成文章表
-- =============================================
CREATE TABLE IF NOT EXISTS `ai_generated_articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `source_language` varchar(20) DEFAULT NULL,
  `target_language` varchar(20) DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'draft' NOT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ai_generated_articles_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 35. 新闻源表
-- =============================================
CREATE TABLE IF NOT EXISTS `news_sources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `url` varchar(500) NOT NULL,
  `keywords` text DEFAULT NULL,
  `language` varchar(20) DEFAULT NULL,
  `target_language` varchar(20) DEFAULT 'zh-TW',
  `is_enabled` tinyint(1) DEFAULT 1,
  `last_fetch_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `news_sources_is_enabled_idx` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 36. 自动发布任务表
-- =============================================
CREATE TABLE IF NOT EXISTS `auto_publish_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `cron_expression` varchar(50) NOT NULL,
  `source_ids` text DEFAULT NULL,
  `ai_config_id` int DEFAULT NULL,
  `is_enabled` tinyint(1) DEFAULT 1,
  `last_run_at` datetime DEFAULT NULL,
  `next_run_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `auto_publish_tasks_is_enabled_idx` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 37. 分享表
-- =============================================
CREATE TABLE IF NOT EXISTS `shares` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `type` varchar(20) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `goods_id` int DEFAULT NULL,
  `poster_url` varchar(500) DEFAULT NULL,
  `share_code` varchar(50) NOT NULL,
  `clicks` int DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `share_code` (`share_code`),
  KEY `shares_user_id_idx` (`user_id`),
  KEY `shares_share_code_idx` (`share_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 38. 页面区块表
-- =============================================
CREATE TABLE IF NOT EXISTS `page_blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `config` json DEFAULT NULL,
  `sort` int DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `page_blocks_page_idx` (`page`),
  KEY `page_blocks_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 39. 反馈表
-- =============================================
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `images` text DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending' NOT NULL,
  `reply` text DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `feedback_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 40. 分销表
-- =============================================
CREATE TABLE IF NOT EXISTS `distributions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `level` int DEFAULT 1,
  `total_commission` decimal(10,2) DEFAULT '0.00',
  `available_commission` decimal(10,2) DEFAULT '0.00',
  `withdrawn_commission` decimal(10,2) DEFAULT '0.00',
  `team_size` int DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `distributions_user_id_idx` (`user_id`),
  KEY `distributions_parent_id_idx` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 41. 分销佣金记录表
-- =============================================
CREATE TABLE IF NOT EXISTS `distribution_commissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `order_id` int NOT NULL,
  `level` int NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'pending' NOT NULL,
  `settled_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `distribution_commissions_user_id_idx` (`user_id`),
  KEY `distribution_commissions_order_id_idx` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 42. 提现记录表
-- =============================================
CREATE TABLE IF NOT EXISTS `withdraw_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `bank_holder` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending' NOT NULL,
  `reject_reason` text DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `withdraw_requests_user_id_idx` (`user_id`),
  KEY `withdraw_requests_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 43. 积分商品表
-- =============================================
CREATE TABLE IF NOT EXISTS `points_goods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `points_price` int NOT NULL,
  `stock` int DEFAULT 0,
  `exchanged_count` int DEFAULT 0,
  `status` tinyint(1) DEFAULT 1 NOT NULL,
  `sort` int DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `points_goods_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 44. 积分兑换记录表
-- =============================================
CREATE TABLE IF NOT EXISTS `points_exchange_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `goods_id` int NOT NULL,
  `points_amount` int NOT NULL,
  `status` varchar(20) DEFAULT 'pending' NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `points_exchange_logs_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 45. 通知表
-- =============================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text DEFAULT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_idx` (`user_id`),
  KEY `notifications_is_read_idx` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 46. 发票表
-- =============================================
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `order_id` int DEFAULT NULL,
  `type` varchar(20) DEFAULT 'personal' NOT NULL,
  `title` varchar(200) NOT NULL,
  `tax_number` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'pending' NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoices_user_id_idx` (`user_id`),
  KEY `invoices_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 完成
-- =============================================
SET FOREIGN_KEY_CHECKS = 1;

-- 插入测试用户（可选）
INSERT INTO `users` (`id`, `email`, `phone`, `password`, `name`, `status`) VALUES
('test-user-001', 'test@example.com', '13800138000', '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '測試用戶', 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);
