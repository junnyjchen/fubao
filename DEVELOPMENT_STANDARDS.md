# 符寶網 - 开发技术框架与标准文档

> 本文档为符寶網项目开发的**唯一技术标准**，所有新增、修改代码必须遵循。
> 最后更新: 2025-01-15

---

## 一、技术栈锁定

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | Next.js | 16 (App Router) | **SSR 渲染层**，SEO友好，不含API逻辑 |
| 后端（唯一） | PHP | 8.x + ThinkPHP | **生产 + 开发共用后端**，`php/` 目录 |
| 后端（开发降级） | Next.js API Routes | - | 仅当 PHP 不可用时降级使用 |
| UI库 | React | 19 | 禁止使用 React 17 旧语法 |
| 语言 | TypeScript / PHP | TS5 / PHP8 | 前端 TS 严格模式；后端 PHP 强类型 |
| 样式 | Tailwind CSS | 4 | 语义化变量，禁止硬编码颜色 |
| 组件库 | shadcn/ui | 最新 | 基础UI组件唯一来源 |
| 包管理 | pnpm / composer | - | 前端 pnpm（**严禁** npm/yarn）；后端 composer |
| 数据库 | MySQL | 8.x | 生产环境；开发降级到 Mock DB |
| AI | 豆包/DeepSeek/Kimi | - | SSE 流式输出 |
| 邮件 | nodemailer / PHPMailer | - | QQ邮箱 SMTP (smtp.qq.com:465 SSL) |

### 架构核心原则：PHP是唯一API源

```
生产环境：
  用户请求 → Nginx
                ├── /api/*  → PHP-FPM (ThinkPHP) → MySQL
                └── /*      → Next.js SSR 渲染页面

开发环境：
  浏览器 → Next.js Dev Server
                ├── /api/*  → Next.js API Routes → MySQL/Mock DB
                └── /*      → Next.js SSR 渲染页面
```

- **开发时**：`NEXT_PUBLIC_API_MODE=local`，前端 `fetch('/api/xxx')` 走 Next.js API Routes
- **生产时**：`NEXT_PUBLIC_API_MODE=php`，前端 `fetch('/api/xxx')` 经 Nginx 转发到 PHP-FPM
- **切换零改动**：前端代码统一使用 `apiRequest('/api/xxx')`，由 `api-config.ts` 自动路由

---

## 二、目录结构规范

```
src/                                # Next.js 前端 + 开发用 API
├── app/                            # Next.js App Router 页面
│   ├── page.tsx                    # 首页
│   ├── layout.tsx                  # 根布局
│   ├── {module}/                   # 功能模块页面
│   │   ├── page.tsx                # 列表页
│   │   ├── [id]/page.tsx           # 详情页
│   │   └── loading.tsx             # 加载态（可选）
│   └── api/                        # API Routes（开发用后端，生产用PHP）
│       └── {module}/route.ts       # 一个文件一个路由
├── components/                     # 组件
│   ├── ui/                         # shadcn/ui 基础组件（禁止手动修改）
│   ├── {module}/                   # 业务模块组件
│   └── common/                     # 跨模块通用组件
└── lib/                            # 工具库
    ├── db.ts                       # 数据库访问层（唯一入口）
    ├── mysql.ts                    # MySQL 连接池
    ├── auth/                       # 认证模块
    ├── ai/                         # AI 模块
    ├── email/                      # 邮件模块
    ├── hooks/                      # 通用 Hooks
    └── i18n/                       # 国际化

php/                                # PHP 后端（生产环境）
├── app/
│   ├── controller/                 # 控制器（与前端 API 路由一一对应）
│   │   ├── admin/                  # 管理后台控制器
│   │   ├── Auth.php                # 认证
│   │   ├── Goods.php               # 商品
│   │   ├── Order.php               # 订单
│   │   └── ...                     # 其他业务控制器
│   ├── common/                     # 公共模块（Jwt/Response/Validator/Cache）
│   ├── middleware/                  # 中间件（AdminAuth）
│   └── think/                      # ThinkPHP 核心扩展
├── config/
│   ├── database.php                # 数据库配置（环境变量驱动）
│   └── app.php                     # 应用配置
├── route/
│   └── router.php                  # 路由映射（与前端 API 路径一一对应）
├── public/
│   └── index.php                   # 入口文件
└── nginx.conf                      # Nginx 配置（API 域名指向 php/public）

sql/                                # 数据库脚本
├── schema.sql                      # 建表 DDL
├── seed.sql                        # 种子数据
└── deploy-mysql.sh                 # 一键部署
```

