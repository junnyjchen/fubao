# 符寶網项目文档

## 项目概述

符寶網是全球玄門文化科普交易平台，提供符箓、法器等玄門文化产品的交易与科普服务。平台采用"科普先行、交易放心、一物一證"的理念，为用户提供专业、可信赖的玄門文化产品购物体验。

### 项目架构

```
符寶網/
├── 前端 (Next.js)          # 用户界面
│   └── 端口 5000           # 主站
├── PHP 后端                # API 服务
│   └── 端口 8080/80       # API 接口
└── MySQL 数据库            # 数据存储
```

### 核心功能

- **商品展示与交易**：符箓、法器等玄門文化产品展示、分类、搜索、购买
- **科普内容**：文章、视频、新闻等玄門文化知识科普
- **用户系统**：注册、登录、个人中心、订单管理
- **第三方登录**：支持Google、Facebook、微信、X等OAuth登录
- **商家入驻**：商家申请、商品管理、订单处理
- **证书认证**：一物一證，产品溯源
- **AI新闻自动发布**：自动搜索新闻并使用AI翻译发布

---

## 技术栈

### 前端

| 类型 | 技术 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Core | React 19 |
| Language | TypeScript 5 |
| UI组件 | shadcn/ui (Radix UI) |
| Styling | Tailwind CSS 4 |

### 后端

| 类型 | 技术 |
|------|------|
| Language | PHP 7.4+ |
| Framework | ThinkPHP 风格（自定义精简框架） |
| Database | MySQL 5.7+ |
| Auth | JWT |

---

## 目录结构

```
符寶網/
├── 前端目录
├── php/                      # PHP 后端
│   ├── public/              # Web 根目录
│   │   ├── index.php        # 入口文件
│   │   └── .htaccess        # Apache 伪静态
│   ├── app/
│   │   ├── Controller.php    # 控制器基类
│   │   ├── common/          # 公共类
│   │   │   └── Jwt.php      # JWT 工具
│   │   ├── controller/       # 业务控制器
│   │   │   ├── Auth.php      # 会员认证
│   │   │   ├── Admin.php     # 管理员认证
│   │   │   ├── Goods.php     # 商品
│   │   │   ├── Order.php     # 订单
│   │   │   ├── Cart.php      # 购物车
│   │   │   ├── Favorite.php  # 收藏
│   │   │   ├── Address.php   # 地址
│   │   │   ├── Category.php  # 分类
│   │   │   ├── Home.php      # 首页
│   │   │   ├── OAuth.php     # OAuth
│   │   │   ├── Health.php    # 健康检查
│   │   │   └── admin/        # 管理后台控制器
│   │   ├── middleware/       # 中间件
│   │   └── think/           # 框架核心
│   ├── config/               # 配置文件
│   │   ├── database.php     # 数据库配置
│   │   └── app.php          # 应用配置
│   ├── route/
│   │   └── router.php       # 路由配置
│   ├── scripts/
│   │   └── mysql-migration.sql  # 数据库迁移
│   └── docs/
│       ├── deployment.md     # 部署文档
│       └── nginx.conf        # Nginx 配置
├── docs/                     # 文档
│   ├── baota-deployment.md   # 宝塔面板部署指南
│   └── mysql-deployment.md   # MySQL 数据库迁移
└── AGENTS.md                # 项目文档
```

---

## 开发规范

### 前端 - 包管理

**仅允许使用 pnpm**，严禁使用 npm 或 yarn。

```bash
pnpm add <package>          # 安装依赖
pnpm add -D <package>       # 安装开发依赖
pnpm install                # 安装所有依赖
pnpm remove <package>       # 移除依赖
```

### 前端 - 代码规范

1. **Hydration 错误预防**：严禁在 JSX 渲染逻辑中直接使用 `typeof window`、`Date.now()`、`Math.random()` 等动态数据。必须使用 `'use client'` 并配合 `useEffect` + `useState` 确保动态内容仅在客户端挂载后渲染。

2. **字段命名**：数据库使用 snake_case

3. **错误处理**：API 调用必须检查响应状态

4. **UI组件**：默认使用 shadcn/ui 组件

### PHP 后端 - 代码规范

1. **命名空间**：`app\controller`
2. **控制器继承**：`extends Controller`
3. **数据库操作**：使用 `$this->db->select/find/insert/update/delete`
4. **请求获取**：`$this->post('field')` / `$this->get('field')`
5. **响应格式**：`$this->json($data, $msg)` / `$this->error($msg, $code)`
6. **认证验证**：`$this->verifyUser()` / `$this->verifyAdmin()`

---

## 数据库表（MySQL）

| 表名 | 说明 |
|------|------|
| users | 用户信息 |
| admin_users | 管理员用户 |
| user_oauth_accounts | OAuth账号绑定 |
| categories | 分类 |
| merchants | 商家 |
| goods | 商品信息 |
| addresses | 收货地址 |
| cart_items | 购物车 |
| favorites | 收藏 |
| coupons | 优惠券 |
| user_coupons | 用户优惠券 |
| orders | 订单 |
| order_items | 订单商品 |
| certificates | 证书 |
| articles | 文章 |
| banners | Banner |
| sms_codes | 短信验证码 |
| oauth_providers | OAuth配置 |
| behavior_logs | 行为日志 |
| ai_configurations | AI配置 |
| news_sources | 新闻源 |
| auto_publish_tasks | 定时任务 |
| ai_generated_articles | AI文章 |

---

## API 接口

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
| `POST /api/admin/logout` | POST | 管理员登出 |
| `GET /api/admin/me` | GET | 获取管理员信息 |
| `POST /api/admin/changePassword` | POST | 修改密码 |
| `GET /api/admin/dashboard` | GET | 统计概览 |
| `GET /api/admin/users` | GET | 用户列表 |
| `GET /api/admin/goods` | GET | 商品列表 |
| `GET /api/admin/orders` | GET | 订单列表 |
| `GET /api/admin/categories` | GET | 分类列表 |
| `GET /api/admin/banners` | GET | Banner列表 |

