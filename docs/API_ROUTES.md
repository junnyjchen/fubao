# 符寶網 - API 路由索引

> 本文档提供符寶網项目中所有 API 路由的快速参考。

---

## 目录

1. [认证 API](#1-认证-api)
2. [商品 API](#2-商品-api)
3. [订单 API](#3-订单-api)
4. [用户 API](#4-用户-api)
5. [AI API](#5-ai-api)
6. [管理后台 API](#6-管理后台-api)

---

## 1. 认证 API

路径: `src/app/api/auth/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| POST | `/api/auth/login` | 用户登录 | `{ account, password }` |
| POST | `/api/auth/register` | 用户注册 | `{ username, password, phone?, email? }` |
| GET | `/api/auth/me` | 获取当前用户 | - |
| POST | `/api/auth/logout` | 用户登出 | - |
| POST | `/api/auth/sendCode` | 发送验证码 | `{ phone }` |
| POST | `/api/auth/loginByPhone` | 手机号登录 | `{ phone, code }` |

### 示例

```typescript
// 登录
POST /api/auth/login
Body: { account: "user@example.com", password: "xxx" }

// 响应
{ success: true, data: { user: {...}, token: "..." } }
```

---

## 2. 商品 API

路径: `src/app/api/goods/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/goods` | 商品列表 | `page, page_size, category_id, keyword` |
| GET | `/api/goods/{id}` | 商品详情 | - |
| GET | `/api/goods/recommended` | 推荐商品 | `limit` |
| GET | `/api/goods/hot` | 热销商品 | `limit` |

路径: `src/app/api/categories/`

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/api/categories` | 分类列表 |
| GET | `/api/categories/all` | 所有分类 |
| GET | `/api/categories/slug/{slug}` | 按slug获取分类 |

路径: `src/app/api/favorites/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/favorites` | 收藏列表 | `page, page_size` |
| POST | `/api/favorites/add` | 添加收藏 | `{ goods_id }` |
| POST | `/api/favorites/remove` | 取消收藏 | `{ goods_id }` |

路径: `src/app/api/cart/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/cart` | 购物车列表 | - |
| POST | `/api/cart/add` | 添加购物车 | `{ goods_id, quantity, specs? }` |
| POST | `/api/cart/update` | 更新购物车 | `{ id, quantity }` |
| POST | `/api/cart/remove` | 删除购物车商品 | `{ id }` |

路径: `src/app/api/coupons/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/coupons/available` | 可领取优惠券 | - |
| GET | `/api/coupons/my` | 我的优惠券 | - |
| POST | `/api/coupons/claim` | 领取优惠券 | `{ coupon_id }` |
| POST | `/api/coupons/validate` | 验证优惠券 | `{ coupon_id, order_amount }` |

---

## 3. 订单 API

路径: `src/app/api/orders/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/orders` | 订单列表 | `page, page_size, status` |
| POST | `/api/orders` | 创建订单 | `{ items, address_id, coupon_id? }` |
| GET | `/api/orders/{id}` | 订单详情 | - |
| POST | `/api/orders/{id}/cancel` | 取消订单 | - |
| POST | `/api/orders/{id}/confirm` | 确认收货 | - |
| POST | `/api/orders/cancel` | 取消订单 | `{ order_id }` |
| POST | `/api/orders/confirm` | 确认收货 | `{ order_id }` |

路径: `src/app/api/addresses/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/addresses` | 地址列表 | - |
| POST | `/api/addresses` | 创建地址 | `{ name, phone, province, city, district, detail, is_default }` |
| PUT | `/api/addresses/{id}` | 更新地址 | - |
| DELETE | `/api/addresses/{id}` | 删除地址 | - |

路径: `src/app/api/logistics/{id}`

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/api/logistics/{id}` | 物流信息 |

---

## 4. 用户 API

路径: `src/app/api/notifications/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/notifications` | 通知列表 | `page, page_size` |
| POST | `/api/notifications/markRead` | 标记已读 | `{ id }` |
| POST | `/api/notifications/markAllRead` | 全部标记已读 | - |
| GET | `/api/notifications/unreadCount` | 未读数量 | - |

路径: `src/app/api/feedback/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/feedback` | 我的反馈列表 | `page, page_size` |
| POST | `/api/feedback` | 提交反馈 | `{ type, content, contact? }` |
| GET | `/api/feedback/{id}` | 反馈详情 | - |
| GET | `/api/feedback/faq` | FAQ列表 | - |

路径: `src/app/api/messages/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/messages` | 消息列表 | `page, page_size` |
| POST | `/api/messages/send` | 发送私信 | `{ to_user_id, content }` |
| POST | `/api/messages/markRead` | 标记已读 | `{ id }` |

---

## 5. AI API

路径: `src/app/api/ai/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| POST | `/api/ai/chat` | AI 聊天 (SSE) | `{ message, session_id? }` |
| GET | `/api/ai/capabilities` | AI 能力列表 | - |
| GET | `/api/ai/models` | 可用模型 | - |
| GET | `/api/ai/myHistory` | 我的对话历史 | `page, page_size` |
| POST | `/api/ai/deleteSession` | 删除会话 | `{ session_id }` |

路径: `src/app/api/ai/embedding/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| POST | `/api/ai/embedding` | 文本嵌入 | `{ texts: string[] }` |

路径: `src/app/api/ai/knowledge/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| POST | `/api/ai/knowledge/search` | 知识库搜索 | `{ query, topK?, useEmbedding? }` |
| GET | `/api/ai/recommendQA` | 推荐问答 | `{ query, limit? }` |

---

## 6. 管理后台 API

路径: `src/app/api/admin/`

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| POST | `/api/admin/login` | 管理员登录 | `{ username, password }` |
| GET | `/api/admin/me` | 管理员信息 | - |
| GET | `/api/admin/dashboard` | 仪表盘统计 | - |
| POST | `/api/admin/changePassword` | 修改密码 | `{ old_password, new_password }` |

### 商品管理

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/admin/goods` | 商品列表 | `page, page_size, status, keyword` |
| POST | `/api/admin/goods/create` | 创建商品 | `{ name, price, ... }` |
| POST | `/api/admin/goods/update` | 更新商品 | `{ id, ... }` |
| POST | `/api/admin/goods/delete` | 删除商品 | `{ id }` |

### 订单管理

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/admin/orders` | 订单列表 | `page, page_size, status` |
| POST | `/api/admin/orders/updateStatus` | 更新订单状态 | `{ order_id, status }` |

### 用户管理

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/admin/users` | 用户列表 | `page, page_size, keyword` |
| GET | `/api/admin/users/{id}` | 用户详情 | - |
| POST | `/api/admin/users/{id}` | 更新用户 | - |

### AI 训练

| 方法 | 路由 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/admin/ai/training/knowledge` | 知识库列表 | `page, page_size, category, status` |
| POST | `/api/admin/ai/training/knowledgeCreate` | 创建知识 | `{ title, content, category }` |
| POST | `/api/admin/ai/training/knowledgeUpdate` | 更新知识 | `{ id, ... }` |
| POST | `/api/admin/ai/training/knowledgeDelete` | 删除知识 | `{ id }` |
| GET | `/api/admin/ai/training/qa` | 问答对列表 | `page, page_size, category` |
| POST | `/api/admin/ai/training/qaCreate` | 创建问答对 | `{ question, answer, category }` |
| POST | `/api/admin/ai/training/generateQA` | 生成问答对 | `{ knowledge_id }` |
| GET | `/api/admin/ai/training/tasks` | 训练任务列表 | `page, page_size, status` |
| POST | `/api/admin/ai/training/taskCreate` | 创建训练任务 | `{ name, type, knowledge_ids }` |
| POST | `/api/admin/ai/training/taskStart` | 启动训练 | `{ id }` |
| GET | `/api/admin/ai/training/stats` | 训练统计 | - |

### 其他管理

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/api/admin/categories` | 分类管理 |
| GET | `/api/admin/banners` | Banner管理 |
| GET | `/api/admin/coupons` | 优惠券管理 |
| GET | `/api/admin/announcements` | 公告管理 |
| GET | `/api/admin/merchants` | 商户管理 |
| GET | `/api/admin/feedback` | 反馈管理 |
| GET | `/api/admin/tickets` | 工单管理 |

---

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE"
}
```

### 分页响应

```json
{
  "success": true,
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}
```

---

## 请求示例

```typescript
import { api } from '@/lib/api-request';

// 获取商品列表
const goods = await api.get('/goods', { page: 1, page_size: 20 });

// 创建订单
const order = await api.post('/orders', {
  items: [{ goods_id: 1, quantity: 2 }],
  address_id: 1
});

// AI 聊天
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: '你好' })
});
```
