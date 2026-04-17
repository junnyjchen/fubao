# 符寶網 - 统一代码规范标准

> 本文档定义了符寶網项目的统一代码规范，包括命名、组件、API调用、目录结构等标准。

---

## 1. 项目概述

| 项目 | 技术栈 |
|------|--------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + shadcn/ui |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 4 |
| 包管理 | **pnpm** (强制) |

---

## 2. 命名规范

### 2.1 文件命名

```
# React 组件
ComponentName.tsx        # 帕斯卡命名
component-name.tsx       # kebab-case (Next.js page 用)

# 工具函数
useHook.ts              # use 前缀 (Hooks)
utilFunction.ts         # 小写下划线
formatDate.ts           # 功能描述性

# API 相关
api-config.ts            # api 前缀
api-response.ts         # api 前缀
*.d.ts                  # 类型定义
```

### 2.2 变量命名

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| React组件 | PascalCase | `UserProfile` |
| 函数组件 | PascalCase | `Header` |
| Hooks | camelCase + use前缀 | `useUserData` |
| 普通变量 | camelCase | `userName` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 类型/接口 | PascalCase | `UserInfo` |
| 枚举 | PascalCase | `OrderStatus` |
| 布尔值 | is/has/should 前缀 | `isLoading` |

### 2.3 目录命名

```
src/
├── app/                 # Next.js App Router
├── components/
│   ├── ui/              # shadcn/ui 基础组件
│   ├── admin/           # 管理后台组件
│   ├── ai/              # AI 相关组件
│   └── [feature]/       # 功能模块组件
├── lib/
│   ├── hooks/           # 自定义 Hooks
│   ├── utils/           # 工具函数 (可选)
│   └── *.ts             # 配置文件
└── styles/              # 全局样式
```

---

## 3. 组件规范

### 3.1 组件文件结构

```tsx
// 1. 导入
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 2. 类型定义
interface Props {
  title: string;
  onClose?: () => void;
}

// 3. 组件定义
export function ComponentName({ title, onClose }: Props) {
  // 4. Hooks
  const [count, setCount] = useState(0);
  
  // 5. 副作用
  useEffect(() => {
    // ...
  }, []);
  
  // 6. 回调
  const handleClick = () => {
    // ...
  };
  
  // 7. 渲染
  return (
    <div className="...">
      <h1>{title}</h1>
      <Button onClick={handleClick}>点击</Button>
    </div>
  );
}

// 8. 导出
export default ComponentName;
```

### 3.2 Props 类型定义

```tsx
// ✅ 推荐：内联类型定义
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// ✅ 推荐：分离类型定义（复杂场景）
type FormProps = {
  fields: Field[];
  onSubmit: (data: FormData) => void;
};

// ❌ 避免：混合命名
interface Props {
  buttonText: string;      // 混用命名风格
  ButtonLabel: string;     // ❌
  on_Btn_Click: () => void; // ❌
}
```

### 3.3 组件分类

| 目录 | 说明 | 命名 |
|------|------|------|
| `ui/` | shadcn/ui 基础组件 | 继承 shadcn 命名 |
| `admin/` | 管理后台专用组件 | Admin 结尾 |
| `ai/` | AI 功能组件 | AI 结尾 |
| `auth/` | 认证相关组件 | Auth 结尾 |
| `cart/` | 购物车组件 | Cart 结尾 |
| `order/` | 订单组件 | Order 结尾 |
| `product/` | 商品组件 | Product/Goods 结尾 |
| `common/` | 通用组件 | 功能描述性 |

---

## 4. API 调用规范

### 4.1 API 配置文件 (`lib/api-config.ts`)

```typescript
// API 配置
export const API_CONFIG = {
  mode: process.env.NEXT_PUBLIC_API_MODE || 'local',  // 'local' | 'remote'
  remoteUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 30000,
  retries: 1,
};

// 获取 API URL
export function getApiUrl(path: string): string {
  if (API_CONFIG.mode === 'remote') {
    return `${API_CONFIG.remoteUrl}${path}`;
  }
  return `/api${path}`;
}
```

### 4.2 API 请求封装

```typescript
// lib/api-request.ts

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
}

export async function request<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params, headers = {} } = options;
  
  let url = getApiUrl(path);
  if (params && method === 'GET') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) searchParams.append(k, String(v));
    });
    const query = searchParams.toString();
    if (query) url += `?${query}`;
  }

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message);
  }

  return res.json();
}

// 便捷方法
export const api = {
  get: <T>(path: string, params?: Record<string, string | number>) =>
    request<T>('GET', path, { params }),
  post: <T>(path: string, data?: any) =>
    request<T>('POST', path, { body: data }),
  put: <T>(path: string, data?: any) =>
    request<T>('PUT', path, { body: data }),
  delete: <T>(path: string, data?: any) =>
    request<T>('DELETE', path, { body: data }),
};
```

### 4.3 API 路由规范

```
src/app/api/
├── [resource]/              # 资源模块
│   ├── route.ts            # GET(列表) POST(创建)
│   └── [id]/
│       └── route.ts        # GET(详情) PUT(更新) DELETE(删除)
├── auth/
│   ├── login/route.ts
│   └── register/route.ts
├── admin/                   # 管理后台 API
│   ├── users/route.ts
│   └── goods/route.ts
└── ai/                      # AI 功能 API
    ├── chat/route.ts
    └── embedding/route.ts
```

