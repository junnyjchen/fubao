# 数据库数据管理指南

## 概述

本项目提供了一套完整的数据库数据管理工具，支持：
- 数据导出为SQL文件
- 数据变更记录与SQL生成
- 批量SQL执行

## 目录结构

```
data/sql/
├── init-data.sql          # 初始数据SQL（可一次性导入）
├── changes/               # 数据变更SQL目录
│   ├── news_insert_xxx.sql
│   ├── goods_update_xxx.sql
│   └── ...
└── change-log.json        # 变更记录日志

scripts/sql/
├── export-data.ts         # 数据导出脚本
├── gen-change.ts          # 变更生成脚本
└── run-batch.ts          # 批量执行脚本
```

## 使用方法

### 1. 导出当前数据

```bash
# 导出所有表数据到SQL文件
pnpm db:export
```

导出文件将保存在 `data/sql/full-data-时间戳.sql`

### 2. 生成数据变更SQL

#### 添加新闻
```bash
pnpm db:change --table news --action insert --data '{"title":"新标题","content":"内容"}' --desc "新增新闻"
```

#### 更新商品
```bash
pnpm db:change --table goods --action update --id 1 --data '{"name":"新名称","price":"299.00"}' --desc "修改价格"
```

#### 删除记录
```bash
pnpm db:change --table news --action delete --id 5 --desc "删除过期新闻"
```

### 3. 查看待执行变更

```bash
pnpm db:batch --list
```

### 4. 执行变更SQL（生产环境）

```bash
# 预览模式（不实际执行）
pnpm db:batch --dry-run

# 正式执行
pnpm db:batch
```

### 5. 执行指定文件

```bash
pnpm db:batch --file "news_insert_2024-04-20.sql"
```

## 批量同步流程

### 步骤1：本地开发生成变更

```bash
# 生成新闻变更
pnpm db:change --table news --action insert --data '{"title":"活动公告"}' --desc "添加活动公告"

# 生成商品变更
pnpm db:change --table goods --action update --id 1 --data '{"stock":999}' --desc "增加库存"
```

### 步骤2：本地验证

```bash
# 预览所有待执行变更
pnpm db:batch --dry-run
```

### 步骤3：提交到Git

```bash
git add data/sql/changes/
git commit -m "data: 添加新闻和更新商品库存"
git push
```

### 步骤4：线上部署后执行SQL

1. 登录Supabase Dashboard
2. 进入 SQL Editor
3. 按顺序执行 `data/sql/changes/` 下的SQL文件

## 支持的表

| 表名 | 说明 |
|------|------|
| banners | 轮播图 |
| categories | 商品分类 |
| news | 新闻文章 |
| news_categories | 新闻分类 |
| wiki_articles | 百科文章 |
| wiki_categories | 百科分类 |
| videos | 视频 |
| video_categories | 视频分类 |
| goods | 商品 |
| merchants | 商户 |
| users | 用户 |
| addresses | 收货地址 |
| orders | 订单 |
| order_items | 订单商品 |

## 注意事项

1. **执行前备份**：重要数据变更前请先备份
2. **按顺序执行**：某些表有外键依赖，需按顺序执行
3. **测试环境优先**：建议先在测试环境执行验证
4. **保留记录**：执行完成的SQL文件会添加 COMPLETED_ 前缀

## 初始数据导入

如需在新的Supabase项目初始化数据：

1. 登录Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `data/sql/init-data.sql` 的内容
4. 执行SQL

## 常见问题

### Q: 如何更新现有数据？

```bash
pnpm db:change --table goods --action update --id 1 --data '{"price":"399.00"}' --desc "涨价"
```

### Q: 如何删除数据？

```bash
pnpm db:change --table news --action delete --id 10 --desc "删除旧新闻"
```

### Q: 执行失败怎么办？

1. 检查SQL语法
2. 检查外键约束
3. 手动在Supabase Dashboard执行

## 工具帮助

查看完整帮助：

```bash
pnpm db:help
```