### 双后端架构说明

| 环境 | 后端 | 入口 | 数据库 |
|------|------|------|--------|
| **生产** | PHP (ThinkPHP) | `php/public/index.php` + Nginx | MySQL |
| **开发/预览** | Next.js API Routes | `src/app/api/*/route.ts` | MySQL 优先，Mock DB 降级 |

**核心原则**：前后端 API 接口路径和响应格式必须保持一致，PHP 控制器和 Next.js API Route 做到一一对应。

### 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 页面 | `page.tsx` | `src/app/shop/page.tsx` |
| 布局 | `layout.tsx` | `src/app/admin/layout.tsx` |
| API路由 | `route.ts` | `src/app/api/goods/route.ts` |
| React组件 | `PascalCase.tsx` | `GoodsList.tsx` |
| 工具函数 | `camelCase.ts` | `formatPrice.ts` |
| Hook | `use-xxx.ts` | `use-api.ts` |
| 常量 | `CONSTANT_CASE` | `ORDER_STATUS` |

---

## 三、数据库访问标准

### 3.1 唯一入口：`@/lib/db`

```typescript
import { query, queryOne, insert, update, remove, count } from '@/lib/db';
```

**严禁**直接 import `@/lib/mysql`，一切数据库操作通过 `@/lib/db`。

### 3.2 六个核心函数签名

```typescript
// SQL 查询（返回数组）
query(sql: string, params?: unknown[]): Promise<any[]>

// 单行查询（返回对象或null）
queryOne(sql: string, params?: unknown[]): Promise<any | null>

// 插入（返回自增ID）
insert(table: string, data: Record<string, unknown>): Promise<number>

// 更新（返回影响行数）
update(table: string, data: Record<string, unknown>, where: Record<string, unknown>): Promise<number>

// 删除（返回影响行数）
remove(table: string, where: Record<string, unknown>): Promise<number>

// 计数
count(sql: string, params?: unknown[], whereParams?: unknown[]): Promise<number>
```

### 3.3 MySQL 降级机制

- MySQL 可用 → 所有操作走 MySQL
- MySQL 不可用 → 自动降级到 Mock DB（内存 + 文件持久化）
- 降级后 5 秒自动重试 MySQL
- **业务代码无需关心底层引擎**

### 3.4 SQL 编写规范

```typescript
// ✅ 正确：参数化查询
const goods = await query('SELECT * FROM goods WHERE status = ? AND category_id = ?', [1, catId]);

// ❌ 错误：字符串拼接（SQL注入风险）
const goods = await query(`SELECT * FROM goods WHERE status = ${status}`);

// ✅ 正确：动态条件
const conditions = ['status = ?'];
const params: unknown[] = [1];
if (categoryId) { conditions.push('category_id = ?'); params.push(categoryId); }
const where = `WHERE ${conditions.join(' AND ')}`;
const data = await query(`SELECT * FROM goods ${where}`, params);

// ❌ 错误：直接使用 insert/update 但传了 SQL
await insert('goods', { name: 'x', price: 100 });  // 这是 insert，不是 query
```

---

## 四、API Route 开发标准

### 4.1 标准结构

```typescript
/**
 * @fileoverview {模块名} API
 * @module app/api/{module}/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update, remove, count } from '@/lib/db';
import { getAuthUserId, getAuthUser } from '@/lib/auth/apiAuth';

// GET - 查询
export async function GET(request: NextRequest) {
  try {
    // 1. 认证检查（如需登录）
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: '請先登錄' }, { status: 401 });

    // 2. 解析参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 3. 查询数据
    const data = await query('SELECT * FROM xxx WHERE ... LIMIT ? OFFSET ?', [...]);
    const total = await count('SELECT COUNT(*) as cnt FROM xxx WHERE ...', [...]);

    // 4. 返回统一格式
    return NextResponse.json({ data, total, page, page_size: pageSize });
  } catch (error) {
    console.error('{操作}失败:', error);
    return NextResponse.json({ error: '操作失敗' }, { status: 500 });
  }
}

// POST - 创建
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: '請先登錄' }, { status: 401 });

    const body = await request.json();
    // 参数校验...
    const id = await insert('xxx', { ...body, user_id: userId });
    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('{操作}失败:', error);
    return NextResponse.json({ error: '操作失敗' }, { status: 500 });
  }
}
```

