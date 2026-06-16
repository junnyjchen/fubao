# 符寶網 - Agent 开发规范

## 项目信息

| 项目 | 值 |
|------|-----|
| 名称 | 符寶網 - 全球玄門文化科普交易平台 |
| 前端 | Next.js 16 (App Router) + React 19 |
| 后端(生产) | **PHP 8.x + ThinkPHP** (`php/` 目录) |
| 后端(开发) | Next.js API Routes (`src/app/api/` 目录) |
| UI | shadcn/ui + Tailwind CSS 4 |
| 语言 | TypeScript 5 / PHP 8 |
| 包管理 | 前端 **pnpm** (强制) / 后端 composer |
| 数据库 | MySQL 优先 + Mock DB 自动降级 |
| AI 集成 | 豆包/DeepSeek/Kimi (流式输出) |
| 邮件 | QQ邮箱SMTP (nodemailer / PHPMailer) |

---

## 项目结构

```
/workspace/projects/
├── src/                        # Next.js 前端 + 开发用 API
│   ├── app/                    # 页面 (Next.js App Router)
│   │   ├── page.tsx           # 首页
│   │   ├── ai-assistant/      # AI 助手页面
│   │   ├── free-gifts/        # 免费送活动
│   │   ├── cart/              # 购物车
│   │   ├── checkout/          # 结账页面
│   │   ├── shop/              # 商品商城
│   │   ├── news/              # 新闻资讯
│   │   ├── baike/             # 百科
│   │   ├── merchant/          # 商家中心
│   │   ├── user/              # 用户中心
│   │   ├── admin/             # 管理后台
│   │   ├── login/             # 用户登录
│   │   ├── register/          # 用户注册
│   │   └── api/               # API Routes（开发用后端）
│   ├── components/            # 组件
│   │   ├── ui/               # shadcn/ui 基础组件
│   │   ├── ai/               # AI 组件
│   │   ├── admin/            # 管理后台组件
│   │   ├── shop/             # 商城组件
│   │   ├── cart/             # 购物车组件
│   │   ├── order/            # 订单组件
│   │   ├── free-gifts/       # 免费送组件
│   │   ├── home/             # 首页组件
│   │   ├── merchant/         # 商家组件
│   │   ├── news/             # 新闻组件
│   │   └── ...
│   └── lib/                   # 工具库
│       ├── db.ts             # Mock DB + MySQL 双模式数据库
│       ├── mysql.ts          # MySQL 连接池
│       ├── email/service.ts  # 邮件服务 (QQ邮箱SMTP)
│       ├── auth/             # 认证相关
│       ├── ai/               # AI 相关
│       └── hooks/            # 自定义 Hooks
├── php/                        # PHP 后端（生产环境）
│   ├── app/
│   │   ├── controller/        # 控制器（与前端 API 一一对应）
│   │   ├── common/            # 公共模块（Jwt/Response/Validator/Cache）
│   │   ├── middleware/         # 中间件（AdminAuth）
│   │   └── think/             # ThinkPHP 核心扩展
│   ├── config/
│   │   ├── database.php       # 数据库配置（环境变量驱动）
│   │   └── app.php            # 应用配置
│   ├── route/
│   │   └── router.php         # 路由映射
│   ├── public/
│   │   └── index.php          # 入口文件
│   └── nginx.conf             # Nginx 配置
├── sql/                       # MySQL 建表和种子数据
│   ├── schema.sql            # 15张表DDL
│   ├── seed.sql              # 种子数据
│   └── deploy-mysql.sh       # 一键部署脚本
├── public/                    # 静态资源
└── update-fubao.sh           # 服务器一键更新脚本
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

# 代码检查
pnpm lint
pnpm ts-check
```

---

## 核心功能清单

### 1. 用户系统
| 路径 | 说明 |
|------|------|
| `/login` | 用户登录（邮箱/手机号） |
| `/register` | 用户注册 |
| `/user` | 用户中心（订单/收藏/钱包/积分/地址/通知/优惠券） |
| API `/api/auth/*` | 认证API（登录/注册/个人信息） |
| API `/api/notifications` | 用户通知（查询/标记已读/删除） |

### 2. 商品商城
| 路径 | 说明 |
|------|------|
| `/shop` | 商品列表（分类/搜索/筛选） |
| `/shop/[id]` | 商品详情（多语言/推荐） |
| `/categories` | 商品分类 |
| API `/api/goods` | 商品CRUD + 多语言(locale) |
| API `/api/goods/i18n` | 商品翻译管理 |
| API `/api/categories` | 分类管理 |

### 3. 购物车与订单
| 路径 | 说明 |
|------|------|
| `/cart` | 购物车 |
| `/checkout` | 结账 |
| `/order/[id]` | 订单详情 |
| `/payment/[id]` | 支付页面 |
| API `/api/cart` | 购物车API |
| API `/api/orders` | 订单API（创建/查询/详情） |
| API `/api/addresses` | 收货地址API |

