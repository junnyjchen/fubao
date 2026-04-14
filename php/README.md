# 符寶網 PHP 后端 API

## 技术栈

- **Language**: PHP 7.4+
- **Framework**: ThinkPHP 风格（自定义精简框架）
- **Database**: MySQL 5.7+
- **Auth**: JWT

## 快速开始

### 1. 配置数据库

编辑 `config/database.php`:

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

### 2. 创建数据库

```bash
mysql -u root -p -e "CREATE DATABASE fubao CHARACTER SET utf8mb4;"
mysql -u root -p fubao < scripts/mysql-migration.sql
```

### 3. 启动服务

```bash
# 开发环境
cd public && php -S localhost:8080

# 生产环境
# 使用 Nginx/Apache + PHP-FPM
```

## 目录结构

```
php/
├── public/              # Web 根目录
│   ├── index.php        # 入口文件
│   └── .htaccess        # Apache 伪静态
├── app/
│   ├── Controller.php   # 控制器基类
│   ├── common/         # 公共类
│   │   └── Jwt.php    # JWT 工具
│   ├── controller/     # 业务控制器
│   └── think/          # 框架核心
├── config/             # 配置
├── route/              # 路由
└── scripts/            # 脚本
    └── mysql-migration.sql
```

## API 接口

### 健康检查

```
GET /api/health
```

### 会员认证

```
POST /api/auth/login        # 登录
POST /api/auth/register     # 注册
GET  /api/auth/me          # 当前用户
```

### 管理后台

```
POST /api/admin/login       # 管理员登录
GET  /api/admin/dashboard   # 统计概览
GET  /api/admin/users       # 用户列表
GET  /api/admin/goods      # 商品列表
GET  /api/admin/orders     # 订单列表
```

### 业务接口

```
GET  /api/goods            # 商品列表
GET  /api/goods/{id}       # 商品详情
GET  /api/categories       # 分类列表
GET  /api/cart             # 购物车
POST /api/cart/add         # 添加购物车
GET  /api/orders          # 订单列表
POST /api/orders/create    # 创建订单
```

## 默认账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

## 响应格式

```json
// 成功
{
  "code": 0,
  "message": "成功",
  "data": {}
}

// 失败
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

## JWT 认证

请求需要认证的接口时，在 Header 中添加：

```
Authorization: Bearer <token>
```

## 常见问题

### 500 Internal Server Error

- 检查 PHP 错误日志
- 确认 `.htaccess` 存在
- 检查目录权限

### 数据库连接失败

- 确认 MySQL 运行中
- 检查用户名密码
- 确认数据库存在

### API 返回 404

- 确认伪静态生效
- 确认网站目录指向 `public/`
