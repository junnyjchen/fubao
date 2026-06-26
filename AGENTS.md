# 符寶網 - Agent 开发规范

## 项目信息

| 项目 | 值 |
|------|-----|
| 名称 | 符寶網 - 全球玄門文化科普交易平台 |
| 前端 | Next.js 16 (App Router) + React 19 |
| 后端 | Next.js API Routes (`src/app/api/` 目录) |
| PHP 后端 | ThinkPHP (`php/` 目录) — 备用/兼容 |
| UI | shadcn/ui + Tailwind CSS 4 |
| 语言 | TypeScript 5 / PHP 8 |
| 包管理 | 前端 **pnpm** (强制) / 后端 composer |
| 数据库 | MySQL（生产唯一） |
| AI 集成 | DeepSeek/豆包/Kimi (流式输出，默认 DeepSeek) |
| 邮件 | QQ邮箱SMTP (nodemailer / PHPMailer) |
| 部署 | systemd + Nginx (无 Docker) |

---

## 生产架构

```
用户 → Nginx (443/80) → Next.js standalone (端口 5000)
                           ├── /api/* → Next.js API Routes (Node.js)
                           ├── /_next/* → Next.js 静态资源
                           └── /* → Next.js SSR 页面
```

- **不再使用 Docker**，改用 systemd 直接管理 Node.js 进程
- Nginx 所有请求代理到 Next.js (端口 5000)
- Next.js API Routes 处理所有 `/api/*` 请求
- PHP/ThinkPHP 作为备用后端，仅通过 `php/public/index.php` 中的代理逻辑降级使用

---

## 项目结构

```
/workspace/projects/
├── src/                        # Next.js 前端 + API
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
│   │   └── api/               # API Routes
│   ├── components/            # 组件
│   │   ├── ui/               # shadcn/ui 基础组件
│   │   ├── ai/               # AI 组件
│   │   ├── admin/            # 管理后台组件
│   │   ├── shop/             # 商城组件
│   │   └── ...
│   └── lib/                   # 工具库
│       ├── db.ts             # MySQL 数据库操作
│       ├── mysql.ts          # MySQL 连接池
│       ├── api-response.ts   # 统一 API 响应格式
│       ├── api-client.ts     # 前端请求封装
│       ├── email/service.ts  # 邮件服务 (QQ邮箱SMTP)
│       ├── auth/             # 认证相关
│       ├── ai/               # AI 相关 (llm-client, store)
│       └── hooks/            # 自定义 Hooks
├── php/                        # PHP 后端（备用）
│   ├── app/
│   │   ├── controller/        # 控制器
│   │   ├── common/            # 公共模块
│   │   └── middleware/         # 中间件
│   ├── public/
│   │   └── index.php          # 入口（含 Next.js 代理逻辑）
│   └── nginx.conf             # Nginx 配置参考
├── sql/                       # MySQL 建表和种子数据
│   ├── schema.sql            # DDL
│   ├── seed.sql              # 种子数据
│   └── deploy-mysql.sh       # 一键部署脚本
├── public/                    # 静态资源
│   ├── images/products/       # 商品图片
│   ├── images/banners/        # Banner 图片
│   └── uploads/              # 用户上传文件
├── fubao-nextjs.service       # systemd 服务配置
├── update-fubao.sh            # 服务器一键部署脚本
└── index.php                  # 根目录 PHP 入口（宝塔环境用）
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

## 服务器部署

```bash
# 首次安装
bash update-fubao.sh --install

# 增量更新（拉取代码 → 构建 → 重启）
bash update-fubao.sh

# 强制完整构建
bash update-fubao.sh --rebuild

# 诊断当前状态
bash update-fubao.sh --diagnose
```

### 服务管理

```bash
# 查看服务状态
sudo systemctl status fubao-nextjs

# 查看实时日志
sudo journalctl -u fubao-nextjs -f

# 重启服务
sudo systemctl restart fubao-nextjs

# 查看最近50行日志
sudo journalctl -u fubao-nextjs -n 50
```

---

## API 响应格式（统一规范）

所有 API 成功响应必须包含 `success: true`：

```typescript
// 成功（无数据）
{ success: true, message: "操作成功" }

// 成功（有数据）
{ success: true, data: [...] }

// 分页
{ success: true, data: [...], total: 100, page: 1, pageSize: 20 }

// 失败
{ success: false, error: "错误描述" }
```

使用 `src/lib/api-response.ts` 工具函数：

```typescript
import { apiSuccess, apiSuccessWithData, apiPaginated, apiError } from '@/lib/api-response';

// 成功
return apiSuccess('操作成功');

// 带数据
return apiSuccessWithData(data);

// 分页
return apiPaginated(data, total, page, pageSize);

// 失败
return apiError('错误描述', 400);
```

前端使用 `src/lib/api-client.ts`：

```typescript
import { isApiSuccess } from '@/lib/api-client';

const data = await res.json();
if (isApiSuccess(data)) {
  // data.data, data.total 等
}
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
| API `/api/notifications` | 用户通知 |
| API `/api/favorites` | 收藏管理 |
| API `/api/user/browse-history` | 浏览历史 |
| API `/api/user/signin` | 用户签到 |
| API `/api/points` | 积分查询 |
| API `/api/coupons` | 优惠券查询 |

