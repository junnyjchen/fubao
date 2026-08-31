# 符寶網 - 開發需求文檔

> **版本**: v2.6.0  
> **更新日期**: 2026-07-28  
> **項目定位**: 全球玄門文化科普交易平台  
> **域名**: www.fubao.ltd  

---

## 目錄

- [一、項目概覽](#一項目概覽)
- [二、技術架構](#二技術架構)
- [三、用戶系統](#三用戶系統)
- [四、商品商城](#四商品商城)
- [五、購物車與訂單](#五購物車與訂單)
- [六、AI 智能助手](#六ai-智能助手)
- [七、免費送活動](#七免費送活動)
- [八、商家中心](#八商家中心)
- [九、新聞資訊與百科](#九新聞資訊與百科)
- [十、錢包與支付系統](#十錢包與支付系統)
- [十一、管理後台](#十一管理後台)
- [十二、郵件服務](#十二郵件服務)
- [十三、部署與運維](#十三部署與運維)
- [十四、認證與安全](#十四認證與安全)
- [十五、已知問題與修復記錄](#十五已知問題與修復記錄)
- [十六、待處理事項](#十六待處理事項)

---

## 一、項目概覽

### 1.1 項目簡介

符寶網是一個面向全球華人社区的玄門文化科普與交易電商平台，整合商品交易、文化科普、AI 智能助手、社區互動等功能，為用戶提供一站式玄門文化體驗。

### 1.2 核心價值

- **文化傳播**：通過百科、新聞資訊傳播玄門文化知識
- **電商交易**：安全便捷的商品交易體驗
- **AI 賦能**：智能助手提供個性化服務
- **全球覆蓋**：多語言支持，面向全球華人社區

### 1.3 生產架構

```
用戶 → Nginx (443/80) → Next.js standalone (端口 5000)
                           ├── /api/* → Next.js API Routes (Node.js)
                           ├── /_next/* → Next.js 靜態資源
                           ├── /uploads/ → Nginx 直接服務 (alias)
                           ├── /images/ → Nginx 直接服務 (alias)
                           └── /* → Next.js SSR 頁面
```

- **不再使用 Docker**，改用 systemd 直接管理 Node.js 進程
- Nginx 所有請求代理到 Next.js (端口 5000)
- Next.js API Routes 處理所有 `/api/*` 請求
- PHP/ThinkPHP 作為備用後端，僅通過降級使用

---

## 二、技術架構

### 2.1 技術棧

| 層級 | 技術 |
|------|------|
| 前端框架 | Next.js 16 (App Router) + React 19 |
| 後端 | Next.js API Routes (`src/app/api/`) |
| PHP 後端 | ThinkPHP (`php/`) — 備用/兼容 |
| UI 組件 | shadcn/ui + Tailwind CSS 4 |
| 語言 | TypeScript 5 / PHP 8 |
| 包管理 | 前端 pnpm (強制) / 後端 composer |
| 數據庫 | MySQL（生產唯一） |
| AI 集成 | DeepSeek/豆包/Kimi（流式輸出，默認 DeepSeek） |
| 郵件 | QQ郵箱 SMTP (nodemailer) |
| 部署 | systemd + Nginx (無 Docker) |

### 2.2 項目結構

```
/workspace/projects/
├── src/                        # Next.js 前端 + API
│   ├── app/                    # 頁面 (App Router)
│   │   ├── page.tsx           # 首頁
│   │   ├── ai-assistant/      # AI 助手頁面
│   │   ├── free-gifts/        # 免費送活動
│   │   ├── cart/              # 購物車
│   │   ├── checkout/          # 結帳頁面
│   │   ├── shop/              # 商品商城
│   │   ├── news/              # 新聞資訊
│   │   ├── baike/             # 百科
│   │   ├── merchant/          # 商家中心
│   │   ├── user/              # 用戶中心
│   │   ├── admin/             # 管理後台
│   │   ├── login/             # 用戶登錄
│   │   ├── register/          # 用戶註冊
│   │   ├── payment/[id]/      # 訂單支付
│   │   └── api/               # API Routes
│   ├── components/            # 組件
│   │   ├── ui/               # shadcn/ui 基礎組件
│   │   ├── ai/               # AI 組件
│   │   ├── admin/            # 管理後台組件
│   │   ├── shop/             # 商城組件
│   │   ├── cart/             # 購物車組件
│   │   ├── upload/           # 文件上傳組件
│   │   └── ...
│   └── lib/                   # 工具庫
│       ├── db.ts             # MySQL 數據庫操作
│       ├── mysql.ts          # MySQL 連接池
│       ├── api-response.ts   # 統一 API 響應格式
│       ├── api-client.ts     # 前端請求封裝
│       ├── email/service.ts  # 郵件服務
│       ├── auth/             # 認證相關
│       ├── ai/               # AI 相關
│       └── hooks/            # 自定義 Hooks
├── php/                        # PHP 後端（備用）
├── sql/                       # MySQL 建表和種子數據
├── public/                    # 靜態資源
│   ├── images/products/       # 商品圖片
│   ├── images/banners/        # Banner 圖片
│   └── uploads/              # 用戶上傳文件
├── docs/                      # 文檔
├── fubao-nextjs.service       # systemd 服務配置
├── update-fubao.sh            # 服務器一鍵部署腳本
└── .coze                      # 項目配置
```

### 2.3 數據庫表結構

| 表名 | 說明 |
|------|------|
| `users` | 用戶信息（含 balance、frozen_balance 字段） |
| `goods` | 商品信息（含 main_image、images JSON 字段） |
| `goods_i18n` | 商品多語言翻譯 |
| `categories` | 商品分類（樹形結構） |
| `cart_items` | 購物車項 |
| `orders` | 訂單 |
| `order_items` | 訂單商品項 |
| `addresses` | 收貨地址 |
| `reviews` | 商品評價 |
| `withdrawals` | 提現記錄 |
| `balance_logs` | 餘額變動記錄 |
| `recharge_records` | 充值記錄 |
| `free_gifts` | 免費送活動 |
| `news` | 新聞資訊 |
| `settings` | 系統設置（含 SMTP、支付配置） |
| `banners` | 輪播圖 |
| `merchants` | 商家信息 |
| `coupons` | 優惠券 |
| `notifications` | 用戶通知 |
| `favorites` | 收藏 |
| `user_distribution` | 分銷員信息 |
| `commission_records` | 佣金記錄 |
| `withdrawal_records` | 分銷提現記錄 |

---

## 三、用戶系統

### 3.1 用戶註冊

| 要點 | 說明 |
|------|------|
| 路由 | `/register` |
| API | `POST /api/auth/register` |
| 註冊方式 | 郵箱註冊 |
| phone 字段 | 允許空字符串（修復 NOT NULL 錯誤） |
| 歡迎郵件 | 註冊成功自動發送 |
| 邀請碼 | 支持邀請碼註冊 |

### 3.2 用戶登錄

| 要點 | 說明 |
|------|------|
| 路由 | `/login` |
| API | `POST /api/auth/login` |
| 認證方式 | JWT 雙通道：`Authorization: Bearer` header + `auth_token` httpOnly cookie |
| 前端存儲 | localStorage 存儲 `fubao_token` |
| Token 加載 | `useEffect` 首次從 localStorage 讀取，確保同步 |

### 3.3 用戶中心

| 功能 | 路由 | 說明 |
|------|------|------|
| 個人信息 | `/user` | 不使用默認數據 fallback（移除 `id: 1` 默認值） |
| 訂單管理 | `/user/orders` | 訂單列表/詳情 |
| 收藏管理 | `/user/favorites` | 商品收藏/取消收藏 |
| 錢包 | `/user/wallet` | 餘額/充值/提現 |
| 積分 | `/user/points` | 積分查詢 |
| 收貨地址 | `/user/addresses` | CRUD 管理 |
| 通知 | `/user/notifications` | 站內通知 |
| 優惠券 | `/user/coupons` | 優惠券列表 |
| 瀏覽歷史 | `/user/history` | 自動記錄瀏覽商品 |
| 簽到 | `/user/signin` | 每日簽到獲取積分 |

### 3.4 認證規範

- 所有需認證的 fetch 請求使用 `getAuthHeaders()` 函數
- `getAuthHeaders()` 從 localStorage 讀取 `fubao_token`，始終包含 `Content-Type: application/json`
- 始終攜帶 `credentials: 'include'` 確保發送 cookie
- API 端使用 `getAuthUserId(request)` 先查 Authorization header，再查 cookie

---

## 四、商品商城

### 4.1 商品列表

| 要點 | 說明 |
|------|------|
| 路由 | `/shop` |
| API | `GET /api/goods?page=1&pageSize=20` |
| 篩選 | 分類(category_id)、關鍵詞(keyword)、類型(type)、用途(purpose) |
| 多語言 | `locale` 參數，默認 `zh-TW` |
| 返回格式 | `{success, data:[...], total, page, pageSize, total_pages}` |

### 4.2 商品詳情

| 要點 | 說明 |
|------|------|
| 路由 | `/shop/[id]` |
| API | `GET /api/goods/[id]?locale=zh-TW` |
| 功能 | 多語言翻譯、相關商品推薦、圖片輪播、規格選擇 |
| 立即購買 | 登錄用戶 POST `/api/orders` `{goods_id, quantity}` → 跳轉 `/payment/[id]` |
| 加入購物車 | 登錄用戶 POST `/api/cart` `{goodsId, quantity}` |
| 收藏 | `checkFavoriteStatus` / `recordBrowseHistory` 帶 `getAuthHeaders()` |

### 4.3 商品分類

| 要點 | 說明 |
|------|------|
| 路由 | `/categories` |
| API | `GET /api/categories` |
| 結構 | 樹形分類，支持父子關係 |

### 4.4 圖片處理規範

- `fixImageUrl()` 統一處理圖片 URL：
  - `/api/file/xxx` → `/uploads/xxx`
  - 純文件名（如 `1783824918257_vqgp0k.jpg`）→ `/uploads/goods/文件名`
  - 已帶 `/` 前綴或 `http(s)://` 的完整 URL → 原樣返回
- MySQL JSON 字段 `images` 可能返回字符串，需 `JSON.parse` 處理
- `parseImages()` 函數處理 JSON 字符串 → 數組轉換

### 4.5 管理後台商品管理

| 要點 | 說明 |
|------|------|
| 新建商品 | `POST /api/admin/goods` |
| 編輯商品 | `PUT /api/goods/[id]` |
| `category_id` | 默認值為 `0`，不允許 null |
| `merchant_id` | 默認值為 `0`，不允許 null |
| `main_image` | 默認空字符串 `''` |
| `images` | 存儲為 JSON 字符串 `JSON.stringify(urls)` |
| 圖片上傳 | `ImageUpload` 組件，`folder="goods"`，返回 `/uploads/goods/文件名` |

---

## 五、購物車與訂單

### 5.1 購物車

| 要點 | 說明 |
|------|------|
| 路由 | `/cart` |
| API | `GET /api/cart` |
| 返回結構 | `{success, data:{groups:[...], summary:{...}}}` |
| 前端解析 | `setMerchantGroups(data.data.groups)`，不能直接 `setMerchantGroups(data.data)` |
| 防崩潰 | `flatMap` 調用需 `Array.isArray` 防禦 |
| 添加商品 | `POST /api/cart` `{goodsId, quantity}` |
| 刪除商品 | `DELETE /api/cart?id=xxx` 帶 `getAuthHeaders()` |
| 認證 | 所有操作帶 `getAuthHeaders()` + `credentials: 'include'` |

### 5.2 結帳

| 要點 | 說明 |
|------|------|
| 路由 | `/checkout` |
| 訪客結帳 | 支持未登錄用戶直接購買 |
| 訂單創建 | `POST /api/orders` |

### 5.3 訂單系統

| 要點 | 說明 |
|------|------|
| 創建模式 | 三種：`cart_item_ids`（購物車）、`items`（訪客）、`goods_id`（直接購買） |
| 訂單狀態 | `pending` → `paid` → `shipped` → `completed` / `cancelled` / `refunded` |
| 更新 API | `PUT /api/orders/[id]` |
| status:'paid' | PUT 支持，更新訂單為已支付 |
| 禁止列 | 不使用 `cancelled_at`/`confirmed_at`/`paid_at` 等不存在的列 |
| 訂單詳情 | `GET /api/orders/[id]` |
| 圖片 URL | 訂單商品圖片使用 `fixImageUrl` 轉換 |

### 5.4 訂單支付

| 要點 | 說明 |
|------|------|
| 路由 | `/payment/[id]` |
| 支付方式 | SOL（首選推薦）、PayPal |
| SOL 支付 | 點擊支付後顯示錢包地址，用戶轉賬後系統確認 |
| PayPal 支付 | 模擬支付流程，2 秒延遲後確認 |
| 倒計時 | 支付超時倒計時 |
| 取消訂單 | `handleCancel` 帶 `credentials: 'include'` |

---

## 六、AI 智能助手

### 6.1 AI 對話

| 要點 | 說明 |
|------|------|
| 路由 | `/ai-assistant` |
| API | `POST /api/ai/chat` |
| 流式輸出 | SSE 協議，`ReadableStream` 逐步輸出，前端 `Reader` 打字機式渲染 |
| Response Header | `Content-Type: text/event-stream`, `Transfer-Encoding: chunked` |
| 默認模型 | DeepSeek |
| 支持模型 | 豆包(Seed/Doubao)、DeepSeek、Kimi |
| 多輪對話 | 支持上下文記憶 |
| 思考模式 | 支持思考鏈輸出 |

### 6.2 AI 其他功能

| 功能 | API | 說明 |
|------|-----|------|
| 模型列表 | `GET /api/ai/models` | 返回可用模型 |
| AI 翻譯 | `POST /api/ai/translate` | 多語言翻譯 |
| 知識庫檢索 | `POST /api/ai/knowledge/search` | 語義搜索 |
| AI 訓練 | `/api/admin/ai-training/*` | 訓練任務管理 |
| AI 內容生成 | `/api/admin/ai-content/*` | 內容生成管理 |
| 知識庫管理 | `/api/admin/ai-knowledge` | 知識庫 CRUD |

### 6.3 知識庫

| 要點 | 說明 |
|------|------|
| 文檔導入 | 支持文本、URL、對象存儲 URI |
| 向量化存儲 | 文檔向量化後存儲 |
| 語義搜索 | 基於向量相似度的語義檢索 |
| 知識庫頁面 | `/knowledge` |

---

## 七、免費送活動

| 要點 | 說明 |
|------|------|
| 列表路由 | `/free-gifts` |
| 詳情路由 | `/free-gifts/[id]` |
| API | `GET /api/free-gifts` |
| 領取 | `POST /api/free-gifts`，需 `getAuthUserId` 認證 |
| 認證調試 | `console.log('[FreeGifts] 認證檢查:', userId)` |
| 圖片 URL | `fixImageUrl(String(g.main_image || ''))` 使用 `String()` 類型轉換 |

---

## 八、商家中心

| 功能 | 路由 | 說明 |
|------|------|------|
| 商家登錄 | `/merchant/login` | 獨立登錄入口 |
| 商家後台 | `/merchant/dashboard` | 儀表盤、商品管理、訂單管理 |
| 商家入駐 | `/merchant/apply` | 申請流程 |
| 商家商品 | `GET/POST /api/merchant/goods` | 商家商品 CRUD |

---

## 九、新聞資訊與百科

### 9.1 新聞資訊

| 功能 | 路由 | 說明 |
|------|------|------|
| 新聞列表 | `/news` | 分頁列表 |
| 新聞詳情 | `/news/[slug]` | slug 路由 |
| 新聞 API | `/api/news` | CRUD |
| 文章 API | `/api/articles` | CRUD |

### 9.2 百科

| 功能 | 路由 | 說明 |
|------|------|------|
| 百科首頁 | `/baike` | 百科條目列表 |
| 百科文章 | `/baike/[slug]` | slug 路由詳情頁 |

---

## 十、錢包與支付系統

### 10.1 餘額充值

| 要點 | 說明 |
|------|------|
| 路由 | `/user/wallet` |
| API | `POST /api/recharge` |
| 支付方式 | SOL（默認推薦）、PayPal、支付寶（即將開放）、微信支付（即將開放） |
| 充值 API | 接受任意 `paymentMethod` 參數，包括 `'sol'` |
| 充值記錄 | `GET /api/recharge` 查詢充值歷史 |
| 贈送規則 | 充值滿額贈送，`bonusRules` 配置 |

### 10.2 餘額提現

| 要點 | 說明 |
|------|------|
| 路由 | `/user/wallet/withdraw` |
| API | `GET/POST /api/user/withdrawals` |
| 提現方式 | SOL（Solana） |
| SOL 地址驗證 | 正則 `/^[1-9A-HJ-NP-Za-km-z]{32,44}$/` |
| 手續費 | 1% |
| 最低金額 | HK$10 |
| 流程 | 提交申請 → 管理員審核 → 完成/拒絕 |
| 餘額凍結 | 提現時從 `balance` 扣除，加入 `frozen_balance` |
| 餘額日誌 | `balance_logs` 表記錄所有變動 |

### 10.3 SOL 支付集成

| 要點 | 說明 |
|------|------|
| 訂單支付 | `/payment/[id]` 頁面，SOL 為首選支付方式 |
| 支付說明 | 選擇 SOL 時顯示支付步驟和匯率參考 |
| 匯率顯示 | 1 SOL ≈ HK$1,200（參考值，以實際到帳為準） |
| 平台 SOL 地址 | 需在 settings 表中配置 `platform_sol_address` |
| 數據庫表 | `withdrawals`（提現記錄）、`balance_logs`（餘額變動） |

### 10.4 分銷系統

| 功能 | API | 說明 |
|------|-----|------|
| 分銷總覽 | `GET /api/distribution?action=overview` | 佣金統計 |
| 團隊成員 | `GET /api/distribution?action=team` | 下級分銷員 |
| 佣金記錄 | `GET /api/distribution?action=commissions` | 佣金明細 |
| 提現記錄 | `GET /api/distribution?action=withdrawals` | 分銷提現 |
| 分銷商品 | `GET /api/distribution?action=products` | 可分銷商品 |
| 分銷連結 | `GET /api/distribution?action=links` | 邀請連結/二維碼 |
| 申請提現 | `POST /api/distribution {action:'withdraw'}` | 最低 HK$100 |

---

## 十一、管理後台

### 11.1 後台概覽

| 要點 | 說明 |
|------|------|
| 登錄 | `/admin/login`，賬號 admin / admin123 |
| 儀表盤 | `/admin` |
| 統計 API | `GET /api/admin/stats` |
| 分析 API | `GET /api/admin/analytics` |

### 11.2 後台功能模塊

| 功能 | 路由 | API | 說明 |
|------|------|-----|------|
| 商品管理 | `/admin/goods` | `/api/admin/goods` | CRUD，`category_id` 默認 0 |
| 新建商品 | `/admin/goods/new` | `POST /api/admin/goods` | 圖片存 JSON 字符串 |
| 編輯商品 | `/admin/goods/[id]` | `PUT /api/goods/[id]` | 含 PUT 方法 |
| 商品翻譯 | `/admin/goods-i18n` | `/api/goods/i18n` | 多語言翻譯管理 |
| 訂單管理 | `/admin/orders` | `/api/orders` | 訂單查看/發貨 |
| 用戶管理 | `/admin/users` | `/api/admin/users` | 用戶列表/封禁 |
| 商家管理 | `/admin/merchants` | `/api/merchant/*` | 商家審核 |
| 新聞管理 | `/admin/news` | `/api/news` | 新聞 CRUD |
| 分類管理 | `/admin/categories` | `/api/categories` | 分類樹 CRUD |
| 輪播圖管理 | `/admin/banners` | `/api/banners` | Banner CRUD，`fixImageUrl` |
| 系統設置 | `/admin/settings` | `/api/settings` | 含 SMTP 測試 |
| 數據庫管理 | `/admin/database` | — | 可視化管理界面 |
| AI 訓練 | `/admin/ai-training` | `/api/admin/ai-training/*` | 訓練任務 |
| AI 內容 | `/admin/ai-content` | `/api/admin/ai-content/*` | 內容生成 |
| 知識庫管理 | `/admin/ai-knowledge` | `/api/admin/ai-knowledge` | 知識庫 CRUD |
| AI 模型配置 | `/admin/ai-models` | `/api/ai/models` | 模型參數 |
| 公告管理 | — | `/api/admin/announcement` | 公告 CRUD |
| 證書管理 | — | `/api/admin/certificate` | 證書 CRUD |
| 優惠券管理 | — | `/api/admin/coupon` | 優惠券 CRUD |
| 提現管理 | `/admin/withdrawals` | `/api/admin/withdrawals` | 審核提現 |
| 權限管理 | — | `/api/admin/permissions` | 權限分配 |
| 角色管理 | — | `/api/admin/roles` | 角色 CRUD |

### 11.3 管理後台圖片規範

- admin/goods GET 返回數據時應用 `fixImageUrl` 處理圖片 URL
- `fixGoodsImages` 函數處理 `main_image` 和 `images` 字段
- `images` 字段可能是 JSON 字符串，需 `JSON.parse` 後再 `fixImageUrl`

---

## 十二、郵件服務

| 功能 | 說明 |
|------|------|
| 訂單確認郵件 | 下單成功自動發送 |
| 註冊歡迎郵件 | 新用戶註冊發送 |
| 發貨通知郵件 | 商家發貨後發送 |
| SMTP 測試 | 管理後台可測試連接和發送 |
| SMTP 配置 | QQ郵箱 `smtp.qq.com:465` SSL |
| 配置存儲 | 存儲在 `settings` 表中，無需環境變量 |
| 實現 | nodemailer (Node.js) / PHPMailer (PHP) |

---

## 十三、部署與運維

### 13.1 部署架構

| 要點 | 說明 |
|------|------|
| 服務器目錄 | `/www/wwwroot/fubao` |
| 進程管理 | systemd (`fubao-nextjs.service`) |
| 端口 | 5000（從 `DEPLOY_RUN_PORT` 環境變量讀取） |
| 構建 | `pnpm build` (standalone 模式) |
| 啟動 | `pnpm start` (node server.js) |

### 13.2 部署腳本

| 命令 | 說明 |
|------|------|
| `bash update-fubao.sh --install` | 首次安裝 |
| `bash update-fubao.sh` | 增量更新（拉取代碼 → 構建 → 重啟） |
| `bash update-fubao.sh --rebuild` | 強制完整構建 |
| `bash update-fubao.sh --diagnose` | 診斷當前狀態 |
| `bash update-fubao.sh --migrate` | 僅執行數據庫遷移 |

### 13.3 關鍵部署步驟

1. **每次構建清理緩存**：`rm -rf .next`（防止 "Failed to find Server Action" 錯誤）
2. **複製 public 目錄**到 standalone
3. **uploads 符號連結**：`standalone/public/uploads` → 源碼 `public/uploads`（確保上傳文件持久保存）
4. **複製 .next/static** 到 standalone
5. **寫入 .env 文件**（MySQL 配置、AI 配置）
6. **數據庫遷移**（執行 `sql/migrate.sql`）
7. **重啟 systemd 服務**

### 13.4 Nginx 配置

| 路徑 | 配置 | 說明 |
|------|------|------|
| `/uploads/` | `alias /www/wwwroot/fubao/public/uploads/` | 靜態文件直接服務 |
| `/images/` | `alias /www/wwwroot/fubao/public/images/` | 靜態文件直接服務 |
| `/_next/static/` | `proxy_pass http://127.0.0.1:5000` | Next.js 靜態資源 |
| `/` | `proxy_pass http://127.0.0.1:5000` | 所有其他請求代理到 Next.js |
| `/php-api/` | PHP-FPM | PHP 後端獨立路徑 |

### 13.5 服務管理

```bash
# 查看服務狀態
sudo systemctl status fubao-nextjs

# 查看實時日誌
sudo journalctl -u fubao-nextjs -f

# 重啟服務
sudo systemctl restart fubao-nextjs

# 查看最近 50 行日誌
sudo journalctl -u fubao-nextjs -n 50
```

### 13.6 文件上傳

| 要點 | 說明 |
|------|------|
| API | `POST /api/upload` |
| 存儲路徑 | `public/uploads/{folder}/` |
| 返回 URL | `/uploads/{folder}/文件名` |
| 文件命名 | `{時間戳}_{隨機字符}.{擴展名}` |
| 最大大小 | 5MB |
| 支持類型 | JPG、PNG、GIF、WebP、SVG |
| 符號連結 | standalone 目錄通過符號連結訪問源碼目錄的 uploads |
| 刪除 | `DELETE /api/upload?key=路徑` |

---

## 十四、認證與安全

### 14.1 JWT 認證

| 要點 | 說明 |
|------|------|
| 後端函數 | `getAuthUserId(request)` — 先查 Authorization header，再查 cookie |
| Cookie 名稱 | `auth_token` / `fubao_token` / `token` |
| 前端函數 | `getAuthHeaders()` — 從 localStorage 讀取 `fubao_token` |
| Header 格式 | `Authorization: Bearer {token}` |
| 始終包含 | `Content-Type: application/json` |
| Cookie 發送 | `credentials: 'include'` |

### 14.2 前端安全

| 要點 | 說明 |
|------|------|
| Hydration 安全 | `'use client'` + `useEffect` + `useState` 確保動態內容僅客戶端渲染 |
| 禁止行為 | JSX 中直接使用 `typeof window`、`Date.now()`、`Math.random()` |
| 防禦性檢查 | API 響應 `.map()` 調用提供默認空數組 `|| []` |
| `isApiSuccess()` | 檢查 API 響應格式 `{success: true, data: ...}` |

### 14.3 API 響應規範

```typescript
// 成功（無數據）
{ success: true, message: "操作成功" }

// 成功（有數據）
{ success: true, data: [...] }

// 分頁
{ success: true, data: [...], total: 100, page: 1, pageSize: 20 }

// 失敗
{ success: false, error: "錯誤描述" }
```

---

## 十五、已知問題與修復記錄

### 15.1 註冊 phone NOT NULL 錯誤

| 項目 | 說明 |
|------|------|
| 問題 | `Column 'phone' cannot be null` |
| 原因 | 註冊時 phone 為 null，但數據庫字段 NOT NULL |
| 修復 | register route 改為 `phone: phone \|\| ''` |
| 文件 | `src/app/api/auth/register/route.ts` |

### 15.2 購物車 flatMap 崩潰

| 項目 | 說明 |
|------|------|
| 問題 | `TypeError: g.flatMap is not a function` |
| 原因 | cart API 返回 `{groups, summary}` 對象，前端卻 `setMerchantGroups(data.data)` 當數組 |
| 修復 | 正確解析 `data.data.groups`，添加 `Array.isArray` 防禦 |
| 文件 | `src/components/cart/CartPage.tsx` |

### 15.3 圖片 404 - URL 格式問題

| 項目 | 說明 |
|------|------|
| 問題 | 圖片 URL 為純文件名（如 `1783824918257_vqgp0k.jpg`），缺少路徑前綴 |
| 原因 | 數據庫中存儲了不完整的 URL |
| 修復 | `fixImageUrl()` 新增純文件名檢測，自動補全為 `/uploads/goods/文件名` |
| 文件 | `src/lib/api-client.ts`、`src/app/api/goods/route.ts`、`src/app/api/goods/[id]/route.ts` |

### 15.4 圖片 404 - 上傳路徑問題

| 項目 | 說明 |
|------|------|
| 問題 | 上傳 API 存 `/api/file/xxx` 格式，standalone 模式下 `process.cwd()` 路徑錯誤 |
| 修復 | 上傳組件優先使用 `result.data.url`（`/uploads/xxx` 格式） |
| 文件 | `src/components/upload/ImageUpload.tsx` |

### 15.5 圖片 404 - MySQL JSON 字段

| 項目 | 說明 |
|------|------|
| 問題 | MySQL JSON 字段 `images` 返回字符串而非數組，`Array.isArray` 為 false |
| 修復 | API 層先 `JSON.parse` 處理 |
| 文件 | `src/app/api/goods/route.ts`、`src/app/api/goods/[id]/route.ts` |

### 15.6 圖片 404 - standalone 符號連結

| 項目 | 說明 |
|------|------|
| 問題 | 每次部署 `rm -rf` 刪除 standalone 的 public 目錄再複製，上傳文件丟失 |
| 修復 | 部署腳本創建符號連結：`standalone/public/uploads` → 源碼 `public/uploads` |
| 文件 | `update-fubao.sh` |

### 15.7 "Failed to find Server Action" 錯誤

| 項目 | 說明 |
|------|------|
| 問題 | Next.js 部署緩存不匹配，客戶端/服務端 Action ID 不一致 |
| 原因 | 部署時 `.next` 緩存未清理 |
| 修復 | `update-fubao.sh` 每次構建都 `rm -rf .next` |
| 用戶操作 | 需清除瀏覽器緩存 |

### 15.8 商品創建 category_id NOT NULL

| 項目 | 說明 |
|------|------|
| 問題 | `Column 'category_id' cannot be null` |
| 原因 | API 傳 null，但數據庫字段 NOT NULL |
| 修復 | `category_id` 和 `merchant_id` 默認值從 `null` 改為 `0` |
| 文件 | `src/app/api/admin/goods/route.ts` |

### 15.9 商品編輯 PUT 路由缺失

| 項目 | 說明 |
|------|------|
| 問題 | 編輯頁面 PUT 到 `/api/goods/[id]` 但該路由只有 GET |
| 修復 | 在 `/api/goods/[id]/route.ts` 添加 PUT 方法 |
| 文件 | `src/app/api/goods/[id]/route.ts` |

### 15.10 新建商品提交到錯誤 API

| 項目 | 說明 |
|------|------|
| 問題 | 新建頁面 POST 到 `/api/goods` 但 POST 路由在 `/api/admin/goods` |
| 修復 | 改為 `POST /api/admin/goods`，同時修復參數格式 |
| 文件 | `src/app/admin/goods/new/page.tsx` |

---

## 十六、待處理事項

| 事項 | 說明 | 優先級 |
|------|------|--------|
| SOL 錢包地址配置 | 需在 settings 表中配置 `platform_sol_address` 用於收款 | 高 |
| 舊商品圖片確認 | 數據庫中 `/images/products/xxx.jpg` 路徑的圖片文件確認存在 | 中 |
| 上傳目錄權限 | 服務器 `public/uploads/` 目錄權限 `chown -R www:www` | 中 |
| 瀏覽器緩存 | "Failed to find Server Action" 需用戶清除瀏覽器緩存 | 中 |
| SOL 匯率動態獲取 | 當前匯率為硬編碼 HK$1,200，可改為動態獲取 | 低 |
| 支付寶/微信支付 | 頁面顯示"即將開放"，需接入支付寶/微信支付 SDK | 低 |
| PHP 後端同步 | ThinkPHP 後端需同步更新 API 變更 | 低 |

---

## 附錄：環境變量

```bash
# 數據庫
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=fubao
MYSQL_PASSWORD=CZDhXEb8M7t1jheP
MYSQL_DATABASE=fubao

# PHP 後端
DB_HOST=localhost
DB_PORT=3306
DB_USER=fubao
DB_PASSWORD=CZDhXEb8M7t1jheP
DB_NAME=fubao

# API 模式
NEXT_PUBLIC_API_MODE=local

# AI 模型（默認 DeepSeek）
AI_PROVIDER=deepseek

# 生產環境標識
COZE_PROJECT_ENV=PROD

# 郵件 SMTP（存儲在 settings 表中，無需環境變量）
```

---

## 附錄：快速命令

```bash
# 安裝依賴
pnpm install

# 開發模式 (端口 5000)
pnpm dev

# 生產構建
pnpm build

# 代碼檢查
pnpm lint
pnpm ts-check

# 服務器部署
bash update-fubao.sh --rebuild

# 查看服務日誌
sudo journalctl -u fubao-nextjs -f

# 重啟服務
sudo systemctl restart fubao-nextjs

# 創建 uploads 符號連結（手動）
rm -rf /www/wwwroot/fubao/.next/standalone/public/uploads
ln -sf /www/wwwroot/fubao/public/uploads /www/wwwroot/fubao/.next/standalone/public/uploads
```

---

> **最後更新**: 2026-07-28  
> **維護者**: 符寶網開發團隊
