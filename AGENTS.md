# 符寶網 - Vue 项目规范

## 项目信息

| 项目 | 值 |
|------|-----|
| 名称 | 符寶網 - 全球玄門文化科普交易平台 |
| 框架 | Vue 3 + Vite |
| UI | Tailwind CSS 3 |
| 语言 | TypeScript 5 |
| 包管理 | **pnpm** (强制) |

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式 (端口 5000)
pnpm dev

# 生产构建
pnpm build

# 预览
pnpm preview
```

---

## 项目结构

```
src/
├── main.ts              # 入口文件
├── App.vue              # 根组件
├── router/index.ts      # 路由配置
├── stores/              # Pinia 状态
│   ├── user.ts         # 用户状态
│   └── cart.ts         # 购物车状态
├── lib/
│   ├── api.ts          # API 请求 + Mock 兜底
│   └── mock-data.ts    # Mock 数据
├── types/index.ts       # 类型定义
├── assets/main.css      # 全局样式
├── components/common/   # 公共组件
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   └── AppNav.vue
└── views/               # 页面视图
```

---

## 页面路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/shop` | 商品列表 |
| `/shop/:id` | 商品详情 |
| `/cart` | 购物车 |
| `/news` | 新闻列表 |
| `/news/:slug` | 新闻详情 |
| `/baike` | 百科 |
| `/ai-assistant` | AI 助手 |
| `/verify` | 证书验证 |
| `/login` | 登录 |

---

## API 调用

### 封装方法

```typescript
import { goodsApi, newsApi, baikeApi, apiRequest } from '@/lib/api'

// 商品
const res = await goodsApi.list({ limit: 10 })
const res = await goodsApi.detail(1)

// 新闻
const res = await newsApi.list({ limit: 10 })

// 百科
const res = await baikeApi.list()

// 通用
const res = await apiRequest.get('/endpoint', { param: 'value' })
const res = await apiRequest.post('/endpoint', { data: 'value' })
```

### Mock 数据

API 不可用时自动返回 Mock 数据兜底，无需额外配置。

---

## 组件规范

### 命名

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件 | PascalCase | `AppHeader.vue` |
| 视图 | PascalCase | `HomeView.vue` |
| 工具 | camelCase | `api.ts` |

### 状态管理

```typescript
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
cartStore.addItem(goods, 1)
```

---

## 开发规范

### 响应式设计

- 移动优先
- 使用 `container mx-auto px-4` 布局
- 移动端底部导航：`md:hidden`
- 桌面端隐藏：`hidden md:flex`

### 安全考虑

- 用户输入需要验证
- API 错误需要捕获处理
- 使用 Mock 数据兜底

---

## 部署

### Coze CLI

```bash
pnpm dev      # 开发
pnpm build    # 构建
pnpm preview  # 预览
```

### API 代理

开发时 `/api/*` 自动代理到 `http://localhost:5000`。
生产环境需配置 Nginx 反向代理。

---

## 环境变量

无需额外配置，所有变量通过 Coze Coding 平台自动注入。
