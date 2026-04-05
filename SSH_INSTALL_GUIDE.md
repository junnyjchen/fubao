# SSH 远程安装指南 - 完整步骤

## 方式一：使用 SSH 客户端（推荐）

### 步骤 1：下载环境安装脚本

将项目中的 `scripts/install-env.sh` 下载到本地

### 步骤 2：上传脚本到服务器

在本地终端执行：

```bash
# 上传安装脚本
scp scripts/install-env.sh root@47.238.127.141:/root/
```

### 步骤 3：SSH 登录服务器

```bash
ssh root@47.238.127.141
# 密码：Gf123456.
```

### 步骤 4：执行环境安装脚本

```bash
cd /root
chmod +x install-env.sh
bash install-env.sh
```

这个脚本会自动安装：
- Node.js 20.x
- pnpm
- PM2
- Nginx
- 创建项目目录
- 配置环境变量
- 配置 Nginx

### 步骤 5：上传项目文件

**方法 A：使用 SCP 上传**
```bash
# 在本地终端执行
scp -r /path/to/fubao-net/* root@47.238.127.141:/www/wwwroot/fubao-net/
```

**方法 B：使用 Git 克隆**
```bash
# 在服务器上执行
cd /www/wwwroot/fubao-net
git clone <your-repo-url> .
```

**方法 C：使用宝塔面板上传**
1. 登录宝塔面板：https://47.238.127.141:17390/ac96d80d
2. 进入「文件管理」
3. 进入 `/www/wwwroot/fubao-net/`
4. 上传所有项目文件

### 步骤 6：构建和启动应用

在服务器上执行：

```bash
cd /www/wwwroot/fubao-net
pnpm install
pnpm build
pm2 start dist/server.js --name fubao-net
pm2 save
pm2 startup
```

### 步骤 7：修改环境变量

```bash
vi /www/wwwroot/fubao-net/.env.local
```

修改以下配置：
```bash
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
```

### 步骤 8：重启应用

```bash
pm2 restart fubao-net
```

### 步骤 9：验证部署

```bash
# 检查应用状态
pm2 status

# 查看日志
pm2 logs fubao-net --lines 50

# 测试访问
curl -I http://47.238.127.141
```

---

## 方式二：一键 SSH 命令（最简单）

### 第一步：SSH 登录并配置环境

复制以下命令，一次性粘贴到终端执行：

```bash
ssh root@47.238.127.141 << 'ENDSSH'
apt-get update -y && \
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
apt-get install -y nodejs && \
npm install -g pnpm pm2 && \
apt-get install -y nginx && \
mkdir -p /www/wwwroot/fubao-net && \
chown -R www:www /www/wwwroot/fubao-net && \
cat > /www/wwwroot/fubao-net/.env.local << 'ENVFILE'
COZE_SUPABASE_URL=your_supabase_url_here
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
COZE_PROJECT_DOMAIN_DEFAULT=https://47.238.127.141
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD
JWT_SECRET=fubao-net-jwt-secret-$(date +%s)
ENVFILE
chmod 600 /www/wwwroot/fubao-net/.env.local && \
cat > /etc/nginx/sites-available/fubao-net << 'NGINXCONF'
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
}
NGINXCONF
ln -sf /etc/nginx/sites-available/fubao-net /etc/nginx/sites-enabled/ && \
nginx -t && nginx -s reload && \
echo "环境配置完成！请上传项目文件后执行构建命令"
ENDSSH
```

### 第二步：上传项目文件

使用宝塔面板上传到 `/www/wwwroot/fubao-net/`

### 第三步：SSH 登录并构建启动

```bash
ssh root@47.238.127.141
# 密码：Gf123456.

cd /www/wwwroot/fubao-net
pnpm install
pnpm build
pm2 start dist/server.js --name fubao-net
pm2 save
pm2 startup
```

---

## 方式三：使用密钥免密登录（最自动化）

### 1. 生成 SSH 密钥（本地）

```bash
ssh-keygen -t rsa -b 4096 -C "root@47.238.127.141"
```

### 2. 复制公钥到服务器

```bash
ssh-copy-id root@47.238.127.141
```

### 3. 创建自动化部署脚本

```bash
#!/bin/bash

# 远程服务器信息
SERVER="root@47.238.127.141"
PROJECT_DIR="/www/wwwroot/fubao-net"

# 1. 上传项目文件
echo "上传项目文件..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  ./ ${SERVER}:${PROJECT_DIR}/

# 2. 远程执行构建和启动
echo "远程构建和启动..."
ssh ${SERVER} << 'ENDSSH'
cd /www/wwwroot/fubao-net
pnpm install
pnpm build
pm2 restart fubao-net || pm2 start dist/server.js --name fubao-net
ENDSSH

echo "部署完成！"
```

### 4. 保存为 deploy.sh 并执行

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 快速命令参考

### SSH 登录
```bash
ssh root@47.238.127.141
```

### 查看应用状态
```bash
pm2 status
pm2 logs fubao-net
```

### 重启应用
```bash
pm2 restart fubao-net
```

### 查看端口
```bash
netstat -tunlp | grep 5000
```

### 修改环境变量
```bash
vi /www/wwwroot/fubao-net/.env.local
```

---

## 故障排查

### 问题1：无法SSH连接
```bash
# 检查SSH服务
systemctl status sshd

# 重启SSH服务
systemctl restart sshd
```

### 问题2：端口被占用
```bash
# 查看端口占用
netstat -tunlp | grep 5000

# 杀掉进程
kill -9 <PID>
```

### 问题3：PM2启动失败
```bash
# 查看详细日志
pm2 logs fubao-net --lines 100

# 手动启动调试
cd /www/wwwroot/fubao-net
node dist/server.js
```

### 问题4：Nginx 502错误
```bash
# 检查Nginx配置
nginx -t

# 重载Nginx
nginx -s reload

# 检查应用是否运行
pm2 status
```

---

## 推荐方案

对于您的情况，我推荐使用**方式二：一键 SSH 命令**

原因：
1. ✅ 最简单，一次性完成环境配置
2. ✅ 无需上传脚本
3. ✅ 适合快速部署

只需执行两次命令：
1. 第一次：配置环境
2. 第二次：上传文件后构建启动

预计时间：10-15分钟

---

## 验证部署成功

部署完成后，访问：http://47.238.127.141

如果看到网站首页，说明部署成功！🎉
