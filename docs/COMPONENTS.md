# 符寶網 - 组件索引

> 本文档提供符寶網项目中所有组件的快速参考。

---

## 目录

1. [UI 基础组件](#1-ui-基础组件)
2. [AI 组件](#2-ai-组件)
3. [管理后台组件](#3-管理后台组件)
4. [业务组件](#4-业务组件)
5. [通用组件](#5-通用组件)

---

## 1. UI 基础组件

路径: `src/components/ui/`

| 组件 | 文件 | 说明 | 用法 |
|------|------|------|------|
| **Modal** | `modal.tsx` | 对话框/抽屉 | `<Modal isOpen onClose title="标题">` |
| **Toast** | `toast.tsx` | 通知提示 | `const { success, error } = useToast()` |
| **Tabs** | `tabs.tsx` | 标签页 | `<Tabs tabs={[]}><TabPanel/></Tabs>` |
| **Image** | `image.tsx` | 图片/头像 | `<Image src="" alt=""/><Avatar/>` |
| **Pagination** | `pagination.tsx` | 分页 | `<Pagination total={100} page={1}/>` |
| **Skeleton** | `skeleton.tsx` | 骨架屏 | `<Skeleton className="h-4 w-32"/>` |
| **EmptyState** | `empty-state.tsx` | 空状态 | `<EmptyState icon={Icon} text="暂无数据"/>` |
| **Badge** | `badge.tsx` | 徽章 | `<Badge>标签</Badge>` |
| **Button** | `button.tsx` | 按钮 | `<Button variant="default">` |
| **Input** | `input.tsx` | 输入框 | `<Input placeholder="请输入"/>` |
| **Card** | `card.tsx` | 卡片 | `<Card><CardHeader/></Card>` |
| **Select** | `select.tsx` | 选择器 | `<Select options={[]}/>` |

### Modal 使用示例

```tsx
import { Modal, ConfirmDialog, Drawer } from '@/components/ui/modal';

// 普通对话框
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="标题">
  <p>内容</p>
</Modal>

// 确认对话框
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  message="确定删除？"
  type="danger"
/>

// 底部抽屉
<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="标题">
  <p>内容</p>
</Drawer>
```

### Toast 使用示例

```tsx
import { ToastProvider, useToast } from '@/components/ui/toast';

// 根组件
<ToastProvider>
  <App />
</ToastProvider>

// 子组件
function MyComponent() {
  const { success, error, info, loading, dismiss } = useToast();
  
  const handleClick = async () => {
    const id = loading('加载中...');
    await apiCall();
    dismiss(id);
    success('操作成功');
  };
}
```

---

## 2. AI 组件

路径: `src/components/ai/`

| 组件 | 文件 | 说明 | 用法 |
|------|------|------|------|
| **AIChat** | `AIChat.tsx` | AI 聊天主组件 | `<AIChat />` 或 `<AIChat adminMode />` |
| **QuickStartAI** | `QuickStartAI.tsx` | 快速启动 AI | `<QuickStartAI />` |
| **FloatingAIButton** | `FloatingAIButton.tsx` | 悬浮 AI 按钮 | `<FloatingAIButton />` |

### AIChat 使用示例

```tsx
import { AIChat } from '@/components/ai/AIChat';

// 用户端 AI 助手
<AIChat />

// 管理端 AI 助手
<AIChat adminMode={true} />
```

---

## 3. 管理后台组件

路径: `src/components/admin/`

| 组件 | 文件 | 说明 |
|------|------|------|
| **AdminTable** | `AdminTable.tsx` | 管理后台表格 |
| **AdminForm** | `AdminForm.tsx` | 管理后台表单 |
| **AdminDashboard** | `AdminDashboard.tsx` | 仪表盘 |
| **Charts** | `Charts.tsx` | 图表组件 |
| **DashboardCharts** | `DashboardCharts.tsx` | 仪表盘图表 |

---

## 4. 业务组件

路径: `src/components/`

### 认证组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **AuthDialog** | `auth/AuthDialog.tsx` | 登录注册对话框 |
| **SigninDialog** | `signin/SigninDialog.tsx` | 登录对话框 |

### 购物车组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **CartList** | `cart/CartList.tsx` | 购物车列表 |
| **CartPage** | `cart/CartPage.tsx` | 购物车页面 |

### 订单组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **OrderList** | `order/OrderList.tsx` | 订单列表 |
| **OrderProgress** | `order/OrderProgress.tsx` | 订单进度 |

### 商品组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **GoodsList** | `product/GoodsList.tsx` | 商品列表 |
| **ProductCompare** | `product/ProductCompare.tsx` | 商品比较 |

### 收藏组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **FavoriteList** | `favorite/FavoriteList.tsx` | 收藏列表 |

### 优惠券组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **CouponCard** | `coupon/CouponCard.tsx` | 优惠券卡片 |
| **CouponSelector** | `coupon/CouponSelector.tsx` | 优惠券选择器 |

### 搜索组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **SearchBar** | `search/SearchBar.tsx` | 搜索栏 |
| **GlobalSearch** | `search/GlobalSearch.tsx` | 全局搜索 |
| **HighlightText** | `search/HighlightText.tsx` | 高亮文本 |

### 分享组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **ShareButton** | `share/ShareButton.tsx` | 分享按钮 |
| **SharePoster** | `share/SharePoster.tsx` | 分享海报 |

---

## 5. 通用组件

路径: `src/components/common/`

| 组件 | 文件 | 说明 |
|------|------|------|
| **Header** | `Header.tsx` | 页头 |
| **Footer** | `Footer.tsx` | 页脚 |
| **LoadingStates** | `LoadingStates.tsx` | 加载状态 |
| **OptimizedImage** | `OptimizedImage.tsx` | 优化图片 |
| **PageSkeletons** | `PageSkeletons.tsx` | 页面骨架屏 |
| **ProductSkeletons** | `ProductSkeletons.tsx` | 商品骨架屏 |

---

## 页面组件

| 组件 | 文件 | 说明 |
|------|------|------|
| **HomePage** | `home/HomePage.tsx` | 首页 |
| **ShopPage** | `shop/ShopPage.tsx` | 商品页 |
| **GoodsDetailPage** | `shop/GoodsDetailPage.tsx` | 商品详情页 |
| **CartPage** | `cart/CartPage.tsx` | 购物车页 |
| **BaikePage** | `baike/BaikePage.tsx` | 百科页 |
| **NewsPage** | `news/NewsPage.tsx` | 新闻页 |
| **MerchantDetailPage** | `merchant/MerchantDetailPage.tsx` | 商家详情页 |
| **CertificateVerifyPage** | `certificate/CertificateVerifyPage.tsx` | 证书验证页 |

---

## 页面速查

| 页面 | 路径 | 主要组件 |
|------|------|----------|
| 首页 | `app/page.tsx` | HomePage |
| 商品列表 | `app/shop/page.tsx` | ShopPage, GoodsList |
| 商品详情 | `app/shop/[id]/page.tsx` | GoodsDetailPage |
| 购物车 | `app/cart/page.tsx` | CartPage |
| AI 助手 | `app/ai-assistant/page.tsx` | AIChat |
| 知识库 | `app/knowledge/page.tsx` | - |
| 管理后台 | `app/admin/page.tsx` | AdminDashboard |
| 管理-AI训练 | `app/admin/ai-training/page.tsx` | - |
| 管理-AI助手 | `app/admin/ai-assistant/page.tsx` | AIChat (adminMode) |

---

## 组件导入示例

```tsx
// UI 组件
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';

// 业务组件
import { AIChat } from '@/components/ai/AIChat';
import { GoodsList } from '@/components/product/GoodsList';
import { SearchBar } from '@/components/search/SearchBar';

// 工具
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
```
