# 一键部署指南 - SSH 远程安装

## 方法一：使用 SSH 一键执行（推荐）

### 前提条件
1. 已在本地准备项目文件
2. 已知服务器 SSH 凭证

### 步骤

#### 1. 先上传部署脚本到本地
将 `scripts/one-click-deploy.sh` 下载到本地

#### 2. 上传项目文件到服务器

**方式 A：使用 SCP 上传**
```bash
# 上传项目文件
scp -r /path/to/fubao-net/* root@47.238.127.141:/www/wwwroot/fubao-net/

# 上传部署脚本
scp /path/to/one-click-deploy.sh root@47.238.127.141:/root/
```

**方式 B：使用 Git 直接克隆**
```bash
# SSH 登录服务器
ssh root@47.238.127.141

# 在服务器上克隆项目
cd /www/wwwroot
git clone <your-repo-url> fubao-net
```

#### 3. SSH 远程执行部署脚本

**上传部署脚本后执行：**
```bash
ssh root@47.238.127.141 "cd /root && chmod +x one-click-deploy.sh && bash one-click-deploy.sh"
```

**或者先登录服务器再执行：**
```bash
# 登录服务器
ssh root@47.238.127.141

# 执行脚本
cd /root
chmod +x one-click-deploy.sh
bash one-click-deploy.sh
```

---

## 方法二：手动 SSH 逐条执行（最简单）

### 1. SSH 登录服务器
```bash
ssh root@47.238.127.141
# 密码：Gf123456.
```

### 2. 执行以下命令（逐条复制粘贴）

```bash
# ========== 系统更新 ==========
apt-get update && apt-get upgrade -y

# ========== 安装 Node.js 20.x ==========
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ========== 安装 pnpm ==========
npm install -g pnpm

# ========== 安装 PM2 ==========
npm install -g pm2

# ========== 安装 Nginx ==========
apt-get install -y nginx

# ========== 创建项目目录 ==========
mkdir -p /www/wwwroot/fubao-net
chown -R www:www /www/wwwroot/fubao-net

# ========== 创建环境变量文件 ==========
cat > /www/wwwroot/fubao-net/.env.local << 'EOF'
# Supabase 配置（请修改）
COZE_SUPABASE_URL=your_supabase_url_here
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 站点配置
COZE_PROJECT_DOMAIN_DEFAULT=https://47.238.127.141
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD

# JWT 密钥
JWT_SECRET=fubao-net-jwt-secret-change-me
EOF

chmod 600 /www/wwwroot/fubao-net/.env.local

# ========== 配置 Nginx ==========
cat > /etc/nginx/sites-available/fubao-net << 'EOF'
server {
    listen 80;
    server_name 47.238.127.141;

    access_log /www/wwwroot/fubao-net/access.log;
    error_log /www/wwwroot/fubao-net/error.log;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    location /static {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/fubao-net /etc/nginx/sites-enabled/

# 测试并重载 Nginx
nginx -t && nginx -s reload

# ========== 上传项目文件（通过宝塔或其他方式）==========
# 此时请通过宝塔面板将项目文件上传到 /www/wwwroot/fubao-net/
# 然后继续执行以下命令

# ========== 安装项目依赖 ==========
cd /www/wwwroot/fubao-net
pnpm install

# ========== 构建项目 ==========
pnpm build

# ========== 启动应用 ==========
pm2 start dist/server.js --name fubao-net
pm2 save
pm2 startup

# ========== 完成 ==========
echo "部署完成！访问: http://47.238.127.141"
```

---

## 方法三：使用宝塔面板（最简单）

### 1. 登录宝塔面板

```
地址：https://47.238.127.141:17390/ac96d80d
用户名：dpiaa0ty
密码：51fc8a77
```

### 2. 上传项目文件

1. 进入「文件管理」
2. 创建目录：`/www/wwwroot/fubao-net`
3. 上传所有项目文件到此目录

### 3. 打开终端

在宝塔面板中点击「终端」

### 4. 执行以下命令

```bash
# 安装依赖
cd /www/wwwroot/fubao-net
pnpm install

# 构建项目
pnpm build

# 启动应用
pm2 start dist/server.js --name fubao-net
pm2 save
pm2 startup
```

### 5. 配置 Nginx

1. 进入「网站」→「添加站点」
2. 域名：`47.238.127.141`
3. 根目录：`/www/wwwroot/fubao-net`
4. PHP版本：纯静态
5. 点击「提交」
6. 修改站点配置（参考上面的 Nginx 配置）

---

## 快速命令参考

### SSH 登录
```bash
ssh root@47.238.127.141
```

### 检查应用状态
```bash
pm2 status
```

### 查看日志
```bash
pm2 logs fubao-net --lines 50
```

### 重启应用
```bash
pm2 restart fubao-net
```

### 检查端口
```bash
netstat -tunlp | grep 5000
```

---

## 推荐方案

**对于您的情况，我推荐使用【方法三：宝塔面板】**

原因：
1. ✅ 最简单直观
2. ✅ 文件上传方便
3. ✅ 图形化操作
4. ✅ 已安装基础软件
5. ✅ 避免SSH命令的复杂性

只需要：
1. 上传文件到宝塔
2. 在宝塔终端执行 3 条命令
3. 配置 Nginx

即可完成部署！
