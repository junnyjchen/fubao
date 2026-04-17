# 符寶網 一键部署教程

## 概述

本项目使用 Vue 3 + Vite 构建，支持一键部署到 Coze Coding 平台。

---

## 技术栈

| 项目 | 技术 |
|------|------|
| 框架 | Vue 3 + Vite |
| UI | Tailwind CSS 3 |
| 路由 | Vue Router 4 |
| 状态 | Pinia |
| 语言 | TypeScript 5 |

---

## 快速部署

### 方式一：Git 推送部署（推荐）

```bash
# 1. 进入项目目录
cd /workspace/projects

# 2. 提交代码
git add .
git commit -m "update: 部署内容描述"
git push
```

然后在 Coze Coding 平台点击「部署」。

### 方式二：CLI 部署

```bash
cd /workspace/projects

# 安装依赖
pnpm install

# 构建生产版本
pnpm build

# 预览
pnpm preview
```

---

## 一键部署命令

```bash
# 完整流程
cd /workspace/projects && pnpm install && pnpm build && git add . && git commit -m "$(date +%Y-%m-%d)" && git push
```

---

## Coze CLI 命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发模式 (端口 5000) |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产版本 |

---

## 数据说明

### Mock 数据兜底

当前配置了完整的 Mock 数据，即使后端 API 不可用，前端也能正常运行：

```typescript
// src/lib/mock-data.ts
export const mockGoods = [...]  // 8 条商品
export const mockNews = [...]   // 4 条新闻
export const mockBaike = [...]  // 3 条百科
```

### API 结构

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/goods` | GET | 商品列表 |
| `/api/goods/:id` | GET | 商品详情 |
| `/api/news` | GET | 新闻列表 |
| `/api/news/:slug` | GET | 新闻详情 |
| `/api/ai/chat` | POST | AI 对话 |

---

## 部署配置

### .coze 文件

```toml
[project]
requires = ["nodejs-24"]

[dev]
build = ["pnpm", "install"]
run = ["pnpm", "run", "dev"]

[deploy]
build = ["pnpm", "install", "&&", "pnpm", "run", "build"]
run = ["npx", "serve", "-l", "5000", "-s", "dist"]
```

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5000,
    proxy: {
      '/api': { target: 'http://localhost:5000' }
    }
  },
  build: { outDir: 'dist' }
})
```

---

## 部署后检查

- [ ] 首页正常加载
- [ ] 商品列表显示商品
- [ ] 商品详情页正常
- [ ] 购物车功能正常
- [ ] AI 助手页面可对话

---

## 常见问题

### Q: 页面空白

检查构建是否成功：
```bash
pnpm build
ls dist/
```

### Q: API 请求失败

开发环境已配置代理，生产环境需配置 Nginx：

```nginx
location /api/ {
  proxy_pass http://backend:5000/api/;
}
```

---

## 快速命令汇总

```bash
# 安装依赖
pnpm install

# 开发预览
pnpm dev

# 生产构建
pnpm build

# 预览构建结果
pnpm preview

# 查看日志
tail -f /app/work/logs/bypass/dev.log
```