### 4.4 API 响应格式

```typescript
// 成功响应
{
  success: true,
  data: { ... },
  message: '操作成功'
}

// 错误响应
{
  success: false,
  error: '错误信息',
  code: 'ERROR_CODE'
}
```

---

## 5. 类型定义规范

### 5.1 统一类型文件 (`lib/types.ts`)

```typescript
// 基础类型
export type ID = string | number;

// API 响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

// 业务类型
export interface User {
  id: ID;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  created_at: string;
}

export interface Goods {
  id: ID;
  name: string;
  price: number;
  cover_image: string;
  category_id: number;
}

export interface Order {
  id: ID;
  order_no: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
}

export type OrderStatus = 
  | 'pending' 
  | 'paid' 
  | 'shipped' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled';
```

---

## 6. Hooks 规范

### 6.1 Hooks 命名

```typescript
// use + 功能名
export function useUser(userId: ID) { }
export function usePagination(initialPage = 1) { }
export function useDebounce<T>(value: T, delay: number) { }
```

### 6.2 常用 Hooks 位置

| Hook | 路径 | 说明 |
|------|------|------|
| useApi | `lib/hooks/use-api.ts` | API 请求封装 |
| useAuth | `lib/auth/context.tsx` | 认证状态 |
| useToast | `components/ui/toast.tsx` | Toast 通知 |
| useLocalStorage | `lib/hooks/use-local-storage.ts` | 本地存储 |
| useMediaQuery | `lib/hooks/use-media-query.ts` | 媒体查询 |

---

## 7. 样式规范

### 7.1 Tailwind CSS 使用

```tsx
// ✅ 推荐：语义化类名
<div className="bg-card text-card-foreground rounded-lg">
  <h2 className="text-xl font-semibold">标题</h2>
</div>

// ❌ 避免：硬编码颜色
<div className="bg-[#f0f0f0] text-[#333] rounded-[8px]">
  <h2 className="text-[20px]">标题</h2>
</div>

// ✅ 使用主题变量
<div className="bg-primary/10 text-primary">
  <h2 className="text-xl font-bold">标题</h2>
</div>
```

### 7.2 主题变量

```css
/* globals.css 主题变量 */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}
```

### 7.3 常用类名

| 场景 | 类名 |
|------|------|
| 容器 | `container mx-auto px-4` |
| 卡片 | `bg-card rounded-lg border shadow-sm` |
| 间距 | `space-y-4 gap-4 p-4 m-4` |
| 文字 | `text-sm text-muted-foreground` |
| 按钮 | `bg-primary text-primary-foreground` |

---

## 8. Next.js 规范

### 8.1 页面文件

```tsx
// ✅ App Router 页面
src/app/
├── page.tsx                    # 首页
├── [slug]/page.tsx             # 动态路由
├── layout.tsx                  # 布局
└── loading.tsx                 # 加载状态
```

### 8.2 Hydration 安全

```tsx
'use client';

// ❌ 错误：在 JSX 中直接使用
export function Component() {
  return <div>{typeof window !== 'undefined' ? 'client' : 'server'}</div>;
}

// ✅ 正确：使用 useState + useEffect
export function Component() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return <div>Loading...</div>;
  
  return <div>{window.location.href}</div>;
}

// ✅ 正确：简单条件渲染
export function Component() {
  const isClient = useIsClient(); // 自定义 hook
  
  return (
    <div>
      {isClient ? <ClientContent /> : null}
    </div>
  );
}
```

### 8.3 动态导入

```tsx
// 大组件懒加载
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// 条件渲染
const Modal = dynamic(() => import('@/components/ui/Modal'));
```

---

## 9. Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具变更
```

### 示例

```
feat: add AI chat component
fix: resolve user login issue
docs: update API documentation
refactor: simplify form validation
```

---

## 10. 目录速查

```
src/
├── app/                    # 页面 (App Router)
│   ├── page.tsx           # 首页
│   ├── [slug]/page.tsx   # 动态路由
│   ├── api/               # API Routes
│   ├── admin/             # 管理后台页面
│   └── (auth)/            # 认证页面
├── components/            # 组件
│   ├── ui/               # shadcn/ui 组件
│   ├── admin/             # 管理后台组件
│   ├── ai/                # AI 组件
│   └── common/            # 通用组件
└── lib/                   # 工具库
    ├── api-config.ts      # API 配置
    ├── types.ts          # 类型定义
    ├── utils.ts          # 工具函数
    ├── hooks/            # 自定义 Hooks
    └── auth/              # 认证相关
```

---

## 11. 常见问题

### Q: 何时使用 `use client`?
A: 组件中使用了浏览器 API（window、localStorage）、Hooks（useState、useEffect）、或事件处理时。

### Q: API 请求放在哪里?
A: 
- 简单请求 → 组件内直接调用 `api.get()` / `api.post()`
- 复杂逻辑 → 封装到 `lib/hooks/use-xxx.ts`
- 数据获取 → 使用 `lib/api-xxx.ts`

### Q: 如何处理错误?
A: 
```tsx
try {
  const data = await api.get('/users');
} catch (error) {
  console.error('获取失败:', error);
  toast.error('操作失败');
}
```

### Q: 组件太大怎么办?
A: 拆分为子组件，或使用 compound component 模式。

---

> 最后更新: 2024年