### 4.2 响应格式标准

```typescript
// 列表查询
{ data: T[], total: number, page: number, page_size: number }

// 单条查询
{ data: T }

// 创建成功
{ id: number, success: true }

// 更新/删除成功
{ success: true }

// 错误
{ error: string }                    // 业务错误
{ error: string }, { status: 401 }   // 认证错误
{ error: string }, { status: 500 }   // 服务器错误
```

### 4.3 认证标准

```typescript
import { getAuthUserId, getAuthUser } from '@/lib/auth/apiAuth';

// 只需用户ID → 用 getAuthUserId
const userId = await getAuthUserId(request);
if (!userId) return NextResponse.json({ error: '請先登錄' }, { status: 401 });

// 需要完整用户信息 → 用 getAuthUser
const user = await getAuthUser(request);
if (!user) return NextResponse.json({ error: '請先登錄' }, { status: 401 });

// 管理员认证
import { getAdminUser } from '@/lib/auth/adminAuth';
const admin = await getAdminUser(request);
if (!admin) return NextResponse.json({ error: '管理員權限不足' }, { status: 403 });
```

### 4.4 禁止事项

- ❌ 直接操作 `request.cookies` 做 token 解析（用 `getAuthUserId`）
- ❌ 在 API Route 中使用 `'use client'`
- ❌ `catch` 块吞掉错误不处理
- ❌ 返回非标准格式（如裸数组 `return NextResponse.json(data)`）

---

## 四-B、PHP 后端开发标准（唯一生产 API）

### 4B.1 架构概述

**PHP 是唯一的生产环境 API 后端**。Next.js API Routes 仅用于开发/预览环境。

```
生产环境请求流程：
  浏览器 → Nginx
    ├── /api/* → PHP-FPM → ThinkPHP Controller → MySQL
    └── /*     → Next.js SSR → 输出完整 HTML（SEO 友好）

开发环境请求流程：
  浏览器 → Next.js Dev Server
    ├── /api/* → Next.js API Routes → MySQL/Mock DB
    └── /*     → Next.js SSR + HMR
```

**前端代码无需改动** — `api-request.ts` 自动根据 `NEXT_PUBLIC_API_MODE` 环境变量选择 API 源：
- `NEXT_PUBLIC_API_MODE=local`（默认）→ `/api/*`（Next.js API Routes，开发用）
- `NEXT_PUBLIC_API_MODE=php` → PHP 后端 URL（生产用）

### 4B.2 新增 PHP 控制器清单

| 控制器 | API 路径 | 说明 |
|--------|---------|------|
| `MerchantCenter.php` | `/api/merchant/*` | 商家中心（登录/商品/订单/入驻/统计） |
| `FreeGift.php` | `/api/free-gifts/*` | 免费送活动 |
| `News.php` | `/api/news/*` | 新闻资讯 |
| `Setting.php` | `/api/settings` | 系统设置 |
| `GoodsI18n.php` | `/api/goods/i18n` | 商品多语言 |
| `admin/Database.php` | `/api/admin/database` | 数据库管理 |
| `admin/Email.php` | `/api/admin/email` | 邮件服务管理 |

### 4B.3 目录结构

```
php/
├── app/
│   ├── controller/            # 控制器（与前端 API 路径一一对应）
│   │   ├── admin/             # 管理后台（admin/前缀）
│   │   ├── Auth.php           # 认证 → /api/auth/*
│   │   ├── Goods.php          # 商品 → /api/goods/*
│   │   ├── Order.php          # 订单 → /api/orders/*
│   │   ├── Cart.php           # 购物车 → /api/cart
│   │   └── ...                # 其他业务控制器
│   ├── common/                # 公共模块（必须复用）
│   │   ├── Jwt.php            # JWT 认证
│   │   ├── Response.php       # 统一响应格式
│   │   ├── Validator.php      # 参数校验
│   │   ├── Cache.php          # 缓存
│   │   ├── Logger.php         # 日志
│   │   └── Sms.php            # 短信
│   ├── middleware/
│   │   └── AdminAuth.php      # 管理员认证中间件
│   └── think/                 # ThinkPHP 核心扩展
├── config/
│   ├── database.php           # 数据库配置（环境变量驱动）
│   └── app.php                # 应用配置
├── route/
│   └── router.php             # 路由映射
└── public/
    └── index.php              # 入口文件
```

