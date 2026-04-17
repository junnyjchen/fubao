# 符寶網 一键部署教程

## 概述

本项目使用 Coze Coding 平台部署，支持一键部署代码和数据。

---

## 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                    Coze Coding 平台                      │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   构建环境   │  │   运行容器   │  │   对象存储   │      │
│  │  (Build)    │  │  (Runtime)  │  │   (OSS)     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│         │                │                │            │
│         └────────────────┼────────────────┘            │
│                          │                              │
│                          ▼                              │
│              https://xxx.dev.coze.site                  │
└─────────────────────────────────────────────────────────┘
```

---

## 部署方式

### 方式一：通过 Coze Coding 界面部署（推荐）

1. **提交代码到 Git**
   ```bash
   cd /workspace/projects
   git add .
   git commit -m "feat: 更新内容描述"
   git push
   ```

2. **在 Coze Coding 平台点击「部署」**

---

### 方式二：通过 Coze CLI 部署

```bash
# 进入项目目录
cd /workspace/projects

# 1. 安装依赖
pnpm install

# 2. 构建生产版本
pnpm build

# 3. 部署到服务器（Coze Coding 自动处理）
```

---

## Coze CLI 命令参考

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发模式（端口 5000） |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务 |
| `pnpm lint` | 代码检查 |
| `pnpm ts-check` | TypeScript 类型检查 |

---

## 数据部署

### 初始化数据脚本

项目包含 `php/scripts/goods-news-articles.sql` 数据脚本：

```sql
-- 包含以下数据：
-- - 34 条商品数据
-- - 16 条百科文章
-- - 15 条新闻文章
-- - 分类、标签等基础数据
```

### 部署数据

由于使用 **Mock 数据兜底机制**，数据库不可用时自动返回预设数据：

```typescript
// src/app/api/goods/route.ts
if (!supabase || typeof supabase.from !== 'function') {
  return NextResponse.json({
    data: getMockGoods(limit),  // 自动使用 mock 数据
    pagination: {...}
  });
}
```

### 配置真实数据库

如需使用真实数据库，请配置环境变量：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

然后执行数据初始化：

```bash
# 导入 SQL 数据
psql -h your-db-host -U postgres -d fubao < php/scripts/goods-news-articles.sql
```

---

## 一键部署脚本

创建 `deploy.sh` 脚本实现一键部署：

```bash
#!/bin/bash
# deploy.sh - 符寶網一键部署脚本

set -e

echo "🚀 开始部署符寶網..."

# 进入项目目录
cd /workspace/projects

# 1. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 2. 代码检查
echo "🔍 代码检查..."
pnpm lint --quiet || true
pnpm ts-check --quiet || true

# 3. 构建生产版本
echo "🏗️ 构建生产版本..."
pnpm build

# 4. 提交代码
echo "📝 提交代码..."
git add .
git commit -m "deploy: $(date +%Y-%m-%d-%H:%M:%S)"
git push

echo "✅ 部署完成！"
```

使用方式：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 部署检查清单

部署后请检查：

- [ ] 首页是否正常加载
- [ ] 商品列表是否显示
- [ ] 商品详情页是否正常
- [ ] 控制台是否有报错

---

## 常见问题

### Q: 部署后页面显示 500 错误

检查日志：
```bash
tail -n 50 /app/work/logs/bypass/app.log
tail -n 50 /app/work/logs/bypass/console.log
```

### Q: 数据没有更新

1. 清除浏览器缓存
2. 检查 API 是否返回新数据：
   ```bash
   curl -s http://localhost:5000/api/goods | jq '.data | length'
   ```

### Q: 数据库连接失败

这是正常的，系统会自动使用 Mock 数据兜底，不影响功能使用。

---

## 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `COZE_WORKSPACE_PATH` | 项目工作目录 | `/workspace/projects/` |
| `COZE_PROJECT_DOMAIN_DEFAULT` | 访问域名 | `https://abc123.dev.coze.site` |
| `DEPLOY_RUN_PORT` | 服务端口 | `5000` |
| `COZE_PROJECT_ENV` | 环境 | `DEV` / `PROD` |

---

## 快速命令汇总

```bash
# 完整部署流程
cd /workspace/projects && pnpm install && pnpm build && git add . && git commit -m "update" && git push

# 查看日志
tail -f /app/work/logs/bypass/app.log
tail -f /app/work/logs/bypass/console.log

# 测试 API
curl -s http://localhost:5000/api/goods | jq '.data | length'
```

---

## 联系支持

如遇部署问题，请查看：
- 开发日志：`/app/work/logs/bypass/`
- API 端点：`/api/` 路由
