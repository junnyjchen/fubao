# 符寶網 PHP 后端 API

全球玄門文化科普交易平台后端 API 服务。

## 技术栈

- **框架**: ThinkPHP 风格（自定义路由 + MVC）
- **数据库**: MySQL 5.7+
- **认证**: JWT
- **缓存**: 文件缓存

## 目录结构

```
php/
├── app/
│   ├── Controller.php          # 控制器基类
│   ├── common/                 # 公共类
│   │   ├── Jwt.php             # JWT 工具
│   │   ├── Sms.php             # 短信服务
│   │   ├── Response.php         # 响应辅助
│   │   ├── Validator.php        # 数据验证
│   │   ├── Logger.php           # 日志记录
│   │   └── Cache.php            # 缓存管理
│   ├── controller/             # 业务控制器
│   │   ├── Auth.php             # 会员认证
│   │   ├── Admin.php            # 管理员认证
│   │   ├── Goods.php            # 商品管理
│   │   ├── Order.php            # 订单管理
│   │   ├── Cart.php             # 购物车
│   │   ├── Favorite.php         # 收藏
│   │   ├── Address.php          # 地址管理
│   │   ├── Category.php         # 分类管理
│   │   ├── Home.php             # 首页数据
│   │   ├── Coupon.php           # 优惠券
│   │   ├── Article.php          # 文章管理
│   │   ├── Notification.php     # 通知
│   │   ├── Merchant.php         # 商家管理
│   │   ├── OAuth.php            # 第三方登录
│   │   ├── Upload.php           # 文件上传
│   │   ├── Health.php          # 健康检查
│   │   └── admin/              # 管理后台控制器
│   │       ├── User.php         # 用户管理
│   │       ├── Goods.php         # 商品管理
│   │       ├── Order.php         # 订单管理
│   │       ├── Category.php      # 分类管理
│   │       ├── Banner.php        # Banner管理
│   │       ├── Article.php       # 文章管理
│   │       ├── Coupon.php        # 优惠券管理
│   │       └── Merchant.php      # 商家管理
│   └── think/                   # 框架核心
│       ├── db/                  # 数据库操作
│       └── Request.php          # 请求处理
├── config/
│   ├── database.php            # 数据库配置
│   └── app.php                  # 应用配置
├── public/
│   ├── index.php               # 入口文件
│   └── .htaccess               # Apache 伪静态
├── route/
│   └── router.php             # 路由配置
└── scripts/
    └── mysql-migration.sql     # 数据库迁移
```

## 快速开始

### 1. 安装依赖

```bash
# 如果使用 Composer
composer install

# 或直接使用
```

### 2. 配置数据库

编辑 `config/database.php`:

```php
return [
    'host' => '127.0.0.1',
    'port' => 3306,
    'database' => 'fubao',
    'username' => 'root',
    'password' => 'your_password',
    'charset' => 'utf8mb4',
];
```

### 3. 执行数据库迁移

```bash
mysql -u root -p fubao < scripts/mysql-migration.sql
```

### 4. 启动服务

```bash
# PHP 内置服务器
cd php/public
php -S localhost:8080

# 或使用 Nginx + PHP-FPM
```

## API 接口

### 认证接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /api/auth/login` | POST | 用户登录 |
| `POST /api/auth/register` | POST | 用户注册 |
| `GET /api/auth/me` | GET | 获取当前用户 |
| `POST /api/auth/logout` | POST | 用户登出 |
| `POST /api/auth/sendCode` | POST | 发送验证码 |
| `POST /api/auth/loginByPhone` | POST | 手机号登录 |

### 管理员接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /api/admin/login` | POST | 管理员登录 |
| `GET /api/admin/dashboard` | GET | 统计概览 |
| `GET /api/admin/users` | GET | 用户列表 |
| `GET /api/admin/goods` | GET | 商品列表 |
| `POST /api/admin/goods/create` | POST | 创建商品 |

### 业务接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/goods` | GET | 商品列表 |
| `GET /api/goods/{id}` | GET | 商品详情 |
| `GET /api/categories` | GET | 分类列表 |
| `GET /api/cart` | GET | 购物车 |
| `POST /api/cart/add` | POST | 添加购物车 |
| `GET /api/orders` | GET | 订单列表 |
| `POST /api/orders/create` | POST | 创建订单 |

## 控制器基类

所有控制器都继承自 `Controller` 基类，提供便捷方法：

```php
<?php
namespace app\controller;

use app\Controller;

class Example extends Controller
{
    public function index()
    {
        // 获取请求参数
        $id = $this->get('id');           // GET 参数
        $name = $this->post('name');      // POST 参数
        $page = $this->param('page', 1);  // 自动判断 GET/POST
        
        // 数据库操作
        $list = $this->db->select("SELECT * FROM table");
        $item = $this->db->find("SELECT * FROM table WHERE id = ?", [$id]);
        
        // 用户认证
        $this->verifyUser();  // 验证普通用户
        $this->verifyAdmin(); // 验证管理员
        
        // 响应
        $this->json($data, $message);     // JSON 响应
        $this->error($message, $code);    // 错误响应
    }
}
```

## 公共类使用

### Response - 响应辅助

```php
use app\common\Response;

// 成功响应
Response::success($data, '操作成功');

// 错误响应
Response::error('操作失败', 400);

// 分页响应
Response::paginate($list, $pagination);

// JSONP
Response::jsonp($data, 'callback');

// 允许跨域
Response::allowCORS();
```

### Validator - 数据验证

```php
use app\common\Validator;

$validator = new Validator($_POST);
$validator->rules([
    'email' => 'required|email',
    'phone' => 'required|phone',
    'password' => 'required|min:6|max:32',
    'age' => 'numeric|min:18|max:100',
]);

if (!$validator->validate()) {
    return Response::error($validator->getFirstError());
}
```

### Logger - 日志记录

```php
use app\common\Logger;

$logger = new Logger();

// 不同级别日志
$logger->info('用户登录', ['user_id' => 1]);
$logger->error('操作失败', ['error' => 'xxx']);
$logger->warning('警告信息');

// 记录异常
$logger->exception($exception);

// API 调用日志
$logger->api('create_order', $params, $response, $duration);
```

### Cache - 缓存管理

```php
use app\common\Cache;

$cache = new Cache();

// 设置缓存
$cache->set('key', $value, 3600); // 1小时

// 获取缓存
$value = $cache->get('key', $default);

// 检查存在
$exists = $cache->has('key');

// 删除缓存
$cache->delete('key');

// 记住模式
$value = $cache->remember('key', 3600, function() {
    return $db->find("SELECT * FROM table");
});
```

## 数据库操作

```php
// 查询
$list = $this->db->select("SELECT * FROM table WHERE status = ?", [1]);
$item = $this->db->find("SELECT * FROM table WHERE id = ?", [$id]);

// 插入
$id = $this->db->insert('table', [
    'name' => '张三',
    'email' => 'zhangsan@example.com',
    'created_at' => date('Y-m-d H:i:s'),
]);

// 更新
$this->db->update('table', [
    'name' => '李四',
    'updated_at' => date('Y-m-d H:i:s'),
], '`id` = ?', [$id]);

// 删除
$this->db->delete('table', '`id` = ?', [$id]);

// 统计
$count = $this->db->count('table');
$count = $this->db->count('table', '`status` = ?', [1]);
```

## 默认账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123 |

## Nginx 配置

```nginx
server {
    listen 8080;
    server_name api.fubao.cn;
    root /www/wwwroot/fubao-api/php/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 许可证

MIT
