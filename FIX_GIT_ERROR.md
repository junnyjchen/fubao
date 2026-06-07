
# 🔧 修复 Git 克隆错误指南

## 问题描述

你遇到的错误：
```
fatal: destination path '.' already exists and is not an empty directory.
```

**原因**：目标目录（`/www/wwwroot/116.204.135.69`）已经有文件了，无法直接克隆。

---

## ✅ 解决方案（任选一种）

---

### 方案一：清空目录重新克隆（推荐，最简单）

```bash
# 1. 进入网站目录
cd /www/wwwroot/116.204.135.69

# 2. 删除所有现有文件（注意：这会删除目录中的所有内容！）
rm -rf *

# 3. 再次克隆
git clone https://github.com/junnyjchen/fubao.git .
```

---

### 方案二：保留现有文件，使用 Git 初始化

如果你想保留现有文件，可以这样做：

```bash
# 1. 进入网站目录
cd /www/wwwroot/116.204.135.69

# 2. 初始化 Git
git init

# 3. 添加远程仓库
git remote add origin https://github.com/junnyjchen/fubao.git

# 4. 获取远程代码
git fetch origin

# 5. 切换到 main 分支并重置
git reset --hard origin/main

# 6. 设置上游分支
git branch --set-upstream-to=origin/main main
```

---

### 方案三：先克隆到临时目录，再移动文件

```bash
# 1. 进入网站目录
cd /www/wwwroot/116.204.135.69

# 2. 克隆到临时目录
git clone https://github.com/junnyjchen/fubao.git temp

# 3. 删除现有文件
rm -rf *

# 4. 将临时目录的内容移动到当前目录
mv temp/* .
mv temp/.* . 2>/dev/null || true

# 5. 删除临时目录
rmdir temp
```

---

## 🎯 我的推荐

**如果你没有重要的现有文件，直接用方案一！**

```bash
cd /www/wwwroot/116.204.135.69
rm -rf *
git clone https://github.com/junnyjchen/fubao.git .
```

---

## ✅ 克隆成功后继续部署

克隆成功后，继续以下步骤：

```bash
# 1. 安装依赖
pnpm install

# 2. 构建项目
pnpm build

# 3. 在宝塔 PM2 管理器中添加项目
#    启动命令：pnpm start
#    端口：5000

# 4. 配置反向代理到 5000 端口
```

---

## 💡 提示

如果目录中有重要文件需要保留，请使用**方案二**或**方案三**。