### 4B.3 控制器编写规范

```php
<?php
namespace app\controller;

use app\common\Jwt;
use app\common\Response;
use app\common\Validator;

class Goods
{
    /**
     * 商品列表 - GET /api/goods
     */
    public function index()
    {
        try {
            // 1. 参数获取与校验
            $page = (int)input('page', 1);
            $pageSize = (int)input('pageSize', 20);
            $categoryId = input('category_id');
            
            // 2. 构建查询
            $where = ['status' => 1];
            if ($categoryId) $where['category_id'] = $categoryId;
            
            // 3. 查询数据（参数绑定防SQL注入）
            $total = db('goods')->where($where)->count();
            $data = db('goods')->where($where)
                ->page($page, $pageSize)
                ->order('id DESC')
                ->select();
            
            // 4. 返回统一格式（与 Next.js API 保持一致）
            Response::success([
                'data' => $data,
                'total' => $total,
                'page' => $page,
                'page_size' => $pageSize,
            ]);
        } catch (\Exception $e) {
            Response::error($e->getMessage());
        }
    }
}
```

### 4B.4 统一响应格式（与 Next.js API 一致）

```php
// app/common/Response.php
class Response
{
    public static function success($data = [], $message = '操作成功')
    {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public static function error($message = '操作失敗', $code = 500)
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($code);
        echo json_encode([
            'error' => $message,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
```

### 4B.5 路由注册规范

在 `php/route/router.php` 中注册，路径**必须**与 Next.js `src/app/api/` 下的路径一致：

```php
// 新增路由必须同步两端
'routers = [
    // Next.js: src/app/api/goods/route.ts → PHP: app/controller/Goods.php
    'api/goods' => ['app\controller\Goods::index', ['GET']],
    'api/goods/create' => ['app\controller\Goods::create', ['POST']],
    // ...
];
```

### 4B.6 认证规范

```php
// 用户认证（从 Header 获取 token）
$userId = Jwt::getUserIdFromHeader();
if (!$userId) Response::error('請先登錄', 401);

// 管理员认证
$adminId = Jwt::getAdminIdFromHeader();
if (!$adminId) Response::error('管理員權限不足', 403);
```

### 4B.8 新增 API 开发流程

**PHP 优先原则**：新增后端接口时，**必须先写 PHP 控制器**，Next.js API Routes 作为开发环境副本。

| 步骤 | PHP（生产，必须） | Next.js API（开发副本） |
|------|---------------|------------|
| 1 | `php/app/controller/{Module}.php` | `src/app/api/{module}/route.ts` |
| 2 | 方法 `index/create/update/delete` | 函数 `GET/POST/PUT/DELETE` |
| 3 | 注册到 `router.php` | 路由自动注册 |
| 4 | 认证 `Jwt::getUserIdFromHeader()` | 认证 `getAuthUserId(request)` |
| 5 | 响应 `Response::success/error` | 响应 `NextResponse.json` |
| 6 | **必须** | 可选（开发环境兜底） |

### 4B.9 API 路由完整映射

所有 `/api/*` 请求在生产环境由 PHP 处理，Nginx 规则：

```nginx
# 生产环境 Nginx 配置（php/nginx.conf）
location /api/ {
    try_files $uri $uri/ /index.php?$query_string;
    # PHP-FPM 处理所有 /api/* 请求
}

location / {
    proxy_pass http://127.0.0.1:3000;  # Next.js SSR
}
```

前端 `api-request.ts` 自动适配：

```typescript
// 开发环境：fetch('/api/goods') → Next.js API Routes
// 生产环境：fetch('https://domain/api/goods') → PHP API
const baseURL = process.env.NEXT_PUBLIC_API_MODE === 'php' 
  ? (process.env.NEXT_PUBLIC_PHP_API_URL || '') 
  : '';
```

---

## 五、前端开发标准

### 5.1 页面组件模式

```tsx
'use client';  // 仅交互页面需要

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-request';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/PageLoader';

export default function ExamplePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/example');
      setData(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加載失敗');
    } finally {
      setLoading(false);
    }
  };

  // 加载态
  if (loading) return <PageLoader />;

  // 空态
  if (data.length === 0) return <EmptyState title="暫無數據" />;

  // 错误态
  if (error) return <EmptyState title="加載失敗" description={error} />;

  return <div>...</div>;
}
```