### 4. AI 智能助手
| 路径 | 说明 |
|------|------|
| `/ai-assistant` | AI 对话页面 |
| `/knowledge` | 知识库页面 |
| API `/api/ai/chat` | AI 聊天 (SSE 流式) |
| API `/api/ai/models` | 可用模型列表 |
| API `/api/ai/knowledge/search` | 知识库检索 |
| API `/api/admin/ai-training/*` | AI 训练管理 |
| API `/api/admin/ai-content/*` | AI 内容生成 |
| API `/api/admin/ai-knowledge` | 知识库管理 |

### 5. 免费送活动
| 路径 | 说明 |
|------|------|
| `/free-gifts` | 免费送列表 |
| `/free-gifts/[id]` | 免费送详情 |
| API `/api/free-gifts` | 免费送API |

### 6. 商家中心
| 路径 | 说明 |
|------|------|
| `/merchant/login` | 商家登录 |
| `/merchant/dashboard` | 商家后台（商品/订单/统计） |
| `/merchant/apply` | 商家入驻申请 |
| API `/api/merchant/*` | 商家API（登录/商品/订单/入驻） |
| API `/api/merchants` | 商家列表/详情 |

### 7. 新闻资讯
| 路径 | 说明 |
|------|------|
| `/news` | 新闻列表 |
| `/news/[slug]` | 新闻详情 |
| API `/api/news` | 新闻API |
| API `/api/articles` | 文章API |

### 8. 百科
| 路径 | 说明 |
|------|------|
| `/baike` | 百科首页 |
| `/baike/[slug]` | 百科文章 |

### 9. 管理后台
| 路径 | 说明 |
|------|------|
| `/admin/login` | 管理员登录 |
| `/admin` | 仪表盘 |
| `/admin/goods` | 商品管理 |
| `/admin/goods-i18n` | 商品翻译管理 |
| `/admin/orders` | 订单管理 |
| `/admin/users` | 用户管理 |
| `/admin/merchants` | 商家管理 |
| `/admin/news` | 新闻管理 |
| `/admin/categories` | 分类管理 |
| `/admin/banners` | 轮播图管理 |
| `/admin/settings` | 系统设置（含邮件测试） |
| `/admin/database` | 数据库管理（状态/初始化/测试） |
| `/admin/ai-training` | AI 训练 |
| `/admin/ai-content` | AI 内容生成 |
| `/admin/ai-knowledge` | 知识库管理 |
| `/admin/ai-models` | AI 模型配置 |

### 10. 邮件服务
| 功能 | 说明 |
|------|------|
| 订单确认邮件 | 下单成功自动发送 |
| 注册欢迎邮件 | 新用户注册发送 |
| 发货通知邮件 | 商家发货后发送 |
| SMTP测试 | 管理后台可测试连接和发送 |
| 配置 | QQ邮箱 smtp.qq.com:465 SSL |

### 11. 数据库
| 功能 | 说明 |
|------|------|
| MySQL 优先 | 有MySQL环境时自动使用 |
| Mock DB 降级 | MySQL不可用时自动降级到内存数据库 |
| 文件持久化 | Mock DB 数据保存到 .db-data/mock-db.json |
| 一键部署 | sql/deploy-mysql.sh 脚本 |
| 数据库管理 | /admin/database 管理界面 |

---

## API 调用规范

### 数据库操作

```typescript
import { query, insert, update, remove, count } from '@/lib/db';

// 查询 (SQL方式)
const goods = await query('SELECT * FROM goods WHERE status = ? LIMIT ?', [1, 20]);

// 插入
const id = await insert('goods', { name: '商品', price: 100 });

// 更新
await update('goods', { price: 200 }, { id: 1 });

// 删除
await remove('goods', { id: 1 });

// 计数
const total = await count('goods', { status: 1 });
```

### 认证

```typescript
import { getAuthUserId } from '@/lib/auth/apiAuth';

// API路由中获取用户ID
const userId = await getAuthUserId(request);
// 支持Cookie(auth_token) + Authorization Header 双通道
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

---

## Mock 数据模式

当 MySQL 不可用时自动降级到 Mock DB：

```typescript
import { mockUsers } from '@/lib/auth/mockStore';

// 预置测试用户
// 邮箱: test@example.com / demo@example.com  密码: admin123
// 管理后台: admin / editor  密码: admin123
```

---

## 环境变量

```bash
# 数据库（前端 + PHP 共用同一 MySQL 实例）
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=fubao
MYSQL_PASSWORD=XNmEbBwKKe5HwnNW
MYSQL_DATABASE=fubao

# PHP 后端（php/config/database.php 读取）
DB_HOST=localhost
DB_PORT=3306
DB_USER=fubao
DB_PASSWORD=XNmEbBwKKe5HwnNW
DB_NAME=fubao

# API 模式
NEXT_PUBLIC_API_MODE=local

# AI 模型
AI_PROVIDER=volcengine

# 邮件 SMTP (QQ邮箱)
# 配置存储在 settings 表中，无需环境变量
```

---

> **开发技术标准详见 [DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md)**，所有新增、修改代码必须遵循该文档。
>
> 最后更新: 2025-01-15
