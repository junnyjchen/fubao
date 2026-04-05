# 符寶網项目部署指南 - 生产环境

## 服务器信息

- **外网面板地址**: https://47.238.127.141:17390/ac96d80d
- **内网面板地址**: https://172.31.41.195:17390/ac96d80d
- **用户名**: dpiaa0ty
- **密码**: 51fc8a77
- **服务器 IP**: 47.238.127.141
- **端口**: 5000

---

## 前置条件检查

### 1. 已安装的软件清单

✅ 宝塔面板
✅ Node.js 20.x（建议版本）
✅ PM2 进程管理器
✅ Nginx
✅ pnpm 包管理器

### 2. 环境要求

- **Node.js**: 18.x 或更高版本
- **pnpm**: 8.x 或更高版本
- **PM2**: 5.x 或更高版本
- **Nginx**: 1.18 或更高版本
- **内存**: 至少 2GB
- **磁盘**: 至少 10GB 可用空间

---

## 部署步骤

### 方案一：使用自动化部署脚本（推荐）

#### 步骤 1：上传部署脚本

1. 下载项目中的 `scripts/deploy-production.sh` 文件
2. 登录宝塔面板
3. 进入「文件管理」
4. 将脚本上传到 `/root/` 目录

#### 步骤 2：执行部署脚本

在宝塔面板的「终端」中执行：

```bash
# 进入 root 目录
cd /root

# 给脚本执行权限
chmod +x deploy-production.sh

# 执行脚本
sudo bash deploy-production.sh
```

脚本会自动完成：
- ✅ 备份现有站点（如果有）
- ✅ 创建项目目录
- ✅ 检查并安装依赖
- ✅ 配置环境变量
- ✅ 配置 Nginx 反向代理

#### 步骤 3：上传项目代码

脚本执行完成后，上传项目代码到服务器：

**方法 A：通过宝塔文件管理上传**
1. 在宝塔面板打开「文件管理」
2. 进入 `/www/wwwroot/fubao-net/`
3. 将所有项目文件拖拽上传

**方法 B：使用 Git 克隆**
```bash
cd /www/wwwroot/fubao-net
git clone <your-repo-url> .
```

**方法 C：使用 SCP 命令**
```bash
scp -r /path/to/local/project/* root@47.238.127.141:/www/wwwroot/fubao-net/
```

#### 步骤 4：配置环境变量

编辑环境变量文件：

```bash
vi /www/wwwroot/fubao-net/.env.local
```

修改以下配置：

```bash
# Supabase 配置（必须修改）
COZE_SUPABASE_URL=https://your-supabase-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key-here

# 站点配置（根据实际情况修改）
COZE_PROJECT_DOMAIN_DEFAULT=https://47.238.127.141
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD

# JWT 密钥（必须修改为安全随机字符串）
JWT_SECRET=generate-a-random-secret-key-here
```

#### 步骤 5：构建和启动项目

在项目目录执行：

```bash
# 进入项目目录
cd /www/wwwroot/fubao-net

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 使用 PM2 启动应用
pm2 start dist/server.js --name fubao-net

# 设置 PM2 开机自启
pm2 save
pm2 startup
```

#### 步骤 6：验证部署

1. **检查 PM2 状态**
   ```bash
   pm2 status
   pm2 logs fubao-net --lines 50
   ```

2. **检查端口监听**
   ```bash
   netstat -tunlp | grep 5000
   ```

3. **访问网站**
   - HTTP: http://47.238.127.141
   - 检查首页是否正常显示

4. **查看日志**
   ```bash
   # Nginx 访问日志
   tail -f /www/wwwroot/fubao-net/access.log

   # Nginx 错误日志
   tail -f /www/wwwroot/fubao-net/error.log

   # PM2 日志
   pm2 logs fubao-net
   ```

---

### 方案二：手动部署

#### 步骤 1：创建项目目录

```bash
mkdir -p /www/wwwroot/fubao-net
chown -R www:www /www/wwwroot/fubao-net
chmod -R 755 /www/wwwroot/fubao-net
```

#### 步骤 2：上传项目代码

参考方案一的步骤 3

#### 步骤 3：创建环境变量文件

```bash
cat > /www/wwwroot/fubao-net/.env.local << 'EOF'
# Supabase 配置
COZE_SUPABASE_URL=your_supabase_url_here
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 站点配置
COZE_PROJECT_DOMAIN_DEFAULT=https://47.238.127.141
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD

# JWT 密钥
JWT_SECRET=fubao-net-jwt-secret-change-me-in-production
EOF

chmod 600 /www/wwwroot/fubao-net/.env.local
chown www:www /www/wwwroot/fubao-net/.env.local
```

#### 步骤 4：配置 Nginx

在宝塔面板中：