### 2. 商品商城
| 路径 | 说明 |
|------|------|
| `/shop` | 商品列表（分类/搜索/筛选） |
| `/shop/[id]` | 商品详情（多语言/推荐） |
| `/categories` | 商品分类 |
| API `/api/goods` | 商品CRUD + 多语言(locale) |
| API `/api/goods/i18n` | 商品翻译管理 |
| API `/api/categories` | 分类管理 |
| API `/api/reviews` | 评价管理 |

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
| API `/api/upload` | 文件上传 |
| API `/api/invoice` | 发票管理 |

### 4. AI 智能助手
| 路径 | 说明 |
|------|------|
| `/ai-assistant` | AI 对话页面 |
| `/knowledge` | 知识库页面 |
| API `/api/ai/chat` | AI 聊天 (SSE 流式) |
| API `/api/ai/models` | 可用模型列表 |
| API `/api/ai/translate` | AI 翻译 |
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
| `/merchant/dashboard` | 商家后台 |
| `/merchant/apply` | 商家入驻申请 |
| API `/api/merchant/*` | 商家API |

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
| `/admin/login` | 管理员登录（admin / admin123） |
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
| `/admin/database` | 数据库管理 |
| `/admin/ai-training` | AI 训练 |
| `/admin/ai-content` | AI 内容生成 |
| `/admin/ai-knowledge` | 知识库管理 |
| `/admin/ai-models` | AI 模型配置 |
| API `/api/admin/stats` | 统计数据 |
| API `/api/admin/analytics` | 分析数据 |
| API `/api/admin/announcement` | 公告管理 |
| API `/api/admin/certificate` | 证书管理 |
| API `/api/admin/coupon` | 优惠券管理 |
| API `/api/admin/withdrawal` | 提现管理 |
| API `/api/admin/permissions` | 权限管理 |
| API `/api/admin/roles` | 角色管理 |

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
| MySQL | 生产环境唯一数据存储 |
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

// 计数（第二个参数为 SQL WHERE 子句字符串）
const total = await count('goods', 'status = 1');
```

### 认证

```typescript
import { getAuthUserId } from '@/lib/auth/apiAuth';

// API路由中获取用户ID
const userId = await getAuthUserId(request);
// 支持Cookie(auth_token) + Authorization Header 双通道
```

---

## 编码行为准则

> 来源: [andrej-karpathy-skills/CLAUDE.md](https://github.com/forrestchang/andrej-karpathy-skills)

### 1. 先思考再编码

**不假设、不隐藏疑问、暴露权衡。**

实施前：
- 明确陈述假设。不确定时先问。
- 存在多种理解时，列出选项而非默默选一个。
- 有更简单的方案时说出来。该反驳就反驳。
- 遇到不清晰的地方，停下来。指出困惑点。提问。

### 2. 简单优先

**最少代码解决问题。不写猜测性代码。**

- 不实现用户没要求的功能。
- 不为只用到一次的代码建抽象层。
- 不添加没被要求的"灵活性"或"可配置性"。
- 不为不可能发生的场景写错误处理。
- 写了 200 行但 50 行能搞定 → 重写。

自问："资深工程师会觉得这过度复杂吗？" 如果是，简化。

### 3. 精准修改

**只动必须动的。只清理自己造成的混乱。**

编辑已有代码时：
- 不"顺手优化"相邻代码、注释或格式。
- 不重构没坏的东西。
- 匹配现有风格，即使你觉得有更好的写法。
- 发现无关的死代码，提出来——但不要删。

修改造成孤立代码时：
- 删除**你的修改**导致不再使用的 import/变量/函数。
- 不删除已有的死代码，除非被要求。

检验标准：每行改动都能追溯到用户的需求。

### 4. 目标驱动执行

**定义成功标准。循环直到验证通过。**

把任务转化为可验证的目标：
- "加校验" → "为无效输入写测试，然后让测试通过"
- "修 bug" → "写一个能复现的测试，然后让它通过"
- "重构 X" → "确保前后测试都通过"

多步骤任务，先陈述简要计划：
```
1. [步骤] → 验证: [检查项]
2. [步骤] → 验证: [检查项]
3. [步骤] → 验证: [检查项]
```

强成功标准让你独立循环。弱标准（"搞出来就行"）需要不断澄清。

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

### API 响应防御性检查

```tsx
// 始终为 .map() 调用提供默认空数组
{(data.items || []).map(item => ...)}

// 检查 API 响应格式
if (isApiSuccess(data)) { ... }
```

---

## 环境变量

```bash
# 数据库（前端 + PHP 共用同一 MySQL 实例）
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=fubao
MYSQL_PASSWORD=CZDhXEb8M7t1jheP
MYSQL_DATABASE=fubao

# PHP 后端（php/config/database.php 读取）
DB_HOST=localhost
DB_PORT=3306
DB_USER=fubao
DB_PASSWORD=CZDhXEb8M7t1jheP
DB_NAME=fubao

# API 模式
NEXT_PUBLIC_API_MODE=local

# AI 模型（默认 DeepSeek，火山引擎不支持境外访问）
AI_PROVIDER=deepseek

# 生产环境标识
COZE_PROJECT_ENV=PROD

# 邮件 SMTP (QQ邮箱)
# 配置存储在 settings 表中，无需环境变量
```

---

> 最后更新: 2026-06-26
