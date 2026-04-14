# 符寶網 - 开发规范文档

## 项目概述

符寶網是全球玄門文化科普交易平台，采用前后端分离架构。

### 项目架构

```
符寶網/
├── 前端 (Next.js)          # 用户界面 - 端口 5000
├── PHP 后端                # API 服务 - 端口 8080/80
└── MySQL 数据库            # 数据存储
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 (App Router) |
| UI组件 | React 19 + shadcn/ui |
| 样式 | TypeScript 5 + Tailwind CSS 4 |
| 后端 | PHP 7.4+ (ThinkPHP 风格) |
| 数据库 | MySQL 5.7+ |
| 认证 | JWT |

---

## 目录结构

```
符寶網/
├── src/                    # Next.js 前端源码
│   ├── app/               # 页面 (App Router)
│   ├── components/        # 组件
│   │   └── ui/           # shadcn/ui 组件
│   └── lib/               # 工具库
│       ├── api.ts         # API 请求封装
│       └── api-config.ts  # API 配置
├── php/                    # PHP 后端
│   ├── public/            # Web 根目录
│   │   ├── index.php      # 入口文件
│   │   └── .htaccess      # Apache 伪静态
│   ├── app/
│   │   ├── Controller.php  # 控制器基类
│   │   ├── common/        # 公共类
│   │   │   └── Jwt.php    # JWT 工具
│   │   ├── controller/    # 业务控制器
│   │   │   ├── Auth.php   # 会员认证
│   │   │   ├── Admin.php  # 管理员认证
│   │   │   ├── Goods.php  # 商品
│   │   │   ├── Order.php  # 订单
│   │   │   ├── Cart.php   # 购物车
│   │   │   ├── Favorite.php # 收藏
│   │   │   ├── Address.php # 地址
│   │   │   ├── Category.php # 分类
│   │   │   ├── Home.php   # 首页
│   │   │   ├── OAuth.php  # OAuth
│   │   │   └── Health.php # 健康检查
│   │   ├── controller/admin/ # 管理后台控制器
│   │   └── think/        # 框架核心
│   │       ├── db/       # 数据库
│   │       └── Request.php # 请求处理
│   ├── config/            # 配置文件
│   │   ├── database.php  # 数据库配置
│   │   └── app.php       # 应用配置
│   ├── route/             # 路由配置
│   │   └── router.php
│   └── scripts/           # 脚本
│       └── mysql-migration.sql
├── docs/                  # 文档
│   ├── baota-deployment.md    # 宝塔部署
│   ├── manual-deployment.md    # 手动部署
│   └── mysql-database.md      # 数据库说明
├── public/                 # 前端静态资源
├── package.json
├── tsconfig.json
└── AGENTS.md             # 本文档
```

---

## 前端开发规范

### 包管理

**仅允许使用 pnpm**，严禁使用 npm 或 yarn。

```bash
pnpm install              # 安装依赖
pnpm add <package>        # 添加依赖
pnpm add -D <package>    # 添加开发依赖
pnpm build               # 构建生产版本
pnpm dev                 # 开发模式
```

### 代码规范

1. **Hydration 错误预防**：
   - 严禁在 JSX 中直接使用 `typeof window`、`Date.now()`、`Math.random()`
   - 必须使用 `'use client'` + `useEffect` + `useState`

2. **字段命名**：数据库使用 snake_case，TypeScript 使用 camelCase

3. **错误处理**：API 调用必须检查响应状态

4. **UI组件**：默认使用 shadcn/ui 组件

### API 调用

```typescript
// 导入 API 封装
import { api } from '@/lib/api'

// 使用
const response = await api.post('/auth/login', { email, password })
```

---

## PHP 后端开发规范

### 代码规范

1. **命名空间**：`app\controller`
2. **控制器继承**：`extends Controller`
3. **数据库操作**：使用 `$this->db->select/find/insert/update/delete`
4. **请求获取**：`$this->post('field')` / `$this->get('field')`
5. **响应格式**：`$this->json($data, $msg)` / `$this->error($msg, $code)`
6. **认证验证**：`$this->verifyUser()` / `$this->verifyAdmin()`

### 控制器模板

```php
<?php
namespace app\controller;

use app\Controller;

class Example extends Controller
{
    public function index()
    {
        $page = (int) $this->get('page', 1);
        $list = $this->db->select("SELECT * FROM table LIMIT 10");
        $this->json(['list' => $list]);
    }
    
    public function detail($id)
    {
        $item = $this->db->find("SELECT * FROM table WHERE id = ?", [$id]);
        if (!$item) {
            $this->error('不存在', 404);
        }
        $this->json(['item' => $item]);
    }
}
```

### 数据库操作

```php
// 查询单条
$item = $this->db->find("SELECT * FROM users WHERE id = ?", [$id]);

