# 符寶網 技术架构说明

## 项目架构

**符寶網** 采用前后端分离架构：

```
┌─────────────────────────────────────────────────────────────────┐
│                        符寶網 系统架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────┐      ┌─────────────────────┐          │
│   │      用户浏览器      │      │     管理后台         │          │
│   └─────────┬───────────┘      └──────────┬──────────┘          │
│             │                               │                     │
│             ▼                               ▼                     │
│   ┌─────────────────────────────────────────────────┐             │
│   │            Next.js 前端 (Node.js)               │             │
│   │                                                  │             │
│   │   • 页面渲染 (SSR/CSR)                          │             │
│   │   • 用户界面组件                                │             │
│   │   • 状态管理                                    │             │
│   │   • 路由跳转                                    │             │
│   └────────────────────────┬────────────────────────┘             │
│                            │                                       │
│                            │ HTTP API                              │
│                            ▼                                       │
│   ┌─────────────────────────────────────────────────┐             │
│   │            PHP 后端 (ThinkPHP)                   │             │
│   │                                                  │             │
│   │   • RESTful API                                 │             │
│   │   • 业务逻辑处理                                │             │
│   │   • 数据库操作                                  │             │
│   │   • 认证授权                                    │             │
│   └────────────────────────┬────────────────────────┘             │
│                            │                                       │
│                            ▼                                       │
│   ┌─────────────────────┐                                       │
│   │     数据库 MySQL     │                                       │
│   └─────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 技术栈

### 前端 (Frontend)

| 项目 | 技术 |
|------|------|
| 框架 | **Next.js 16** (App Router) |
| 语言 | React 19 |
| UI 组件 | shadcn/ui |
| 样式 | Tailwind CSS 4 |
| 语言 | TypeScript 5 |
| 包管理 | pnpm |

### 后端 (Backend)

| 项目 | 技术 |
|------|------|
| 框架 | **ThinkPHP 8** |
| 语言 | PHP 8+ |
| 数据库 | MySQL 8+ |
| 认证 | JWT |
| 缓存 | Redis (可选) |

---

## 目录结构

```
/workspace/projects/
│
├── src/                          # 前端源码 (Next.js)
│   ├── app/                     # App Router 页面
│   │   ├── page.tsx            # 首页
│   │   ├── shop/               # 商城页面
│   │   ├── admin/              # 管理后台页面
│   │   └── api/                # API Routes (部分)
│   ├── components/              # React 组件
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── home/              # 首页组件
│   │   ├── shop/              # 商城组件
│   │   └── admin/             # 管理后台组件
│   └── lib/                    # 工具库
│       ├── api-request.ts     # API 请求封装
│       ├── supabase/          # Supabase 配置
│       └── i18n/              # 国际化
│
├── php/                         # 后端源码 (PHP)
│   ├── app/                    # 应用目录
│   │   ├── controller/         # 控制器
│   │   │   ├── Auth.php       # 认证
│   │   │   ├── Goods.php      # 商品
│   │   │   ├── Order.php      # 订单
│   │   │   ├── User.php       # 用户
│   │   │   └── admin/         # 管理后台
│   │   ├── common/            # 公共类
│   │   │   ├── Jwt.php        # JWT 工具
│   │   │   ├── Cache.php      # 缓存
│   │   │   └── Validator.php  # 验证器
│   │   └── middleware/        # 中间件
│   ├── config/                # 配置文件
│   │   ├── app.php           # 应用配置
│   │   └── database.php      # 数据库配置
│   ├── public/               # 入口文件
│   │   └── index.php         # 入口
│   ├── route/                # 路由配置
│   │   └── router.php        # 路由定义
│   ├── scripts/              # 脚本
│   │   ├── goods-news-articles.sql   # 业务数据
│   │   └── mysql-migration.sql       # 数据库迁移
│   └── nginx.conf           # Nginx 配置
│
├── package.json              # Node.js 依赖
├── .coze                    # Coze 部署配置
└── docs/                    # 文档
    ├── DEPLOY_GUIDE.md
    └── DEPLOY_TUTORIAL.md
```

---

## API 接口

### 用户端 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/me` | GET | 获取当前用户 |
| `/api/goods` | GET | 商品列表 |
| `/api/goods/:id` | GET | 商品详情 |
| `/api/orders` | GET/POST | 订单管理 |
| `/api/cart` | GET/POST | 购物车 |
| `/api/categories` | GET | 分类列表 |

### 管理后台 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/login` | POST | 管理员登录 |
| `/api/admin/users` | GET | 用户列表 |
| `/api/admin/goods` | GET/POST | 商品管理 |
| `/api/admin/orders` | GET | 订单管理 |
| `/api/admin/banners` | GET/POST | Banner 管理 |
| `/api/admin/dashboard` | GET | 仪表盘统计 |

---

## 部署说明

### 前端部署 (Next.js)

前端使用 Coze Coding 平台部署：

```bash
cd /workspace/projects
pnpm build
git push
# 在 Coze 平台点击部署
```

### 后端部署 (PHP)

后端需要独立的 PHP 服务器：

1. **安装 PHP 环境**
   ```bash
   PHP >= 8.0
   Composer >= 2.0
   MySQL >= 8.0
   ```

2. **安装依赖**
   ```bash
   cd php
   composer install
   ```

3. **配置数据库**
   编辑 `php/config/database.php`

4. **导入数据**
   ```bash
   mysql -u root -p fubao < php/scripts/goods-news-articles.sql
   ```

5. **配置 Nginx**
   ```bash
   cp php/nginx.conf /etc/nginx/sites-available/fubao
   nginx -t
   systemctl reload nginx
   ```

---

## 环境变量

### 前端 (.env.local)

```env
NEXT_PUBLIC_API_MODE=production
NEXT_PUBLIC_API_URL=https://api.fubao.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 后端 (.env)

```env
APP_DEBUG=false
JWT_SECRET=your-jwt-secret-key
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fubao
DB_USER=root
DB_PASSWORD=your-password
```

---

## 常用命令

### 前端命令

```bash
pnpm install      # 安装依赖
pnpm dev          # 开发模式
pnpm build        # 构建生产版本
pnpm lint         # 代码检查
```

### 后端命令

```bash
composer install    # 安装 PHP 依赖
php think migrate    # 运行数据库迁移
php think seed       # 填充数据
```

---

## 开发指南

### 前端开发

1. 启动前端开发服务器：
   ```bash
   pnpm dev
   ```

2. 访问 http://localhost:5000

### 后端开发

1. 启动 PHP 内置服务器（仅开发用）：
   ```bash
   cd php/public
   php -S localhost:8080
   ```

2. 或使用 Nginx + PHP-FPM

### 前后端联调

1. 确保后端 API 运行在 `http://localhost:8080`
2. 前端 `.env.local` 设置 `NEXT_PUBLIC_API_URL=http://localhost:8080`
3. 修改前端 API 请求地址指向 PHP 后端

---

## 注意事项

1. **跨域问题**：生产环境需要后端配置 CORS 或前端使用代理
2. **API 地址**：目前前端 `/api/*` 路由由 Next.js 处理，需改为请求 PHP 后端
3. **数据库连接**：确认 MySQL 服务正常运行
4. **JWT 配置**：前后端使用相同的 JWT Secret