### 5.2 Hydration 安全

```tsx
// ✅ 正确：客户端挂载后渲染动态内容
'use client';
export function Component() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <Skeleton />;
  return <ClientContent />;
}

// ❌ 错误：渲染中使用动态值
<div>{new Date().toLocaleString()}</div>           // 服务端/客户端不一致
<div>{typeof window !== 'undefined' && ...}</div>  // Hydration 不匹配
```

### 5.3 样式规范

```tsx
// ✅ 正确：使用语义化变量
<div className="bg-background text-foreground border-border">
<div className="bg-card text-card-foreground">
<div className="bg-muted text-muted-foreground">
<div className="bg-primary text-primary-foreground">

// ❌ 错误：硬编码颜色
<div className="bg-[#1a1a2e] text-[#e2e8f0]">
<div className="bg-blue-600 text-white">
<div className="bg-gradient-to-r from-blue-600 to-purple-600">

// ✅ 正确：使用语义化圆角
<div className="rounded-md rounded-lg">

// ❌ 错误：硬编码圆角
<div className="rounded-[8px]">
```

---

## 六、可复用模块清单

### 6.1 数据库层

| 模块 | 路径 | 说明 | 复用方式 |
|------|------|------|---------|
| 数据库访问 | `@/lib/db` | query/queryOne/insert/update/remove/count | `import { query } from '@/lib/db'` |
| MySQL连接池 | `@/lib/mysql` | 连接池管理（内部模块） | 不直接使用 |

### 6.2 认证模块

| 模块 | 路径 | 说明 | 复用方式 |
|------|------|------|---------|
| 用户认证 | `@/lib/auth/apiAuth` | getAuthUser / getAuthUserId | API Route 认证 |
| 管理员认证 | `@/lib/auth/adminAuth` | getAdminUser | 管理后台API认证 |
| Token工具 | `@/lib/auth/utils` | signToken / verifyToken | JWT签发与验证 |
| 认证上下文 | `@/lib/auth/context` | AuthProvider / useAuth | 前端登录态管理 |
| 前端守卫 | `@/components/auth/RequireAuth` | 登录拦截 | 包裹需要登录的页面 |
| 前端守卫 | `@/components/auth/GuestGuard` | 游客拦截 | 登录/注册页 |

### 6.3 请求层

| 模块 | 路径 | 说明 | 复用方式 |
|------|------|------|---------|
| API请求 | `@/lib/api-request` | api.get/post/put/delete | 前端统一请求 |
| API配置 | `@/lib/api-config` | getApiUrl / API_CONFIG | 请求地址管理 |
| 数据Hook | `@/lib/hooks/use-api` | useFetch / usePagination | 数据获取 |
| 通用Hooks | `@/lib/hooks` | useDebounce / useLocalStorage | 工具Hook |
| Toast | `@/lib/hooks/use-toast` | useToast | 消息提示 |

### 6.4 工具函数

| 模块 | 路径 | 说明 | 复用方式 |
|------|------|------|---------|
| 金额格式化 | `@/lib/format` | formatPrice / formatDiscount | 金额显示 |
| 表单验证 | `@/lib/validation` | validate / ValidationRule | 表单校验 |
| 类名合并 | `@/lib/utils` | cn() | Tailwind类名 |
| 常量定义 | `@/lib/constants` | ORDER_STATUS / PAGINATION | 业务常量 |
| 类型定义 | `@/lib/types` | 通用类型 | TypeScript类型 |

### 6.5 UI组件

| 组件 | 路径 | 说明 | 使用场景 |
|------|------|------|---------|
| EmptyState | `@/components/ui/empty-state` | 空状态（通用版） | **所有空态统一用这个** |
| PageLoader | `@/components/ui/PageLoader` | 页面加载 | 页面级loading |
| Pagination | `@/components/ui/Pagination` | 分页 | 列表分页 |
| StatusBadge | `@/components/ui/StatusBadge` | 状态标签 | 订单/商品状态 |
| DataTable | `@/components/ui/DataTable` | 数据表格 | 管理后台列表 |
| SearchFilter | `@/components/ui/SearchFilter` | 搜索筛选 | 列表筛选 |
| ConfirmDialog | `@/components/ui/ConfirmDialog` | 确认弹窗 | 删除/操作确认 |
| ImageUpload | `@/components/upload/ImageUpload` | 图片上传 | 商品/新闻图片 |
| FileUpload | `@/components/ui/FileUpload` | 文件上传 | 通用上传 |
| AdminTable | `@/components/admin/AdminTable` | 管理后台表格 | 后台列表页 |
| AdminForm | `@/components/admin/AdminForm` | 管理后台表单 | 后台编辑页 |