// 查询多条
$list = $this->db->select("SELECT * FROM users WHERE status = ?", [1]);

// 插入
$id = $this->db->insert('users', [
    'name' => '张三',
    'email' => 'zhangsan@example.com',
    'created_at' => date('Y-m-d H:i:s'),
]);

// 更新
$this->db->update('users', [
    'name' => '李四',
    'updated_at' => date('Y-m-d H:i:s'),
], '`id` = ?', [$id]);

// 删除
$this->db->delete('users', '`id` = ?', [$id]);

// 统计
$count = $this->db->count('users');
$count = $this->db->count('users', '`status` = ?', [1]);
```

---

## API 接口列表

### 健康检查

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 服务健康检查 |

### 会员认证

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /api/auth/login` | POST | 用户登录 |
| `POST /api/auth/register` | POST | 用户注册 |
| `GET /api/auth/me` | GET | 获取当前用户 |
| `POST /api/auth/sendCode` | POST | 发送验证码 |
| `POST /api/auth/loginByPhone` | POST | 手机号登录 |

### 管理员认证

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /api/admin/login` | POST | 管理员登录 |
| `GET /api/admin/me` | GET | 获取管理员信息 |
| `POST /api/admin/changePassword` | POST | 修改密码 |
| `GET /api/admin/dashboard` | GET | 统计概览 |

### 管理后台 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/admin/users` | GET | 用户列表 |
| `GET /api/admin/goods` | GET | 商品列表 |
| `POST /api/admin/goods/create` | POST | 创建商品 |
| `POST /api/admin/goods/update` | POST | 更新商品 |
| `POST /api/admin/goods/delete` | POST | 删除商品 |
| `GET /api/admin/orders` | GET | 订单列表 |
| `POST /api/admin/orders/updateStatus` | POST | 更新订单状态 |
| `GET /api/admin/categories` | GET | 分类列表 |
| `GET /api/admin/banners` | GET | Banner列表 |

### 业务 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/goods` | GET | 商品列表 |
| `GET /api/goods/{id}` | GET | 商品详情 |
| `GET /api/goods/featured` | GET | 精选商品 |
| `GET /api/goods/recommended` | GET | 推荐商品 |
| `GET /api/goods/hot` | GET | 热销商品 |
| `GET /api/categories` | GET | 分类列表 |
| `GET /api/cart` | GET | 购物车列表 |
| `POST /api/cart/add` | POST | 添加购物车 |
| `GET /api/favorites` | GET | 收藏列表 |
| `POST /api/favorites/add` | POST | 添加收藏 |
| `GET /api/orders` | GET | 订单列表 |
| `POST /api/orders/create` | POST | 创建订单 |
| `GET /api/addresses` | GET | 地址列表 |
| `POST /api/addresses/create` | POST | 创建地址 |
| `GET /api/home` | GET | 首页数据 |

---

## 数据库表

| 表名 | 说明 |
|------|------|
| admin_users | 管理员用户 |
| users | 会员用户 |
| user_oauth_accounts | OAuth 账号绑定 |
| categories | 商品分类 |
| merchants | 商家 |
| goods | 商品信息 |
| addresses | 收货地址 |
| cart_items | 购物车 |
| favorites | 收藏 |
| orders | 订单 |
| order_items | 订单商品 |
| coupons | 优惠券 |
| articles | 文章 |
| banners | Banner |
| ai_configurations | AI 配置 |
| ai_generated_articles | AI 生成文章 |

---

## 默认账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123 |

---

## 环境变量

### 前端 (.env)

```bash
NEXT_PUBLIC_API_MODE=local        # local 或 remote
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### PHP 后端

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fubao
DB_USER=fubao
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

---

## 常用命令

### 前端

```bash
pnpm install    # 安装依赖
pnpm dev        # 开发模式
pnpm build      # 生产构建
pnpm lint       # 代码检查
pnpm ts-check   # 类型检查
```

### PHP 后端

```bash
# 数据库迁移
mysql -u root -p fubao < php/scripts/mysql-migration.sql

# 启动开发服务器
cd php/public && php -S localhost:8080

# PHP 语法检查
find php -name "*.php" -exec php -l {} \;
```

---

## 注意事项

1. **端口规范**：前端必须运行在 5000 端口
2. **禁止 Mock**：集成服务必须使用真实 API
3. **安全**：生产环境必须修改默认密钥和密码
4. **HTTPS**：生产环境必须使用 HTTPS
