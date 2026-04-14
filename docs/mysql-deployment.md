# 符寶網 MySQL 数据库部署指南

## 一、服务器配置

### 1. 创建 MySQL 数据库

在宝塔面板中：
1. 进入 **数据库** → **MySQL**
2. 创建新数据库：`fubao`
3. 设置用户名和密码

### 2. 执行数据库迁移

在宝塔 phpMyAdmin 中：
1. 选择 `fubao` 数据库
2. 点击 **导入** 标签
3. 上传文件 `scripts/mysql-migration.sql`
4. 点击执行

或在命令行中：
```bash
mysql -u root -p fubao < scripts/mysql-migration.sql
```

### 3. 配置环境变量

在宝塔中设置以下环境变量（或在 `.env` 文件中）：

```env
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=fubao

# JWT 密钥
JWT_SECRET=your-secret-key-here
```

## 二、修改后的表结构

数据库包含以下表（与原 Supabase PostgreSQL 结构一致）：

| 表名 | 说明 |
|------|------|
| users | 用户信息 |
| admin_users | 管理员用户 |
| oauth_providers | OAuth配置 |
| user_oauth_accounts | OAuth账号绑定 |
| addresses | 收货地址 |
| categories | 商品分类 |
| goods | 商品信息 |
| orders | 订单 |
| order_items | 订单商品 |
| carts | 购物车 |
| favorites | 收藏 |
| merchants | 商家 |
| articles | 文章 |
| certificates | 证书 |
| coupons | 优惠券 |
| user_coupons | 用户优惠券 |
| user_balances | 用户余额 |
| recharges | 充值记录 |
| balance_logs | 余额变动记录 |
| videos | 视频 |
| news | 新闻 |
| banners | 轮播图 |
| announcements | 公告 |
| merchant_applications | 商家申请 |
| tickets | 工单 |
| ticket_replies | 工单回复 |
| reviews | 评价 |
| refunds | 退款 |
| search_keywords | 搜索关键词 |
| browse_history | 浏览历史 |
| merchant_users | 商家用户 |
| user_signins | 签到记录 |
| ai_configurations | AI配置 |
| ai_generated_articles | AI文章 |
| news_sources | 新闻源 |
| auto_publish_tasks | 定时任务 |
| shares | 分享记录 |
| page_blocks | 页面区块 |
| feedback | 反馈 |
| distributions | 分销 |
| distribution_commissions | 分销佣金 |
| withdraw_requests | 提现申请 |
| points_goods | 积分商品 |
| points_exchange_logs | 积分兑换记录 |
| notifications | 通知 |
| invoices | 发票 |

## 三、管理后台账号

执行迁移脚本后，默认管理员账号：

| 项目 | 内容 |
|------|------|
| 用户名 | `admin` |
| 密码 | `admin123` |
| 角色 | super_admin |

**重要**：生产环境请立即修改默认密码！

## 四、测试账号

迁移脚本会创建一个测试用户：

| 项目 | 内容 |
|------|------|
| ID | test-user-001 |
| 邮箱 | test@example.com |
| 手机 | 13800138000 |
| 密码 | (未设置，需注册) |

## 五、故障排除

### 问题：连接数据库失败

1. 检查 MySQL 服务是否运行
2. 确认用户名密码正确
3. 检查防火墙端口 3306 是否开放

### 问题：表已存在

迁移脚本使用 `CREATE TABLE IF NOT EXISTS`，不会覆盖已有表。

### 问题：管理员登录失败

确保 `admin_users` 表中有正确的管理员记录：
```sql
SELECT * FROM admin_users WHERE username = 'admin';
```
