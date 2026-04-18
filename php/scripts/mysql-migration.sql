-- =====================================================
-- 符寶網 MySQL 数据库完整迁移脚本
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 管理员用户表
-- ----------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码（加密）',
  `name` varchar(50) DEFAULT NULL COMMENT '姓名',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `role` enum('super_admin','admin') NOT NULL DEFAULT 'admin' COMMENT '角色',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `last_login_at` datetime DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 默认管理员账户
INSERT INTO `admin_users` (`username`, `password`, `name`, `role`, `status`) VALUES
('admin', '$2b$10$MBVN7lKa4gP/htlqZP.rN.G0qrqlpx9HAbVX9y/dhK.tD4QMfVvRy', '管理员', 'super_admin', 1);

-- ----------------------------
-- 2. 用户表
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL COMMENT '用户名',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `password` varchar(255) DEFAULT NULL COMMENT '密码',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `gender` enum('unknown','male','female') NOT NULL DEFAULT 'unknown' COMMENT '性别',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `language` varchar(10) DEFAULT 'zh-TW' COMMENT '语言',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态',
  `last_login_at` datetime DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_phone` (`phone`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- 3. OAuth账号绑定表
-- ----------------------------
DROP TABLE IF EXISTS `user_oauth_accounts`;
CREATE TABLE `user_oauth_accounts` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `provider` varchar(20) NOT NULL COMMENT '提供商：google, facebook, wechat, x',
  `provider_user_id` varchar(100) NOT NULL COMMENT '第三方用户ID',
  `access_token` text COMMENT '访问令牌',
  `refresh_token` text COMMENT '刷新令牌',
  `expires_at` datetime DEFAULT NULL COMMENT '过期时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_provider_user` (`provider`, `provider_user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `user_oauth_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='OAuth账号绑定表';

-- ----------------------------
-- 4. 分类表
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '父分类ID',
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `icon` varchar(255) DEFAULT NULL COMMENT '图标',
  `cover` varchar(255) DEFAULT NULL COMMENT '封面图',
  `description` text COMMENT '描述',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- 初始分类数据
INSERT INTO `categories` (`name`, `icon`, `sort`, `status`) VALUES
('符箓', 'fu', 100, 1),
('法器', 'faqi', 90, 1),
('摆件', 'baijian', 80, 1),
('风水用品', 'fengshui', 70, 1);

-- ----------------------------
-- 5. 商家表
-- ----------------------------
DROP TABLE IF EXISTS `merchants`;
CREATE TABLE `merchants` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `name` varchar(100) NOT NULL COMMENT '商家名称',
  `logo` varchar(255) DEFAULT NULL COMMENT 'Logo',
  `banner` varchar(255) DEFAULT NULL COMMENT '横幅图',
  `description` text COMMENT '描述',
  `contact_phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `address` varchar(255) DEFAULT NULL COMMENT '地址',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `reason` varchar(255) DEFAULT NULL COMMENT '拒绝原因',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `merchants_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家表';

-- ----------------------------
-- 6. 商品表
-- ----------------------------
DROP TABLE IF EXISTS `goods`;
CREATE TABLE `goods` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` int(11) UNSIGNED NOT NULL COMMENT '分类ID',
  `merchant_id` int(11) UNSIGNED DEFAULT NULL COMMENT '商家ID',
  `name` varchar(200) NOT NULL COMMENT '商品名称',
  `cover` varchar(255) DEFAULT NULL COMMENT '封面图',
  `images` json DEFAULT NULL COMMENT '图片列表',
  `description` text COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `stock` int(11) NOT NULL DEFAULT 0 COMMENT '库存',
  `sales` int(11) NOT NULL DEFAULT 0 COMMENT '销量',
  `views` int(11) NOT NULL DEFAULT 0 COMMENT '浏览量',
  `specs` json DEFAULT NULL COMMENT '规格',
  `tags` json DEFAULT NULL COMMENT '标签',
  `is_featured` tinyint(1) NOT NULL DEFAULT 0 COMMENT '精选',
  `is_recommended` tinyint(1) NOT NULL DEFAULT 0 COMMENT '推荐',
  `rating` decimal(2,1) NOT NULL DEFAULT 5.0 COMMENT '评分',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：0下架 1上架',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_merchant` (`merchant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- ----------------------------
-- 7. 收货地址表
-- ----------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `name` varchar(50) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `province` varchar(50) NOT NULL COMMENT '省份',
  `city` varchar(50) NOT NULL COMMENT '城市',
  `district` varchar(50) DEFAULT NULL COMMENT '区县',
  `address` varchar(255) NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '默认地址',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';

-- ----------------------------
-- 8. 购物车表
-- ----------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `goods_id` int(11) UNSIGNED NOT NULL COMMENT '商品ID',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT '数量',
  `specs` json DEFAULT NULL COMMENT '规格',
  `specs_hash` varchar(32) DEFAULT NULL COMMENT '规格哈希',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- ----------------------------
-- 9. 收藏表
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `goods_id` int(11) UNSIGNED NOT NULL COMMENT '商品ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_goods` (`user_id`, `goods_id`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- ----------------------------
-- 10. 优惠券表
-- ----------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '优惠券名称',
  `type` enum('fixed','percent') NOT NULL COMMENT '类型：fixed固定金额, percent百分比',
  `value` decimal(10,2) NOT NULL COMMENT '优惠值',
  `min_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '最低消费金额',
  `max_discount` decimal(10,2) DEFAULT NULL COMMENT '最高优惠金额',
  `total` int(11) NOT NULL COMMENT '发放总数',
  `remain` int(11) NOT NULL COMMENT '剩余数量',
  `valid_from` datetime NOT NULL COMMENT '开始时间',
  `valid_to` datetime NOT NULL COMMENT '结束时间',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';

-- ----------------------------
-- 11. 用户优惠券表
-- ----------------------------
DROP TABLE IF EXISTS `user_coupons`;
CREATE TABLE `user_coupons` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `coupon_id` int(11) UNSIGNED NOT NULL COMMENT '优惠券ID',
  `order_id` int(11) UNSIGNED DEFAULT NULL COMMENT '订单ID',
  `used_at` datetime DEFAULT NULL COMMENT '使用时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_coupon_id` (`coupon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';

-- ----------------------------
-- 12. 订单表
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) NOT NULL COMMENT '订单号',
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '商品总金额',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '运费',
  `actual_amount` decimal(10,2) NOT NULL COMMENT '实付金额',
  `status` enum('pending','paid','processing','shipped','delivering','delivered','completed','cancelled') NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `payment_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid' COMMENT '支付状态',
  `payment_method` varchar(20) DEFAULT NULL COMMENT '支付方式',
  `paid_at` datetime DEFAULT NULL COMMENT '支付时间',
  `shipping_name` varchar(50) DEFAULT NULL COMMENT '收货人',
  `shipping_phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `shipping_province` varchar(50) DEFAULT NULL COMMENT '省份',
  `shipping_city` varchar(50) DEFAULT NULL COMMENT '城市',
  `shipping_district` varchar(50) DEFAULT NULL COMMENT '区县',
  `shipping_address` varchar(255) DEFAULT NULL COMMENT '详细地址',
  `tracking_no` varchar(100) DEFAULT NULL COMMENT '物流单号',
  `shipping_company` varchar(50) DEFAULT NULL COMMENT '物流公司',
  `shipped_at` datetime DEFAULT NULL COMMENT '发货时间',
  `received_at` datetime DEFAULT NULL COMMENT '收货时间',
  `completed_at` datetime DEFAULT NULL COMMENT '完成时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- ----------------------------
-- 13. 订单商品表
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` int(11) UNSIGNED NOT NULL COMMENT '订单ID',
  `goods_id` int(11) UNSIGNED NOT NULL COMMENT '商品ID',
  `goods_name` varchar(200) NOT NULL COMMENT '商品名称',
  `goods_image` varchar(255) DEFAULT NULL COMMENT '商品图片',
  `specs` json DEFAULT NULL COMMENT '规格',
  `price` decimal(10,2) NOT NULL COMMENT '单价',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT '数量',
  `subtotal` decimal(10,2) NOT NULL COMMENT '小计',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品表';

-- ----------------------------
-- 14. 证书表
-- ----------------------------
DROP TABLE IF EXISTS `certificates`;
CREATE TABLE `certificates` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` int(11) UNSIGNED DEFAULT NULL COMMENT '订单ID',
  `order_item_id` int(11) UNSIGNED DEFAULT NULL COMMENT '订单商品ID',
  `goods_id` int(11) UNSIGNED NOT NULL COMMENT '商品ID',
  `user_id` int(11) UNSIGNED DEFAULT NULL COMMENT '用户ID',
  `certificate_no` varchar(64) NOT NULL COMMENT '证书编号',
  `name` varchar(100) DEFAULT NULL COMMENT '物品名称',
  `material` varchar(100) DEFAULT NULL COMMENT '材质',
  `dimensions` varchar(100) DEFAULT NULL COMMENT '尺寸',
  `origin` varchar(100) DEFAULT NULL COMMENT '产地',
  `master_name` varchar(50) DEFAULT NULL COMMENT '制符/法师',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content` text COMMENT '证书内容',
  `image` varchar(255) DEFAULT NULL COMMENT '证书图片',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_certificate_no` (`certificate_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='证书表';

-- ----------------------------
-- 15. 文章表
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- ----------------------------
-- 16. Banner表
-- ----------------------------
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '标题',
  `image` varchar(255) NOT NULL COMMENT '图片',
  `link` varchar(255) DEFAULT NULL COMMENT '链接',
  `type` enum('image','video') NOT NULL DEFAULT 'image' COMMENT '类型',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Banner表';

-- 初始Banner数据
INSERT INTO `banners` (`title`, `image`, `link`, `sort`, `status`) VALUES
('符寶網开业大吉', '/uploads/banners/banner1.jpg', '/goods', 100, 1),
('精选符箓专区', '/uploads/banners/banner2.jpg', '/goods?category=1', 90, 1);

-- ----------------------------
-- 17. 短信验证码表
-- ----------------------------
DROP TABLE IF EXISTS `sms_codes`;
CREATE TABLE `sms_codes` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `code` varchar(10) NOT NULL COMMENT '验证码',
  `type` varchar(20) NOT NULL COMMENT '类型：login, register, bind',
  `used` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已使用',
  `expire_at` datetime NOT NULL COMMENT '过期时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_phone_code` (`phone`, `code`),
  KEY `idx_expire` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信验证码表';

-- ----------------------------
-- 18. OAuth提供商配置表
-- ----------------------------
DROP TABLE IF EXISTS `oauth_providers`;
CREATE TABLE `oauth_providers` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `provider` varchar(20) NOT NULL COMMENT '提供商',
  `name` varchar(50) NOT NULL COMMENT '名称',
  `client_id` varchar(255) DEFAULT NULL COMMENT 'Client ID',
  `client_secret` varchar(255) DEFAULT NULL COMMENT 'Client Secret',
  `enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_provider` (`provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='OAuth提供商配置表';

-- ----------------------------
-- 19. 行为日志表
-- ----------------------------
DROP TABLE IF EXISTS `behavior_logs`;
CREATE TABLE `behavior_logs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED DEFAULT NULL COMMENT '用户ID',
  `event_type` varchar(50) NOT NULL COMMENT '事件类型',
  `event_data` json DEFAULT NULL COMMENT '事件数据',
  `page_url` varchar(500) DEFAULT NULL COMMENT '页面URL',
  `user_agent` varchar(500) DEFAULT NULL COMMENT 'User Agent',
  `ip` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行为日志表';

-- ----------------------------
-- 20. AI新闻配置表
-- ----------------------------
DROP TABLE IF EXISTS `ai_configurations`;
CREATE TABLE `ai_configurations` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '配置名称',
  `provider` enum('doubao','coze','deepseek','kimi','glm','qwen') NOT NULL COMMENT 'AI提供商',
  `api_key` varchar(255) DEFAULT NULL COMMENT 'API Key',
  `model` varchar(100) DEFAULT NULL COMMENT '模型名称',
  `base_url` varchar(255) DEFAULT NULL COMMENT 'API地址',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI配置表';

-- ----------------------------
-- 21. 新闻源表
-- ----------------------------
DROP TABLE IF EXISTS `news_sources`;
CREATE TABLE `news_sources` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '名称',
  `url` varchar(500) NOT NULL COMMENT 'RSS或API地址',
  `type` enum('rss','api') NOT NULL DEFAULT 'rss' COMMENT '类型',
  `keywords` json DEFAULT NULL COMMENT '关键词',
  `source_lang` varchar(10) NOT NULL DEFAULT 'en' COMMENT '源语言',
  `target_lang` varchar(10) NOT NULL DEFAULT 'zh' COMMENT '目标语言',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='新闻源表';

-- ----------------------------
-- 22. 自动发布任务表
-- ----------------------------
DROP TABLE IF EXISTS `auto_publish_tasks`;
CREATE TABLE `auto_publish_tasks` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '任务名称',
  `source_id` int(11) UNSIGNED DEFAULT NULL COMMENT '新闻源ID',
  `ai_config_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'AI配置ID',
  `cron_expression` varchar(50) NOT NULL COMMENT 'Cron表达式',
  `status` enum('active','paused') NOT NULL DEFAULT 'active' COMMENT '状态',
  `last_run_at` datetime DEFAULT NULL COMMENT '上次运行时间',
  `next_run_at` datetime DEFAULT NULL COMMENT '下次运行时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_source_id` (`source_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='定时任务表';

-- ----------------------------
-- 23. AI生成文章表
-- ----------------------------
DROP TABLE IF EXISTS `ai_generated_articles`;
CREATE TABLE `ai_generated_articles` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `original_content` text COMMENT '原文内容',
  `translated_content` text COMMENT '翻译内容',
  `published_content` text COMMENT '发布内容',
  `cover` varchar(255) DEFAULT NULL COMMENT '封面图',
  `source_url` varchar(500) DEFAULT NULL COMMENT '原文链接',
  `source_name` varchar(100) DEFAULT NULL COMMENT '来源名称',
  `ai_config_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'AI配置ID',
  `article_id` int(11) UNSIGNED DEFAULT NULL COMMENT '发布的文章ID',
  `status` enum('pending','translating','translated','publishing','published','failed') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `error_message` text COMMENT '错误信息',
  `published_at` datetime DEFAULT NULL COMMENT '发布时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI生成文章表';

-- ----------------------------
-- 24. 通知表
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `type` enum('system','order','promotion','activity') NOT NULL DEFAULT 'system' COMMENT '类型',
  `data` json DEFAULT NULL COMMENT '附加数据',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已读',
  `read_at` datetime DEFAULT NULL COMMENT '阅读时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 新增表结构
-- =====================================================

-- ----------------------------
-- 25. AI聊天日志表
-- ----------------------------
DROP TABLE IF EXISTS `ai_chat_logs`;
CREATE TABLE `ai_chat_logs` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `config_id` int(11) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'AI配置ID',
  `session_id` varchar(100) DEFAULT NULL COMMENT '会话ID',
  `user_id` int(11) UNSIGNED DEFAULT NULL COMMENT '用户ID',
  `role` enum('system','user','assistant') NOT NULL COMMENT '角色',
  `content` text NOT NULL COMMENT '消息内容',
  `input_tokens` int(11) NOT NULL DEFAULT 0 COMMENT '输入Token数',
  `output_tokens` int(11) NOT NULL DEFAULT 0 COMMENT '输出Token数',
  `model` varchar(100) DEFAULT NULL COMMENT '使用的模型',
  `status` enum('success','error') NOT NULL DEFAULT 'success' COMMENT '状态',
  `error_code` varchar(50) DEFAULT NULL COMMENT '错误码',
  `latency_ms` float NOT NULL DEFAULT 0 COMMENT '响应延迟(毫秒)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI聊天日志表';

-- ----------------------------
-- 26. AI配置表
-- ----------------------------
DROP TABLE IF EXISTS `ai_configurations`;
CREATE TABLE `ai_configurations` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '配置名称',
  `model` varchar(100) NOT NULL COMMENT '模型名称',
  `api_key` varchar(255) DEFAULT NULL COMMENT 'API密钥',
  `api_endpoint` varchar(255) DEFAULT NULL COMMENT 'API端点',
  `system_prompt` text COMMENT '系统提示词',
  `temperature` float NOT NULL DEFAULT 0.7 COMMENT '温度参数',
  `max_tokens` int(11) NOT NULL DEFAULT 2000 COMMENT '最大Token数',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI配置表';

-- 插入默认配置
INSERT INTO `ai_configurations` (`name`, `model`, `system_prompt`, `temperature`, `max_tokens`, `is_active`) VALUES
('符寶默認助手', 'doubao-seed-1-6-251015', '你是符寶網的AI助手，專注於玄門文化科普與服務...', 0.7, 2000, 1);

-- ----------------------------
-- 27. AI训练知识库表
-- ----------------------------
DROP TABLE IF EXISTS `ai_training_knowledge`;
CREATE TABLE `ai_training_knowledge` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `category` varchar(50) DEFAULT 'general' COMMENT '分类：culture文化/product商品/usage使用/fortune命理/general通用',
  `source_type` enum('text','url','document','qa') NOT NULL DEFAULT 'text' COMMENT '来源类型',
  `source_url` varchar(500) DEFAULT NULL COMMENT '来源URL',
  `tags` json DEFAULT NULL COMMENT '标签',
  `status` enum('draft','training','ready','archived') NOT NULL DEFAULT 'draft' COMMENT '状态',
  `embedding_status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending' '向量化状态',
  `embedding_vector` text COMMENT '向量化数据(JSON)',
  `usage_count` int(11) NOT NULL DEFAULT 0 COMMENT '使用次数',
  `accuracy_score` float DEFAULT NULL COMMENT '准确率评分',
  `admin_id` int(11) UNSIGNED DEFAULT NULL COMMENT '创建管理员ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_embedding_status` (`embedding_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI训练知识库表';

-- ----------------------------
-- 28. AI训练任务表
-- ----------------------------
DROP TABLE IF EXISTS `ai_training_tasks`;
CREATE TABLE `ai_training_tasks` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '任务名称',
  `description` text COMMENT '任务描述',
  `type` enum('full','incremental','fine_tune') NOT NULL DEFAULT 'incremental' COMMENT '训练类型',
  `knowledge_ids` json DEFAULT NULL COMMENT '关联知识库ID列表',
  `model` varchar(100) DEFAULT NULL COMMENT '目标模型',
  `status` enum('pending','running','completed','failed','cancelled') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `progress` int(11) NOT NULL DEFAULT 0 COMMENT '进度百分比',
  `total_records` int(11) NOT NULL DEFAULT 0 COMMENT '总记录数',
  `processed_records` int(11) NOT NULL DEFAULT 0 COMMENT '已处理记录数',
  `failed_records` int(11) NOT NULL DEFAULT 0 COMMENT '失败记录数',
  `error_message` text COMMENT '错误信息',
  `started_at` datetime DEFAULT NULL COMMENT '开始时间',
  `completed_at` datetime DEFAULT NULL COMMENT '完成时间',
  `admin_id` int(11) UNSIGNED DEFAULT NULL COMMENT '创建管理员ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI训练任务表';

-- ----------------------------
-- 29. AI问答对表
-- ----------------------------
DROP TABLE IF EXISTS `ai_qa_pairs`;
CREATE TABLE `ai_qa_pairs` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `knowledge_id` int(11) UNSIGNED DEFAULT NULL COMMENT '关联知识库ID',
  `question` text NOT NULL COMMENT '问题',
  `answer` text NOT NULL COMMENT '回答',
  `keywords` json DEFAULT NULL COMMENT '关键词',
  `category` varchar(50) DEFAULT 'general' COMMENT '分类',
  `usage_count` int(11) NOT NULL DEFAULT 0 COMMENT '使用次数',
  `accuracy` float DEFAULT NULL COMMENT '准确率',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_knowledge_id` (`knowledge_id`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI问答对表';

-- ----------------------------
-- 30. 消息表（私信/系统消息）
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '接收用户ID',
  `from_user_id` int(11) UNSIGNED NOT NULL COMMENT '发送用户ID（系统消息时为0）',
  `type` enum('system','order','chat','activity') NOT NULL DEFAULT 'system' COMMENT '类型',
  `msg_type` enum('text','image','goods') NOT NULL DEFAULT 'text' COMMENT '消息类型',
  `title` varchar(200) DEFAULT NULL COMMENT '标题（系统消息）',
  `content` text NOT NULL COMMENT '内容',
  `data` json DEFAULT NULL COMMENT '附加数据',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已读',
  `read_at` datetime DEFAULT NULL COMMENT '阅读时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_from_user_id` (`from_user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- ----------------------------
-- 26. 反馈表
-- ----------------------------
DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE `feedbacks` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `type` enum('suggestion','complaint','bug','other') NOT NULL DEFAULT 'other' COMMENT '类型',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `images` json DEFAULT NULL COMMENT '图片',
  `contact` varchar(100) DEFAULT NULL COMMENT '联系方式',
  `status` enum('pending','processing','resolved','rejected') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `admin_reply` text DEFAULT NULL COMMENT '管理员回复',
  `replied_at` datetime DEFAULT NULL COMMENT '回复时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈表';

-- ----------------------------
-- 27. 反馈回复表
-- ----------------------------
DROP TABLE IF EXISTS `feedback_replies`;
CREATE TABLE `feedback_replies` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `feedback_id` int(11) UNSIGNED NOT NULL COMMENT '反馈ID',
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '回复用户ID',
  `content` text NOT NULL COMMENT '回复内容',
  `is_admin` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否管理员回复',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_feedback_id` (`feedback_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈回复表';

-- ----------------------------
-- 28. FAQ表
-- ----------------------------
DROP TABLE IF EXISTS `faq`;
CREATE TABLE `faq` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL DEFAULT 'other' COMMENT '分类',
  `question` varchar(500) NOT NULL COMMENT '问题',
  `answer` text NOT NULL COMMENT '答案',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `view_count` int(11) NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `is_published` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否发布',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='FAQ表';

-- ----------------------------
-- 29. 举报表
-- ----------------------------
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '举报用户ID',
  `type` enum('goods','merchant','user','article') NOT NULL COMMENT '被举报类型',
  `target_id` int(11) UNSIGNED NOT NULL COMMENT '被举报对象ID',
  `reason` varchar(50) NOT NULL COMMENT '举报原因',
  `description` text NOT NULL COMMENT '详细描述',
  `evidence` json DEFAULT NULL COMMENT '证据图片',
  `status` enum('pending','processing','resolved','rejected') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `handle_result` text DEFAULT NULL COMMENT '处理结果',
  `handled_by` int(11) UNSIGNED DEFAULT NULL COMMENT '处理人ID',
  `handled_at` datetime DEFAULT NULL COMMENT '处理时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_target_id` (`target_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='举报表';

-- ----------------------------
-- 30. 举报回复表
-- ----------------------------
DROP TABLE IF EXISTS `report_responses`;
CREATE TABLE `report_responses` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` int(11) UNSIGNED NOT NULL COMMENT '举报ID',
  `content` text NOT NULL COMMENT '回复内容',
  `images` json DEFAULT NULL COMMENT '附件图片',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_report_id` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='举报回复表';

-- =====================================================
-- 执行完成
-- =====================================================
