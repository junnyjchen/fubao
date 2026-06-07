
# 宝塔面板 - 5分钟快速部署

## 📋 前置条件

✅ 已安装宝塔面板  
✅ 服务器可访问 GitHub  
✅ 有 root 或 sudo 权限

---

## 🚀 快速开始（5步部署）

### 第一步：创建网站

1. 宝塔 → 网站 → 添加站点
2. **域名**: `116.204.135.69`
3. **数据库**: 不创建
4. **PHP**: 纯静态
5. 提交

---

### 第二步：安装环境

**宝塔软件商店安装**：
- ✅ Node.js 20.x
- ✅ PM2 管理器

**终端执行**：
```bash
npm install -g pnpm
pnpm -v  # 验证安装
```

---

### 第三步：拉取代码

```bash
cd /www/wwwroot/116.204.135.69

# 克隆代码
git clone https://github.com/junnyjchen/fubao.git .

# 如果目录不为空
mv index.html index.html.bak
git clone https://github.com/junnyjchen/fubao.git .
```

---

### 第四步：安装依赖和构建

> ⚠️ **如果提示 `pnpm: command not found`，先回到第二步安装 pnpm！**
> ```bash
> npm install -g pnpm
> ```

```bash
cd /www/wwwroot/116.204.135.69

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

---

### 第五步：配置 PM2 和 Nginx

#### PM2 配置
1. 宝塔 → PM2管理器 → 添加项目
2. **项目名**: `fubao`
3. **启动文件**: `/www/wwwroot/116.204.135.69/node_modules/next/dist/bin/next`
4. **项目目录**: `/www/wwwroot/116.204.135.69`
5. **启动参数**: `start -p 5000`
6. 提交 → 启动

#### Nginx 反向代理
1. 网站设置 → 反向代理 → 添加
2. **代理名**: `fubao`
3. **目标URL**: `http://127.0.0.1:5000`
4. 提交
5. 点击配置文件，替换为：
```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
}
```
6. 保存

#### 防火墙
- 宝塔 → 安全 → 添加端口 `5000` → 放行

---

## ✅ 完成！

访问：**http://116.204.135.69**

---

## 🔄 日常更新（3步）

```bash
# 1. 进入目录
cd /www/wwwroot/116.204.135.69

# 2. 拉取代码
git pull origin main

# 3. 重新构建并重启
pnpm install &amp;&amp; pnpm build &amp;&amp; pm2 restart fubao
```

或者使用宝塔界面：
1. 网站设置 → Git → 拉取
2. PM2管理器 → 重启 fubao

---

## 🔑 测试账户

| 类型 | 用户名 | 密码 |
|------|--------|------|
| 用户 | test@example.com | admin123 |
| 管理员 | admin | admin123 |

---

## 📌 重要路径

| 项目 | 路径 |
|------|------|
| 网站根目录 | `/www/wwwroot/116.204.135.69` |
| Nginx 日志 | `/www/wwwlogs/` |
| PM2 日志 | `pm2 logs fubao` |

---

## 💡 提示

- 详细教程请查看 `BAOTA_DEPLOY.md`
- 遇到问题先看日志
- 定期备份数据

