# 符寶網 - Agent 开发规范

## 项目信息

| 项目 | 值 |
|------|-----|
| 名称 | 符寶網 - 全球玄門文化科普交易平台 |
| 框架 | Next.js 16 (App Router) + React 19 |
| UI | shadcn/ui + Tailwind CSS 4 |
| 语言 | TypeScript 5 |
| 包管理 | **pnpm** (强制) |

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式 (端口 5000)
pnpm dev

# 生产构建
pnpm build

# 代码检查
pnpm lint
pnpm ts-check
```

---

## 目录结构

```
src/
├── app/                    # 页面 (Next.js App Router)
│   ├── page.tsx           # 首页
│   ├── [slug]/page.tsx   # 动态路由
│   ├── api/               # API Routes
│   │   ├── auth/         # 认证 API
│   │   ├── goods/        # 商品 API
│   │   ├── orders/       # 订单 API
│   │   └── ai/           # AI API
│   ├── admin/             # 管理后台页面
│   └── layout.tsx        # 根布局
├── components/            # 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── ai/               # AI 组件
│   ├── admin/             # 管理后台组件
│   └── [feature]/        # 功能模块组件
└── lib/                   # 工具库
    ├── api-request.ts     # API 请求封装
    ├── api-config.ts      # API 配置
    ├── types.ts          # 类型定义
    ├── utils.ts          # 工具函数
    ├── format.ts         # 格式化函数
    ├── hooks/            # 自定义 Hooks
    └── auth/             # 认证相关
```

---

## 核心组件

### UI 基础组件 (`components/ui/`)

| 组件 | 文件 | 说明 |
|------|------|------|
| Toast | `toast.tsx` | 通知提示 |
| Modal | `modal.tsx` | 对话框/抽屉 |
| Tabs | `tabs.tsx` | 标签页 |
| Image | `image.tsx` | 图片/头像 |
| EmptyState | `empty-state.tsx` | 空状态 |
| Pagination | `pagination.tsx` | 分页 |
| Skeleton | `skeleton.tsx` | 骨架屏 |

### AI 组件 (`components/ai/`)

| 组件 | 说明 |
|------|------|
| `AIChat` | AI 聊天主组件 (支持 `adminMode` 属性) |
| `QuickStartAI` | 快速启动 AI 助手 |
| `FloatingAIButton` | 悬浮 AI 按钮 |

### 业务组件

| 目录 | 说明 |
|------|------|
| `admin/` | 管理后台组件 (AdminTable, AdminForm, Charts) |
| `auth/` | 认证组件 (AuthDialog, SigninDialog) |
| `cart/` | 购物车组件 |
| `order/` | 订单组件 |
| `product/` | 商品组件 |
| `favorite/` | 收藏组件 |
| `coupon/` | 优惠券组件 |
| `search/` | 搜索组件 (HighlightText, GlobalSearch) |
| `share/` | 分享组件 (SharePoster) |

---

## API 调用

### 基础请求

```typescript
import { getApiUrl } from '@/lib/api-config';
import { api } from '@/lib/api-request';

export async function getUsers(params: { page?: number; limit?: number }) {
  return api.get('/admin/users', params);
}

export async function createUser(data: { name: string; email: string }) {
  return api.post('/admin/users', data);
}
```

### AI API

```typescript
// 聊天 (SSE 流式)
POST /api/ai/chat
Body: { message: string, session_id?: string }

// 搜索知识库
POST /api/ai/knowledge/search
Body: { query: string, topK?: number }

// 文本嵌入
POST /api/ai/embedding
Body: { texts: string[] }
```

---

## 常用工具

### 格式化 (`lib/format.ts`)

```typescript
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/format';

// ¥100.00
formatPrice(100);

// 2024-01-01
formatDate(new Date());

// 3小時前
formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000);
```

### 类型 (`lib/types.ts`)

```typescript
import type { ApiResponse, PaginatedResponse, User, Goods, Order } from '@/lib/types';
```

### 工具 (`lib/utils.ts`)

```typescript
import { cn } from '@/lib/utils';

// 合并类名
<div className={cn('base-class', condition && 'active-class')} />
```

---

## 管理后台页面

| 路径 | 页面 |
|------|------|
| `/admin` | 仪表盘 |
| `/admin/goods` | 商品管理 |
| `/admin/orders` | 订单管理 |
| `/admin/users` | 用户管理 |
| `/admin/ai-training` | AI 训练中心 |
| `/admin/ai-assistant` | AI 助手 (管理员专用) |
| `/admin/coupons` | 优惠券管理 |
| `/admin/banners` | Banner 管理 |
| `/admin/announcements` | 公告管理 |
| `/admin/categories` | 分类管理 |
| `/admin/settings` | 系统设置 |

---

## 用户端页面

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/shop` | 商品列表 |
| `/shop/[id]` | 商品详情 |
| `/cart` | 购物车 |
| `/order/[id]` | 订单详情 |
| `/knowledge` | 知识库 |
| `/ai-assistant` | AI 助手 |
| `/baike` | 百科 |
| `/news` | 新闻 |
| `/certificate` | 证书验证 |

---

## 开发规范

### Hydration 安全

```tsx
'use client';

export function Component() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return <Skeleton />;
  return <ClientContent />;
}
```

### 组件命名

- React 组件: `PascalCase` → `UserProfile.tsx`
- 工具函数: `camelCase` → `useUserData.ts`
- 页面文件: `kebab-case` → `user-profile/page.tsx`

### 命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 变量 | camelCase | `userName` |
| 常量 | UPPER_SNAKE | `MAX_COUNT` |
| 组件 | PascalCase | `UserCard` |
| 接口 | PascalCase | `UserInfo` |
| 布尔 | is/has 前缀 | `isLoading` |

---

## 快捷命令

```bash
pnpm dev          # 开发模式
pnpm build        # 生产构建
pnpm start        # 生产运行
pnpm lint         # 代码检查
pnpm ts-check     # 类型检查
```

---

## 默认账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123 |

---

## 环境变量

```bash
NEXT_PUBLIC_API_MODE=local        # local 或 remote
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

> 详细规范见 `docs/CODING_STANDARDS.md`
