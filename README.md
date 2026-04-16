# 符寶網

全球玄門文化科普交易平台

## 项目简介

符寶網提供符籙、法器等玄門文化產品的交易與科普服務。平台採用「科普先行、交易放心、一物一證」的理念，為用戶提供專業、可信賴的玄門文化產品購物體驗。

## 技術架構

```
符寶網/
├── 前端 (Next.js)      # 用戶界面 - 端口 5000
├── PHP 後端            # API 服務 - 端口 8080
└── MySQL 數據庫        # 數據存儲
```

### 技術棧

| 層級 | 技術 |
|------|------|
| 前端框架 | Next.js 16 (App Router) |
| UI組件 | React 19 + shadcn/ui |
| 樣式 | TypeScript 5 + Tailwind CSS 4 |
| 後端 | PHP 7.4+ (ThinkPHP 風格) |
| 數據庫 | MySQL 5.7+ |
| 認證 | JWT |

## 快速開始

### 前端

```bash
# 安裝依賴
pnpm install

# 開發模式
pnpm dev

# 構建生產版本
pnpm build
```

### 後端 (PHP)

```bash
# 1. 創建數據庫
mysql -u root -p -e "CREATE DATABASE fubao CHARACTER SET utf8mb4;"
mysql -u root -p fubao < php/scripts/mysql-migration.sql

# 2. 啟動服務
cd php/public && php -S localhost:8080
```

## 目錄結構

```
符寶網/
├── src/                    # Next.js 前端源碼
│   ├── app/               # 頁面
│   ├── components/        # 組件
│   └── lib/               # 工具庫
├── php/                    # PHP 後端
│   ├── public/            # Web 根目錄
│   ├── app/               # 應用代碼
│   ├── config/            # 配置
│   ├── route/             # 路由
│   └── scripts/           # 腳本
├── docs/                   # 文檔
├── public/                 # 靜態資源
└── AGENTS.md              # 開發規範
```

## 核心功能

- **商品管理**：符籙、法器展示與交易
- **用戶系統**：註冊登錄、OAuth第三方登錄
- **購物流程**：購物車、訂單管理
- **互動功能**：收藏、願望清單、評價
- **內容系統**：文章、百科、Wiki
- **AI助手**：智能客服、文化科普
- **管理後台**：商品、訂單、用戶管理
- **反饋系統**：意見反饋、舉報管理

## 文檔

- [開發規範](./AGENTS.md) - 項目開發規範和API文檔
- [寶塔部署指南](./docs/baota-deployment.md) - 寶塔面板部署
- [手動部署指南](./docs/manual-deployment.md) - 手動部署教程
- [MySQL數據庫](./docs/mysql-database.md) - 數據庫說明

## 登錄信息

| 角色 | 用戶名 | 密碼 |
|------|--------|------|
| 管理員 | admin | admin123 |

## License

MIT
