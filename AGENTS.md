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

### 前端工具库

#### 组件 (`src/components/ui/`)

| 文件 | 说明 |
|------|------|
| `toast.tsx` | Toast 通知组件 |
| `modal.tsx` | Modal/Dialog/Drawer 组件 |
| `error-boundary.tsx` | 错误边界组件 |
| `image.tsx` | Image/Avatar/CoverImage 组件 |
| `tabs.tsx` | Tabs 标签页组件 |
| `empty-state.tsx` | 空状态组件 |
| `pagination.tsx` | 分页组件 |
| `skeleton.tsx` | 骨架屏组件 |

#### Toast 通知

```typescript
import { ToastProvider, useToast } from '@/components/ui/toast'

// 在根组件中使用
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  )
}

// 在子组件中使用
function MyComponent() {
  const { success, error, info, loading, dismiss } = useToast()
  
  const handleClick = async () => {
    const id = loading('加载中...')
    await apiCall()
    dismiss(id)
    success('操作成功')
  }
}
```

#### Modal 对话框

```typescript
import { Modal, ConfirmDialog, Drawer } from '@/components/ui/modal'

// 普通对话框
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="标题">
  内容
</Modal>

// 确认对话框
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  message="确定要删除吗？"
  type="danger"
/>

// 底部抽屉
<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="标题">
  内容
</Drawer>
```

#### Image 图片组件

```typescript
import { Image, Avatar, CoverImage } from '@/components/ui/image'

// 普通图片（带懒加载和错误处理）
<Image src="/image.jpg" alt="图片" className="w-40 h-40" />

// 头像
<Avatar src="/avatar.jpg" alt="用户名" size="lg" />

// 封面图
<CoverImage src="/cover.jpg" alt="标题" ratio="16/9" />
```

#### Tabs 标签页

```typescript
import { Tabs, TabPanel } from '@/components/ui/tabs'

<Tabs
  tabs={[
    { id: 'tab1', label: '标签1', badge: 10 },
    { id: 'tab2', label: '标签2', icon: <Icon /> },
    { id: 'tab3', label: '标签3', disabled: true },
  ]}
  variant="line"
>
  <TabPanel id="tab1">内容1</TabPanel>
  <TabPanel id="tab2">内容2</TabPanel>
</Tabs>
```

#### 工具函数 (`src/lib/`)

| 文件 | 说明 |
|------|------|
| `types.ts` | TypeScript 类型定义 |
| `format.ts` | 格式化工具函数 |
| `utils.ts` | 通用工具函数 |
| `seo.ts` | SEO 工具 |
| `hooks/use-api.ts` | API 相关 Hooks |

#### 格式化工具 (`format.ts`)

```typescript
import { 
  formatPrice,        // 金额格式化 ¥100.00
  formatDate,         // 日期格式化
  formatRelativeTime, // 相对时间
  formatCount,        // 数量格式化（1.2k, 10w）
  formatFileSize,     // 文件大小
  maskPhone,          // 手机号脱敏
  truncate,           // 文本截断
  getOrderStatusText, // 订单状态文本
} from '@/lib/format'
```

#### 类型定义 (`types.ts`)

```typescript
import type { 
  ApiResponse,        // API 响应格式
  PaginatedResponse,  // 分页响应
  User,              // 用户类型
  Goods,             // 商品类型
  Order,             // 订单类型
  Category,          // 分类类型
} from '@/lib/types'
```

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
| `POST /api/auth/logout` | POST | 用户登出 |
| `POST /api/auth/sendCode` | POST | 发送验证码 |
| `POST /api/auth/loginByPhone` | POST | 手机号登录 |

### 管理员认证

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /api/admin/login` | POST | 管理员登录 |
| `GET /api/admin/me` | GET | 获取管理员信息 |
| `POST /api/admin/changePassword` | POST | 修改密码 |
| `GET /api/admin/dashboard` | GET | 统计概览 |
| `GET /api/admin/users` | GET | 用户列表 |
| `GET /api/admin/goods` | GET | 商品列表 |
| `POST /api/admin/goods/create` | POST | 创建商品 |
| `POST /api/admin/goods/update` | POST | 更新商品 |
| `POST /api/admin/goods/delete` | POST | 删除商品 |
| `GET /api/admin/orders` | GET | 订单列表 |
| `POST /api/admin/orders/updateStatus` | POST | 更新订单状态 |
| `GET /api/admin/categories` | GET | 分类列表 |
| `GET /api/admin/banners` | GET | Banner列表 |
| `GET /api/admin/articles` | GET | 文章列表 |
| `POST /api/admin/articles/create` | POST | 创建文章 |
| `POST /api/admin/articles/update` | POST | 更新文章 |
| `POST /api/admin/articles/delete` | POST | 删除文章 |

### 业务 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/goods` | GET | 商品列表 |
| `GET /api/goods/{id}` | GET | 商品详情 |
| `GET /api/goods/featured` | GET | 精选商品 |
| `GET /api/goods/recommended` | GET | 推荐商品 |
| `GET /api/goods/hot` | GET | 热销商品 |
| `GET /api/categories` | GET | 分类列表 |
| `GET /api/categories/all` | GET | 所有分类 |
| `GET /api/cart` | GET | 购物车列表 |
| `POST /api/cart/add` | POST | 添加购物车 |
| `POST /api/cart/update` | POST | 更新购物车 |
| `POST /api/cart/remove` | POST | 删除购物车商品 |
| `GET /api/favorites` | GET | 收藏列表 |
| `POST /api/favorites/add` | POST | 添加收藏 |
| `POST /api/favorites/remove` | POST | 取消收藏 |
| `GET /api/orders` | GET | 订单列表 |
| `POST /api/orders/create` | POST | 创建订单 |
| `GET /api/orders/{id}` | GET | 订单详情 |
| `POST /api/orders/cancel` | POST | 取消订单 |
| `POST /api/orders/confirm` | POST | 确认收货 |
| `GET /api/addresses` | GET | 地址列表 |
| `POST /api/addresses/create` | POST | 创建地址 |
| `GET /api/home` | GET | 首页数据 |
| `GET /api/home/banners` | GET | Banner列表 |
| `GET /api/articles` | GET | 文章列表 |
| `GET /api/articles/{id}` | GET | 文章详情 |
| `POST /api/articles/like/{id}` | POST | 点赞文章 |

