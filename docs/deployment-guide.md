# 符寶網部署指南

## 服务器信息
- **IP**: 47.76.186.195
- **系统**: Ubuntu 24.04
- **域名**: fubao.ltd
- **SSH端口**: 22
- **用户名**: root

---

## 快速部署步骤

### 步骤 1: 连接服务器

```bash
ssh root@47.76.186.195
```

### 步骤 2: 安装必要软件

```bash
# 更新系统
apt update && apt upgrade -y

# 安装基础依赖
apt install -y curl wget git build-essential python3

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2
npm install -g pm2
pm2 startup systemd -u root --hp /root

# 安装 Nginx
apt install -y nginx

# 安装 Certbot (SSL证书)
apt install -y certbot python3-certbot-nginx
```

### 步骤 3: 创建项目目录

```bash
mkdir -p /www/wwwroot/fubao.ltd
mkdir -p /www/wwwlogs/fubao
```

### 步骤 4: 上传项目文件

**方式一：Git 克隆（推荐）**
```bash
cd /www/wwwroot
git clone <你的仓库地址> fubao.ltd
```

**方式二：SCP 上传（从本地执行）**
```bash
# 在本地电脑执行，将项目打包上传
scp -r /workspace/projects/* root@47.76.186.195:/www/wwwroot/fubao.ltd/
```

### 步骤 5: 配置环境变量

```bash
cd /www/wwwroot/fubao.ltd

# 复制环境变量模板
cp .env.production.example .env.production

# 编辑配置文件
nano .env.production
```

**必须修改的配置项：**
```env
# 数据库配置 (必填)
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-supabase-anon-key

# 安全配置 (必填)
JWT_SECRET=your-jwt-secret-key-at-least-32-characters

# 域名配置
COZE_PROJECT_DOMAIN_DEFAULT=fubao.ltd
```

### 步骤 6: 安装依赖并构建

```bash
cd /www/wwwroot/fubao.ltd

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

### 步骤 7: 配置 Nginx

```bash
# 创建 Nginx 配置
cat > /etc/nginx/sites-available/fubao.ltd << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name fubao.ltd www.fubao.ltd;
    
    access_log /www/wwwlogs/fubao.log;
    error_log /www/wwwlogs/fubao.error.log;
    
    client_max_body_size 50M;
    
    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 反向代理
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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
    
    # 静态资源缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/fubao.ltd /etc/nginx/sites-enabled/

# 删除默认站点
rm -f /etc/nginx/sites-enabled/default

# 测试并重载
nginx -t && systemctl reload nginx
```

### 步骤 8: 启动应用

```bash
cd /www/wwwroot/fubao.ltd

# 使用 PM2 启动
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 查看状态
pm2 status
```

### 步骤 9: 配置 SSL 证书

```bash
# 创建验证目录
mkdir -p /var/www/certbot

# 申请证书（自动配置 Nginx）
certbot --nginx -d fubao.ltd -d www.fubao.ltd \
    --non-interactive \
    --agree-tos \
    --email admin@fubao.ltd \
    --redirect

# 设置自动续期
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
```

### 步骤 10: 配置防火墙

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## 验证部署

```bash
# 检查服务状态
pm2 status

# 检查端口
ss -tlnp | grep 5000

# 检查 HTTP 响应
curl -I http://localhost:5000

# 访问网站
curl -I https://fubao.ltd
```

---

## 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs fubao-web

# 重启应用
pm2 restart fubao-web

# 停止应用
pm2 stop fubao-web

# 重载 Nginx
nginx -s reload

# 查看 Nginx 日志
tail -f /www/wwwlogs/fubao.log
```

---

## 更新部署

```bash
cd /www/wwwroot/fubao.ltd

# 拉取最新代码
git pull

# 安装依赖
pnpm install

# 构建
pnpm build

# 重启应用
pm2 restart fubao-web
```

---

## 访问地址

部署完成后访问：
- **网站**: https://fubao.ltd
- **管理后台**: https://fubao.ltd/admin
