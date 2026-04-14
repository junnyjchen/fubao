# 符寶網 - PHP 后端部署指南

## 概述

本目录包含符寶網的 PHP 后端服务，基于 ThinkPHP 框架风格的自定义精简框架。

## 快速开始

### 1. 环境要求

- PHP >= 7.4
- MySQL >= 5.7
- PDO PHP Extension
- JSON PHP Extension
- cURL PHP Extension

### 2. 数据库配置

编辑 `config/database.php`：

```php
return [
    'type' => 'mysql',
    'hostname' => getenv('DB_HOST') ?: 'localhost',
    'database' => getenv('DB_NAME') ?: 'fubao',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASSWORD') ?: '',
    'hostport' => getenv('DB_PORT') ?: '3306',
    'charset' => 'utf8mb4',
];
```

或设置环境变量：

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=fubao
export DB_USER=root
export DB_PASSWORD=your_password
```

### 3. 数据库迁移

```bash
mysql -u root -p fubao < scripts/mysql-migration.sql
```

### 4. 修改 JWT 密钥

编辑 `app/common/Jwt.php`，修改默认密钥：

```php
private static $secret = 'your-production-secret-key-here';
```

### 5. 启动服务

#### 开发环境

```bash
cd public
php -S localhost:8080
```

#### 生产环境

配置 Web 服务器（参考下文）。

## 目录结构

```
php/
├── public/                 # Web 根目录
│   ├── index.php          # 入口文件
│   └── .htaccess          # Apache 伪静态配置
├── app/
│   ├── Controller.php     # 控制器基类
│   ├── common/            # 公共类
│   │   └── Jwt.php        # JWT 工具
│   ├── controller/        # 业务控制器
│   │   ├── Auth.php       # 会员认证
│   │   ├── Admin.php      # 管理员认证
│   │   ├── Goods.php      # 商品
│   │   ├── Order.php      # 订单
│   │   ├── Cart.php       # 购物车
│   │   ├── Favorite.php   # 收藏
│   │   ├── Address.php    # 收货地址
│   │   ├── Category.php   # 分类
│   │   ├── Home.php       # 首页
│   │   ├── OAuth.php      # OAuth
│   │   └── admin/         # 管理后台控制器
│   │       ├── Dashboard.php
│   │       ├── Goods.php
│   │       ├── Order.php
│   │       ├── Category.php
│   │       ├── Banner.php
│   │       ├── User.php
│   ├── middleware/        # 中间件
│   │   └── AdminAuth.php
│   └── think/            # 框架核心
│       ├── db/
│       │   └── Connection.php
│       └── Request.php
├── config/
│   ├── database.php     # 数据库配置
│   └── app.php          # 应用配置
├── route/
│   └── router.php       # 路由配置
├── scripts/
│   └── mysql-migration.sql  # 数据库迁移
└── docs/
    ├── deployment.md    # 部署文档
    └── nginx.conf       # Nginx 配置示例
```

## API 接口

### 会员接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/me` | GET | 获取当前用户 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/auth/sendCode` | POST | 发送验证码 |
| `/api/auth/loginByPhone` | POST | 手机号登录 |

### 管理员接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/login` | POST | 管理员登录 |
| `/api/admin/logout` | POST | 管理员登出 |
| `/api/admin/me` | GET | 获取管理员信息 |
| `/api/admin/changePassword` | POST | 修改密码 |
| `/api/admin/dashboard` | GET | 统计概览 |
| `/api/admin/dashboard/sales` | GET | 销售统计 |
| `/api/admin/dashboard/goodsRanking` | GET | 商品排行 |
| `/api/admin/dashboard/users` | GET | 用户统计 |
| `/api/admin/users` | GET | 用户列表 |
| `/api/admin/users/detail` | GET | 用户详情 |
| `/api/admin/users/updateStatus` | POST | 更新用户状态 |
| `/api/admin/users/delete` | POST | 删除用户 |
| `/api/admin/goods` | GET | 商品列表 |
| `/api/admin/goods/create` | POST | 创建商品 |
| `/api/admin/goods/update` | POST | 更新商品 |
| `/api/admin/goods/delete` | POST | 删除商品 |
| `/api/admin/orders` | GET | 订单列表 |
| `/api/admin/orders/detail` | GET | 订单详情 |
| `/api/admin/orders/updateStatus` | POST | 更新订单状态 |
| `/api/admin/orders/export` | GET | 导出订单 |
| `/api/admin/categories` | GET | 分类列表 |
| `/api/admin/categories/create` | POST | 创建分类 |
| `/api/admin/categories/update` | POST | 更新分类 |
| `/api/admin/categories/delete` | POST | 删除分类 |
| `/api/admin/banners` | GET | Banner列表 |
| `/api/admin/banners/create` | POST | 创建Banner |
| `/api/admin/banners/update` | POST | 更新Banner |
| `/api/admin/banners/delete` | POST | 删除Banner |
| `/api/admin/admins` | GET | 管理员列表 |
| `/api/admin/admins/create` | POST | 创建管理员 |
| `/api/admin/admins/update` | POST | 更新管理员 |
| `/api/admin/admins/delete` | POST | 删除管理员 |

