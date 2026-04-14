# 符寶網

全球玄門文化科普交易平台

## 项目简介

符寶網提供符箓、法器等玄門文化产品的交易与科普服务。平台采用"科普先行、交易放心、一物一證"的理念，为用户提供专业、可信赖的玄門文化产品购物体验。

## 技术架构

```
符寶網/
├── 前端 (Next.js)      # 用户界面 - 端口 5000
├── PHP 后端            # API 服务 - 端口 8080
└── MySQL 数据库        # 数据存储
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

## 快速开始

### 前端

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build
```

### 后端 (PHP)

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE fubao CHARACTER SET utf8mb4;"
mysql -u root -p fubao < php/scripts/mysql-migration.sql

# 2. 启动服务
cd php/public && php -S localhost:8080
```

## 目录结构

```
符寶網/
├── src/                    # Next.js 前端源码
│   ├── app/               # 页面
│   ├── components/        # 组件
│   └── lib/               # 工具库
├── php/                    # PHP 后端
│   ├── public/            # Web 根目录
│   ├── app/               # 应用代码
│   ├── config/            # 配置
│   ├── route/             # 路由
│   └── scripts/           # 脚本
├── docs/                   # 文档
├── public/                 # 静态资源
└── AGENTS.md              # 开发规范
```

## 核心功能

- 商品展示与交易
- 用户注册登录
- 购物车与订单
- 收藏与愿望清单
- 第三方 OAuth 登录
- 管理后台
- AI 新闻发布

## 文档

- [开发规范](./AGENTS.md)
- [宝塔部署指南](./docs/baota-deployment.md)
- [手动部署指南](./docs/manual-deployment.md)
- [MySQL 数据库](./docs/mysql-database.md)

## 登录信息

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

## License

MIT
