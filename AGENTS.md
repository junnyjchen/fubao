# 符寶網 - Agent 开发规范

## 项目信息

| 项目 | 值 |
|------|-----|
| 名称 | 符寶網 - 全球玄門文化科普交易平台 |
| 框架 | Next.js 16 (App Router) + React 19 |
| UI | shadcn/ui + Tailwind CSS 4 |
| 语言 | TypeScript 5 |
| 包管理 | **pnpm** (强制) |
| AI 集成 | 豆包/DeepSeek/Kimi (流式输出) |

---

## 项目结构

```
/workspace/projects/
├── src/
│   ├── app/                    # 页面 (Next.js App Router)
│   │   ├── page.tsx           # 首页
│   │   ├── ai-assistant/      # AI 助手页面
│   │   ├── free-gifts/        # 免费送活动
│   │   ├── cart/              # 购物车
│   │   ├── checkout/          # 结账页面
│   │   ├── login/             # 用户登录
│   │   ├── register/          # 用户注册
│   │   ├── admin/             # 管理后台
│   │   ├── api/               # API Routes
│   │   │   ├── auth/         # 认证 API
│   │   │   ├── ai/           # AI API
│   │   │   └── ...
│   │   └── layout.tsx        # 根布局
│   ├── components/            # 组件
│   │   ├── ui/               # shadcn/ui 基础组件
│   │   ├── ai/               # AI 组件
│   │   ├── cart/             # 购物车组件
│   │   ├── order/            # 订单组件
│   │   └── ...
│   └── lib/                   # 工具库
│       ├── auth/             # 认证相关
│       ├── hooks/            # 自定义 Hooks
│       └── utils.ts          # 工具函数
├── public/                    # 静态资源
├── .coze/                    # Coze 配置
└── package.json
```

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式 (端口 5000)
pnpm dev

# 生产构建
pnpm build

# 生产运行
pnpm start

# 代码检查
pnpm lint
pnpm ts-check
```

---

## 核心功能

### 1. AI 助手

| 路径 | 说明 |
|------|------|
| `/ai-assistant` | AI 助手对话页面 |
| `/api/ai/chat` | AI 聊天 API (SSE 流式) |

**特性：**
- 流式输出 (SSE)
- 知识库检索增强
- 多模型支持

### 2. 免费送活动

| 路径 | 说明 |
|------|------|
| `/free-gifts` | 免费送列表 |
| `/free-gifts/[id]` | 免费送详情 |

**特性：**
- 用户需登录参与
- 积分/任务兑换
- 分享邀请

### 3. 用户认证

| 路径 | 说明 |
|------|------|
| `/login` | 用户登录 |
| `/register` | 用户注册 |

**特性：**
- 邮箱/手机号登录
- JWT Token 认证
- 本地 Mock 模式（无数据库时）

---

## 组件库

### UI 基础组件 (`components/ui/`)

| 组件 | 说明 |
|------|------|
| Toast | 通知提示 |
| Modal/Dialog | 对话框 |
| Card | 卡片 |
| Button | 按钮 |
| Input | 输入框 |
| Select | 选择器 |
| Tabs | 标签页 |

### AI 组件 (`components/ai/`)

| 组件 | 说明 |
|------|------|
| AIChat | AI 聊天主组件 |
| QuickStartAI | 快速启动 AI |
| FloatingAIButton | 悬浮 AI 按钮 |

### 业务组件

| 目录 | 说明 |
|------|------|
| `auth/` | 认证组件 |
| `cart/` | 购物车组件 |
| `order/` | 订单组件 |
| `product/` | 商品组件 |

---

## API 调用

### 基础请求

```typescript
import { api } from '@/lib/api-request';

export async function getData(params: { page?: number }) {
  return api.get('/endpoint', params);
}
```

### AI API

```typescript
// 聊天 (SSE 流式)
POST /api/ai/chat
Body: { messages: [{role, content}], model?, temperature? }
Response: SSE stream
```

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

- React 组件: `PascalCase` → `UserCard.tsx`
- 工具函数: `camelCase` → `useUserData.ts`
- 页面文件: `kebab-case` → `user-profile/page.tsx`

### 命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 变量 | camelCase | `userName` |
| 常量 | UPPER_SNAKE | `MAX_COUNT` |
| 组件 | PascalCase | `UserCard` |
| 布尔 | is/has 前缀 | `isLoading` |

---

## Mock 数据模式

当数据库不可用时，系统会自动切换到本地 Mock 模式：

```typescript
import { mockUsers } from '@/lib/auth/mockStore';

// 查找用户
const user = mockUsers.find(email);

// 添加用户
mockUsers.add({ id, name, email, phone, password });
```

**预置测试用户：**

| 邮箱 | 密码 |
|------|------|
| test@example.com | admin123 |
| demo@example.com | admin123 |

**管理后台账户：**

| 用户名 | 密码 |
|--------|------|
| admin | admin123 |
| editor | admin123 |

---

## 环境变量

```bash
# API 模式
NEXT_PUBLIC_API_MODE=local        # local 或 remote

# Supabase (可选)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI 模型
AI_PROVIDER=volcengine          # volcengine | deepseek | kimi
```

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

> 最后更新: 2025-01-15
