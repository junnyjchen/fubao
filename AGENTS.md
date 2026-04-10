# 符寶網项目文档

## 项目概述

符寶網是全球玄門文化科普交易平台，提供符箓、法器等玄門文化产品的交易与科普服务。平台采用"科普先行、交易放心、一物一證"的理念，为用户提供专业、可信赖的玄門文化产品购物体验。

### 核心功能

- **商品展示与交易**：符箓、法器等玄門文化产品展示、分类、搜索、购买
- **科普内容**：文章、视频、新闻等玄門文化知识科普
- **用户系统**：注册、登录、个人中心、订单管理
- **第三方登录**：支持Google、Facebook、微信、X等OAuth登录
- **商家入驻**：商家申请、商品管理、订单处理
- **证书认证**：一物一證，产品溯源
- **AI内容生成**：使用coze-coding-dev-sdk集成大语言模型
- **AI新闻自动发布**：自动搜索新闻并使用AI翻译发布

## 技术栈

| 类型 | 技术 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Core | React 19 |
| Language | TypeScript 5 |
| UI组件 | shadcn/ui (Radix UI) |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Auth | JWT + OAuth 2.0 |
| AI SDK | coze-coding-dev-sdk |

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── admin/          # 后台管理页面
│   │   ├── api/            # API路由
│   │   ├── user/           # 用户中心页面
│   │   ├── login/          # 登录页面
│   │   ├── register/       # 注册页面
│   │   └── ...             # 其他页面
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── auth/           # 认证相关工具
│   │   └── utils.ts        # 通用工具函数
│   └── storage/            # 数据存储
│       └── database/       # 数据库配置与Schema
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 开发规范

### 包管理
**仅允许使用 pnpm**，严禁使用 npm 或 yarn。

```bash
pnpm add <package>          # 安装依赖
pnpm add -D <package>       # 安装开发依赖
pnpm install                # 安装所有依赖
pnpm remove <package>       # 移除依赖
```

### 数据库操作

```bash
# 同步数据库模型到本地schema.ts
coze-coding-ai db generate-models

# 同步本地schema到数据库
coze-coding-ai db upgrade
```

### 代码规范

1. **Hydration 错误预防**：严禁在 JSX 渲染逻辑中直接使用 `typeof window`、`Date.now()`、`Math.random()` 等动态数据。必须使用 `'use client'` 并配合 `useEffect` + `useState` 确保动态内容仅在客户端挂载后渲染。

2. **字段命名**：Supabase SDK 使用 snake_case，禁止 camelCase

3. **错误处理**：每次 Supabase 调用都检查 `{ data, error }`，遇到 error 必须 throw 或处理

4. **UI组件**：默认使用 shadcn/ui 组件、风格和规范

## 核心数据库表

| 表名 | 说明 |
|------|------|
| users | 用户信息 |
| oauth_providers | OAuth提供商配置 |
| user_oauth_accounts | 用户OAuth账号绑定 |
| goods | 商品信息 |
| categories | 分类 |
| orders | 订单 |
| certificates | 证书 |
| articles | 文章 |
| merchants | 商家 |

## 关键API接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息

### OAuth相关
- `GET /api/oauth/providers` - 获取启用的OAuth提供商
- `GET /api/oauth/authorize` - 生成OAuth授权URL
- `GET /api/oauth/callback` - OAuth回调处理
- `GET /api/user/oauth-accounts` - 用户OAuth账号管理
- `GET/PUT /api/admin/oauth-providers` - 后台OAuth配置管理

### 商品相关
- `GET /api/goods` - 商品列表
- `GET /api/goods/[id]` - 商品详情
- `GET /api/categories` - 分类列表

### 订单相关
- `GET /api/orders` - 订单列表
- `POST /api/orders` - 创建订单
- `GET /api/orders/[id]` - 订单详情

## OAuth登录配置

### 后台配置路径
`/admin/oauth-config`

### 支持的提供商
- Google
- Facebook
- WeChat (微信)
- X (Twitter)