### 业务接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/goods` | GET | 商品列表 |
| `/api/goods/{id}` | GET | 商品详情 |
| `/api/goods/featured` | GET | 精选商品 |
| `/api/goods/recommended` | GET | 推荐商品 |
| `/api/goods/hot` | GET | 热销商品 |
| `/api/categories` | GET | 分类列表 |
| `/api/categories/all` | GET | 所有分类 |
| `/api/cart` | GET | 购物车列表 |
| `/api/cart/add` | POST | 添加到购物车 |
| `/api/cart/update` | POST | 更新购物车 |
| `/api/cart/remove` | POST | 删除购物车商品 |
| `/api/cart/clear` | POST | 清空购物车 |
| `/api/cart/count` | GET | 购物车数量 |
| `/api/favorites` | GET | 收藏列表 |
| `/api/favorites/add` | POST | 添加收藏 |
| `/api/favorites/remove` | POST | 取消收藏 |
| `/api/favorites/check` | GET | 检查是否收藏 |
| `/api/orders` | GET | 订单列表 |
| `/api/orders/create` | POST | 创建订单 |
| `/api/orders/cancel` | POST | 取消订单 |
| `/api/orders/confirm` | POST | 确认收货 |
| `/api/addresses` | GET | 地址列表 |
| `/api/addresses/create` | POST | 创建地址 |
| `/api/addresses/update` | POST | 更新地址 |
| `/api/addresses/delete` | POST | 删除地址 |
| `/api/addresses/setDefault` | POST | 设为默认 |
| `/api/home` | GET | 首页数据 |
| `/api/home/banners` | GET | Banner列表 |
| `/api/home/articles` | GET | 文章列表 |

## Web 服务器配置

### Nginx

```nginx
server {
    listen 80;
    server_name api.fubao.com;
    root /var/www/fubao/php/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Apache

项目已包含 `.htaccess` 文件，启用 mod_rewrite 模块即可。

### 宝塔面板

1. 添加网站
2. 设置 → 伪静态 → 选择 `thinkphp`
3. 设置 → 配置修改 → 添加上面的 Nginx 配置

## 默认账户

### 管理员

- 用户名：`admin`
- 密码：`admin123`

**重要**：生产环境请立即修改默认密码！

## 常见问题

### 1. 500 Internal Server Error

- 检查 PHP 错误日志
- 确认 `.htaccess` 文件存在
- 检查文件权限（755 for dirs, 644 for files）

### 2. 数据库连接失败

- 确认 MySQL 服务运行中
- 检查用户名密码
- 检查防火墙设置

### 3. API 返回 404

- 确认伪静态规则生效
- 检查路由配置
- 查看 Nginx/Apache 错误日志

## 安全建议

1. **修改默认密钥**：部署前修改 JWT 密钥
2. **修改默认密码**：修改数据库中 admin 用户的密码
3. **HTTPS**：生产环境必须使用 HTTPS
4. **CORS**：根据需要配置跨域访问
5. **限流**：建议配置 API 限流防止滥用
6. **日志**：开启错误日志记录便于排查问题
