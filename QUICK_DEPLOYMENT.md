# 快速部署指南 - 符寶網

## 前提条件

已验证：项目可以正常构建 ✅

## 服务器信息

- **外网地址**: https://47.76.186.195:21500/49918664
- **内网地址**: https://172.20.218.237:21500/49918664
- **用户名**: prd0bdif
- **密码**: fe256418

---

## 方案一：完全自动化部署（推荐）

### 步骤 1：上传部署脚本

1. 将本地项目中的 `scripts/deploy-server.sh` 上传到服务器 `/root/` 目录
   - 可以通过宝塔面板的「文件管理」上传
   - 或通过 SCP 命令：`scp scripts/deploy-server.sh root@47.76.186.195:/root/`

### 步骤 2：执行部署脚本

在服务器终端执行：

```bash
# 进入 root 目录
cd /root

# 给脚本执行权限
chmod +x deploy-server.sh

# 执行脚本
sudo bash deploy-server.sh
```

脚本会自动完成以下操作：
- ✅ 删除旧站点（会自动备份）
- ✅ 创建新站点目录
- ✅ 检查并安装依赖（Node.js、pnpm、PM2）
- ✅ 创建环境变量文件
- ✅ 配置 Nginx 反向代理

### 步骤 3：上传项目文件

脚本执行完成后，上传所有项目文件到 `/www/wwwroot/fubao-net/`：

**方法 A：通过宝塔面板上传**
1. 打开宝塔「文件管理」
2. 进入 `/www/wwwroot/fubao-net/`
3. 将本地所有文件拖拽上传

**方法 B：通过 Git 克隆**
```bash
cd /www/wwwroot/fubao-net
git clone <your-repo-url> .
```

### 步骤 4：构建并启动

在宝塔「终端」或 SSH 中执行：

```bash
cd /www/wwwroot/fubao-net

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 使用 PM2 启动应用
pm2 start dist/server.js --name fubao-net

# 设置 PM2 开机自启
pm2 startup
pm2 save
```

### 步骤 5：验证部署

1. 访问：http://47.76.186.195
2. 检查 PM2 状态：`pm2 status`
3. 查看应用日志：`pm2 logs fubao-net`

---

## 方案二：手动部署（推荐用于排查问题）

### 步骤 1：删除旧站点

通过宝塔面板：
1. 进入「网站」管理
2. 找到旧站点，点击「删除」
3. 选择「删除数据库」（如果有）
4. 确认删除

或在终端执行：
```bash
# 停止并删除 PM2 应用
pm2 stop fubao-net 2>/dev/null || true
pm2 delete fubao-net 2>/dev/null || true

# 删除旧站点目录
rm -rf /www/wwwroot/fubao-net

# 创建新目录
mkdir -p /www/wwwroot/fubao-net
chown -R www:www /www/wwwroot/fubao-net
chmod -R 755 /www/wwwroot/fubao-net
```

### 步骤 2：安装依赖（如果未安装）

```bash
# 安装 pnpm
npm install -g pnpm

# 安装 PM2
npm install -g pm2
```

### 步骤 3：上传项目文件

同方案一的步骤 3

### 步骤 4：配置环境变量

创建 `/www/wwwroot/fubao-net/.env.local`：

```bash
cat > /www/wwwroot/fubao-net/.env.local << 'EOF'
# Supabase 配置
COZE_SUPABASE_URL=your_supabase_url_here
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 站点配置
COZE_PROJECT_DOMAIN_DEFAULT=https://47.76.186.195
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD

# JWT 密钥（请修改为安全的随机字符串）
JWT_SECRET=fubao-net-jwt-secret-change-me-in-production
EOF

# 设置权限
chmod 600 /www/wwwroot/fubao-net/.env.local
chown www:www /www/wwwroot/fubao-net/.env.local
```

⚠️ **重要**：修改环境变量中的 Supabase 配置

### 步骤 5：配置 Nginx

创建 Nginx 配置文件：

```bash
cat > /www/server/panel/vhost/nginx/fubao-net.conf << 'EOF'
server {
    listen 80;
    server_name 47.76.186.195;

    # 日志
    access_log /www/wwwroot/fubao-net/access.log;
    error_log /www/wwwroot/fubao-net/error.log;

    # 反向代理到 PM2 应用
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

    # 静态文件缓存
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

# 测试 Nginx 配置
nginx -t

# 重载 Nginx
nginx -s reload
```

### 步骤 6：构建并启动

```bash
cd /www/wwwroot/fubao-net

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 使用 PM2 启动应用
pm2 start dist/server.js --name fubao-net

# 设置 PM2 开机自启
pm2 startup
pm2 save
```

### 步骤 7：配置 SSL（可选）

1. 在宝塔面板进入「网站」→「设置」→「SSL」
2. 选择「Let's Encrypt」
3. 填写邮箱并勾选域名
4. 点击「申请」
5. 勾选「强制HTTPS」

---

## 常用命令

### PM2 管理命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs fubao-net

# 重启应用
pm2 restart fubao-net

# 停止应用
pm2 stop fubao-net

# 删除应用
pm2 delete fubao-net

# 查看详细信息
pm2 show fubao-net
```

### Nginx 管理命令

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 重启 Nginx
systemctl restart nginx
```

### 查看日志

```bash
# Nginx 访问日志
tail -f /www/wwwroot/fubao-net/access.log

# Nginx 错误日志
tail -f /www/wwwroot/fubao-net/error.log

# 应用日志
pm2 logs fubao-net
```

---

## 问题排查

### 1. 端口被占用

```bash
# 查看端口占用
netstat -tunlp | grep 5000

# 杀掉进程
kill -9 <PID>
```

### 2. 权限问题

```bash
# 设置正确的文件权限
chown -R www:www /www/wwwroot/fubao-net
chmod -R 755 /www/wwwroot/fubao-net
```

### 3. 依赖安装失败

```bash
# 清除 pnpm 缓存
pnpm store prune

# 重新安装
pnpm install
```

### 4. PM2 启动失败

```bash
# 查看详细日志
pm2 logs fubao-net --lines 50

# 手动启动调试
node dist/server.js
```

---

## 更新部署

当有新代码需要部署时：

```bash
cd /www/wwwroot/fubao-net

# 拉取最新代码（如果使用 Git）
git pull

# 或上传新文件覆盖

# 重新构建
pnpm build

# 重启应用
pm2 restart fubao-net
```

---

## 联系支持

如遇到问题，请提供：
1. 错误日志（`pm2 logs fubao-net`）
2. Nginx 错误日志
3. 环境信息（Node.js 版本、系统版本）