### 优惠券

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/coupons/available` | GET | 可领取优惠券 |
| `GET /api/coupons/my` | GET | 我的优惠券 |
| `POST /api/coupons/claim` | POST | 领取优惠券 |
| `POST /api/coupons/check` | POST | 检查优惠券 |

### 通知

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/notifications` | GET | 通知列表 |
| `POST /api/notifications/markRead` | POST | 标记已读 |
| `POST /api/notifications/markAllRead` | POST | 全部标记已读 |
| `GET /api/notifications/unreadCount` | GET | 未读数量 |

### 商家

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/merchants` | GET | 商家列表 |
| `GET /api/merchants/{id}` | GET | 商家详情 |
| `POST /api/merchants/apply` | POST | 商家申请 |
| `GET /api/merchants/mine` | GET | 我的商家 |
| `POST /api/merchants/update` | POST | 更新商家信息 |
| `POST /api/merchants/review` | POST | 审核商家（管理员） |

### 上传

| 接口 | 方法 | 说明 |
|------|------|------|
| `POST /api/upload/image` | POST | 上传单张图片 |
| `POST /api/upload/images` | POST | 上传多张图片 |
| `POST /api/upload/goodsImage` | POST | 上传商品图片 |
| `POST /api/upload/bannerImage` | POST | 上传Banner图片 |
| `POST /api/upload/delete` | POST | 删除文件 |

### OAuth

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/oauth/providers` | GET | 获取OAuth提供商 |
| `GET /api/oauth/authorize` | GET | 获取授权URL |
| `GET /api/oauth/callback` | GET | OAuth回调 |

### SEO 与工具

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/search` | GET | 全局搜索（商品/文章） |
| `GET /api/stats` | GET | 网站统计数据 |
| `GET /api/verify/{code}` | GET | 商品真伪验证 |
| `GET /api/sitemap.xml` | GET | 网站地图 |
| `GET /api/rss.xml` | GET | RSS订阅源 |
| `GET /api/robots.txt` | GET | robots.txt |

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
| certificates | 商品认证证书 |
| notifications | 通知消息 |

---

## 前端工具库

### React Hooks (`src/lib/hooks/`)

| 文件 | 说明 |
|------|------|
| `use-api.ts` | API 相关 Hooks |

#### 可用 Hooks

```typescript
// 搜索 Hook
import { useSearch } from '@/lib/hooks/use-api';
const { data, loading, error, search, clear } = useSearch('/api/search');

// 数据获取 Hook
import { useFetch } from '@/lib/hooks/use-api';
const { data, loading, error, refresh } = useFetch('/api/goods');

// 分页 Hook
import { usePagination } from '@/lib/hooks/use-api';
const { data, loading, page, totalPages, setPage } = usePagination('/api/goods');

// 表单提交 Hook
import { useSubmit } from '@/lib/hooks/use-api';
const { data, loading, error, submit } = useSubmit('/api/orders/create');
```

### SEO 工具 (`src/lib/seo.ts`)

```typescript
import { generateMetadata, generateJsonLd, generateProductListJsonLd } from '@/lib/seo';

// 生成页面 meta 标签
export const metadata = generateMetadata({
  title: '商品名称',
  description: '商品描述',
  type: 'product',
  image: '/product.jpg',
});

// 生成 JSON-LD 结构化数据
const jsonLd = generateProductListJsonLd(products);
```

### Skeleton 组件 (`src/components/ui/skeleton.tsx`)

```typescript
import { GoodsListSkeleton, ArticleListSkeleton, TableSkeleton } from '@/components/ui/skeleton';

// 商品列表骨架屏
<GoodsListSkeleton count={8} />

// 文章列表骨架屏
<ArticleListSkeleton count={3} />

// 表格骨架屏
<TableSkeleton rows={10} columns={5} />
```

---

## 默认账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123 |

---

## 宝塔部署（前后端分离）

### 目录结构

| 组件 | 目录 | 端口 | 说明 |
|------|------|------|------|
| 前端 | `/www/wwwroot/fubao-web` | 5000 | Next.js |
| 后端 | `/www/wwwroot/fubao-api` | 8080 | PHP |

### 一键部署命令

在宝塔终端执行：

```bash
# 一键部署
curl -sL https://raw.githubusercontent.com/junnyjchen/fubao/main/scripts/deploy-separate.sh | bash

# 或手动执行
cd /www/wwwroot/fubao-web && git pull && npm install && npm run build && chown -R www:www /www/wwwroot/fubao-web
cd /www/wwwroot/fubao-api && git pull && chown -R www:www /www/wwwroot/fubao-api
pm2 restart fubao-web
systemctl reload nginx
```

### 前端 Nginx 配置

在宝塔站点设置中添加反向代理：

```
代理名称: fubao-nextjs
目标URL: http://127.0.0.1:5000
发送域名: $host
```

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
