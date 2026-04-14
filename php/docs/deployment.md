# ThinkPHP 后端部署指南

## 环境要求

- PHP >= 7.4
- MySQL >= 5.7
- PDO PHP Extension
- JSON PHP Extension

## 目录结构

```
php/
├── public/
│   └── index.php          # 入口文件
├── app/
│   ├── Controller.php      # 控制器基类
│   ├── controller/        # 业务控制器
│   │   ├── Auth.php        # 会员认证
│   │   ├── Admin.php       # 管理员认证
│   │   ├── Goods.php       # 商品
│   │   ├── Order.php       # 订单
│   │   ├── Cart.php        # 购物车
│   │   ├── Favorite.php    # 收藏
│   │   ├── Address.php     # 地址
│   │   ├── Category.php    # 分类
│   │   ├── Home.php        # 首页
│   │   └── OAuth.php       # OAuth
│   ├── middleware/          # 中间件
│   │   └── AdminAuth.php   # 管理员认证中间件
│   └── common/             # 公共类
│       └── Jwt.php         # JWT工具
├── config/
│   ├── database.php        # 数据库配置
│   └── app.php             # 应用配置
├── route/
│   └── router.php          # 路由配置
└── scripts/
    └── mysql-migration.sql # 数据库迁移脚本
```

## 配置说明

### 1. 数据库配置

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

### 2. 环境变量

```bash
# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fubao
DB_USER=root
DB_PASSWORD=your_password

# JWT密钥
JWT_SECRET=your_secret_key_here
```

### 3. JWT密钥配置

编辑 `app/common/Jwt.php`，修改默认密钥：

```php
private static $secret = 'your-production-secret-key';
```

## 数据库迁移

```bash
mysql -u root -p fubao < scripts/mysql-migration.sql
```

## 伪静态配置

### Nginx

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

### Apache (.htaccess)

项目已包含 `.htaccess` 文件。

### 宝塔面板

1. 网站 → 添加站点
2. 设置 → 伪静态 → 选择 `thinkphp`
3. 设置 → 配置文件，添加：

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

## API 接口列表

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
| `/api/admin/me` | GET | 获取管理员信息 |
| `/api/admin/dashboard` | GET | 统计概览 |
| `/api/admin/users` | GET | 用户列表 |
| `/api/admin/goods` | GET/POST | 商品管理 |
| `/api/admin/orders` | GET | 订单列表 |
| `/api/admin/categories` | GET/POST | 分类管理 |
| `/api/admin/banners` | GET/POST | Banner管理 |

### 业务接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/goods` | GET | 商品列表 |
| `/api/goods/{id}` | GET | 商品详情 |
| `/api/categories` | GET | 分类列表 |
| `/api/cart` | GET | 购物车列表 |
| `/api/orders` | GET | 订单列表 |
| `/api/addresses` | GET | 地址列表 |

## 部署检查清单

- [ ] PHP 版本 >= 7.4
- [ ] MySQL 数据库已创建
- [ ] 数据库迁移脚本已执行
- [ ] 数据库连接配置正确
- [ ] JWT 密钥已修改
- [ ] 伪静态规则已配置
- [ ] 目录权限正确（755）
- [ ] 文件写入权限正确
- [ ] 默认管理员密码已修改

## 安全建议

1. **修改默认密钥**：部署前修改 `JWT_SECRET` 和 `Jwt.php` 中的密钥
2. **修改默认密码**：修改数据库中 admin 用户的密码
3. **HTTPS**：生产环境必须使用 HTTPS
4. **CORS**：根据需要配置跨域访问
5. **限流**：建议配置 API 限流防止滥用
6. **日志**：开启错误日志记录便于排查问题

## 常见问题

### 1. 500 Internal Server Error

- 检查 PHP 错误日志
- 确认 `.htaccess` 文件存在
- 检查文件权限

### 2. 数据库连接失败

- 确认数据库服务运行中
- 检查用户名密码
- 检查防火墙设置

### 3. API 返回 404

- 确认伪静态规则生效
- 检查路由配置
- 查看 Nginx/Apache 错误日志
