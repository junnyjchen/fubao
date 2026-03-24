# 分销系统使用文档

## 概述

符宝网分销系统是一个三级分销系统，支持多级佣金奖励和团队长管理。用户可以通过分享邀请链接邀请好友注册，好友购物后邀请人可获得佣金奖励。

## 功能特性

### 1. 三级分销
- **一级分销**：直接邀请的好友购物，获得订单金额的 10% 佣金
- **二级分销**：好友邀请的好友购物，获得订单金额的 5% 佣金
- **三级分销**：间接好友购物，获得订单金额的 2% 佣金

### 2. 团队长奖励
成为团队长后，除正常分销佣金外，还可获得团队成员销售额的额外奖励：
- 一级团队成员购物：额外 2%
- 二级团队成员购物：额外 1%
- 三级团队成员购物：额外 0.5%

### 3. 成为团队长条件
- 直推人数达到 50 人
- 团队总销售额达到 HK$50,000
- 申请并通过审核

## 用户端功能

### 分销中心 (`/distribution`)
- 查看佣金概览（可用佣金、待结算、累计佣金）
- 查看团队统计（团队人数、销售额）
- 申请提现
- 邀请好友

### 我的团队 (`/distribution/team`)
- 查看三级团队成员
- 按级别筛选成员
- 查看成员贡献

### 佣金明细 (`/distribution/commissions`)
- 查看佣金记录
- 按状态筛选（全部/待结算/已结算）
- 查看佣金来源

### 提现记录 (`/distribution/withdrawals`)
- 查看提现申请状态
- 追踪审核进度

### 分销规则 (`/distribution/rules`)
- 详细规则说明
- 常见问题解答

## 商家端功能

### 商品分享
- 商品详情页点击"分享"按钮
- 生成商品分享海报
- 分享链接包含邀请码

## 管理端功能

### 分销管理 (`/admin/distribution`)
- 查看分销统计数据
- 配置佣金比例
- 管理团队长

### 提现审核 (`/admin/withdrawals`)
- 审核用户提现申请
- 批准/拒绝提现
- 记录打款信息

## API 接口

### 用户端接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/distribution` | GET | 获取分销中心数据 |
| `/api/distribution/team` | GET | 获取团队成员列表 |
| `/api/distribution/commissions` | GET | 获取佣金明细 |
| `/api/distribution/withdraw` | GET/POST | 提现记录/申请提现 |
| `/api/share` | GET/POST | 获取分享信息/记录分享行为 |

### 管理端接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/distribution` | GET/POST | 分销统计/配置管理 |
| `/api/admin/withdrawals` | GET/POST | 提现列表/审核操作 |

## 数据库表结构

### user_distribution - 用户分销信息表
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | TEXT | 用户ID |
| invite_code | VARCHAR(20) | 邀请码 |
| parent_id | TEXT | 上级用户ID |
| parent_level_2_id | TEXT | 上上级用户ID |
| parent_level_3_id | TEXT | 上上上级用户ID |
| is_team_leader | BOOLEAN | 是否是团队长 |
| team_leader_id | TEXT | 所属团队长ID |
| total_commission | DECIMAL | 累计佣金 |
| available_commission | DECIMAL | 可用佣金 |
| frozen_commission | DECIMAL | 冻结佣金 |

### distribution_commissions - 佣金记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | TEXT | 获得佣金的用户 |
| from_user_id | TEXT | 贡献佣金的用户 |
| order_id | BIGINT | 订单ID |
| order_amount | DECIMAL | 订单金额 |
| commission_amount | DECIMAL | 佣金金额 |
| level | SMALLINT | 分销层级 |
| status | SMALLINT | 状态：0待结算/1已结算 |

### withdrawals - 提现记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | TEXT | 用户ID |
| amount | DECIMAL | 提现金额 |
| actual_amount | DECIMAL | 实际到账 |
| bank_name | VARCHAR | 银行名称 |
| status | SMALLINT | 状态：0待审核/1已通过/2已拒绝/3已打款 |

## 业务流程

### 1. 用户注册建立分销关系
```
用户访问 /register?ref=ABC123
    ↓
邀请码自动填充
    ↓
注册成功
    ↓
系统查找邀请人
    ↓
建立分销关系链
    ↓
生成新用户的邀请码
```

### 2. 订单完成计算佣金
```
用户确认收货
    ↓
订单状态变为"已完成"
    ↓
触发佣金计算
    ↓
按配置计算三级佣金
    ↓
插入佣金记录
    ↓
更新上级佣金统计
```

### 3. 提现流程
```
用户申请提现
    ↓
佣金转入冻结状态
    ↓
管理员审核
    ↓
批准：记录打款信息 → 已打款
拒绝：佣金退回用户
```

## 配置说明

### 分销配置 (distribution_config)
| level | rate | team_leader_rate |
|-------|------|------------------|
| 1 | 10.00 | 2.00 |
| 2 | 5.00 | 1.00 |
| 3 | 2.00 | 0.50 |

### 提现配置
- 最低提现金额：HK$100
- 提现手续费：0%
- 审核时间：1-3个工作日
- 到账时间：1-2个工作日

## 注意事项

1. **禁止刷单**：禁止刷单、虚假交易等违规行为，一经发现将取消分销资格
2. **佣金仅可提现**：不支持转赠或消费
3. **结算周期**：订单完成后7天自动结算
4. **冻结期**：佣金在冻结期内不可提现，防止退货纠纷

## 技术实现

### 前端
- React 19 + Next.js 16
- shadcn/ui 组件库
- Tailwind CSS 4

### 后端
- Next.js API Routes
- Supabase (PostgreSQL)
- JWT 认证

### 关键文件
- `src/app/distribution/` - 用户端分销页面
- `src/app/admin/distribution/` - 管理端分销页面
- `src/app/api/distribution/` - 分销API接口
- `scripts/create-distribution-tables.sql` - 数据库表结构