### 回调地址
```
{COZE_PROJECT_DOMAIN_DEFAULT}/api/oauth/callback
```

### 使用流程
1. 在对应开发者平台创建应用获取 Client ID 和 Client Secret
2. 在后台配置页面填写配置信息
3. 开启启用开关
4. 用户即可在登录/注册页面使用第三方登录

## 环境变量

| 变量名 | 说明 |
|--------|------|
| COZE_WORKSPACE_PATH | 项目工作目录 |
| COZE_PROJECT_DOMAIN_DEFAULT | 对外访问域名 |
| DEPLOY_RUN_PORT | 服务监听端口 (5000) |
| COZE_PROJECT_ENV | 环境标识 (DEV/PROD) |
| COZE_SUPABASE_URL | Supabase项目URL |
| COZE_SUPABASE_ANON_KEY | Supabase匿名密钥 |

## 常用命令

```bash
# 开发环境启动
pnpm dev

# 构建检查
npx tsc --noEmit

# 生产环境构建
pnpm build

# 生产环境启动
pnpm start
```

## 注意事项

1. **端口规范**：Web服务必须运行在 5000 端口
2. **RLS策略**：新建表必须配置 RLS 策略
3. **文件存储**：生成的文件优先存储到对象存储，本地存储仅在开发环境使用 `/workspace/projects/public`，生产环境使用 `/tmp`
4. **禁止Mock**：集成服务调用必须使用真实API，禁止返回假数据

## 部署文档

- [宝塔面板部署指南](./docs/baota-deployment.md) - 详细的服务器部署、环境配置、Nginx反向代理、SSL证书配置说明

## AI新闻自动发布功能

### 功能概述
AI新闻自动发布功能可以自动搜索最新新闻，使用AI模型翻译和优化内容，并支持定时发布。

### 后台入口
`/admin/ai-news`

### 数据库表

| 表名 | 说明 |
|------|------|
| ai_configurations | AI模型配置（支持豆包、DeepSeek、Kimi、智谱GLM、通义千问） |
| news_sources | 新闻源配置（关键词、语言、目标语言） |
| auto_publish_tasks | 定时任务配置（Cron表达式） |
| ai_generated_articles | AI生成的文章 |

### AI配置说明

支持的AI提供商：
- **豆包/Coze**: `provider: 'doubao'` 或 `'coze'`
- **DeepSeek**: `provider: 'deepseek'`
- **Kimi**: `provider: 'kimi'`
- **智谱GLM**: `provider: 'glm'`
- **通义千问**: `provider: 'qwen'`

### API接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/ai-news/configs` | GET/POST/PUT | AI配置CRUD |
| `/api/ai-news/configs/[id]` | DELETE/PUT | 删除/更新配置 |
| `/api/ai-news/sources` | GET/POST/PUT | 新闻源CRUD |
| `/api/ai-news/sources/[id]` | DELETE/PUT | 删除/更新新闻源 |
| `/api/ai-news/tasks` | GET/POST/PUT/DELETE | 定时任务CRUD |
| `/api/ai-news/tasks/[id]/run` | POST | 手动执行任务 |
| `/api/ai-news/articles` | GET/PUT/DELETE | 文章列表和管理 |
| `/api/ai-news/articles/[id]` | GET/PUT/DELETE | 文章详情管理 |

### Cron表达式示例

| 表达式 | 说明 |
|--------|------|
| `0 6 * * *` | 每天早上6点 |
| `0 */4 * * *` | 每4小时 |
| `0 9,12,18 * * *` | 每天9点、12点、18点 |
| `0 0 * * 0` | 每周日凌晨 |

### 环境变量

| 变量名 | 说明 |
|--------|------|
| COZE_API_TOKEN | Coze API Token（用于新闻搜索） |

### 数据库迁移

运行以下命令创建AI新闻功能所需的数据库表：

```bash
# 或在 Supabase SQL Editor 中执行
# 文件位置: scripts/ai-news-migration.sql
```

> 数据库表已通过 exec_sql 工具创建完成。
