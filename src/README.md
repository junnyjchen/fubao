# 符寶網前端

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + shadcn/ui
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4

## 开始开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm ts-check
```

## 目录结构

```
src/
├── app/                 # 页面 (App Router)
│   ├── page.tsx        # 首页
│   ├── layout.tsx      # 布局
│   ├── goods/          # 商品页
│   ├── cart/           # 购物车
│   ├── user/           # 用户中心
│   └── admin/          # 管理后台
├── components/         # 组件
│   └── ui/            # shadcn/ui 组件
└── lib/               # 工具库
    ├── api.ts         # API 请求
    └── utils.ts       # 工具函数
```

## 环境变量

创建 `.env.local`:

```bash
NEXT_PUBLIC_API_MODE=local        # local 或 remote
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 主要页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 首页 |
| 商品列表 | `/goods` | 商品列表 |
| 商品详情 | `/goods/[id]` | 商品详情 |
| 购物车 | `/cart` | 购物车 |
| 用户登录 | `/user/login` | 登录 |
| 用户注册 | `/user/register` | 注册 |
| 用户中心 | `/user` | 用户中心 |
| 管理后台 | `/admin` | 管理后台 |
| 管理员登录 | `/admin/login` | 管理员登录 |