### 6.6 业务组件

| 组件 | 路径 | 说明 | 复用场景 |
|------|------|------|---------|
| ProductRecommendations | `@/components/shop/ProductRecommendations` | 商品推荐 | 首页/商品详情 |
| OrderList | `@/components/order/OrderList` | 订单列表 | 用户中心/管理后台 |
| CartList | `@/components/cart/CartList` | 购物车列表 | 购物车页 |
| ReviewSection | `@/components/review/ReviewSection` | 评价区块 | 商品详情 |
| NotificationBell | `@/components/notification/NotificationBell` | 通知铃铛 | Header |
| AddressList | `@/components/user/AddressList` | 地址管理 | 结算页/用户中心 |

---

## 七、组件开发规范

### 7.1 新建组件原则

1. **优先复用**：检查上方"可复用模块清单"是否已有满足需求的组件
2. **禁止重复造轮子**：
   - 空状态 → 用 `@/components/ui/empty-state`，**不要**在各模块自建
   - 加载态 → 用 `@/components/ui/PageLoader` 或 `@/components/ui/Skeleton`
   - 分页 → 用 `@/components/ui/Pagination`
   - 确认弹窗 → 用 `@/components/ui/ConfirmDialog`
3. **模块内聚**：业务组件放在对应模块目录 `src/components/{module}/`
4. **跨模块通用**：放在 `src/components/common/` 或 `src/components/ui/`

### 7.2 重复组件清理结果

| 重复项 | 保留 | 已删除 | 状态 |
|--------|------|--------|------|
| EmptyState (3个) | `ui/empty-state` | `ui/EmptyState`, `free-gifts/EmptyState` | 已清理 |
| OptimizedImage (2个) | `common/OptimizedImage` | `media/OptimizedImage` | 已清理 |
| ImagePreview (2个) | `ui/ImagePreview` | `media/ImagePreview` | 已清理 |
| Skeleton (多处) | `ui/Skeleton` | `free-gifts/Skeleton` | 已清理 |
| empty.tsx vs empty-state.tsx | `ui/empty-state` | `ui/empty.tsx` | 已清理 |
| ErrorState | `ui/empty-state` (ErrorState) | `free-gifts/EmptyState` (ErrorState) | 已合并 |

**重要**：新增空状态/错误状态统一使用 `@/components/ui/empty-state`，已包含：
- `EmptyState` - 通用空状态
- `EmptyIcon` - 预设图标（cart/favorites/orders/search/data/network）
- `ErrorState` - 错误状态
- `NetworkError` - 网络错误状态

### 7.3 组件文件模板

```tsx
/**
 * @fileoverview {组件名} - {简述}
 * @module components/{module}/{ComponentName}
 */

'use client';  // 交互组件必须，纯展示组件不需要

import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';  // shadcn/ui 组件

interface {ComponentName}Props {
  /** 必填属性必须有注释 */
  data: any[];
  /** 可选属性 */
  className?: string;
  /** 回调函数 */
  onItemClick?: (id: number) => void;
}

export function {ComponentName}({ data, className, onItemClick }: {ComponentName}Props) {
  if (!data.length) return null;

  return (
    <div className={cn('base-classes', className)}>
      {/* 内容 */}
    </div>
  );
}
```

---

## 八、新增功能开发流程

### 8.1 标准开发步骤

```
1. 确认需求 → 查阅本文档"可复用模块清单"
2. 数据库 → SQL建表 + sql/schema.sql同步 + db.ts种子数据
3. API Route → 按第四章标准编写
4. 前端页面 → 按第五章标准编写，复用已有组件
5. 测试 → ts-check + lint + API冒烟测试
```

### 8.2 新增模块 Checklist

- [ ] `sql/schema.sql` 已同步建表语句
- [ ] `src/lib/db.ts` 已添加种子数据（如Mock DB需初始化）
- [ ] API Route 遵循第四章标准
- [ ] 认证使用 `getAuthUserId` / `getAdminUser`
- [ ] 数据库操作使用 `@/lib/db` 六个函数
- [ ] 响应格式遵循 4.2 标准
- [ ] 前端复用已有组件（对照 6.5 / 6.6）
- [ ] 无 Hydration 风险（对照 5.2）
- [ ] 样式使用语义化变量（对照 5.3）

