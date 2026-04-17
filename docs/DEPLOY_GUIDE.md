# 符寶網 Vue 项目一键部署教程

## 技术栈变更

| 项目 | 原技术 | 新技术 |
|------|--------|--------|
| 框架 | Next.js 16 (App Router) | Vue 3 + Vite |
| UI | React 19 | Vue 3 Composition API |
| 样式 | Tailwind CSS 4 | Tailwind CSS 3 |
| 路由 | Next.js 内置 | Vue Router 4 |
| 状态 | React Context | Pinia |
| 类型 | TypeScript 5 | TypeScript 5 |

---

## 项目结构

```
src/
├── main.ts              # 入口文件
├── App.vue              # 根组件
├── router/
│   └── index.ts         # 路由配置
├── stores/
│   ├── user.ts          # 用户状态
│   └── cart.ts          # 购物车状态
├── lib/
│   └── api.ts           # API 请求封装
├── types/
│   └── index.ts         # 类型定义
├── components/
│   └── common/          # 公共组件
│       ├── AppHeader.vue
│       ├── AppFooter.vue
│       └── AppNav.vue
└── views/               # 页面视图
    ├── HomeView.vue
    ├── ShopView.vue
    ├── GoodsDetailView.vue
    ├── CartView.vue
    ├── NewsView.vue
    ├── AIAssistantView.vue
    ├── BaikeView.vue
    ├── VerifyView.vue
    └── ...
```

---

## 部署方式

### 方式一：通过 Coze Coding 界面部署（推荐）

1. **提交代码到 Git**
   ```bash
   cd /workspace/projects
   git add .
   git commit -m "feat: 迁移到 Vue 3"
   git push
   ```

2. **在 Coze Coding 平台点击「部署」**

### 方式二：使用 Coze CLI

```bash
# 安装依赖
pnpm install

# 开发模式（端口 5000）
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

---

## 一键部署命令

```bash
# 完整部署流程
cd /workspace/projects && pnpm install && pnpm build && git add . && git commit -m "$(date +%Y-%m-%d)" && git push
```

---

## Coze CLI 命令参考

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发模式（端口 5000） |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产版本 |
| `pnpm lint` | 代码检查 |

---

## 注意事项

### API 代理配置

Vue 开发服务器配置了 API 代理：
- 开发时：`/api/*` 请求自动代理到 `http://localhost:5000`
- 生产环境：需要配置 Nginx 反向代理或使用现有后端服务

### 后端 API

项目依赖后端 API 服务提供数据，请确保以下 API 端点可用：
- `/api/goods` - 商品列表
- `/api/goods/:id` - 商品详情
- `/api/news` - 新闻列表
- `/api/ai/chat` - AI 对话

---

## 环境变量

无需额外配置，所有环境变量通过 Coze Coding 平台自动注入。

---

## 部署检查清单

- [ ] 首页正常加载
- [ ] 商品列表显示正常
- [ ] 商品详情页正常
- [ ] 购物车功能正常
- [ ] AI 助手页面正常

---

## 常见问题

### Q: 页面空白或显示 404

检查 Vite 配置和路由是否正确：
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5000,
  },
})
```

### Q: API 请求失败

确保后端服务运行在 5000 端口，或配置正确的代理目标。

---

## 快速命令汇总

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 查看日志
tail -f /app/work/logs/bypass/dev.log
```