1. 进入「网站」→「添加站点」
2. 域名填写：`47.238.127.141`
3. 根目录：`/www/wwwroot/fubao-net`
4. PHP 版本：选择「纯静态」
5. 点击「提交」

然后修改 Nginx 配置：

1. 找到新建的站点，点击「设置」→「配置文件」
2. 替换为以下配置：

```nginx
server {
    listen 80;
    server_name 47.238.127.141;

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
```

3. 保存并重载 Nginx

#### 步骤 5：构建和启动项目

参考方案一的步骤 5

---

## 配置 SSL 证书（可选但推荐）

### 使用 Let's Encrypt 免费证书

1. 在宝塔面板中，进入「网站」→「设置」→「SSL」
2. 选择「Let's Encrypt」
3. 填写邮箱地址
4. 勾选域名：`47.238.127.141`
5. 点击「申请」
6. 申请成功后，勾选「强制HTTPS」

### 使用自定义证书

1. 在「SSL」页面选择「其他证书」
2. 粘贴证书（.crt）和私钥（.key）内容
3. 点击「保存」

---

## PM2 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs fubao-net

# 查看最近 50 行日志
pm2 logs fubao-net --lines 50

# 实时查看日志
pm2 logs fubao-net --lines 0

# 重启应用
pm2 restart fubao-net

# 停止应用
pm2 stop fubao-net

# 删除应用
pm2 delete fubao-net

# 查看详细信息
pm2 show fubao-net

# 监控应用
pm2 monit

# 重载应用（零停机）
pm2 reload fubao-net
```

---

## 更新部署

当有新代码需要部署时：

### 方法一：使用 Git 拉取

```bash
cd /www/wwwroot/fubao-net

# 拉取最新代码
git pull

# 重新构建
pnpm build

# 重启应用
pm2 restart fubao-net
```

### 方法二：上传文件覆盖

1. 上传新文件到 `/www/wwwroot/fubao-net/`
2. 重新构建和启动：

```bash
cd /www/wwwroot/fubao-net
pnpm build
pm2 restart fubao-net
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
pm2 logs fubao-net --lines 100

# 手动启动调试
cd /www/wwwroot/fubao-net
node dist/server.js
```

### 5. Nginx 502 错误

- 检查 PM2 应用是否正常运行
- 检查端口 5000 是否被监听
- 查看 Nginx 错误日志

### 6. 数据库连接失败

检查 `.env.local` 中的数据库配置是否正确：

```bash
cat /www/wwwroot/fubao-net/.env.local
```

---

## 性能优化建议

### 1. 开启 Gzip 压缩

在 Nginx 配置中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. 配置 CDN

使用 CDN 加速静态资源：

- Next.js 静态文件：`/_next/static/`
- 公共资源：`/static/`

### 3. 启用 Redis 缓存

安装 Redis 并配置缓存策略。

### 4. 数据库优化

- 添加数据库索引
- 配置连接池
- 定期清理日志

---

## 安全建议

1. **修改默认端口**：将 5000 改为随机端口
2. **配置防火墙**：只开放必要端口
3. **定期更新**：保持系统和依赖最新
4. **备份策略**：定期备份数据库和代码
5. **监控告警**：配置应用监控和告警

---

## 监控和日志

### 查看应用日志

```bash
# PM2 日志
pm2 logs fubao-net

# Nginx 访问日志
tail -f /www/wwwroot/fubao-net/access.log

# Nginx 错误日志
tail -f /www/wwwroot/fubao-net/error.log
```

### 监控系统资源

```bash
# CPU 和内存
htop

# 磁盘使用
df -h

# 网络连接
netstat -tunlp
```

---

## 联系支持

如遇到问题，请提供以下信息：

1. 错误日志（`pm2 logs fubao-net`）
2. Nginx 错误日志
3. 环境信息（Node.js 版本、系统版本）
4. 复现步骤

---

## 快速命令参考

```bash
# 完整部署流程
cd /www/wwwroot/fubao-net
pnpm install
pnpm build
pm2 restart fubao-net

# 查看状态
pm2 status
pm2 logs fubao-net --lines 50

# 重启服务
pm2 restart fubao-net

# 检查端口
netstat -tunlp | grep 5000

# 测试访问
curl -I http://47.238.127.141
```

---

## 附录：项目结构

```
/www/wwwroot/fubao-net/
├── .env.local              # 环境变量
├── .next/                  # Next.js 构建输出
├── dist/                   # 服务端构建输出
├── node_modules/           # 依赖包
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── app/               # 页面和 API
│   ├── components/        # 组件
│   └── lib/               # 工具库
├── package.json           # 项目配置
├── next.config.ts         # Next.js 配置
├── tsconfig.json          # TypeScript 配置
└── .coze                  # 部署配置
```
