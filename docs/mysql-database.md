# MySQL 数据库说明

## 概述

符寶網使用 MySQL 5.7+ 数据库，完整数据库迁移脚本位于 `php/scripts/mysql-migration.sql`。

## 数据库配置

### 配置文件

编辑 `php/config/database.php`:

```php
return [
    'type' => 'mysql',
    'hostname' => '127.0.0.1',
    'database' => 'fubao',
    'username' => 'fubao',
    'password' => 'your_password',
    'hostport' => '3306',
    'charset' => 'utf8mb4',
];
```

### 环境变量

也可以通过环境变量配置：

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=fubao
export DB_USER=fubao
export DB_PASSWORD=your_password
```

## 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE fubao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选）
CREATE USER 'fubao'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON fubao.* TO 'fubao'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

## 导入数据

```bash
# 完整迁移
mysql -u root -p fubao < php/scripts/mysql-migration.sql

# 或指定用户
mysql -u fubao -p fubao < php/scripts/mysql-migration.sql
```

## 数据表列表

| 表名 | 说明 |
|------|------|
| `admin_users` | 管理员用户 |
| `users` | 会员用户 |
| `user_oauth_accounts` | OAuth 账号绑定 |
| `categories` | 商品分类 |
| `merchants` | 商家信息 |
| `goods` | 商品信息 |
| `addresses` | 收货地址 |
| `cart_items` | 购物车 |
| `favorites` | 收藏 |
| `coupons` | 优惠券 |
| `user_coupons` | 用户优惠券 |
| `orders` | 订单 |
| `order_items` | 订单商品 |
| `certificates` | 证书 |
| `articles` | 文章 |
| `banners` | Banner |
| `sms_codes` | 短信验证码 |
| `oauth_providers` | OAuth 配置 |
| `behavior_logs` | 行为日志 |
| `ai_configurations` | AI 配置 |
| `news_sources` | 新闻源 |
| `auto_publish_tasks` | 定时任务 |
| `ai_generated_articles` | AI 生成文章 |

## 核心表结构

### admin_users (管理员)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| username | VARCHAR(50) | 用户名 |
| password | VARCHAR(255) | 密码哈希 |
| name | VARCHAR(50) | 姓名 |
| email | VARCHAR(100) | 邮箱 |
| role | ENUM | 角色 (super_admin/admin) |
| status | TINYINT | 状态 |
| last_login_at | DATETIME | 最后登录时间 |
| created_at | DATETIME | 创建时间 |

**默认管理员**: username=admin, password=admin123

### users (会员)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| username | VARCHAR(50) | 用户名 |
| email | VARCHAR(100) | 邮箱 |
| phone | VARCHAR(20) | 手机号 |
| password | VARCHAR(255) | 密码哈希 |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(255) | 头像 |
| language | VARCHAR(10) | 语言 |
| status | TINYINT | 状态 |
| created_at | DATETIME | 创建时间 |

### goods (商品)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| category_id | INT | 分类ID |
| merchant_id | INT | 商家ID |
| name | VARCHAR(200) | 商品名称 |
| cover | VARCHAR(255) | 封面图 |
| images | JSON | 图片列表 |
| description | TEXT | 描述 |
| price | DECIMAL(10,2) | 售价 |
| original_price | DECIMAL(10,2) | 原价 |
| stock | INT | 库存 |
| sales | INT | 销量 |
| views | INT | 浏览量 |
| is_featured | TINYINT | 精选 |
| is_recommended | TINYINT | 推荐 |
| status | TINYINT | 状态 |
| created_at | DATETIME | 创建时间 |

### orders (订单)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| order_no | VARCHAR(32) | 订单号 |
| user_id | INT | 用户ID |
| total_amount | DECIMAL(10,2) | 商品总额 |
| discount_amount | DECIMAL(10,2) | 优惠金额 |
| shipping_fee | DECIMAL(10,2) | 运费 |
| actual_amount | DECIMAL(10,2) | 实付金额 |
| status | ENUM | 订单状态 |
| payment_status | ENUM | 支付状态 |
| shipping_name | VARCHAR(50) | 收货人 |
| shipping_phone | VARCHAR(20) | 联系电话 |
| shipping_address | VARCHAR(255) | 收货地址 |
| tracking_no | VARCHAR(100) | 物流单号 |
| created_at | DATETIME | 创建时间 |

**订单状态**: pending → paid → processing → shipped → delivering → delivered → completed

## 常用 SQL

### 查看所有表

```sql
SHOW TABLES;
```

### 查看表结构

```sql
DESC admin_users;
```

### 修改管理员密码

```sql
-- 生成新密码哈希后更新
UPDATE admin_users 
SET password = '$2y$10$...' 
WHERE username = 'admin';
```

### 重置管理员密码

```php
// 使用 PHP 生成哈希
<?php
echo password_hash('newpassword', PASSWORD_DEFAULT);
?>
```

然后更新数据库。

### 查看订单统计

```sql
SELECT 
    status,
    COUNT(*) as count,
    SUM(actual_amount) as total
FROM orders
GROUP BY status;
```

### 查看热销商品

```sql
SELECT 
    name,
    sales,
    price
FROM goods
WHERE status = 1
ORDER BY sales DESC
LIMIT 10;
```

## 备份与恢复

### 备份

```bash
# 备份整个数据库
mysqldump -u root -p fubao > fubao_backup_$(date +%Y%m%d).sql

# 备份并压缩
mysqldump -u root -p fubao | gzip > fubao_backup_$(date +%Y%m%d).sql.gz
```

### 恢复

```bash
# 恢复
mysql -u root -p fubao < fubao_backup_20240101.sql

# 从压缩文件恢复
gunzip < fubao_backup_20240101.sql.gz | mysql -u root -p fubao
```

## 性能优化

### 添加索引

```sql
-- 用户表
ALTER TABLE users ADD INDEX idx_phone (phone);
ALTER TABLE users ADD INDEX idx_email (email);

-- 商品表
ALTER TABLE goods ADD INDEX idx_category (category_id);
ALTER TABLE goods ADD INDEX idx_status (status);

-- 订单表
ALTER TABLE orders ADD INDEX idx_user (user_id);
ALTER TABLE orders ADD INDEX idx_status (status);
ALTER TABLE orders ADD INDEX idx_created (created_at);
```

### 查看慢查询

```sql
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
```

## 安全建议

1. **使用强密码**：数据库密码至少 16 位
2. **限制远程访问**：只允许本地连接
3. **定期备份**：每天自动备份
4. **最小权限原则**：应用使用专用数据库用户
5. **敏感数据加密**：密码已自动哈希存储