---

## 九、编码红线（必须遵守）

### 9.1 禁止

| 红线 | 说明 |
|------|------|
| ❌ 直接使用 npm / yarn | 包管理器只用 pnpm |
| ❌ import `@/lib/mysql` | 数据库操作只用 `@/lib/db` |
| ❌ 直接使用 `@supabase/*` | 已移除 Supabase |
| ❌ 硬编码颜色 | 用 `bg-background` / `text-foreground` 等语义变量 |
| ❌ 硬编码端口 | 从 `process.env.DEPLOY_RUN_PORT` 读取 |
| ❌ 硬编码域名 | 从 `process.env.COZE_PROJECT_DOMAIN_DEFAULT` 读取 |
| ❌ SQL字符串拼接 | 必须参数化查询 `?` |
| ❌ 隐式 any | 函数参数、回调必须标注类型 |
| ❌ 渲染中使用 `Date.now()` / `Math.random()` | Hydration 不匹配 |
| ❌ `<p>` 嵌套 `<div>` | 非法 HTML 嵌套 |
| ❌ 重复造空态/加载态/分页组件 | 复用已有组件 |

### 9.2 必须

| 规则 | 说明 |
|------|------|
| ✅ API Route 用 try-catch | 防止未捕获异常导致服务崩溃 |
| ✅ 需要登录的API调 `getAuthUserId` | Cookie + Header 双通道认证 |
| ✅ 管理后台API调 `getAdminUser` | 管理员权限校验 |
| ✅ 列表API返回 `{ data, total, page, page_size }` | 标准分页格式 |
| ✅ 交互组件加 `'use client'` | Next.js App Router 要求 |
| ✅ 动态内容用 `useState + useEffect` | 避免 Hydration 错误 |
| ✅ 文件头加 `@fileoverview` 注释 | 代码可读性 |

---

## 十、部署相关

### 生产架构（SSR + PHP API，SEO 友好）

```
                        ┌─────────────────────┐
                        │     Nginx 反向代理    │
                        └──────────┬───────────┘
                    ┌──────────────┼──────────────┐
                    ▼                              ▼
          /api/* → PHP-FPM              /* → Next.js (SSR)
          (php/public/index.php)        (localhost:5000)
                    │                              │
                    ▼                              ▼
               MySQL 8.x                    渲染完整 HTML
            (fubao database)            (爬虫直接拿到内容)
```

**SEO 关键**：Next.js SSR 输出完整 HTML，搜索引擎爬虫无需执行 JS 即可获取页面内容。所有 API 调用在服务端完成，页面以完整 DOM 输出。

### 开发环境 vs 生产环境

| 维度 | 开发环境 | 生产环境 |
|------|---------|---------|
| 前端 SSR | Next.js Dev (port 5000) | Next.js Start (port 5000) |
| API 处理 | Next.js API Routes | PHP-FPM + ThinkPHP |
| 数据库 | Mock DB 降级 / MySQL | MySQL |
| API 模式变量 | `NEXT_PUBLIC_API_MODE=local` | `NEXT_PUBLIC_API_MODE=php` |
| 热更新 | HMR 开启 | 关闭 |

### 环境变量

```bash
# Next.js 前端
DEPLOY_RUN_PORT=5000                    # 服务监听端口
COZE_WORKSPACE_PATH=/workspace/projects # 工作目录
NEXT_PUBLIC_API_MODE=local              # 开发=local / 生产=php
NEXT_PUBLIC_PHP_API_URL=                # PHP API地址（生产环境设置）

# MySQL（前端 + PHP 共用）
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=fubao
MYSQL_PASSWORD=xxx
MYSQL_DATABASE=fubao

# PHP 后端（php/config/database.php 读取）
DB_HOST=localhost
DB_PORT=3306
DB_USER=fubao
DB_PASSWORD=xxx
DB_NAME=fubao

# AI
AI_PROVIDER=volcengine
```

### 部署脚本

```bash
# 一键更新（Next.js 前端 + Docker）
bash update-fubao.sh

# MySQL初始化
bash sql/deploy-mysql.sh
```

---

> 本文档由项目维护者更新，如有疑问以本文档为准。
