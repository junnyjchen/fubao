# 符寶網 网站部署安装教程

## 目录

1. [项目简介](#项目简介)
2. [环境要求](#环境要求)
3. [本地开发部署](#本地开发部署)
4. [生产环境部署](#生产环境部署)
5. [数据库配置](#数据库配置)
6. [常见问题](#常见问题)

---

## 项目简介

**符寶網** - 全球玄門文化科普交易平台

- **框架**：Next.js 16 + React 19
- **UI**：shadcn/ui + Tailwind CSS 4
- **语言**：TypeScript 5
- **包管理**：pnpm

---

## 环境要求

### 必需环境

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 18.0.0 | 推荐使用 LTS 版本 |
| pnpm | ≥ 8.0.0 | 包管理器（必须） |

### 可选环境

| 软件 | 说明 |
|------|------|
| PostgreSQL | 数据库（可选，已有 Mock 数据兜底） |
| Supabase | 远程数据库服务（可选） |

---

## 本地开发部署

### Step 1：克隆代码

```bash
git clone https://github.com/junnyjchen/fubao.git
cd fubao
```

### Step 2：安装依赖

```bash
pnpm install
```

### Step 3：启动开发服务

```bash
pnpm dev
```

### Step 4：访问预览

```
http://localhost:5000
```

### 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（热更新） |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 代码检查 |
| `pnpm ts-check` | TypeScript 类型检查 |

---

## 生产环境部署

### 方式一：Coze Coding 平台部署（推荐）

#### 1. 推送代码到 GitHub

```bash
# 添加所有更改
git add .

# 提交
git commit -m "feat: 你的更新内容"

# 推送到远程
git push origin main
```

#### 2. 在 Coze Coding 平台部署

1. 登录 Coze Coding 平台
2. 进入项目
3. 点击「部署」按钮
4. 等待构建完成

#### 3. 访问生产环境

部署完成后，通过平台提供的域名访问。

---

### 方式二：手动部署到服务器

#### 1. 构建项目

```bash
pnpm install
pnpm build
```

#### 2. 启动服务

```bash
pnpm start
```

#### 3. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start pnpm --name "fubao" -- start

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup
```

---

### 方式三：Docker 部署

#### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

ENV PORT 3000

CMD ["pnpm", "start"]
```

#### 构建和运行

```bash
# 构建镜像
docker build -t fubao .

# 运行容器
docker run -d -p 3000:3000 --name fubao fubao
```

---

## 数据库配置

### 方式一：使用 Mock 数据（默认）

项目默认使用 Mock 数据，无需配置数据库即可正常运行。

Mock 数据包含：
- 10 条商品数据
- 16 条百科文章
- 15 条新闻文章
- 分类、标签等基础数据

### 方式二：使用 Supabase

#### 1. 创建 Supabase 项目

访问 [supabase.com](https://supabase.com) 创建项目

#### 2. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 3. 导入数据

在 Supabase 管理界面执行 `php/scripts/goods-news-articles.sql` 文件

### 方式三：使用自建 PostgreSQL

#### 1. 安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
```

#### 2. 创建数据库

```bash
sudo -u postgres psql

CREATE DATABASE fubao;
CREATE USER fubao_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fubao TO fubao_user;
```

#### 3. 配置连接

在 `.env.local` 中添加：

```env
DATABASE_URL=postgresql://fubao_user:your_password@localhost:5432/fubao
```

#### 4. 导入数据

```bash
psql -h localhost -U fubao_user -d fubao -f php/scripts/goods-news-articles.sql
```

---

## 常见问题

### Q1：pnpm install 失败

**错误**：EAGAIN: resource temporarily unavailable

**解决方案**：

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Q2：端口被占用

**错误**：Error: listen EADDRINUSE :::5000

**解决方案**：

```bash
# 查找占用端口的进程
lsof -i :5000

# 终止进程
kill -9 <PID>

# 或使用其他端口
PORT=3000 pnpm dev
```

### Q3：构建失败

**检查项**：

1. Node.js 版本是否正确
2. 依赖是否完整安装
3. TypeScript 类型是否有错误

```bash
# 检查 Node 版本
node -v

# 重新安装依赖
rm -rf node_modules
pnpm install

# 类型检查
pnpm ts-check
```

### Q4：页面显示 404

**解决方案**：

1. 清除浏览器缓存
2. 检查路由是否正确
3. 查看控制台错误信息

### Q5：API 请求失败

**检查项**：

1. 开发服务是否正常运行
2. API 端点是否正确
3. 查看日志文件

```bash
# 查看应用日志
tail -f /app/work/logs/bypass/app.log

# 查看控制台日志
tail -f /app/work/logs/bypass/console.log
```

---

## 一键部署脚本

创建 `deploy.sh` 脚本：

```bash
#!/bin/bash

set -e

echo "🚀 开始部署符寶網..."

cd /workspace/projects

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 代码检查
echo "🔍 代码检查..."
pnpm lint --quiet || true

# 构建
echo "🏗️ 构建项目..."
pnpm build

# 提交代码
echo "📝 提交代码..."
git add .
git commit -m "deploy: $(date +%Y-%m-%d-%H:%M:%S)"
git push

echo "✅ 部署完成！"
```

使用：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 技术支持

如遇问题，请提供以下信息：

1. 错误日志
2. Node.js 版本
3. pnpm 版本
4. 操作系统

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2024-01-01 | v1.0.0 | 初始版本 |
| 2024-XX-XX | v1.1.0 | 添加 Mock 数据兜底 |

---

**符寶網** - 让玄門文化触手可及