### 业务接口

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
| `POST /api/cart/update` | POST | 更新购物车 |
| `POST /api/cart/remove` | POST | 删除购物车商品 |
| `GET /api/favorites` | GET | 收藏列表 |
| `POST /api/favorites/add` | POST | 添加收藏 |
| `POST /api/favorites/remove` | POST | 取消收藏 |
| `GET /api/orders` | GET | 订单列表 |
| `POST /api/orders/create` | POST | 创建订单 |
| `GET /api/addresses` | GET | 地址列表 |
| `POST /api/addresses/create` | POST | 创建地址 |
| `GET /api/home` | GET | 首页数据 |

### OAuth

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /api/oauth/providers` | GET | 获取OAuth提供商 |
| `GET /api/oauth/authorize` | GET | 获取授权URL |
| `GET /api/oauth/callback` | GET | OAuth回调 |

---

## 管理后台

### 访问地址

- 管理后台：`/admin`
- 管理员登录：`/admin/login`

### 默认账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123 |

**重要：生产环境请立即修改默认密码！**

### 安全机制

1. JWT Token 认证
2. 管理员与会员用户体系分离
3. 中间件路由保护

---

## PHP 后端部署

### 环境要求

- PHP >= 7.4
- MySQL >= 5.7
- PDO PHP Extension
- JSON PHP Extension
- cURL PHP Extension

### 部署步骤

#### 1. 上传代码

将 `php/` 目录上传到服务器，如 `/www/wwwroot/fubao-api/`

#### 2. 数据库配置

编辑 `config/database.php` 或设置环境变量：

```bash
# 环境变量
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=fubao
export DB_USER=root
export DB_PASSWORD=your_password
```

#### 3. 修改 JWT 密钥

编辑 `config/app.php`，修改 `jwt_secret`：

```php
'jwt_secret' => 'your-production-secret-key',
```

#### 4. 数据库迁移

```bash
mysql -u root -p -e "CREATE DATABASE fubao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p fubao < scripts/mysql-migration.sql
```

#### 5. Web 服务器配置

**Apache**：确保 `public/.htaccess` 存在，启用 mod_rewrite

**Nginx**：参考 `docs/nginx.conf`

**宝塔面板**：
1. 添加站点
2. 设置 → 伪静态 → 选择 `thinkphp`
3. 网站目录指向 `public/`

#### 6. 启动服务

**开发环境**：
```bash
cd php/public
php -S localhost:8080
```

**生产环境**：配置 Web 服务器后直接访问域名

---

## 环境变量

### 前端

| 变量名 | 说明 |
|--------|------|
| COZE_WORKSPACE_PATH | 项目工作目录 |
| COZE_PROJECT_DOMAIN_DEFAULT | 对外访问域名 |
| DEPLOY_RUN_PORT | 服务监听端口 (5000) |
| NEXT_PUBLIC_API_MODE | API 模式：local/remote |
| NEXT_PUBLIC_API_URL | 远程 API 地址 |
| NEXT_PUBLIC_SUPABASE_URL | Supabase URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 密钥 |

### PHP 后端

| 变量名 | 说明 |
|--------|------|
| DB_HOST | 数据库主机 |
| DB_PORT | 数据库端口 |
| DB_NAME | 数据库名 |
| DB_USER | 数据库用户 |
| DB_PASSWORD | 数据库密码 |
| JWT_SECRET | JWT 密钥 |

---

## 常用命令

### 前端

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

---

## 注意事项

1. **端口规范**：前端必须运行在 5000 端口
2. **PHP 后端**：建议使用 8080 或 80 端口
3. **文件存储**：生成的文件优先存储到对象存储
4. **禁止Mock**：集成服务调用必须使用真实API
5. **安全**：生产环境必须修改默认密钥和密码
6. **HTTPS**：生产环境必须使用 HTTPS

---

## 部署文档

- [宝塔面板部署指南](./docs/baota-deployment.md)
- [MySQL 数据库迁移](./docs/mysql-deployment.md)
- [PHP 后端部署文档](./php/docs/deployment.md)

---

## OAuth 配置

### 支持的提供商

- Google
- Facebook
- WeChat (微信)
- X (Twitter)

### 回调地址

```
https://your-domain.com/api/oauth/callback
```

### 配置流程

1. 在对应开发者平台创建应用获取 Client ID 和 Client Secret
2. 在数据库 `oauth_providers` 表中插入配置
3. 开启 enabled = 1
4. 用户即可在登录页面使用第三方登录

```sql
INSERT INTO oauth_providers (provider, name, client_id, client_secret, enabled)
VALUES ('google', 'Google', 'your-client-id', 'your-client-secret', 1);
```

---

## AI 新闻自动发布

### 功能说明

自动搜索最新新闻，使用 AI 模型翻译和优化内容，支持定时发布。

### 后台入口

`/admin/ai-news`

### 支持的 AI 提供商

- **豆包/Coze**: `provider: 'doubao'`
- **DeepSeek**: `provider: 'deepseek'`
- **Kimi**: `provider: 'kimi'`
- **智谱GLM**: `provider: 'glm'`
- **通义千问**: `provider: 'qwen'`

### Cron 表达式示例

| 表达式 | 说明 |
|--------|------|
| `0 6 * * *` | 每天早上6点 |
| `0 */4 * * *` | 每4小时 |
| `0 9,12,18 * * *` | 每天9点、12点、18点 |
| `0 0 * * 0` | 每周日凌晨 |
